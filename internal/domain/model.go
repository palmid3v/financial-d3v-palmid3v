package domain

import (
	"errors"
	"fmt"
	"time"
)

var (
	ErrInvalidEntity = errors.New("invalid entity")
	ErrInvalidTransaction = errors.New("invalid transaction")
	ErrInvalidBudget = errors.New("invalid budget")
	ErrInvalidSavingsGoal = errors.New("invalid savings goal")
	ErrInvalidPeriod = errors.New("invalid financial period")
)

type AccountType string

const (
	AccountTypeCash AccountType = "cash"
	AccountTypeBank AccountType = "bank"
	AccountTypeCredit AccountType = "credit"
	AccountTypeInvestment AccountType = "investment"
	AccountTypeOther AccountType = "other"
)

func (t AccountType) Valid() bool {
	return t == AccountTypeCash || t == AccountTypeBank || t == AccountTypeCredit || t == AccountTypeInvestment || t == AccountTypeOther
}

type Account struct {
	ID string
	OwnerID string
	Name string
	Type AccountType
	Currency string
	OpeningBalance Money
	CreatedAt time.Time
}

func NewAccount(id, ownerID, name string, accountType AccountType, openingBalance Money, createdAt time.Time) (Account, error) {
	if id == "" || ownerID == "" || name == "" || !accountType.Valid() || openingBalance.Currency == "" {
		return Account{}, fmt.Errorf("%w: account identity, name, type and currency are required", ErrInvalidEntity)
	}
	if createdAt.IsZero() {
		createdAt = time.Now().UTC()
	}
	return Account{ID:id, OwnerID:ownerID, Name:name, Type:accountType, Currency:openingBalance.Currency, OpeningBalance:openingBalance, CreatedAt:createdAt.UTC()}, nil
}

type TransactionType string

const (
	TransactionIncome TransactionType = "income"
	TransactionExpense TransactionType = "expense"
	TransactionTransfer TransactionType = "transfer"
)

func (t TransactionType) Valid() bool {
	return t == TransactionIncome || t == TransactionExpense || t == TransactionTransfer
}

type Transaction struct {
	ID string
	OwnerID string
	AccountID string
	Type TransactionType
	Amount Money
	CategoryID string
	TransferID string
	Description string
	OccurredAt time.Time
	CreatedAt time.Time
}

func NewTransaction(id, ownerID, accountID string, transactionType TransactionType, amount Money, occurredAt time.Time) (Transaction, error) {
	if id == "" || ownerID == "" || accountID == "" || !transactionType.Valid() {
		return Transaction{}, fmt.Errorf("%w: identity, account and type are required", ErrInvalidTransaction)
	}
	if !amount.IsPositive() {
		return Transaction{}, fmt.Errorf("%w: amount must be positive", ErrInvalidTransaction)
	}
	if occurredAt.IsZero() {
		return Transaction{}, fmt.Errorf("%w: occurred time is required", ErrInvalidTransaction)
	}
	return Transaction{ID:id, OwnerID:ownerID, AccountID:accountID, Type:transactionType, Amount:amount, OccurredAt:occurredAt.UTC(), CreatedAt:time.Now().UTC()}, nil
}

func (t Transaction) IsTransfer() bool { return t.Type == TransactionTransfer }

type CategoryKind string

const (
	CategoryIncome CategoryKind = "income"
	CategoryExpense CategoryKind = "expense"
)

func (k CategoryKind) Valid() bool { return k == CategoryIncome || k == CategoryExpense }

type Category struct {
	ID string
	OwnerID string
	Name string
	Kind CategoryKind
	CreatedAt time.Time
}

func NewCategory(id, ownerID, name string, kind CategoryKind, createdAt time.Time) (Category, error) {
	if id == "" || ownerID == "" || name == "" || !kind.Valid() {
		return Category{}, fmt.Errorf("%w: category requires identity, name and valid kind", ErrInvalidEntity)
	}
	if createdAt.IsZero() { createdAt = time.Now().UTC() }
	return Category{ID:id, OwnerID:ownerID, Name:name, Kind:kind, CreatedAt:createdAt.UTC()}, nil
}

type FinancialPeriod struct {
	StartDate time.Time
	EndDate time.Time
}

func NewFinancialPeriod(startDate, endDate time.Time) (FinancialPeriod, error) {
	start, end := dateOnly(startDate), dateOnly(endDate)
	if start.IsZero() || end.IsZero() || !start.Before(end) {
		return FinancialPeriod{}, ErrInvalidPeriod
	}
	return FinancialPeriod{StartDate:start, EndDate:end}, nil
}

