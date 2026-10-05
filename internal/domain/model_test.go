package domain

import (
	"testing"
	"time"
)

func TestMoneyRejectsCurrencyMismatch(t *testing.T) {
	if _, err := MustMoney(100, "USD").Add(MustMoney(100, "EUR")); err != ErrCurrencyMismatch {
		t.Fatalf("expected currency mismatch, got %v", err)
	}
}

func TestTransactionRequiresPositiveAmount(t *testing.T) {
	_, err := NewTransaction("tx-1", "owner-1", "account-1", TransactionExpense, MustMoney(0, "COP"), time.Now())
	if err == nil {
		t.Fatal("expected zero amount to be rejected")
	}
}

func TestFinancialPeriodUsesHalfOpenRange(t *testing.T) {
	period, err := NewFinancialPeriod(
		time.Date(2026, 10, 1, 0, 0, 0, 0, time.UTC),
		time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC),
	)
	if err != nil { t.Fatal(err) }
	if !period.Contains(time.Date(2026, 10, 31, 12, 0, 0, 0, time.UTC)) { t.Fatal("expected date inside period") }
	if period.Contains(time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC)) { t.Fatal("expected end boundary to be excluded") }
}

func TestBudgetRejectsDuplicateCategory(t *testing.T) {
	period, _ := NewFinancialPeriod(
		time.Date(2026, 10, 1, 0, 0, 0, 0, time.UTC),
		time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC),
	)
	budget, _ := NewBudget("b-1", "owner-1", "October", "COP", period, time.Time{})
	if err := budget.AddItem("food", MustMoney(500000, "COP")); err != nil { t.Fatal(err) }
	if err := budget.AddItem("food", MustMoney(500000, "COP")); err == nil { t.Fatal("expected duplicate category rejection") }
}

func TestSavingsGoalCapsProgressAt100(t *testing.T) {
	goal, _ := NewSavingsGoal("g-1", "owner-1", "Emergency", MustMoney(1000000, "COP"), nil, time.Time{})
	progress, err := goal.Progress(MustMoney(1200000, "COP"))
	if err != nil { t.Fatal(err) }
	if progress.Percentage != 100 || progress.Remaining.MinorUnits != 0 { t.Fatalf("unexpected progress: %+v", progress) }
}

func TestAccountBalanceIsReproducibleFromTransactions(t *testing.T) {
	account, _ := NewAccount("a-1", "owner-1", "Bank", AccountTypeBank, MustMoney(100000, "COP"), time.Time{})
	transactions := []Transaction{
		{AccountID: "a-1", Type: TransactionIncome, Amount: MustMoney(50000, "COP")},
		{AccountID: "a-1", Type: TransactionExpense, Amount: MustMoney(20000, "COP")},
		{AccountID: "a-1", Type: TransactionTransfer, Amount: MustMoney(10000, "COP")},
	}
	balance, err := CalculateAccountBalance(account, transactions)
	if err != nil { t.Fatal(err) }
	if balance.MinorUnits != 120000 { t.Fatalf("expected 120000, got %d", balance.MinorUnits) }
}
