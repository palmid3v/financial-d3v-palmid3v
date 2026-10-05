package persistence

import (
	"context"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
)

type AccountRepository interface { Create(context.Context, domain.Account) error; Get(context.Context,string,string)(domain.Account,error); List(context.Context,string)([]domain.Account,error) }
type TransactionRepository interface { Create(context.Context,domain.Transaction) error; Get(context.Context,string,string)(domain.Transaction,error); ListByAccount(context.Context,string,string)([]domain.Transaction,error); ListByPeriod(context.Context,string,domain.FinancialPeriod)([]domain.Transaction,error) }
type CategoryRepository interface { Create(context.Context,domain.Category) error; Get(context.Context,string,string)(domain.Category,error); List(context.Context,string)([]domain.Category,error) }
type BudgetRepository interface { Create(context.Context,domain.Budget) error; Get(context.Context,string,string)(domain.Budget,error); ListByPeriod(context.Context,string,domain.FinancialPeriod)([]domain.Budget,error) }
type SavingsGoalRepository interface { Create(context.Context,domain.SavingsGoal) error; Get(context.Context,string,string)(domain.SavingsGoal,error); List(context.Context,string)([]domain.SavingsGoal,error) }
type SavingsContributionRepository interface { Create(context.Context,domain.SavingsContribution) error; ListByGoal(context.Context,string,string)([]domain.SavingsContribution,error) }