func (p FinancialPeriod) Contains(value time.Time) bool {
	date := dateOnly(value)
	return !date.Before(p.StartDate) && date.Before(p.EndDate)
}

type Budget struct {
	ID string
	OwnerID string
	Name string
	Period FinancialPeriod
	Currency string
	Items []BudgetItem
	CreatedAt time.Time
}

type BudgetItem struct {
	CategoryID string
	Limit Money
}

func NewBudget(id, ownerID, name, currency string, period FinancialPeriod, createdAt time.Time) (Budget, error) {
	if id == "" || ownerID == "" || name == "" || currency == "" || !period.StartDate.Before(period.EndDate) {
		return Budget{}, fmt.Errorf("%w: budget identity, name, currency and valid period are required", ErrInvalidBudget)
	}
	if createdAt.IsZero() { createdAt = time.Now().UTC() }
	return Budget{ID:id, OwnerID:ownerID, Name:name, Period:period, Currency:currency, CreatedAt:createdAt.UTC()}, nil
}

func (b *Budget) AddItem(categoryID string, limit Money) error {
	if categoryID == "" || !limit.IsPositive() || limit.Currency != b.Currency {
		return ErrInvalidBudget
	}
	for _, item := range b.Items {
		if item.CategoryID == categoryID {
			return fmt.Errorf("%w: duplicate budget category", ErrInvalidBudget)
		}
	}
	b.Items = append(b.Items, BudgetItem{CategoryID:categoryID, Limit:limit})
	return nil
}

type SavingsGoal struct {
	ID string
	OwnerID string
	Name string
	Target Money
	TargetDate *time.Time
	CreatedAt time.Time
}

func NewSavingsGoal(id, ownerID, name string, target Money, targetDate *time.Time, createdAt time.Time) (SavingsGoal, error) {
	if id == "" || ownerID == "" || name == "" || !target.IsPositive() {
		return SavingsGoal{}, ErrInvalidSavingsGoal
	}
	if targetDate != nil && targetDate.IsZero() {
		return SavingsGoal{}, ErrInvalidSavingsGoal
	}
	if createdAt.IsZero() { createdAt = time.Now().UTC() }
	var date *time.Time
	if targetDate != nil {
		value := dateOnly(*targetDate)
		date = &value
	}
	return SavingsGoal{ID:id, OwnerID:ownerID, Name:name, Target:target, TargetDate:date, CreatedAt:createdAt.UTC()}, nil
}

type SavingsProgress struct {
	Contributed Money
	Remaining Money
	Percentage float64
}

func (g SavingsGoal) Progress(contributed Money) (SavingsProgress, error) {
	if contributed.Currency != g.Target.Currency {
		return SavingsProgress{}, ErrCurrencyMismatch
	}
	if contributed.MinorUnits < 0 {
		return SavingsProgress{}, ErrInvalidSavingsGoal
	}
	remaining := g.Target.MinorUnits - contributed.MinorUnits
	if remaining < 0 { remaining = 0 }
	percentage := float64(contributed.MinorUnits) / float64(g.Target.MinorUnits) * 100
	if percentage > 100 { percentage = 100 }
	return SavingsProgress{Contributed:contributed, Remaining:Money{MinorUnits:remaining, Currency:g.Target.Currency}, Percentage:percentage}, nil
}

type EducationContext struct {
	Topic string
	MetricKey string
	Fact string
	Calculation string
	Interpretation string
	Action string
}

func (c EducationContext) Valid() bool { return c.Topic != "" && c.MetricKey != "" }

func ValidateTransferPair(outgoing, incoming Transaction) error {
	if !outgoing.IsTransfer() || !incoming.IsTransfer() {
		return fmt.Errorf("%w: both transactions must be transfers", ErrInvalidTransaction)
	}
	if outgoing.TransferID == "" || incoming.TransferID == "" || outgoing.TransferID != incoming.TransferID {
		return fmt.Errorf("%w: transfer identifier must match", ErrInvalidTransaction)
	}
	if outgoing.OwnerID != incoming.OwnerID || outgoing.AccountID == incoming.AccountID {
		return fmt.Errorf("%w: transfer must stay within one owner and use distinct accounts", ErrInvalidTransaction)
	}
	if outgoing.Amount.Currency != incoming.Amount.Currency || outgoing.Amount.MinorUnits != incoming.Amount.MinorUnits {
		return fmt.Errorf("%w: transfer amounts must match", ErrInvalidTransaction)
	}
	return nil
}

func dateOnly(value time.Time) time.Time {
	if value.IsZero() { return time.Time{} }
	value = value.UTC()
	return time.Date(value.Year(), value.Month(), value.Day(), 0, 0, 0, 0, time.UTC)
}
