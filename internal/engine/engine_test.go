package engine

import "testing"

func TestAnalyzeFinancialRules(t *testing.T) {
	vault := Vault{
		Accounts: []Account{
			{ID: "checking", Currency: "COP", OpeningMinorUnits: 1000000},
			{ID: "savings", Currency: "COP", OpeningMinorUnits: 0},
		},
		Transactions: []Transaction{
			{AccountID: "checking", Type: "income", MinorUnits: 500000, Currency: "COP", CategoryID: "salary", OccurredAt: "2026-10-05T10:00:00Z"},
			{AccountID: "checking", Type: "expense", MinorUnits: 120000, Currency: "COP", CategoryID: "food", OccurredAt: "2026-10-05T11:00:00Z"},
			{AccountID: "checking", ToAccountID: "savings", Type: "transfer", MinorUnits: 200000, Currency: "COP", OccurredAt: "2026-10-05T12:00:00Z"},
		},
		SavingsGoals: []SavingsGoal{{ID: "emergency", TargetMinorUnits: 1000000, Currency: "COP"}},
		SavingsContributions: []SavingsContribution{{GoalID: "emergency", AmountMinorUnits: 250000}},
		Debts: []Debt{{ID: "card", OriginalMinorUnits: 600000, Currency: "COP"}},
		DebtPayments: []DebtPayment{{DebtID: "card", PrincipalMinorUnits: 120000}},
		Assets: []Asset{{MinorUnits: 2000000, Currency: "COP"}},
		Liabilities: []Liability{{MinorUnits: 100000, Currency: "COP"}},
	}
	result, err := Analyze(vault, Period{Start: "2026-10-01T00:00:00Z", End: "2026-11-01T00:00:00Z"}, "COP")
	if err != nil { t.Fatal(err) }

	if result.CashFlow.Income != 500000 || result.CashFlow.Expenses != 120000 || result.CashFlow.NetCashFlow != 380000 {
		t.Fatalf("unexpected cash flow: %+v", result.CashFlow)
	}
	if result.AccountBalances[0].Balance != 1180000 || result.AccountBalances[1].Balance != 200000 {
		t.Fatalf("unexpected account balances: %+v", result.AccountBalances)
	}
	if result.Savings[0].Percent != 25 {
		t.Fatalf("unexpected savings: %+v", result.Savings[0])
	}
	if result.Debts[0].Balance != 480000 {
		t.Fatalf("unexpected debt: %+v", result.Debts[0])
	}
	if result.NetWorth.Net != 1420000 {
		t.Fatalf("unexpected net worth: %+v", result.NetWorth)
	}
}

func TestAnalyzeRejectsInvalidPeriod(t *testing.T) {
	_, err := Analyze(Vault{}, Period{Start: "bad", End: "also-bad"}, "COP")
	if err == nil { t.Fatal("expected invalid period error") }
}
