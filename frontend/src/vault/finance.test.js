import test from "node:test";
import assert from "node:assert/strict";
import {
  accountBalance,
  budgetSummary,
  makeDebtPayment,
  makeTransaction,
  transactionTotals,
  normalizeVault,
  currentMonthRange,
  debtBalance,
  makeAccount,
  makeBudget,
  makeDebt,
  makeSavingsContribution,
  makeSavingsGoal,
  netWorth,
  savingsProgress,
} from "./finance.js";

const account = makeAccount({ name: "Cuenta principal", openingMinorUnits: 1000000 });

test("account balance derives from ledger and transfers", () => {
  const other = makeAccount({ name: "Ahorros", openingMinorUnits: 0 });
  const transactions = [
    { accountId: account.id, type: "income", minorUnits: 500000, currency: "COP" },
    { accountId: account.id, type: "expense", minorUnits: 120000, currency: "COP" },
    { accountId: account.id, toAccountId: other.id, type: "transfer", minorUnits: 200000, currency: "COP" },
  ];

  assert.equal(accountBalance(account, transactions), 1180000);
  assert.equal(accountBalance(other, transactions), 200000);
});

test("budget actuals come from expense transactions", () => {
  const { start, end } = currentMonthRange();
  const budget = makeBudget({
    name: "Monthly",
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    items: [{ categoryId: "cat-food", limitMinorUnits: 500000 }],
  });
  const vault = {
    categories: [{ id: "cat-food", name: "Comida" }],
    transactions: [
      { type: "expense", categoryId: "cat-food", minorUnits: 125000, occurredAt: new Date(start.getTime() + 1000).toISOString() },
      { type: "income", categoryId: "cat-food", minorUnits: 900000, occurredAt: new Date(start.getTime() + 2000).toISOString() },
    ],
  };

  vault.transactions.push({
    type: "expense",
    categoryId: "cat-food",
    minorUnits: 700000,
    currency: "USD",
    occurredAt: new Date(start.getTime() + 3000).toISOString(),
  });

  const result = budgetSummary(budget, vault, start, end);
  assert.equal(result.totalSpent, 125000);
  assert.equal(result.totalRemaining, 375000);
});

test("cash flow excludes transactions in a different currency", () => {
  const { start, end } = currentMonthRange();
  const transactions = [
    { type: "income", minorUnits: 500000, currency: "COP", occurredAt: new Date(start.getTime() + 1000).toISOString() },
    { type: "income", minorUnits: 800000, currency: "USD", occurredAt: new Date(start.getTime() + 2000).toISOString() },
    { type: "expense", minorUnits: 120000, currency: "COP", occurredAt: new Date(start.getTime() + 3000).toISOString() },
  ];
  const result = transactionTotals(transactions, start, end, "COP");
  assert.equal(result.income, 500000);
  assert.equal(result.expenses, 120000);
  assert.equal(result.netCashFlow, 380000);
});

test("account balance ignores transactions whose currency differs from the account", () => {
  const transactions = [
    { accountId: account.id, type: "income", minorUnits: 100000, currency: "USD" },
  ];
  assert.equal(accountBalance(account, transactions), account.openingMinorUnits);
});

test("debt payments must reconcile principal, interest, fees and total", () => {
  assert.throws(() => makeDebtPayment({
    debtId: "debt-1",
    amountMinorUnits: 10000,
    principalMinorUnits: 8000,
    interestMinorUnits: 1000,
    feesMinorUnits: 500,
  }), /principal \+ intereses \+ cargos/);
  assert.throws(() => makeDebtPayment({
    debtId: "debt-1",
    amountMinorUnits: 10000,
    principalMinorUnits: -1,
    interestMinorUnits: 10001,
    feesMinorUnits: 0,
  }), /importes enteros válidos/);
  const valid = makeDebtPayment({
    debtId: "debt-1",
    amountMinorUnits: 10000,
    principalMinorUnits: 8500,
    interestMinorUnits: 1000,
    feesMinorUnits: 500,
  });
  assert.equal(valid.amountMinorUnits, 10000);
});

test("savings progress is separate from ordinary expenses", () => {
  const goal = makeSavingsGoal({ name: "Emergency", targetMinorUnits: 1000000 });
  const contributions = [makeSavingsContribution({ goalId: goal.id, amountMinorUnits: 250000 })];
  const result = savingsProgress(goal, contributions);

  assert.equal(result.saved, 250000);
  assert.equal(result.percent, 25);
});

