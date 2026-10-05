const DEFAULT_CATEGORIES = [
  { id: "cat-housing", name: "Vivienda", kind: "expense", color: "blue" },
  { id: "cat-food", name: "Comida", kind: "expense", color: "green" },
  { id: "cat-transport", name: "Transporte", kind: "expense", color: "yellow" },
  { id: "cat-leisure", name: "Ocio", kind: "expense", color: "purple" },
  { id: "cat-health", name: "Salud", kind: "expense", color: "red" },
  { id: "cat-other", name: "Otros", kind: "expense", color: "gray" },
  { id: "cat-salary", name: "Salario", kind: "income", color: "green" },
  { id: "cat-other-income", name: "Otros ingresos", kind: "income", color: "blue" },
];

const EDUCATION = [
  {
    id: "edu-cash-flow",
    topic: "Cash flow",
    title: "El flujo de caja cuenta una historia",
    fact: "El flujo de caja es la diferencia entre ingresos y gastos durante un periodo.",
    calculation: "Flujo neto = ingresos − gastos.",
    interpretation: "Un flujo positivo significa que entró más dinero del que salió en el periodo.",
    action: "Revisa qué categorías explican el cambio y decide qué mantener o ajustar.",
  },
  {
    id: "edu-net-worth",
    topic: "Patrimonio",
    title: "Tu patrimonio es una fotografía",
    fact: "El patrimonio neto representa lo que queda después de restar todos los pasivos a los activos.",
    calculation: "Patrimonio neto = activos − pasivos.",
    interpretation: "Puede subir o bajar aunque el flujo mensual sea positivo o negativo.",
    action: "Revisa los componentes del patrimonio, no solo el número final.",
  },
  {
    id: "edu-budget",
    topic: "Presupuesto",
    title: "Un presupuesto compara plan contra realidad",
    fact: "El presupuesto establece límites para categorías y el ledger registra lo que realmente ocurrió.",
    calculation: "Disponible = límite − gasto real.",
    interpretation: "El porcentaje usado muestra qué tan cerca estás del límite.",
    action: "Ajusta la decisión, no el dato histórico: el ledger sigue siendo autoritativo.",
  },
];

