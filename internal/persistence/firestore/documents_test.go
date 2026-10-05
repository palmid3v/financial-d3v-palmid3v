package firestore

import (
	"testing"
	"time"

	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
)

func TestAccountDocumentPreservesMoneyAndOwnership(t *testing.T) {
	account, err := domain.NewAccount("a-1", "owner-1", "Checking", domain.AccountTypeBank, domain.MustMoney(150000, "COP"), time.Time{})
	if err != nil { t.Fatal(err) }
	document := AccountToDocument(account)
	if document.OwnerID != account.OwnerID || document.OpeningBalance.MinorUnits != 150000 || document.OpeningBalance.Currency != "COP" {
		t.Fatalf("unexpected document: %+v", document)
	}
}

func TestBudgetDocumentPreservesPeriodAndItems(t *testing.T) {
	period, _ := domain.NewFinancialPeriod(
		time.Date(2026, 10, 1, 0, 0, 0, 0, time.UTC),
		time.Date(2026, 11, 1, 0, 0, 0, 0, time.UTC),
	)
	budget, _ := domain.NewBudget("b-1", "owner-1", "October", "COP", period, time.Time{})
	_ = budget.AddItem("food", domain.MustMoney(500000, "COP"))
	document := BudgetToDocument(budget)
	if len(document.Items) != 1 || !document.StartDate.Equal(period.StartDate) || !document.EndDate.Equal(period.EndDate) {
		t.Fatalf("unexpected document: %+v", document)
	}
}