test("debt balance decreases only by principal", () => {
  const debt = makeDebt({ name: "Credit", originalMinorUnits: 1000000 });
  const payment = makeDebtPayment({
    debtId: debt.id,
    amountMinorUnits: 180000,
    principalMinorUnits: 120000,
    interestMinorUnits: 50000,
    feesMinorUnits: 10000,
  });

  assert.equal(debtBalance(debt, [payment]), 880000);
});

test("net worth includes debt balances as liabilities", () => {
  const debt = makeDebt({ name: "Credit", originalMinorUnits: 600000 });
  const vault = {
    assets: [{ id: "asset", name: "Savings", minorUnits: 2000000, currency: "COP" }],
    liabilities: [{ id: "liability", name: "Other", minorUnits: 100000, currency: "COP" }],
    debts: [debt],
    debtPayments: [],
  };

  const result = netWorth(vault);
  assert.equal(result.assets, 2000000);
  assert.equal(result.liabilities, 700000);
  assert.equal(result.net, 1300000);
});


test("legacy transactions inherit the normalized source-account currency", () => {
  const vault = normalizeVault({
    accounts: [{ id: "usd-account", name: "USD", currency: "usd", openingMinorUnits: 0 }],
    transactions: [{ id: "legacy-tx", accountId: "usd-account", type: "income", minorUnits: 1000 }],
  });
  assert.equal(vault.accounts[0].currency, "USD");
  assert.equal(vault.transactions[0].currency, "USD");
});


test("net worth filters assets and liabilities by currency without conversion", () => {
  const vault = {
    assets: [
      { id: "cop-asset", minorUnits: 250000, currency: "COP" },
      { id: "usd-asset", minorUnits: 90000, currency: "USD" },
    ],
    liabilities: [
      { id: "cop-liability", minorUnits: 50000, currency: "COP" },
      { id: "usd-liability", minorUnits: 10000, currency: "USD" },
    ],
    debts: [
      { id: "cop-debt", originalMinorUnits: 30000, currency: "COP" },
      { id: "usd-debt", originalMinorUnits: 20000, currency: "USD" },
    ],
    debtPayments: [],
  };
  const cop = netWorth(vault, "COP");
  const usd = netWorth(vault, "USD");
  assert.deepEqual(cop, { assets: 250000, liabilities: 80000, debtLiabilities: 30000, net: 170000 });
  assert.deepEqual(usd, { assets: 90000, liabilities: 30000, debtLiabilities: 20000, net: 60000 });
});


test("transaction domain helper rejects invalid amounts and malformed transfers", () => {
  assert.throws(() => makeTransaction({ type: "expense", accountId: "acc-1", minorUnits: 0 }), /importe positivo/);
  assert.throws(() => makeTransaction({ type: "expense", accountId: "acc-1", minorUnits: -100 }), /importe positivo/);
  assert.throws(() => makeTransaction({ type: "expense", accountId: "acc-1", minorUnits: Number.MAX_SAFE_INTEGER + 1 }), /importe positivo/);
  assert.throws(() => makeTransaction({ type: "transfer", accountId: "acc-1", toAccountId: "acc-1", minorUnits: 100 }), /cuenta destino distinta/);
  const valid = makeTransaction({ type: "transfer", accountId: "acc-1", toAccountId: "acc-2", minorUnits: 100 });
  assert.equal(valid.minorUnits, 100);
});


test("savings contribution helper rejects missing goals and invalid amounts", () => {
  assert.throws(() => makeSavingsContribution({ goalId: "goal-1", amountMinorUnits: 0 }), /meta y un importe positivo/);
  assert.throws(() => makeSavingsContribution({ goalId: "", amountMinorUnits: 100 }), /meta y un importe positivo/);
  assert.throws(() => makeSavingsContribution({ goalId: "goal-1", amountMinorUnits: -100 }), /meta y un importe positivo/);
  assert.equal(makeSavingsContribution({ goalId: "goal-1", amountMinorUnits: 100 }).amountMinorUnits, 100);
});


test("account helper rejects negative or unsafe opening balances", () => {
  assert.throws(() => makeAccount({ name: "Invalid", openingMinorUnits: -1 }), /saldo inicial entero no negativo/);
  assert.throws(() => makeAccount({ name: "Invalid", openingMinorUnits: Number.MAX_SAFE_INTEGER + 1 }), /saldo inicial entero no negativo/);
  assert.equal(makeAccount({ name: "Valid", currency: "usd", openingMinorUnits: 0 }).currency, "USD");
});


