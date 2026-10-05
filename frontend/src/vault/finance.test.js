import test from "node:test";
import assert from "node:assert/strict";
import {
  accountBalance,
  budgetSummary,
  currentMonthRange,
  debtBalance,
  makeAccount,
  makeBudget,
  makeDebt,
  makeDebtPayment,
  makeSavingsContribution,
  makeSavingsGoal,
  netWorth,
  savingsProgress,
} from "./finance.js";

const account = makeAccount({ name: "Cuenta principal", openingMinorUnits: 1000000 });

test("account balance derives from ledger and transfers", () => {
  const other = makeAccount({ name: "Ahorros", openingMinorUnits: 0 });
  const transactions = [
    { accountId: account.id, type: "income", minorUnits: 500000 },
    { accountId: account.id, type: "expense", minorUnits: 120000 },
    { accountId: account.id, toAccountId: other.id, type: "transfer", minorUnits: 200000 },
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

  const result = budgetSummary(budget, vault, start, end);
  assert.equal(result.totalSpent, 125000);
  assert.equal(result.totalRemaining, 375000);
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
