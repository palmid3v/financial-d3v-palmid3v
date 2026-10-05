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
type DebtRepository interface { Create(context.Context,domain.Debt) error; Get(context.Context,string,string)(domain.Debt,error); List(context.Context,string)([]domain.Debt,error); Update(context.Context,domain.Debt) error }
type DebtPaymentRepository interface { Create(context.Context,domain.DebtPayment) error; ListByDebt(context.Context,string,string)([]domain.DebtPayment,error) }
type AssetRepository interface { Create(context.Context,domain.Asset) error; Get(context.Context,string,string)(domain.Asset,error); List(context.Context,string)([]domain.Asset,error) }
type LiabilityRepository interface { Create(context.Context,domain.Liability) error; Get(context.Context,string,string)(domain.Liability,error); List(context.Context,string)([]domain.Liability,error) }

type PayrollEmployeeRepository interface { Create(context.Context,domain.PayrollEmployee) error; Get(context.Context,string,string)(domain.PayrollEmployee,error); List(context.Context,string)([]domain.PayrollEmployee,error) }
type PayrollPeriodRepository interface { Create(context.Context,domain.PayrollPeriod) error; ListByEmployee(context.Context,string,string)([]domain.PayrollPeriod,error) }
type AuditRepository interface { Create(context.Context, domain.AuditEvent) error; List(context.Context,string)([]domain.AuditEvent,error) }
