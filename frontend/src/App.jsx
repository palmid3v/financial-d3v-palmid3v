import { useEffect, useMemo, useState } from "react";
import { useVault } from "./vault/VaultContext";
import { calculateWithGoEngine } from "./vault/goEngine";
import {
  accountBalance,
  budgetSummary,
  currentMonthRange,
  debtBalance,
  makeAccount,
  makeAsset,
  makeBudget,
  makeDebt,
  makeDebtPayment,
  makeLiability,
  makeSavingsContribution,
  makeSavingsGoal,
  makeTransaction,
  monthSeries,
  netWorth,
  normalizeVault,
  savingsProgress,
  transactionTotals,
} from "./vault/finance";

const money = (minorUnits = 0, currency = "COP") =>
  new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format((Number(minorUnits) || 0) / 100);

const numberValue = (value) => Math.round((Number(value) || 0) * 100);
const todayInput = () => new Date().toISOString().slice(0, 10);
const monthInput = (date) => new Date(date.getFullYear(), date.getMonth(), 1).toISOString().slice(0, 10);
const nextMonthInput = (date) => new Date(date.getFullYear(), date.getMonth() + 1, 0).toISOString().slice(0, 10);

const navGroups = [
  { label: "Finanzas", items: [["dashboard", "Dashboard", "⌂"], ["accounts", "Cuentas", "▣"], ["transactions", "Transacciones", "↕"], ["budget", "Presupuestos", "◫"]] },
  { label: "Planeación", items: [["savings", "Ahorro y metas", "◎"], ["debts", "Deudas", "◇"]] },
  { label: "Patrimonio", items: [["net-worth", "Patrimonio neto", "◆"]] },
  { label: "Aprendizaje", items: [["education", "Educación", "?"]] },
];

const allNav = navGroups.flatMap((group) => group.items);

function Button({ children, onClick, primary = false, disabled = false, type = "button", className = "" }) {
  return <button type={type} disabled={disabled} onClick={onClick} className={`button ${primary ? "primary" : ""} ${className}`}>{children}</button>;
}

function Field({ label, ...props }) {
  return <label className="field"><span>{label}</span><input {...props} /></label>;
}

function Select({ label, children, ...props }) {
  return <label className="field"><span>{label}</span><select {...props}>{children}</select></label>;
}

function Panel({ children, className = "" }) {
  return <section className={`panel ${className}`}>{children}</section>;
}

function Notice({ children, tone = "" }) {
  return <div className={`notice ${tone}`}>{children}</div>;
}

function Empty({ title, text, action }) {
  return <div className="empty">
    <b>＋</b>
    <h3>{title}</h3>
    <p>{text}</p>
    {action}
  </div>;
}

function Progress({ value, tone = "green" }) {
  const safe = Math.max(0, Math.min(100, Number(value) || 0));
  return <div className={`progress ${tone}`}><i style={{ width: `${safe}%` }} /></div>;
}

function Metric({ label, value, detail, tone = "" }) {
  return <article className="metric reveal">
    <div><small>{label}</small><span className={tone}>●</span></div>
    <strong>{value}</strong>
    <em>{detail}</em>
  </article>;
}

function Sidebar({ active, setActive, onLock, dirty }) {
  return <aside className="sidebar">
    <div className="brand">
      <b className="brand-mark">F</b>
      <div><strong>Financial-D3v</strong><small>Personal finance</small></div>
    </div>
    {navGroups.map((group) => <div className="nav-group" key={group.label}>
      <span className="label">{group.label}</span>
      <nav>{group.items.map(([key, label, icon]) =>
        <button key={key} onClick={() => setActive(key)} className={active === key ? "nav active" : "nav"}>
          <i>{icon}</i><span>{label}</span>
        </button>
      )}</nav>
    </div>)}
    <div className="side-bottom">
      <div className="privacy"><span /><div><b>Private workspace</b><small>Vault · encrypted</small></div></div>
      <button className="lock-link" onClick={onLock}>⌕ {dirty ? "Guardar y bloquear" : "Bloquear"}</button>
      <small className="signature">PALMI-D3V · v0.1</small>
    </div>
  </aside>;
}

function MobileNav({ active, setActive, moreOpen, setMoreOpen }) {
  const items = [["dashboard", "Inicio", "⌂"], ["transactions", "Movs", "↕"], ["budget", "Presup.", "◫"], ["net-worth", "Patrimonio", "◆"]];
  return <>
    {moreOpen && <div className="mobile-more">
      {allNav.filter(([key]) => !items.some(([item]) => item === key)).map(([key, label, icon]) =>
        <button key={key} onClick={() => { setActive(key); setMoreOpen(false); }} className={active === key ? "active" : ""}>
          <i>{icon}</i><span>{label}</span>
        </button>
      )}
    </div>}
    <nav className="mobile-nav">
      {items.map(([key, label, icon]) => <button key={key} onClick={() => setActive(key)} className={active === key ? "active" : ""}><i>{icon}</i><small>{label}</small></button>)}
      <button onClick={() => setMoreOpen((value) => !value)} className={moreOpen ? "active" : ""}><i>•••</i><small>Más</small></button>
    </nav>
  </>;
}

