const HEADER_ALIASES = {
  date: ["fecha", "fecha del movimiento", "date", "transaction date"],
  description: ["descripcion", "descripción", "concepto", "detalle", "description", "detail"],
  amount: ["valor", "monto", "importe", "amount", "debit/credit"],
  balance: ["saldo", "balance", "saldo disponible"],
};

const normalizeHeader = (value) => String(value || "")
  .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
  .toLowerCase().replace(/[^a-z0-9/ ]/g, "").trim();

export function parseStatementCsv(text) {
  const source = String(text || "").replace(/^\uFEFF/, "");
  const lines = source.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length < 2) throw new Error("El archivo no contiene filas suficientes.");

  const delimiter = [",", ";", "\t"].sort((a, b) =>
    (lines[0].split(b).length - 1) - (lines[0].split(a).length - 1))[0];
  const parseLine = (line) => {
    const cells = [];
    let value = "";
    let quoted = false;
    for (let index = 0; index < line.length; index += 1) {
      const char = line[index];
      if (char === '"' && line[index + 1] === '"' && quoted) { value += '"'; index += 1; }
      else if (char === '"') quoted = !quoted;
      else if (char === delimiter && !quoted) { cells.push(value.trim()); value = ""; }
      else value += char;
    }
    cells.push(value.trim());
    return cells;
  };

  const headers = parseLine(lines[0]).map(normalizeHeader);
  const locate = (key) => headers.findIndex((header) => HEADER_ALIASES[key].includes(header));
  const indexes = { date: locate("date"), description: locate("description"), amount: locate("amount"), balance: locate("balance") };
  if (indexes.date < 0 || indexes.description < 0 || indexes.amount < 0) {
    throw new Error("No se reconocieron las columnas. Se requieren Fecha, Descripción y Valor.");
  }

  const parseDate = (raw) => {
    const value = String(raw || "").trim();
    let match = value.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
    if (match) return `${match[3]}-${match[2].padStart(2, "0")}-${match[1].padStart(2, "0")}`;
    match = value.match(/^(\d{4})-(\d{2})-(\d{2})/);
    return match ? `${match[1]}-${match[2]}-${match[3]}` : "";
  };
  const parseAmount = (raw) => {
    let value = String(raw || "").replace(/[^\d,.-]/g, "");
    if (!value || !/[\d]/.test(value)) return NaN;
    const comma = value.lastIndexOf(",");
    const dot = value.lastIndexOf(".");
    if (comma >= 0 && dot >= 0) {
      const decimal = comma > dot ? "," : ".";
      value = value.replace(decimal === "," ? /\./g : /,/g, "").replace(decimal, ".");
    } else if (comma >= 0) {
      value = value.replace(",", ".");
    }
    return Number(value);
  };

  const rows = lines.slice(1).map((line, index) => {
    const cells = parseLine(line);
    const amount = parseAmount(cells[indexes.amount]);
    const date = parseDate(cells[indexes.date]);
    const description = cells[indexes.description] || "";
    const balance = indexes.balance >= 0 ? parseAmount(cells[indexes.balance]) : null;
    return { rowNumber: index + 2, date, description, amount, balance: Number.isFinite(balance) ? Math.round(balance * 100) : null };
  }).filter((row) => row.date || row.description || Number.isFinite(row.amount));

  const invalid = rows.filter((row) => !row.date || !row.description || !Number.isFinite(row.amount) || row.amount === 0);
  return { rows, invalid, headers };
}

export function statementFingerprint(accountId, row) {
  const normalized = [
    accountId,
    row.date,
    String(row.description || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/\s+/g, " ").trim(),
    Math.round(Math.abs(Number(row.amount)) * 100),
    row.balance ?? "",
  ].join("|");
  let hash = 2166136261;
  for (let index = 0; index < normalized.length; index += 1) {
    hash ^= normalized.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return `stmt-${(hash >>> 0).toString(16).padStart(8, "0")}`;
}

export function reconcileStatementRows(rows, accountId, transactions = []) {
  const imported = new Set(transactions.map((item) => item.importFingerprint).filter(Boolean));
  return rows.map((row) => {
    const fingerprint = statementFingerprint(accountId, row);
    const exactDuplicate = imported.has(fingerprint);
    return { ...row, fingerprint, exactDuplicate, selected: !exactDuplicate, suggestedType: row.amount < 0 ? "expense" : "income" };
  });
}