test("debt payments reduce the selected account by the full payment but count only interest and fees as expenses", () => {
  const { start, end } = currentMonthRange();
  const cash = makeAccount({ name: "Cuenta de pago", openingMinorUnits: 1000000 });
  const debt = makeDebt({ name: "Crédito", originalMinorUnits: 600000 });
  const payment = makeDebtPayment({
    debtId: debt.id,
    accountId: cash.id,
    currency: "COP",
    categoryId: "cat-other",
    amountMinorUnits: 100000,
    principalMinorUnits: 80000,
    interestMinorUnits: 15000,
    feesMinorUnits: 5000,
    occurredAt: new Date(start.getTime() + 1000).toISOString(),
  });
  assert.equal(accountBalance(cash, [], [payment]), 900000);
  const flow = transactionTotals([], start, end, "COP", [payment]);
  assert.equal(flow.expenses, 20000);
  assert.equal(flow.principalPayments, 80000);
  assert.equal(flow.cashOutflows, 100000);
  assert.equal(flow.netCashFlow, -100000);
  assert.equal(debtBalance(debt, [payment]), 520000);
  const worth = netWorth({
    accounts: [cash],
    transactions: [],
    assets: [],
    liabilities: [],
    debts: [debt],
    debtPayments: [payment],
  });
  assert.equal(worth.assets, 900000);
  assert.equal(worth.liabilities, 520000);
  assert.equal(worth.net, 380000);
});

test("account-scoped budgets include only expenses and debt interest/fees from that account", () => {
  const { start, end } = currentMonthRange();
  const checking = makeAccount({ name: "Corriente", openingMinorUnits: 0 });
  const savings = makeAccount({ name: "Ahorros", openingMinorUnits: 0 });
  const budget = makeBudget({
    name: "Comida de corriente",
    accountId: checking.id,
    currency: "COP",
    startDate: start.toISOString(),
    endDate: end.toISOString(),
    items: [{ categoryId: "cat-food", limitMinorUnits: 100000 }],
  });
  const vault = {
    accounts: [checking, savings],
    categories: [{ id: "cat-food", name: "Comida" }],
    transactions: [
      { type: "expense", accountId: checking.id, categoryId: "cat-food", currency: "COP", minorUnits: 30000, occurredAt: new Date(start.getTime() + 1000).toISOString() },
      { type: "expense", accountId: savings.id, categoryId: "cat-food", currency: "COP", minorUnits: 40000, occurredAt: new Date(start.getTime() + 2000).toISOString() },
    ],
    debtPayments: [
      { accountId: checking.id, currency: "COP", categoryId: "cat-food", interestMinorUnits: 10000, feesMinorUnits: 5000, occurredAt: new Date(start.getTime() + 3000).toISOString() },
      { accountId: savings.id, currency: "COP", categoryId: "cat-food", interestMinorUnits: 20000, feesMinorUnits: 0, occurredAt: new Date(start.getTime() + 4000).toISOString() },
    ],
  };
  assert.equal(budgetSummary(budget, vault, start, end).totalSpent, 45000);
});


test("legacy vault records receive safe defaults for account-linked finance", () => {
  const vault = normalizeVault({
    accounts: [{ id: "bank-cop", name: "Banco", currency: "cop", type: "bank", openingMinorUnits: 0 }],
    budgets: [{ id: "budget-legacy", name: "Legacy", items: [] }],
    savingsGoals: [{ id: "goal-usd", name: "USD goal", currency: "usd", targetMinorUnits: 10000 }],
    savingsContributions: [{ id: "contribution-legacy", goalId: "goal-usd", amountMinorUnits: 1000 }],
    debts: [{ id: "debt-usd", name: "USD debt", currency: "usd", originalMinorUnits: 10000 }],
    debtPayments: [{ id: "payment-legacy", debtId: "debt-usd", amountMinorUnits: 1000, principalMinorUnits: 500, interestMinorUnits: 400, feesMinorUnits: 100 }],
  });
  assert.equal(vault.budgets[0].accountId, "all");
  assert.equal(vault.savingsContributions[0].currency, "USD");
  assert.equal(vault.debtPayments[0].currency, "USD");
  assert.equal(vault.debtPayments[0].categoryId, "cat-other");
});

test("credit accounts are not double-counted as net-worth assets", () => {
  const bank = makeAccount({ name: "Banco", openingMinorUnits: 500000 });
  const card = makeAccount({ name: "Tarjeta", type: "credit", openingMinorUnits: 0 });
  const vault = {
    accounts: [bank, card],
    transactions: [{ type: "expense", accountId: card.id, currency: "COP", minorUnits: 100000 }],
    assets: [],
    liabilities: [],
    debts: [makeDebt({ name: "Tarjeta", originalMinorUnits: 100000 })],
    debtPayments: [],
  };
  const result = netWorth(vault);
  assert.equal(result.accountAssets, 500000);
  assert.equal(result.accountLiabilities, 0);
  assert.equal(result.liabilities, 100000);
  assert.equal(result.net, 400000);
});