function Topbar({ active, dirty, saveVault, lock }) {
  const label = allNav.find(([key]) => key === active)?.[1] || "Dashboard";
  return <header className="topbar">
    <div><small>Financial-D3v <b>/</b> {label}</small><h1>{label}</h1></div>
    <div className="top-actions">
      <span className={dirty ? "save-status dirty" : "save-status"}><i /> {dirty ? "Cambios sin guardar" : "Vault guardado"}</span>
      <Button onClick={saveVault} disabled={!dirty}>{dirty ? "Guardar vault" : "Guardado"}</Button>
      <button className="avatar" onClick={lock} aria-label="Bloquear vault">P</button>
    </div>
  </header>;
}

function Dashboard({ vault, setActive }) {
  const { start, end } = currentMonthRange();
  const [goAnalysis, setGoAnalysis] = useState(null);
  const [goEngineStatus, setGoEngineStatus] = useState("loading");

  useEffect(() => {
    let cancelled = false;
    setGoEngineStatus("loading");
    calculateWithGoEngine({
      vault,
      currency: "COP",
      period: { start: start.toISOString(), end: end.toISOString() },
    }).then((result) => {
      if (!cancelled) {
        setGoAnalysis(result);
        setGoEngineStatus("ready");
      }
    }).catch(() => {
      if (!cancelled) {
        setGoAnalysis(null);
        setGoEngineStatus("fallback");
      }
    });
    return () => { cancelled = true; };
  }, [vault, start, end]);
  const jsTotals = transactionTotals(vault.transactions, start, end);
  const jsNetWorth = netWorth(vault);
  const totals = goAnalysis?.cashFlow ?? jsTotals;
  const nw = goAnalysis?.netWorth ? { net: goAnalysis.netWorth.net, debtLiabilities: goAnalysis.netWorth.debtLiabilities, assets: goAnalysis.netWorth.assets, liabilities: goAnalysis.netWorth.liabilities } : jsNetWorth;
  const accountsTotal = vault.accounts.reduce((sum, account) => sum + accountBalance(account, vault.transactions), 0);
  const savingsRate = totals.income ? (totals.income > 0 ? (Math.max(0, totals.income - totals.expenses) / totals.income) * 100 : 0) : 0;
  const debt = nw.debtLiabilities;
  const series = monthSeries(vault.transactions, 6);
  const max = Math.max(...series.flatMap((row) => [row.income, row.expenses]), 1);
  const expenseCategories = vault.categories.filter((item) => item.kind === "expense").map((category) => ({
    ...category,
    value: vault.transactions.filter((tx) => tx.type === "expense" && tx.categoryId === category.id && new Date(tx.occurredAt) >= start && new Date(tx.occurredAt) < end).reduce((sum, tx) => sum + tx.minorUnits, 0),
  })).filter((item) => item.value > 0).sort((a, b) => b.value - a.value);
  const totalCategorySpend = expenseCategories.reduce((sum, item) => sum + item.value, 0);
  const budget = vault.budgets.find((item) => new Date(item.startDate) <= start && new Date(item.endDate) >= end) || vault.budgets[0];
  const budgetData = budget ? budgetSummary(budget, vault, new Date(budget.startDate), new Date(budget.endDate)) : null;
  const recent = [...vault.transactions].sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt)).slice(0, 6);

  return <div className="workspace dashboard-page">
    <section className="hero reveal">
      <div><small>Resumen financiero · {new Intl.DateTimeFormat("es-CO", { month: "long", year: "numeric" }).format(new Date())}</small><h2>Haz que tu dinero <em>tenga sentido.</em></h2><p>Registra el movimiento, entiende el estado y decide qué sigue.</p></div>
      <Button primary onClick={() => setActive("transactions")}>＋ Nueva transacción</Button>
    </section>

    <Notice tone={goEngineStatus === "ready" ? "success" : ""}>
      <b>Go Financial Engine</b>
      <span>{goEngineStatus === "ready" ? "WASM activo · cálculos locales" : goEngineStatus === "loading" ? "Inicializando motor local…" : "WASM no disponible · cálculo JS local"}</span>
    </Notice>

    <div className="metrics metrics-4">
      <Metric label="Patrimonio neto" value={money(nw.net)} detail="Activos − pasivos" tone="green" />
      <Metric label="Flujo de caja" value={`+ ${money(totals.netCashFlow)}`} detail="Este mes" tone="green" />
      <Metric label="Ahorro del mes" value={`${Math.round(savingsRate)}%`} detail="Ingreso − gasto" tone="yellow" />
      <Metric label="Deuda pendiente" value={money(debt)} detail="Saldo de deudas" tone="blue" />
    </div>

    <div className="dashboard-grid">
      <Panel className="chart-panel reveal">
        <div className="panel-head"><div><small>Últimos 6 meses</small><h3>Ingresos vs gastos</h3></div><div className="legend"><span><i className="green-dot" />Ingresos</span><span><i className="red-dot" />Gastos</span></div></div>
        <div className="bar-chart">
          {series.map((row) => <div className="bar-group" key={row.label}>
            <div className="bar-pair">
              <i className="bar income-bar" style={{ height: `${Math.max(4, row.income / max * 100)}%` }} />
              <i className="bar expense-bar" style={{ height: `${Math.max(4, row.expenses / max * 100)}%` }} />
            </div>
            <small>{row.label}</small>
          </div>)}
        </div>
      </Panel>

      <Panel className="chart-panel reveal">
        <div className="panel-head"><div><small>Este mes</small><h3>Gasto por categoría</h3></div></div>
        {totalCategorySpend === 0 ? <Empty title="Sin gastos todavía" text="Registra una transacción y aquí aparecerá la distribución." /> :
          <div className="donut-wrap">
            <div className="donut" style={{ background: `conic-gradient(${expenseCategories.slice(0, 6).map((item, index) => {
              const colors = ["#3b82f6", "#22c55e", "#f5b700", "#a78bfa", "#f0525b", "#64748b"];
              const from = expenseCategories.slice(0, index).reduce((sum, current) => sum + current.value, 0) / totalCategorySpend * 360;
              const to = expenseCategories.slice(0, index + 1).reduce((sum, current) => sum + current.value, 0) / totalCategorySpend * 360;
              return `${colors[index % colors.length]} ${from}deg ${to}deg`;
            }).join(",")})` }}><strong>{money(totalCategorySpend)}</strong><span>gastado</span></div>
            <div className="donut-legend">{expenseCategories.slice(0, 6).map((item, index) => <div key={item.id}><span className={`series-dot series-${index + 1}`} />{item.name}<b>{Math.round(item.value / totalCategorySpend * 100)}%</b></div>)}</div>
          </div>}
      </Panel>
    </div>

    <div className="dashboard-bottom">
      <Panel className="reveal"><div className="panel-head"><div><small>Tu dinero</small><h3>Cuentas</h3></div><button onClick={() => setActive("accounts")} className="text-link">Ver todas</button></div>
        {vault.accounts.length === 0 ? <Empty title="Crea tu primera cuenta" text="Las cuentas son el punto de partida del ledger." action={<Button primary onClick={() => setActive("accounts")}>Agregar cuenta</Button>} /> :
          <div className="stack-list">{vault.accounts.slice(0, 4).map((account) => <div className="stack-row" key={account.id}><span className="account-icon">{account.type === "credit" ? "▭" : "▣"}</span><div><b>{account.name}</b><small>{account.type} · {account.currency}</small></div><strong>{money(accountBalance(account, vault.transactions), account.currency)}</strong></div>)}</div>}
        <div className="panel-total"><span>Saldo total</span><b>{money(accountsTotal)}</b></div>
      </Panel>

      <Panel className="reveal"><div className="panel-head"><div><small>Presupuesto</small><h3>Presupuesto del mes</h3></div><button onClick={() => setActive("budget")} className="text-link">Ver todo</button></div>
        {!budgetData ? <Empty title="Sin presupuesto" text="Crea un presupuesto para comparar plan contra realidad." action={<Button primary onClick={() => setActive("budget")}>Crear presupuesto</Button>} /> :
          <div className="budget-preview"><div className="budget-total"><strong>{Math.round(budgetData.percent)}%</strong><span>usado</span></div>{budgetData.lines.slice(0, 4).map((line, index) => <div className="budget-line" key={line.categoryId}><div><b><i className={`series-dot series-${index + 1}`} />{line.categoryName}</b><span>{money(line.spent)} / {money(line.limitMinorUnits)}</span></div><Progress value={line.percent} tone={line.percent >= 100 ? "red" : index === 1 ? "green" : index === 2 ? "yellow" : "blue"} /></div>)}</div>}
      </Panel>

      <Panel className="reveal"><div className="panel-head"><div><small>Ledger</small><h3>Movimientos recientes</h3></div><button onClick={() => setActive("transactions")} className="text-link">Ver todos</button></div>
        {recent.length === 0 ? <Empty title="Tu ledger está vacío" text="Registra el primer movimiento para empezar." /> :
          <div className="stack-list">{recent.map((tx) => <div className="stack-row" key={tx.id}><span className={`movement-icon ${tx.type}`}>{tx.type === "income" ? "↗" : tx.type === "expense" ? "↘" : "⇄"}</span><div><b>{tx.description || "Movimiento"}</b><small>{tx.type} · {new Date(tx.occurredAt).toLocaleDateString("es-CO")}</small></div><strong className={tx.type === "expense" ? "negative" : tx.type === "income" ? "positive" : ""}>{tx.type === "expense" ? "−" : tx.type === "income" ? "+" : ""}{money(tx.minorUnits, tx.currency)}</strong></div>)}</div>}
      </Panel>
    </div>
  </div>;
}

