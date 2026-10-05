package persistence

import (
	"context"

	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
)

type AccountRepository interface {
	Create(ctx context.Context, account domain.Account) error
	Get(ctx context.Context, ownerID, accountID string) (domain.Account, error)
	List(ctx context.Context, ownerID string) ([]domain.Account, error)
}

type TransactionRepository interface {
	Create(ctx context.Context, transaction domain.Transaction) error
	Get(ctx context.Context, ownerID, transactionID string) (domain.Transaction, error)
	ListByAccount(ctx context.Context, ownerID, accountID string) ([]domain.Transaction, error)
	ListByPeriod(ctx context.Context, ownerID string, period domain.FinancialPeriod) ([]domain.Transaction, error)
}

type CategoryRepository interface {
	Create(ctx context.Context, category domain.Category) error
	Get(ctx context.Context, ownerID, categoryID string) (domain.Category, error)
	List(ctx context.Context, ownerID string) ([]domain.Category, error)
}

type BudgetRepository interface {
	Create(ctx context.Context, budget domain.Budget) error
	Get(ctx context.Context, ownerID, budgetID string) (domain.Budget, error)
	ListByPeriod(ctx context.Context, ownerID string, period domain.FinancialPeriod) ([]domain.Budget, error)
}

type SavingsGoalRepository interface {
	Create(ctx context.Context, goal domain.SavingsGoal) error
	Get(ctx context.Context, ownerID, goalID string) (domain.SavingsGoal, error)
	List(ctx context.Context, ownerID string) ([]domain.SavingsGoal, error)
}
