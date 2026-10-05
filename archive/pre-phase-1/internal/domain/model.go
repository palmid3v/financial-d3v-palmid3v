package domain

import "time"

type User struct {
	ID string
	Email string
	CreatedAt time.Time
}

type Organization struct {
	ID string
	Name string
	CreatedAt time.Time
}

type AccountType string

const (
	AccountTypeCash AccountType = "cash"
	AccountTypeBank AccountType = "bank"
	AccountTypeCredit AccountType = "credit"
	AccountTypeInvestment AccountType = "investment"
	AccountTypeOther AccountType = "other"
)

type Account struct {
	ID string
	OwnerID string
	Name string
	Type AccountType
	Currency string
	OpeningBalance Money
	CreatedAt time.Time
}

type TransactionType string

const (
	TransactionIncome TransactionType = "income"
	TransactionExpense TransactionType = "expense"
	TransactionTransfer TransactionType = "transfer"
)

type Transaction struct {
	ID string
	AccountID string
	Type TransactionType
	Amount Money
	CategoryID string
	Description string
	OccurredAt time.Time
	TransferGroup string
	CreatedAt time.Time
}

type TransactionCategory struct {
	ID string
	OwnerID string
	Name string
	Kind string
	CreatedAt time.Time
}

type Budget struct {
	ID string
	OwnerID string
	Name string
	StartDate time.Time
	EndDate time.Time
	Currency string
	CreatedAt time.Time
}

type BudgetItem struct {
	ID string
	BudgetID string
	CategoryID string
	Limit Money
}

type SavingsGoal struct {
	ID string
	OwnerID string
	Name string
	Target Money
	TargetDate *time.Time
	CreatedAt time.Time
}

type Debt struct {
	ID string
	OwnerID string
	Name string
	Principal Money
	Outstanding Money
	DueDate *time.Time
	CreatedAt time.Time
}

type DebtPayment struct {
	ID string
	DebtID string
	Amount Money
	PaidAt time.Time
	CreatedAt time.Time
}

type Asset struct {
	ID string
	OwnerID string
	Name string
	Value Money
	ValuedAt time.Time
	CreatedAt time.Time
}

type Liability struct {
	ID string
	OwnerID string
	Name string
	Value Money
	RecordedAt time.Time
	CreatedAt time.Time
}

type Employee struct {
	ID string
	OwnerID string
	Name string
	CreatedAt time.Time
}

type Contract struct {
	ID string
	EmployeeID string
	StartDate time.Time
	EndDate *time.Time
	CreatedAt time.Time
}

type PayrollPeriod struct {
	ID string
	StartDate time.Time
	EndDate time.Time
	CreatedAt time.Time
}

type PayrollRun struct {
	ID string
	PeriodID string
	RuleSetVersion string
	Status string
	CreatedAt time.Time
}

type Earning struct {
	ID string
	PayrollRunID string
	Name string
	Amount Money
}

type Deduction struct {
	ID string
	PayrollRunID string
	Name string
	Amount Money
}

type AuditEvent struct {
	ID string
	ActorID string
	Action string
	Target string
	CreatedAt time.Time
}