function Transactions({ vault, updateVault }) {
  const [form, setForm] = useState({ type: "expense", amount: "", accountId: "", toAccountId: "", categoryId: "cat-food", description: "", occurredAt: new Date().toISOString().slice(0, 16) });
  const [message, setMessage] = useState("");
  const categories = vault.categories.filter((item) => item.kind === form.type);
  const save = (event) => {
    event.preventDefault();
    const account = vault.accounts.find((item) => item.id === form.accountId);
    if (!account || !form.amount) return;
    const transaction = makeTransaction({
      accountId: form.accountId,
      toAccountId: form.type === "transfer" ? form.toAccountId : "",
      type: form.type,
      minorUnits: numberValue(form.amount),
      currency: account.currency,
      categoryId: form.type === "transfer" ? "" : form.categoryId,
      description: form.description || (form.type === "income" ? "Ingreso" : form.type === "expense" ? "Gasto" : "Transferencia"),
      occurredAt: new Date(form.occurredAt).toISOString(),
    });
    updateVault((current) => ({ ...current, transactions: [...current.transactions, transaction] }));
    setMessage("Movimiento guardado en memoria. Guarda el Vault para persistirlo cifrado.");
    setForm((current) => ({ ...current, amount: "", description: "" }));
  };
  const items = [...vault.transactions].sort((a, b) => new Date(b.occurredAt) - new Date(a.occurredAt));

  return <Module title="Transacciones" eyebrow="Registrar → Categorizar" description="Captura ingresos, gastos y transferencias directamente en el ledger privado.">
    <div className="two-col">
      <Panel><div className="panel-head"><div><small>Nueva transacción</small><h3>Registrar movimiento</h3></div></div>
        <form onSubmit={save} className="form-grid">
          <div className="segmented full"><button type="button" className={form.type === "expense" ? "active" : ""} onClick={() => setForm({ ...form, type: "expense", categoryId: "cat-food" })}>Gasto</button><button type="button" className={form.type === "income" ? "active" : ""} onClick={() => setForm({ ...form, type: "income", categoryId: "cat-salary" })}>Ingreso</button><button type="button" className={form.type === "transfer" ? "active" : ""} onClick={() => setForm({ ...form, type: "transfer", categoryId: "" })}>Transfer.</button></div>
          <Field label="Monto" type="number" min="0.01" step="0.01" required value={form.amount} onChange={(e) => setForm({ ...form, amount: e.target.value })} />
          <Select label="Cuenta" required value={form.accountId} onChange={(e) => setForm({ ...form, accountId: e.target.value })}><option value="">Selecciona cuenta</option>{vault.accounts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
          {form.type === "transfer" ? <Select label="Cuenta destino" required value={form.toAccountId} onChange={(e) => setForm({ ...form, toAccountId: e.target.value })}><option value="">Selecciona destino</option>{vault.accounts.filter((item) => item.id !== form.accountId).map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select> :
            <Select label="Categoría" value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })}>{categories.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>}
          <Field label="Fecha" type="datetime-local" value={form.occurredAt} onChange={(e) => setForm({ ...form, occurredAt: e.target.value })} />
          <Field label="Descripción" placeholder="Opcional" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
          <div className="form-actions"><Button primary type="submit">Guardar movimiento</Button></div>
        </form>
        {message && <Notice tone="success"><b>Guardado.</b><span>{message}</span></Notice>}
      </Panel>
      <Panel><div className="panel-head"><div><small>Ledger privado</small><h3>Movimientos</h3></div><span>{items.length} registros</span></div>
        {items.length === 0 ? <Empty title="Sin movimientos" text="El ledger está listo. Registra tu primer ingreso, gasto o transferencia." /> :
          <div className="stack-list">{items.map((tx) => <div className="stack-row" key={tx.id}><span className={`movement-icon ${tx.type}`}>{tx.type === "income" ? "↗" : tx.type === "expense" ? "↘" : "⇄"}</span><div><b>{tx.description}</b><small>{tx.type} · {new Date(tx.occurredAt).toLocaleString("es-CO")}</small></div><strong className={tx.type === "expense" ? "negative" : tx.type === "income" ? "positive" : ""}>{tx.type === "expense" ? "−" : tx.type === "income" ? "+" : ""}{money(tx.minorUnits, tx.currency)}</strong></div>)}</div>}
      </Panel>
    </div>
  </Module>;
}