const nowIso = () => new Date().toISOString();
const uid = (prefix) => `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;

export function seedCategories(categories = []) {
  const existing = new Set(categories.map((item) => item.id));
  return [...categories, ...DEFAULT_CATEGORIES.filter((item) => !existing.has(item.id))];
}

export function normalizeVault(vault) {
  const next = { ...vault };
  next.accounts = Array.isArray(next.accounts) ? next.accounts : [];
  next.categories = seedCategories(Array.isArray(next.categories) ? next.categories : []);
  next.transactions = Array.isArray(next.transactions) ? next.transactions : [];
  next.budgets = Array.isArray(next.budgets) ? next.budgets : [];
  next.savingsGoals = Array.isArray(next.savingsGoals) ? next.savingsGoals : [];
  next.savingsContributions = Array.isArray(next.savingsContributions) ? next.savingsContributions : [];
  next.debts = Array.isArray(next.debts) ? next.debts : [];
  next.debtPayments = Array.isArray(next.debtPayments) ? next.debtPayments : [];
  next.assets = Array.isArray(next.assets) ? next.assets : [];
  next.liabilities = Array.isArray(next.liabilities) ? next.liabilities : [];
  next.education = Array.isArray(next.education) && next.education.length ? next.education : EDUCATION;
  return next;
}

export function makeAccount({ name, type = "bank", currency = "COP", openingMinorUnits = 0 }) {
  return { id: uid("acc"), name, type, currency: currency.toUpperCase(), openingMinorUnits: Number(openingMinorUnits) || 0, createdAt: nowIso() };
}

export function makeTransaction(data) {
  return { id: uid("tx"), createdAt: nowIso(), ...data, minorUnits: Math.abs(Number(data.minorUnits) || 0) };
}

export function makeBudget({ name, currency = "COP", startDate, endDate, items }) {
  return { id: uid("budget"), name, currency, startDate, endDate, items: items.map((item) => ({ ...item, limitMinorUnits: Number(item.limitMinorUnits) || 0 })), createdAt: nowIso() };
}

export function makeSavingsGoal({ name, targetMinorUnits, currency = "COP", targetDate = "" }) {
  return { id: uid("goal"), name, targetMinorUnits: Number(targetMinorUnits) || 0, currency, targetDate, createdAt: nowIso() };
}

export function makeSavingsContribution(data) {
  return { id: uid("contrib"), occurredAt: nowIso(), ...data, amountMinorUnits: Math.abs(Number(data.amountMinorUnits) || 0) };
}

export function makeDebt({ name, originalMinorUnits, currency = "COP", dueDate = "" }) {
  return { id: uid("debt"), name, originalMinorUnits: Number(originalMinorUnits) || 0, currency, dueDate, createdAt: nowIso() };
}

export function makeDebtPayment(data) {
  const amount = Math.abs(Number(data.amountMinorUnits) || 0);
  const principal = Math.min(Math.abs(Number(data.principalMinorUnits) || 0), amount);
  const interest = Math.abs(Number(data.interestMinorUnits) || 0);
  const fees = Math.abs(Number(data.feesMinorUnits) || 0);
  return { id: uid("debt-payment"), occurredAt: nowIso(), ...data, amountMinorUnits: amount, principalMinorUnits: principal, interestMinorUnits: interest, feesMinorUnits: fees };
}

export function makeAsset({ name, minorUnits, currency = "COP" }) {
  return { id: uid("asset"), name, minorUnits: Number(minorUnits) || 0, currency, createdAt: nowIso() };
}

export function makeLiability({ name, minorUnits, currency = "COP" }) {
  return { id: uid("liability"), name, minorUnits: Number(minorUnits) || 0, currency, createdAt: nowIso() };
}

export function currentMonthRange(date = new Date()) {
  return {
    start: new Date(date.getFullYear(), date.getMonth(), 1),
    end: new Date(date.getFullYear(), date.getMonth() + 1, 1),
  };
}

export function inRange(iso, start, end) {
  const value = new Date(iso).getTime();
  return value >= start.getTime() && value < end.getTime();
}

export function transactionSignedMinor(transaction) {
  const type = transaction.type;
  return type === "income" ? transaction.minorUnits : type === "expense" ? -transaction.minorUnits : 0;
}

export function transactionTotals(transactions, start, end) {
  const scoped = transactions.filter((item) => inRange(item.occurredAt, start, end));
  const income = scoped.filter((item) => item.type === "income").reduce((sum, item) => sum + item.minorUnits, 0);
  const expenses = scoped.filter((item) => item.type === "expense").reduce((sum, item) => sum + item.minorUnits, 0);
  return { income, expenses, netCashFlow: income - expenses, transactions: scoped };
}

export function accountBalance(account, transactions) {
  const opening = Number(account.openingMinorUnits) || 0;
  return transactions.reduce((balance, item) => {
    if (item.accountId !== account.id) return balance;
    if (item.type === "income") return balance + item.minorUnits;
    if (item.type === "expense") return balance - item.minorUnits;
    return balance;
  }, opening);
}

export function debtBalance(debt, payments) {
  const principalPaid = payments
    .filter((item) => item.debtId === debt.id)
    .reduce((sum, item) => sum + (Number(item.principalMinorUnits) || 0), 0);
  return Math.max(0, (Number(debt.originalMinorUnits) || 0) - principalPaid);
}

export function savingsProgress(goal, contributions) {
  const saved = contributions
    .filter((item) => item.goalId === goal.id)
    .reduce((sum, item) => sum + (Number(item.amountMinorUnits) || 0), 0);
  const target = Number(goal.targetMinorUnits) || 0;
  return { saved, target, percent: target ? Math.min(100, (saved / target) * 100) : 0 };
}

export function netWorth(vault, currency = "COP") {
  const assets = vault.assets.filter((item) => item.currency === currency).reduce((sum, item) => sum + (Number(item.minorUnits) || 0), 0);
  const explicitLiabilities = vault.liabilities.filter((item) => item.currency === currency).reduce((sum, item) => sum + (Number(item.minorUnits) || 0), 0);
  const debtLiabilities = vault.debts.filter((item) => item.currency === currency).reduce((sum, debt) => sum + debtBalance(debt, vault.debtPayments), 0);
  return { assets, liabilities: explicitLiabilities + debtLiabilities, debtLiabilities, net: assets - explicitLiabilities - debtLiabilities };
}

export function budgetSummary(budget, vault, start = new Date(budget.startDate), end = new Date(budget.endDate)) {
  const lines = budget.items.map((item) => {
    const category = vault.categories.find((candidate) => candidate.id === item.categoryId);
    const spent = vault.transactions
      .filter((tx) => tx.type === "expense" && tx.categoryId === item.categoryId && inRange(tx.occurredAt, start, end))
      .reduce((sum, tx) => sum + tx.minorUnits, 0);
    const limit = Number(item.limitMinorUnits) || 0;
    return { ...item, categoryName: category?.name || "Category", spent, remaining: limit - spent, percent: limit ? (spent / limit) * 100 : 0 };
  });
  const totalLimit = lines.reduce((sum, item) => sum + item.limitMinorUnits, 0);
  const totalSpent = lines.reduce((sum, item) => sum + item.spent, 0);
  return { lines, totalLimit, totalSpent, totalRemaining: totalLimit - totalSpent, percent: totalLimit ? (totalSpent / totalLimit) * 100 : 0 };
}

export function monthLabel(date) {
  return new Intl.DateTimeFormat("es-CO", { month: "short" }).format(date).replace(".", "");
}

export function monthSeries(transactions, months = 6, reference = new Date()) {
  const rows = [];
  for (let i = months - 1; i >= 0; i -= 1) {
    const date = new Date(reference.getFullYear(), reference.getMonth() - i, 1);
    const { start, end } = currentMonthRange(date);
    const totals = transactionTotals(transactions, start, end);
    rows.push({ label: monthLabel(date), income: totals.income, expenses: totals.expenses });
  }
  return rows;
}

export { DEFAULT_CATEGORIES, EDUCATION };
