package firestore

import (
	"time"

	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
)

type MoneyDocument struct {
	MinorUnits int64
	Currency string
}

type AccountDocument struct {
	ID string
	OwnerID string
	Name string
	Type string
	Currency string
	OpeningBalance MoneyDocument
	CreatedAt time.Time
}

type TransactionDocument struct {
	ID string
	OwnerID string
	AccountID string
	Type string
	Amount MoneyDocument
	CategoryID string
	TransferID string
	Description string
	OccurredAt time.Time
	CreatedAt time.Time
}

type CategoryDocument struct {
	ID string
	OwnerID string
	Name string
	Kind string
	CreatedAt time.Time
}

type BudgetItemDocument struct {
	CategoryID string
	Limit MoneyDocument
}

type BudgetDocument struct {
	ID string
	OwnerID string
	Name string
	StartDate time.Time
	EndDate time.Time
	Currency string
	Items []BudgetItemDocument
	CreatedAt time.Time
}

type SavingsGoalDocument struct {
	ID string
	OwnerID string
	Name string
	Target MoneyDocument
	TargetDate *time.Time
	CreatedAt time.Time
}

func moneyDocument(m domain.Money) MoneyDocument {
	return MoneyDocument{MinorUnits: m.MinorUnits, Currency: m.Currency}
}

func AccountToDocument(value domain.Account) AccountDocument {
	return AccountDocument{ID:value.ID, OwnerID:value.OwnerID, Name:value.Name, Type:string(value.Type), Currency:value.Currency, OpeningBalance:moneyDocument(value.OpeningBalance), CreatedAt:value.CreatedAt}
}

func TransactionToDocument(value domain.Transaction) TransactionDocument {
	return TransactionDocument{ID:value.ID, OwnerID:value.OwnerID, AccountID:value.AccountID, Type:string(value.Type), Amount:moneyDocument(value.Amount), CategoryID:value.CategoryID, TransferID:value.TransferID, Description:value.Description, OccurredAt:value.OccurredAt, CreatedAt:value.CreatedAt}
}

func CategoryToDocument(value domain.Category) CategoryDocument {
	return CategoryDocument{ID:value.ID, OwnerID:value.OwnerID, Name:value.Name, Kind:string(value.Kind), CreatedAt:value.CreatedAt}
}

func BudgetToDocument(value domain.Budget) BudgetDocument {
	items := make([]BudgetItemDocument, 0, len(value.Items))
	for _, item := range value.Items {
		items = append(items, BudgetItemDocument{CategoryID:item.CategoryID, Limit:moneyDocument(item.Limit)})
	}
	return BudgetDocument{ID:value.ID, OwnerID:value.OwnerID, Name:value.Name, StartDate:value.Period.StartDate, EndDate:value.Period.EndDate, Currency:value.Currency, Items:items, CreatedAt:value.CreatedAt}
}

func SavingsGoalToDocument(value domain.SavingsGoal) SavingsGoalDocument {
	return SavingsGoalDocument{ID:value.ID, OwnerID:value.OwnerID, Name:value.Name, Target:moneyDocument(value.Target), TargetDate:value.TargetDate, CreatedAt:value.CreatedAt}
}