function Accounts({ vault, updateVault }) {
  const [form, setForm] = useState({ name: "", type: "bank", currency: "COP", opening: "" });
  const save = (event) => {
    event.preventDefault();
    if (!form.name) return;
    updateVault((current) => ({ ...current, accounts: [...current.accounts, makeAccount({ name: form.name, type: form.type, currency: form.currency, openingMinorUnits: numberValue(form.opening) })] }));
    setForm({ name: "", type: "bank", currency: "COP", opening: "" });
  };
  return <Module title="Cuentas" eyebrow="Dónde vive tu dinero" description="Los saldos se derivan del opening balance y del ledger. No hay un balance paralelo que pueda contradecir las transacciones.">
    <div className="two-col">
      <Panel><div className="panel-head"><div><small>Nueva cuenta</small><h3>Agregar cuenta</h3></div></div><form onSubmit={save} className="form-grid">
        <Field label="Nombre" placeholder="Cuenta de ahorros" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <Select label="Tipo" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}><option value="cash">Efectivo</option><option value="bank">Banco</option><option value="credit">Crédito</option><option value="investment">Inversión</option><option value="other">Otro</option></Select>
        <Field label="Moneda" maxLength="3" value={form.currency} onChange={(e) => setForm({ ...form, currency: e.target.value.toUpperCase() })} />
        <Field label="Saldo inicial" type="number" step="0.01" value={form.opening} onChange={(e) => setForm({ ...form, opening: e.target.value })} />
        <div className="form-actions"><Button primary type="submit">Crear cuenta</Button></div>
      </form></Panel>
      <Panel><div className="panel-head"><div><small>Tu dinero</small><h3>Cuentas</h3></div></div>
        {vault.accounts.length === 0 ? <Empty title="Todavía no hay cuentas" text="Crea la primera cuenta para empezar a registrar movimientos." /> :
          <div className="account-grid">{vault.accounts.map((account) => <article className="account-card reveal" key={account.id}><div><span className="badge">{account.type}</span><small>{account.currency}</small></div><h3>{account.name}</h3><strong>{money(accountBalance(account, vault.transactions), account.currency)}</strong><p>Saldo inicial {money(account.openingMinorUnits, account.currency)}</p></article>)}</div>}
      </Panel>
    </div>
  </Module>;
}

