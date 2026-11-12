import { useMemo, useState } from "react";
import { makeTransaction } from "./vault/finance";
import { parseStatementCsv, reconcileStatementRows } from "./vault/statementImport";
import { extractPdfText, parseNequiStatementText } from "./vault/nequiPdf";

const money = (minorUnits, currency = "COP") => new Intl.NumberFormat("es-CO", {
  style: "currency", currency, maximumFractionDigits: 2,
}).format((Number(minorUnits) || 0) / 100);

const periodOf = (date) => date.slice(0, 7);
const periodLabel = (period) => {
  if (!period) return "Periodo sin identificar";
  const [year, month] = period.split("-");
  return new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" }).format(new Date(Number(year), Number(month) - 1, 1));
};

export default function StatementImport({ vault, updateVault }) {
  const accounts = vault.accounts.filter((account) => account.type !== "credit");
  const [accountId, setAccountId] = useState(accounts.find((item) => /nequi/i.test(item.name))?.id || accounts[0]?.id || "");
  const [files, setFiles] = useState([]);
  const [rows, setRows] = useState([]);
  const [error, setError] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [pdfChecks, setPdfChecks] = useState([]);

  const selected = rows.filter((row) => row.selected && !row.exactDuplicate && !row.invalid);
  const totalIncome = selected.filter((row) => row.type === "income").reduce((sum, row) => sum + Math.abs(row.amountMinorUnits), 0);
  const totalExpense = selected.filter((row) => row.type === "expense").reduce((sum, row) => sum + Math.abs(row.amountMinorUnits), 0);
  const periods = useMemo(() => [...new Set(rows.map((row) => periodOf(row.date)).filter(Boolean))].sort(), [rows]);
  const account = accounts.find((item) => item.id === accountId);

  const loadFiles = async (event) => {
    const chosen = Array.from(event.target.files || []);
    setError("");
    setStatus("");
    setRows([]);
    setPdfChecks([]);
    setFiles(chosen.map((file) => ({ name: file.name, size: file.size })));
    if (!chosen.length) return;
    setBusy(true);
    try {
      const allRows = [];
      const checks = [];
      for (const file of chosen) {
        let parsed;
        if (/\.pdf$/i.test(file.name)) {
          if (!/nequi/i.test(account?.name || "")) {
            throw new Error("El adaptador PDF de esta fase es exclusivo para una cuenta Nequi. Para otras cuentas utiliza CSV.");
          }
          const text = await extractPdfText(file);
          const statement = parseNequiStatementText(text);
          parsed = { rows: statement.rows.map((row) => ({ ...row, balance: row.balance == null ? null : Math.round(row.balance * 100) })), invalid: [] };
          checks.push({ file: file.name, period: statement.period, summary: statement.summary, validation: statement.validation });
        } else if (/\.csv$/i.test(file.name)) {
          parsed = parseStatementCsv(await file.text());
        } else {
          throw new Error("Formato no compatible. Selecciona CSV o PDF de Nequi con texto seleccionable.");
        }
        const reconciled = reconcileStatementRows(parsed.rows, accountId, vault.transactions);
        for (const row of reconciled) {
          allRows.push({
            ...row,
            sourceFile: file.name,
            invalid: parsed.invalid.some((invalid) => invalid.rowNumber === row.rowNumber),
            type: row.suggestedType,
            categoryId: row.suggestedType === "income" ? "cat-other-income" : "cat-other",
            toAccountId: "",
            amountMinorUnits: Math.round(Math.abs(row.amount) * 100),
          });
        }
      }
      setPdfChecks(checks);
      const seen = new Set();
      const withBatchDuplicates = allRows.map((row) => {
        const duplicateInBatch = seen.has(row.fingerprint);
        seen.add(row.fingerprint);
        return { ...row, exactDuplicate: row.exactDuplicate || duplicateInBatch, selected: row.selected && !duplicateInBatch };
      });
      setRows(withBatchDuplicates);
      setStatus(`${chosen.length} archivo(s) analizado(s) localmente. Revisa cada clasificación y los controles del PDF antes de importar.`);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudieron leer los archivos.");
      setRows([]);
    } finally {
      setBusy(false);
      event.target.value = "";
    }
  };

  const updateRow = (index, patch) => setRows((current) => current.map((row, rowIndex) => rowIndex === index ? { ...row, ...patch } : row));

  const importRows = () => {
    if (!account || !selected.length) return;
    const failedPdf = pdfChecks.find((item) => !item.validation.summaryComplete || !item.validation.incomeMatches || !item.validation.expenseMatches || !item.validation.openingBalanceMatches || !item.validation.closingBalanceMatches);
    if (failedPdf) { setError(`El PDF ${failedPdf.file} no supera la conciliación de resumen/saldos. No se importó ningún movimiento.`); return; }
    const invalidTransfer = selected.some((row) => row.type === "transfer" && (!row.toAccountId || row.toAccountId === accountId));
    if (invalidTransfer) { setError("Cada transferencia requiere una cuenta destino distinta."); return; }
    const importedAt = new Date().toISOString();
    const transactions = selected.map((row) => makeTransaction({
      accountId,
      ...(row.type === "transfer" ? (row.amount < 0
        ? { toAccountId: row.toAccountId }
        : { accountId: row.toAccountId, toAccountId: accountId }) : {}),
      type: row.type,
      minorUnits: row.amountMinorUnits,
      currency: account.currency,
      categoryId: row.type === "transfer" ? "" : row.categoryId,
      description: row.description,
      occurredAt: new Date(`${row.date}T12:00:00`).toISOString(),
      importFingerprint: row.fingerprint,
      importSource: row.sourceFile,
      importProvider: /nequi/i.test(account.name) ? "nequi" : "bank-generic",
      statementPeriod: periodOf(row.date),
      statementBalanceMinorUnits: row.balance,
    }));
    const batches = [...new Set(selected.map((row) => row.sourceFile))].map((sourceFile) => {
      const sourceRows = selected.filter((row) => row.sourceFile === sourceFile);
      return {
        id: `statement-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`,
        accountId,
        provider: /nequi/i.test(account.name) ? "nequi" : "bank-generic",
        sourceFile,
        periods: [...new Set(sourceRows.map((row) => periodOf(row.date)))].sort(),
        importedAt,
        transactionCount: sourceRows.length,
        status: "imported",
      };
    });
    updateVault((current) => ({
      ...current,
      transactions: [...current.transactions, ...transactions],
      statementImports: [...(current.statementImports || []), ...batches],
    }));
    setStatus(`${transactions.length} movimiento(s) agregados a la bóveda en memoria. Guarda el archivo .fdv para cifrar los cambios.`);
    setRows([]);
    setFiles([]);
    setError("");
  };

  return <div className="workspace module statement-import">
    <div className="module-head reveal">
      <div><small>Herramientas · Importación bancaria</small><h2>Importar y conciliar</h2><p>Importa extractos por lotes, revisa los movimientos y confirma antes de modificar tu Financial Vault.</p></div>
    </div>
    <div className="metrics metrics-4">
      <article className="metric"><div><small>Cuenta destino</small><span>●</span></div><strong>{account?.name || "Sin cuenta"}</strong><em>Cuenta existente · no se duplica</em></article>
      <article className="metric"><div><small>Archivos seleccionados</small><span>●</span></div><strong>{files.length}</strong><em>Importación por lotes</em></article>
      <article className="metric"><div><small>Periodos detectados</small><span>●</span></div><strong>{periods.length}</strong><em>{periods.map(periodLabel).join(", ") || "Aún sin analizar"}</em></article>
      <article className="metric"><div><small>Movimientos seleccionados</small><span>●</span></div><strong>{selected.length}</strong><em>Excluye duplicados exactos</em></article>
    </div>
    <div className="two-col">
      <section className="panel">
        <div className="panel-head"><div><small>01 · Origen</small><h3>Seleccionar extractos</h3></div><span className="badge">Local</span></div>
        <label className="field"><span>Cuenta existente</span><select value={accountId} onChange={(event) => { setAccountId(event.target.value); setRows([]); }}><option value="">Selecciona una cuenta</option>{accounts.map((item) => <option key={item.id} value={item.id}>{item.name} · {item.currency}</option>)}</select></label>
        <label className="statement-drop">
          <strong>＋ Seleccionar extractos CSV o PDF de Nequi</strong>
          <span>PDF: extractos Nequi con texto seleccionable. El procesamiento ocurre localmente; no se envía el documento a servidores.</span>
          <input type="file" accept=".csv,text/csv,.pdf,application/pdf" multiple onChange={loadFiles} disabled={!accountId || busy}/>
        </label>
        {busy && <div className="notice">Analizando archivos localmente…</div>}
        <div className="notice"><b>Compatibilidad</b><span>CSV genérico y PDF de texto Nequi. Los PDF escaneados, cifrados o con formato diferente no se importan; OCR queda fuera de esta subfase.</span></div>
        {pdfChecks.map((check) => <div className="notice" key={check.file}><b>Control del extracto · {check.period}</b><span>{check.file} · Abonos: {check.validation.incomeMatches ? "coinciden" : "no coinciden"} · Cargos: {check.validation.expenseMatches ? "coinciden" : "no coinciden"} · Saldo inicial: {check.validation.openingBalanceMatches ? "coincide" : "no coincide"} · Saldo final: {check.validation.closingBalanceMatches ? "coincide" : "no coincide"}</span></div>)}
        {error && <div className="notice error">{error}</div>}
        {status && <div className="notice success">{status}</div>}
      </section>
      <section className="panel">
        <div className="panel-head"><div><small>02 · Control</small><h3>Resumen de importación</h3></div></div>
        <div className="projection-values">
          <div><small>Abonos seleccionados</small><strong className="positive">{money(totalIncome, account?.currency)}</strong></div>
          <div><small>Cargos seleccionados</small><strong className="negative">{money(totalExpense, account?.currency)}</strong></div>
          <div><small>Impacto neto</small><strong>{money(totalIncome - totalExpense, account?.currency)}</strong></div>
        </div>
        <div className="stack-list compact">
          <div className="stack-row"><div><b>Nequi</b><small>Primer adaptador objetivo · enero–noviembre 2026</small></div><span className="badge">En progreso</span></div>
          <div className="stack-row"><div><b>Bancolombia</b><small>Cuenta preparada para un adaptador posterior</small></div><span className="badge">Preparado</span></div>
          <div className="stack-row"><div><b>Efectivo</b><small>Se mantiene con registro manual</small></div><span className="badge">Manual</span></div>
        </div>
      </section>
    </div>
    {rows.length > 0 && <section className="panel">
      <div className="panel-head"><div><small>03 · Revisión obligatoria</small><h3>Movimientos detectados ({rows.length})</h3></div><span className="badge">{rows.filter((row) => row.exactDuplicate).length} duplicados</span></div>
      <div className="table-wrap"><table className="statement-table"><thead><tr><th>Importar</th><th>Fecha</th><th>Descripción</th><th>Tipo</th><th>Valor</th><th>Saldo extracto</th></tr></thead>
        <tbody>{rows.map((row, index) => <tr key={`${row.sourceFile}-${row.rowNumber}-${index}`}>
          <td><input type="checkbox" checked={row.selected && !row.exactDuplicate} disabled={row.exactDuplicate || row.invalid} onChange={(event) => updateRow(index, { selected: event.target.checked })}/></td>
          <td>{row.date || "—"}</td><td><strong>{row.description || "Sin descripción"}</strong><small>{row.sourceFile} · fila {row.rowNumber}</small></td>
          <td><select value={row.type} onChange={(event) => updateRow(index, { type: event.target.value })}><option value="income">Abono</option><option value="expense">Cargo</option><option value="transfer">Transferencia</option></select>{row.type === "transfer" && <select value={row.toAccountId} onChange={(event) => updateRow(index, { toAccountId: event.target.value })}><option value="">Cuenta contraparte</option>{accounts.filter((item) => item.id !== accountId && item.currency === account?.currency).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select>}</td>
          <td className={row.amount < 0 ? "negative" : "positive"}>{money(row.amountMinorUnits, account?.currency)}</td><td>{row.balance == null ? "—" : money(row.balance, account?.currency)}</td>
        </tr>)}</tbody></table></div>
      <div className="form-actions"><button className="button" onClick={() => { setRows([]); setFiles([]); }}>Descartar revisión</button><button className="button primary" onClick={importRows} disabled={!selected.length}>Importar {selected.length} movimientos</button></div>
    </section>}
    <section className="panel"><div className="panel-head"><div><small>Historial · 2026</small><h3>Seguimiento de extractos Nequi</h3></div><span className="badge">{new Set((vault.statementImports || []).flatMap((item) => item.periods || [])).size}/11 periodos</span></div>
      <div className="statement-months">{["Ene","Feb","Mar","Abr","May","Jun","Jul","Ago","Sep","Oct","Nov"].map((label, index) => {
        const period = "2026-" + String(index + 1).padStart(2, "0");
        const imported = (vault.statementImports || []).some((item) => item.accountId === accountId && (item.periods || []).includes(period));
        return <div className={imported ? "statement-month imported" : "statement-month"} key={period}><b>{label}</b><small>{imported ? "Importado" : "Pendiente"}</small></div>;
      })}</div>
      {(vault.statementImports || []).length > 0 && <div className="stack-list compact">{vault.statementImports.slice().reverse().map((item) => <div className="stack-row" key={item.id}><div><b>{item.sourceFile}</b><small>{item.periods.join(", ")} · {item.transactionCount} movimientos</small></div><span className="badge">Registrado</span></div>)}</div>}
    </section>
    <section className="panel"><div className="panel-head"><div><small>04 · Conciliación</small><h3>Reglas de integridad</h3></div></div>
      <div className="stack-list compact">
        <div className="stack-row"><div><b>No crear cuentas nuevas</b><small>Los registros se vinculan a la cuenta seleccionada.</small></div><span className="positive">Activo</span></div>
        <div className="stack-row"><div><b>Transferencias neutrales</b><small>Se guardan como transferencias y no como ingresos/gastos.</small></div><span className="positive">Activo</span></div>
        <div className="stack-row"><div><b>Saldo mensual encadenado</b><small>Se validará contra el saldo inicial y final de cada extracto PDF.</small></div><span className="badge">Siguiente subfase</span></div>
        <div className="stack-row"><div><b>Registro de auditoría</b><small>Se conserva archivo, cuenta, periodo y fecha de importación, sin guardar el documento original.</small></div><span className="positive">Activo</span></div>
      </div>
    </section>
  </div>;
}
