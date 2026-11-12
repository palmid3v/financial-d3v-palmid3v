const MONEY = /-?\s*\$?\s*\d[\d,]*(?:\.\d{1,2})?/g;
const DATE = /^(\d{2})\/(\d{2})\/(\d{4})\s+(.+)$/;

export function parseNequiAmount(raw) {
  const value = String(raw || "").replace(/[\s$,]/g, "");
  if (!/^-?\d+(?:\.\d{1,2})?$/.test(value)) return NaN;
  return Number(value);
}

function readSummary(text, label) {
  const escaped = label.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = text.match(new RegExp(escaped + "\\s+\\$?([\\d,]+(?:\\.\\d{1,2})?)", "i"));
  return match ? parseNequiAmount(match[1]) : null;
}

export function parseNequiStatementText(text) {
  const source = String(text || "").replace(/\u00a0/g, " ");
  if (!/NEQUI\s+S\.A\.|Extracto de cuenta de ahorro de/i.test(source)) {
    throw new Error("El PDF no coincide con el formato de extracto Nequi esperado.");
  }
  const periodMatch = source.match(/per[ií]odo de:\s*(\d{4})\/(\d{2})\/(\d{2})\s+a\s+(\d{4})\/(\d{2})\/(\d{2})/i);
  if (!periodMatch) throw new Error("No se pudo identificar el periodo del extracto Nequi.");

  const rows = [];
  for (const rawLine of source.split(/\r?\n/)) {
    const line = rawLine.replace(/\s+/g, " ").trim();
    const dateMatch = line.match(DATE);
    if (!dateMatch) continue;
    const tail = dateMatch[4];
    const amounts = [...tail.matchAll(MONEY)];
    if (amounts.length < 2) continue;
    const amountMatch = amounts[amounts.length - 2];
    const balanceMatch = amounts[amounts.length - 1];
    const description = tail.slice(0, amountMatch.index).trim().replace(/\s{2,}/g, " ");
    const amount = parseNequiAmount(amountMatch[0]);
    const balance = parseNequiAmount(balanceMatch[0]);
    if (!description || !Number.isFinite(amount) || !Number.isFinite(balance) || amount === 0) continue;
    rows.push({
      rowNumber: rows.length + 1,
      date: `${dateMatch[3]}-${dateMatch[2]}-${dateMatch[1]}`,
      description,
      amount,
      balance,
    });
  }
  if (!rows.length) throw new Error("No se detectaron movimientos. El PDF puede estar escaneado o tener un formato distinto; OCR no está habilitado.");

  const summary = {
    openingBalance: readSummary(source, "Saldo anterior"),
    totalIncome: readSummary(source, "Total abonos"),
    totalExpense: readSummary(source, "Total cargos"),
    closingBalance: readSummary(source, "Saldo actual"),
  };
  const missingSummary = Object.values(summary).some((value) => value == null);
  const period = `${periodMatch[1]}-${periodMatch[2]}`;
  const expectedIncome = summary.totalIncome;
  const expectedExpense = summary.totalExpense;
  const actualIncome = rows.filter((row) => row.amount > 0).reduce((sum, row) => sum + row.amount, 0);
  const actualExpense = rows.filter((row) => row.amount < 0).reduce((sum, row) => sum + Math.abs(row.amount), 0);
  const tolerance = 0.02;
  return {
    provider: "nequi",
    period,
    periodStart: `${periodMatch[1]}-${periodMatch[2]}-${periodMatch[3]}`,
    periodEnd: `${periodMatch[4]}-${periodMatch[5]}-${periodMatch[6]}`,
    summary,
    rows,
    validation: {
      summaryComplete: !missingSummary,
      incomeMatches: expectedIncome != null && Math.abs(actualIncome - expectedIncome) <= tolerance,
      expenseMatches: expectedExpense != null && Math.abs(actualExpense - expectedExpense) <= tolerance,
      openingBalanceMatches: rows.length > 0 && summary.openingBalance != null
        ? Math.abs(rows[rows.length - 1].balance - rows[rows.length - 1].amount - summary.openingBalance) <= tolerance
        : false,
      closingBalanceMatches: rows.length > 0 && summary.closingBalance != null
        ? Math.abs(rows[0].balance - summary.closingBalance) <= tolerance
        : false,
      actualIncome,
      actualExpense,
    },
  };
}

export async function extractPdfText(file) {
  const pdfjs = await import("pdfjs-dist");
  pdfjs.GlobalWorkerOptions.workerSrc = new URL("pdfjs-dist/build/pdf.worker.min.mjs", import.meta.url).toString();
  const data = new Uint8Array(await file.arrayBuffer());
  const document = await pdfjs.getDocument({ data, isEvalSupported: false, useSystemFonts: true }).promise;
  const pages = [];
  try {
    for (let pageNumber = 1; pageNumber <= document.numPages; pageNumber += 1) {
      const page = await document.getPage(pageNumber);
      const content = await page.getTextContent();
      const lines = new Map();
      for (const item of content.items) {
        if (!("str" in item) || !item.str.trim()) continue;
        const y = Math.round(item.transform[5] / 2) * 2;
        if (!lines.has(y)) lines.set(y, []);
        lines.get(y).push({ x: item.transform[4], text: item.str });
      }
      pages.push([...lines.entries()]
        .sort((a, b) => b[0] - a[0])
        .map(([, items]) => items.sort((a, b) => a.x - b.x).map((item) => item.text).join(" "))
        .join("\n"));
    }
  } finally {
    await document.destroy();
  }
  return pages.join("\n");
}