function Budget({ vault, updateVault }) {
  const { start, end } = currentMonthRange();
  const [name, setName] = useState("Presupuesto de octubre");
  const [rows, setRows] = useState([{ categoryId: "cat-housing", limit: "" }, { categoryId: "cat-food", limit: "" }, { categoryId: "cat-transport", limit: "" }]);
  const expenseCategories = vault.categories.filter((item) => item.kind === "expense");
  const budgets = vault.budgets;
  const save = (event) => {
    event.preventDefault();
    const items = rows.filter((row) => row.categoryId && Number(row.limit) > 0).map((row) => ({ categoryId: row.categoryId, limitMinorUnits: numberValue(row.limit) }));
    if (!items.length) return;
    updateVault((current) => ({ ...current, budgets: [...current.budgets, makeBudget({ name, currency: "COP", startDate: start.toISOString(), endDate: end.toISOString(), items })] }));
    setRows([{ categoryId: "cat-housing", limit: "" }]);
  };
  return <Module title="Presupuestos" eyebrow="Plan → Entender" description="Define límites y compara el plan contra el gasto real del ledger. Los actuals siempre salen de las transacciones.">
    <div className="two-col">
      <Panel><div className="panel-head"><div><small>Plan mensual</small><h3>Crear presupuesto</h3></div></div><form onSubmit={save} className="form-grid">
        <Field label="Nombre" value={name} onChange={(e) => setName(e.target.value)} />
        <div className="budget-inputs">{rows.map((row, index) => <div className="budget-input-row" key={index}><Select label={`Categoría ${index + 1}`} value={row.categoryId} onChange={(e) => setRows(rows.map((item, i) => i === index ? { ...item, categoryId: e.target.value } : item))}>{expenseCategories.map((cat) => <option key={cat.id} value={cat.id}>{cat.name}</option>)}</Select><Field label="Límite" type="number" min="0.01" step="0.01" value={row.limit} onChange={(e) => setRows(rows.map((item, i) => i === index ? { ...item, limit: e.target.value } : item))} /></div>)}<Button onClick={() => setRows([...rows, { categoryId: "cat-other", limit: "" }])}>＋ Agregar categoría</Button></div>
        <div className="form-actions"><Button primary type="submit">Crear presupuesto</Button></div>
      </form></Panel>
      <Panel><div className="panel-head"><div><small>Plan vs realidad</small><h3>Presupuestos</h3></div></div>
        {budgets.length === 0 ? <Empty title="Sin presupuesto" text="Crea un presupuesto y dale un trabajo concreto a cada peso." /> :
          <div className="budget-list">{budgets.map((budget) => { const data = budgetSummary(budget, vault, new Date(budget.startDate), new Date(budget.endDate)); return <article className="budget-card reveal" key={budget.id}><div className="budget-card-head"><div><b>{budget.name}</b><small>{new Date(budget.startDate).toLocaleDateString("es-CO")} — {new Date(budget.endDate).toLocaleDateString("es-CO")}</small></div><strong>{Math.round(data.percent)}%</strong></div>{data.lines.map((line) => <div className="budget-line" key={line.categoryId}><div><b>{line.categoryName}</b><span>{money(line.spent)} / {money(line.limitMinorUnits)}</span></div><Progress value={line.percent} tone={line.percent >= 100 ? "red" : line.percent >= 80 ? "yellow" : "green"} /></div>)}</article>; })}</div>}
      </Panel>
    </div>
  </Module>;
}

function Savings({ vault, updateVault }) {
  const [goal, setGoal] = useState({ name: "", target: "", targetDate: "" });
  const [contribution, setContribution] = useState({ goalId: "", amount: "", note: "" });
  const saveGoal = (event) => { event.preventDefault(); if (!goal.name || !goal.target) return; updateVault((current) => ({ ...current, savingsGoals: [...current.savingsGoals, makeSavingsGoal({ name: goal.name, targetMinorUnits: numberValue(goal.target), targetDate: goal.targetDate })] })); setGoal({ name: "", target: "", targetDate: "" }); };
  const saveContribution = (event) => { event.preventDefault(); if (!contribution.goalId || !contribution.amount) return; updateVault((current) => ({ ...current, savingsContributions: [...current.savingsContributions, makeSavingsContribution({ goalId: contribution.goalId, amountMinorUnits: numberValue(contribution.amount), note: contribution.note })] })); setContribution({ goalId: contribution.goalId, amount: "", note: "" }); };
  return <Module title="Ahorro y metas" eyebrow="Planeación" description="Las contribuciones son registros de progreso de una meta, no gastos del presupuesto.">
    <div className="two-col">
      <Panel><div className="panel-head"><div><small>Nueva meta</small><h3>Define qué estás construyendo</h3></div></div><form onSubmit={saveGoal} className="form-grid">
        <Field label="Nombre" placeholder="Fondo de emergencia" required value={goal.name} onChange={(e) => setGoal({ ...goal, name: e.target.value })} />
        <Field label="Objetivo" type="number" min="0.01" step="0.01" required value={goal.target} onChange={(e) => setGoal({ ...goal, target: e.target.value })} />
        <Field label="Fecha objetivo" type="date" value={goal.targetDate} onChange={(e) => setGoal({ ...goal, targetDate: e.target.value })} />
        <div className="form-actions"><Button primary type="submit">Crear meta</Button></div>
      </form></Panel>
      <Panel><div className="panel-head"><div><small>Progreso</small><h3>Contribuir</h3></div></div><form onSubmit={saveContribution} className="form-grid">
        <Select label="Meta" required value={contribution.goalId} onChange={(e) => setContribution({ ...contribution, goalId: e.target.value })}><option value="">Selecciona meta</option>{vault.savingsGoals.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
        <Field label="Monto" type="number" min="0.01" step="0.01" required value={contribution.amount} onChange={(e) => setContribution({ ...contribution, amount: e.target.value })} />
        <Field label="Nota" placeholder="Opcional" value={contribution.note} onChange={(e) => setContribution({ ...contribution, note: e.target.value })} />
        <div className="form-actions"><Button primary type="submit" disabled={!vault.savingsGoals.length}>Registrar aporte</Button></div>
      </form></Panel>
    </div>
    <div className="goal-grid">{vault.savingsGoals.map((item) => { const data = savingsProgress(item, vault.savingsContributions); return <Panel className="goal-card reveal" key={item.id}><div className="goal-head"><div><span className="badge">Meta</span><h3>{item.name}</h3></div><strong>{Math.round(data.percent)}%</strong></div><Progress value={data.percent} tone="green" /><div className="goal-values"><span>{money(data.saved)}</span><span>{money(data.target)}</span></div>{item.targetDate && <small>Objetivo · {new Date(item.targetDate).toLocaleDateString("es-CO")}</small>}</Panel>; })}</div>
  </Module>;
}

function Debts({ vault, updateVault }) {
  const [debt, setDebt] = useState({ name: "", amount: "", dueDate: "" });
  const [payment, setPayment] = useState({ debtId: "", amount: "", principal: "", interest: "", fees: "" });
  const saveDebt = (event) => { event.preventDefault(); if (!debt.name || !debt.amount) return; updateVault((current) => ({ ...current, debts: [...current.debts, makeDebt({ name: debt.name, originalMinorUnits: numberValue(debt.amount), dueDate: debt.dueDate })] })); setDebt({ name: "", amount: "", dueDate: "" }); };
  const savePayment = (event) => { event.preventDefault(); if (!payment.debtId || !payment.amount) return; updateVault((current) => ({ ...current, debtPayments: [...current.debtPayments, makeDebtPayment({ debtId: payment.debtId, amountMinorUnits: numberValue(payment.amount), principalMinorUnits: numberValue(payment.principal || payment.amount), interestMinorUnits: numberValue(payment.interest), feesMinorUnits: numberValue(payment.fees) })] })); setPayment({ ...payment, amount: "", principal: "", interest: "", fees: "" }); };
  return <Module title="Deudas" eyebrow="Planeación" description="Los pagos separan principal, intereses y cargos. Solo el principal reduce el saldo de la deuda.">
    <div className="two-col">
      <Panel><div className="panel-head"><div><small>Nueva deuda</small><h3>Registrar obligación</h3></div></div><form onSubmit={saveDebt} className="form-grid">
        <Field label="Nombre" placeholder="Crédito de consumo" required value={debt.name} onChange={(e) => setDebt({ ...debt, name: e.target.value })} />
        <Field label="Saldo inicial" type="number" min="0.01" step="0.01" required value={debt.amount} onChange={(e) => setDebt({ ...debt, amount: e.target.value })} />
        <Field label="Fecha objetivo" type="date" value={debt.dueDate} onChange={(e) => setDebt({ ...debt, dueDate: e.target.value })} />
        <div className="form-actions"><Button primary type="submit">Agregar deuda</Button></div>
      </form></Panel>
      <Panel><div className="panel-head"><div><small>Pago</small><h3>Registrar pago</h3></div></div><form onSubmit={savePayment} className="form-grid">
        <Select label="Deuda" required value={payment.debtId} onChange={(e) => setPayment({ ...payment, debtId: e.target.value })}><option value="">Selecciona deuda</option>{vault.debts.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</Select>
        <Field label="Pago total" type="number" min="0.01" step="0.01" required value={payment.amount} onChange={(e) => setPayment({ ...payment, amount: e.target.value })} />
        <Field label="Principal" type="number" min="0" step="0.01" value={payment.principal} onChange={(e) => setPayment({ ...payment, principal: e.target.value })} />
        <Field label="Intereses" type="number" min="0" step="0.01" value={payment.interest} onChange={(e) => setPayment({ ...payment, interest: e.target.value })} />
        <Field label="Cargos" type="number" min="0" step="0.01" value={payment.fees} onChange={(e) => setPayment({ ...payment, fees: e.target.value })} />
        <div className="form-actions"><Button primary type="submit" disabled={!vault.debts.length}>Registrar pago</Button></div>
      </form></Panel>
    </div>
    <div className="debt-grid">{vault.debts.map((item) => { const balance = debtBalance(item, vault.debtPayments); return <Panel className="debt-card reveal" key={item.id}><div className="goal-head"><div><span className="badge">Deuda</span><h3>{item.name}</h3></div><strong className="negative">{money(balance)}</strong></div><Progress value={item.originalMinorUnits ? ((item.originalMinorUnits - balance) / item.originalMinorUnits) * 100 : 0} tone="red" /><div className="goal-values"><span>Pagado {money(item.originalMinorUnits - balance)}</span><span>Inicial {money(item.originalMinorUnits)}</span></div></Panel>; })}</div>
  </Module>;
}

function NetWorth({ vault, updateVault }) {
  const [asset, setAsset] = useState({ name: "", amount: "" });
  const [liability, setLiability] = useState({ name: "", amount: "" });
  const data = netWorth(vault);
  const addAsset = (event) => { event.preventDefault(); if (!asset.name || !asset.amount) return; updateVault((current) => ({ ...current, assets: [...current.assets, makeAsset({ name: asset.name, minorUnits: numberValue(asset.amount) })] })); setAsset({ name: "", amount: "" }); };
  const addLiability = (event) => { event.preventDefault(); if (!liability.name || !liability.amount) return; updateVault((current) => ({ ...current, liabilities: [...current.liabilities, makeLiability({ name: liability.name, minorUnits: numberValue(liability.amount) })] })); setLiability({ name: "", amount: "" }); };
  return <Module title="Patrimonio neto" eyebrow="Activos − pasivos" description="Una vista patrimonial: activos menos todos los pasivos. Los saldos de deuda se incluyen como pasivos.">
    <div className="metrics metrics-4"><Metric label="Patrimonio neto" value={money(data.net)} detail="Activos − pasivos" tone="green" /><Metric label="Activos" value={money(data.assets)} detail="Activos registrados" tone="green" /><Metric label="Pasivos" value={money(data.liabilities)} detail="Incluye deudas" tone="red" /><Metric label="Deuda" value={money(data.debtLiabilities)} detail="Saldo pendiente" tone="blue" /></div>
    <div className="two-col">
      <Panel><div className="panel-head"><div><small>Patrimonio</small><h3>Activos</h3></div></div><form onSubmit={addAsset} className="form-grid"><Field label="Nombre" placeholder="Apartamento" required value={asset.name} onChange={(e) => setAsset({ ...asset, name: e.target.value })} /><Field label="Valor" type="number" min="0" step="0.01" required value={asset.amount} onChange={(e) => setAsset({ ...asset, amount: e.target.value })} /><div className="form-actions"><Button primary type="submit">Agregar activo</Button></div></form><div className="stack-list compact">{vault.assets.map((item) => <div className="stack-row" key={item.id}><div><b>{item.name}</b><small>Activo</small></div><strong>{money(item.minorUnits)}</strong></div>)}</div></Panel>
      <Panel><div className="panel-head"><div><small>Patrimonio</small><h3>Pasivos</h3></div></div><form onSubmit={addLiability} className="form-grid"><Field label="Nombre" placeholder="Obligación" required value={liability.name} onChange={(e) => setLiability({ ...liability, name: e.target.value })} /><Field label="Valor" type="number" min="0" step="0.01" required value={liability.amount} onChange={(e) => setLiability({ ...liability, amount: e.target.value })} /><div className="form-actions"><Button primary type="submit">Agregar pasivo</Button></div></form><div className="stack-list compact">{vault.liabilities.map((item) => <div className="stack-row" key={item.id}><div><b>{item.name}</b><small>Pasivo</small></div><strong className="negative">{money(item.minorUnits)}</strong></div>)}{vault.debts.map((item) => <div className="stack-row" key={`debt-${item.id}`}><div><b>{item.name}</b><small>Deuda</small></div><strong className="negative">{money(debtBalance(item, vault.debtPayments))}</strong></div>)}</div></Panel>
    </div>
  </Module>;
}

function Education({ vault }) {
  return <Module title="Educación" eyebrow="Aprender → ajustar" description="Cada concepto sigue FACT → CALCULATION → INTERPRETATION → ACTION.">
    <div className="education-grid">{vault.education.map((card) => <Panel className="education-card reveal" key={card.id}><span className="badge">{card.topic}</span><h3>{card.title}</h3><div><b>FACT</b><p>{card.fact}</p></div><div><b>CALCULATION</b><p>{card.calculation}</p></div><div><b>INTERPRETATION</b><p>{card.interpretation}</p></div><div><b>ACTION</b><p>{card.action}</p></div></Panel>)}</div>
  </Module>;
}

function Module({ title, eyebrow, description, children }) {
  return <div className="workspace module"><div className="module-head reveal"><div><small>{eyebrow}</small><h2>{title}</h2><p>{description}</p></div></div>{children}</div>;
}

export default function App() {
  const { vault, updateVault, saveVault, dirty, lock } = useVault();
  const [active, setActive] = useState("dashboard");
  const [moreOpen, setMoreOpen] = useState(false);
  const safeVault = useMemo(() => normalizeVault(vault), [vault]);

  const guardedLock = () => {
    if (dirty && !window.confirm("Tienes cambios sin guardar. ¿Bloquear sin guardar?")) return;
    lock();
  };

  if (!vault) return null;

  const render = () => {
    if (active === "dashboard") return <Dashboard vault={safeVault} setActive={setActive} />;
    if (active === "transactions") return <Transactions vault={safeVault} updateVault={updateVault} />;
    if (active === "accounts") return <Accounts vault={safeVault} updateVault={updateVault} />;
    if (active === "budget") return <Budget vault={safeVault} updateVault={updateVault} />;
    if (active === "savings") return <Savings vault={safeVault} updateVault={updateVault} />;
    if (active === "debts") return <Debts vault={safeVault} updateVault={updateVault} />;
    if (active === "net-worth") return <NetWorth vault={safeVault} updateVault={updateVault} />;
    return <Education vault={safeVault} />;
  };

  return <div className="app-shell">
    <Sidebar active={active} setActive={setActive} onLock={guardedLock} dirty={dirty} />
    <div className="main">
      <Topbar active={active} dirty={dirty} saveVault={saveVault} lock={guardedLock} />
      <main>{render()}</main>
      <footer>PRIVATE BY DESIGN · FINANCIAL-D3V · ENCRYPTED VAULT</footer>
    </div>
    <MobileNav active={active} setActive={setActive} moreOpen={moreOpen} setMoreOpen={setMoreOpen} />
  </div>;
}
