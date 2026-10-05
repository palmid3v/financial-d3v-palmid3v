package memory

import (
	"context"
	"sort"
	"sync"

	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/persistence"
)

type Store struct {
	mu sync.RWMutex
	accounts map[string]domain.Account
	transactions map[string]domain.Transaction
	categories map[string]domain.Category
	budgets map[string]domain.Budget
	goals map[string]domain.SavingsGoal
	contributions map[string]domain.SavingsContribution
	debts map[string]domain.Debt
	payments map[string]domain.DebtPayment
	assets map[string]domain.Asset
	liabilities map[string]domain.Liability
	payrollEmployees map[string]domain.PayrollEmployee
	payrollPeriods map[string]domain.PayrollPeriod
	auditEvents map[string]domain.AuditEvent
}

func NewStore() *Store {
	return &Store{
		accounts: map[string]domain.Account{}, transactions: map[string]domain.Transaction{},
		categories: map[string]domain.Category{}, budgets: map[string]domain.Budget{},
		goals: map[string]domain.SavingsGoal{}, contributions: map[string]domain.SavingsContribution{},
		debts: map[string]domain.Debt{}, payments: map[string]domain.DebtPayment{},
		assets: map[string]domain.Asset{}, liabilities: map[string]domain.Liability{},
		payrollEmployees: map[string]domain.PayrollEmployee{}, payrollPeriods: map[string]domain.PayrollPeriod{},
		auditEvents: map[string]domain.AuditEvent{},
	}
}

func (s *Store) Accounts() persistence.AccountRepository { return (*accountRepo)(s) }
func (s *Store) Transactions() persistence.TransactionRepository { return (*transactionRepo)(s) }
func (s *Store) Categories() persistence.CategoryRepository { return (*categoryRepo)(s) }
func (s *Store) Budgets() persistence.BudgetRepository { return (*budgetRepo)(s) }
func (s *Store) SavingsGoals() persistence.SavingsGoalRepository { return (*goalRepo)(s) }
func (s *Store) SavingsContributions() persistence.SavingsContributionRepository { return (*contributionRepo)(s) }
func (s *Store) Debts() persistence.DebtRepository { return (*debtRepo)(s) }
func (s *Store) DebtPayments() persistence.DebtPaymentRepository { return (*paymentRepo)(s) }
func (s *Store) Assets() persistence.AssetRepository { return (*assetRepo)(s) }
func (s *Store) Liabilities() persistence.LiabilityRepository { return (*liabilityRepo)(s) }
func (s *Store) PayrollEmployees() persistence.PayrollEmployeeRepository { return (*payrollEmployeeRepo)(s) }
func (s *Store) PayrollPeriods() persistence.PayrollPeriodRepository { return (*payrollPeriodRepo)(s) }
func (s *Store) Audit() persistence.AuditRepository { return (*auditRepo)(s) }

func notFound() error { return persistence.ErrNotFound }
func conflict() error { return persistence.ErrConflict }

type accountRepo Store
func (r *accountRepo) Create(_ context.Context, v domain.Account) error { r.mu.Lock(); defer r.mu.Unlock(); if _, ok := r.accounts[v.ID]; ok { return conflict() }; r.accounts[v.ID]=v; return nil }
func (r *accountRepo) Get(_ context.Context, owner,id string)(domain.Account,error){r.mu.RLock();defer r.mu.RUnlock();v,ok:=r.accounts[id];if !ok||v.OwnerID!=owner{return domain.Account{},notFound()};return v,nil}
func (r *accountRepo) List(_ context.Context, owner string)([]domain.Account,error){r.mu.RLock();defer r.mu.RUnlock();out:=[]domain.Account{};for _,v:=range r.accounts{if v.OwnerID==owner{out=append(out,v)}};sort.Slice(out,func(i,j int)bool{return out[i].CreatedAt.Before(out[j].CreatedAt)});return out,nil}

type transactionRepo Store
func (r *transactionRepo) Create(_ context.Context,v domain.Transaction)error{r.mu.Lock();defer r.mu.Unlock();if _,ok:=r.transactions[v.ID];ok{return conflict()};r.transactions[v.ID]=v;return nil}
func (r *transactionRepo) Get(_ context.Context,owner,id string)(domain.Transaction,error){r.mu.RLock();defer r.mu.RUnlock();v,ok:=r.transactions[id];if !ok||v.OwnerID!=owner{return domain.Transaction{},notFound()};return v,nil}
func (r *transactionRepo) ListByAccount(_ context.Context,owner,accountID string)([]domain.Transaction,error){r.mu.RLock();defer r.mu.RUnlock();out:=[]domain.Transaction{};for _,v:=range r.transactions{if v.OwnerID==owner&&v.AccountID==accountID{out=append(out,v)}};sort.Slice(out,func(i,j int)bool{return out[i].OccurredAt.After(out[j].OccurredAt)});return out,nil}
func (r *transactionRepo) ListByPeriod(_ context.Context,owner string,p domain.FinancialPeriod)([]domain.Transaction,error){r.mu.RLock();defer r.mu.RUnlock();out:=[]domain.Transaction{};for _,v:=range r.transactions{if v.OwnerID==owner&&p.Contains(v.OccurredAt){out=append(out,v)}};sort.Slice(out,func(i,j int)bool{if out[i].OccurredAt.Equal(out[j].OccurredAt){return out[i].CreatedAt.After(out[j].CreatedAt)};return out[i].OccurredAt.Before(out[j].OccurredAt)});return out,nil}

type categoryRepo Store
func (r *categoryRepo) Create(_ context.Context,v domain.Category)error{r.mu.Lock();defer r.mu.Unlock();if _,ok:=r.categories[v.ID];ok{return conflict()};r.categories[v.ID]=v;return nil}
func (r *categoryRepo) Get(_ context.Context,owner,id string)(domain.Category,error){r.mu.RLock();defer r.mu.RUnlock();v,ok:=r.categories[id];if !ok||v.OwnerID!=owner{return domain.Category{},notFound()};return v,nil}
func (r *categoryRepo) List(_ context.Context,owner string)([]domain.Category,error){r.mu.RLock();defer r.mu.RUnlock();out:=[]domain.Category{};for _,v:=range r.categories{if v.OwnerID==owner{out=append(out,v)}};sort.Slice(out,func(i,j int)bool{return out[i].CreatedAt.Before(out[j].CreatedAt)});return out,nil}

type budgetRepo Store
func (r *budgetRepo) Create(_ context.Context,v domain.Budget)error{r.mu.Lock();defer r.mu.Unlock();if _,ok:=r.budgets[v.ID];ok{return conflict()};r.budgets[v.ID]=v;return nil}
func (r *budgetRepo) Get(_ context.Context,owner,id string)(domain.Budget,error){r.mu.RLock();defer r.mu.RUnlock();v,ok:=r.budgets[id];if !ok||v.OwnerID!=owner{return domain.Budget{},notFound()};return v,nil}
func (r *budgetRepo) ListByPeriod(_ context.Context,owner string,p domain.FinancialPeriod)([]domain.Budget,error){r.mu.RLock();defer r.mu.RUnlock();out:=[]domain.Budget{};for _,v:=range r.budgets{if v.OwnerID==owner&&v.Period.StartDate.Before(p.EndDate)&&p.StartDate.Before(v.Period.EndDate){out=append(out,v)}};sort.Slice(out,func(i,j int)bool{return out[i].Period.StartDate.Before(out[j].Period.StartDate)});return out,nil}

type goalRepo Store
func (r *goalRepo) Create(_ context.Context,v domain.SavingsGoal)error{r.mu.Lock();defer r.mu.Unlock();if _,ok:=r.goals[v.ID];ok{return conflict()};r.goals[v.ID]=v;return nil}
func (r *goalRepo) Get(_ context.Context,owner,id string)(domain.SavingsGoal,error){r.mu.RLock();defer r.mu.RUnlock();v,ok:=r.goals[id];if !ok||v.OwnerID!=owner{return domain.SavingsGoal{},notFound()};return v,nil}
func (r *goalRepo) List(_ context.Context,owner string)([]domain.SavingsGoal,error){r.mu.RLock();defer r.mu.RUnlock();out:=[]domain.SavingsGoal{};for _,v:=range r.goals{if v.OwnerID==owner{out=append(out,v)}};sort.Slice(out,func(i,j int)bool{return out[i].CreatedAt.Before(out[j].CreatedAt)});return out,nil}

type contributionRepo Store
func (r *contributionRepo) Create(_ context.Context,v domain.SavingsContribution)error{r.mu.Lock();defer r.mu.Unlock();if _,ok:=r.contributions[v.ID];ok{return conflict()};r.contributions[v.ID]=v;return nil}
func (r *contributionRepo) ListByGoal(_ context.Context,owner,goalID string)([]domain.SavingsContribution,error){r.mu.RLock();defer r.mu.RUnlock();out:=[]domain.SavingsContribution{};for _,v:=range r.contributions{if v.OwnerID==owner&&v.GoalID==goalID{out=append(out,v)}};sort.Slice(out,func(i,j int)bool{return out[i].ContributedAt.After(out[j].ContributedAt)});return out,nil}

type debtRepo Store
func (r *debtRepo) Create(_ context.Context,v domain.Debt)error{r.mu.Lock();defer r.mu.Unlock();if _,ok:=r.debts[v.ID];ok{return conflict()};r.debts[v.ID]=v;return nil}
func (r *debtRepo) Get(_ context.Context,owner,id string)(domain.Debt,error){r.mu.RLock();defer r.mu.RUnlock();v,ok:=r.debts[id];if !ok||v.OwnerID!=owner{return domain.Debt{},notFound()};return v,nil}
func (r *debtRepo) List(_ context.Context,owner string)([]domain.Debt,error){r.mu.RLock();defer r.mu.RUnlock();out:=[]domain.Debt{};for _,v:=range r.debts{if v.OwnerID==owner{out=append(out,v)}};sort.Slice(out,func(i,j int)bool{return out[i].CreatedAt.Before(out[j].CreatedAt)});return out,nil}
func (r *debtRepo) Update(_ context.Context,v domain.Debt)error{r.mu.Lock();defer r.mu.Unlock();if _,ok:=r.debts[v.ID];!ok{return notFound()};r.debts[v.ID]=v;return nil}

type paymentRepo Store
func (r *paymentRepo) Create(_ context.Context,v domain.DebtPayment)error{r.mu.Lock();defer r.mu.Unlock();if _,ok:=r.payments[v.ID];ok{return conflict()};r.payments[v.ID]=v;return nil}
func (r *paymentRepo) ListByDebt(_ context.Context,owner,debtID string)([]domain.DebtPayment,error){r.mu.RLock();defer r.mu.RUnlock();out:=[]domain.DebtPayment{};for _,v:=range r.payments{if v.OwnerID==owner&&v.DebtID==debtID{out=append(out,v)}};sort.Slice(out,func(i,j int)bool{return out[i].PaidAt.After(out[j].PaidAt)});return out,nil}

type assetRepo Store
func (r *assetRepo) Create(_ context.Context,v domain.Asset)error{r.mu.Lock();defer r.mu.Unlock();if _,ok:=r.assets[v.ID];ok{return conflict()};r.assets[v.ID]=v;return nil}
func (r *assetRepo) Get(_ context.Context,owner,id string)(domain.Asset,error){r.mu.RLock();defer r.mu.RUnlock();v,ok:=r.assets[id];if !ok||v.OwnerID!=owner{return domain.Asset{},notFound()};return v,nil}
func (r *assetRepo) List(_ context.Context,owner string)([]domain.Asset,error){r.mu.RLock();defer r.mu.RUnlock();out:=[]domain.Asset{};for _,v:=range r.assets{if v.OwnerID==owner{out=append(out,v)}};return out,nil}

type liabilityRepo Store
func (r *liabilityRepo) Create(_ context.Context,v domain.Liability)error{r.mu.Lock();defer r.mu.Unlock();if _,ok:=r.liabilities[v.ID];ok{return conflict()};r.liabilities[v.ID]=v;return nil}
func (r *liabilityRepo) Get(_ context.Context,owner,id string)(domain.Liability,error){r.mu.RLock();defer r.mu.RUnlock();v,ok:=r.liabilities[id];if !ok||v.OwnerID!=owner{return domain.Liability{},notFound()};return v,nil}
func (r *liabilityRepo) List(_ context.Context,owner string)([]domain.Liability,error){r.mu.RLock();defer r.mu.RUnlock();out:=[]domain.Liability{};for _,v:=range r.liabilities{if v.OwnerID==owner{out=append(out,v)}};return out,nil}

type payrollEmployeeRepo Store
func (r *payrollEmployeeRepo) Create(_ context.Context,v domain.PayrollEmployee)error{r.mu.Lock();defer r.mu.Unlock();if _,ok:=r.payrollEmployees[v.ID];ok{return conflict()};r.payrollEmployees[v.ID]=v;return nil}
func (r *payrollEmployeeRepo) Get(_ context.Context,owner,id string)(domain.PayrollEmployee,error){r.mu.RLock();defer r.mu.RUnlock();v,ok:=r.payrollEmployees[id];if !ok||v.OwnerID!=owner{return domain.PayrollEmployee{},notFound()};return v,nil}
func (r *payrollEmployeeRepo) List(_ context.Context,owner string)([]domain.PayrollEmployee,error){r.mu.RLock();defer r.mu.RUnlock();out:=[]domain.PayrollEmployee{};for _,v:=range r.payrollEmployees{if v.OwnerID==owner{out=append(out,v)}};sort.Slice(out,func(i,j int)bool{return out[i].CreatedAt.Before(out[j].CreatedAt)});return out,nil}

type payrollPeriodRepo Store
func (r *payrollPeriodRepo) Create(_ context.Context,v domain.PayrollPeriod)error{r.mu.Lock();defer r.mu.Unlock();if _,ok:=r.payrollPeriods[v.ID];ok{return conflict()};r.payrollPeriods[v.ID]=v;return nil}
func (r *payrollPeriodRepo) ListByEmployee(_ context.Context,owner,employeeID string)([]domain.PayrollPeriod,error){r.mu.RLock();defer r.mu.RUnlock();out:=[]domain.PayrollPeriod{};for _,v:=range r.payrollPeriods{if v.OwnerID==owner&&v.EmployeeID==employeeID{out=append(out,v)}};sort.Slice(out,func(i,j int)bool{return out[i].StartDate.After(out[j].StartDate)});return out,nil}

type auditRepo Store
func (r *auditRepo) Create(_ context.Context,v domain.AuditEvent)error{r.mu.Lock();defer r.mu.Unlock();if _,ok:=r.auditEvents[v.ID];ok{return conflict()};r.auditEvents[v.ID]=v;return nil}
func (r *auditRepo) List(_ context.Context,owner string)([]domain.AuditEvent,error){r.mu.RLock();defer r.mu.RUnlock();out:=[]domain.AuditEvent{};for _,v:=range r.auditEvents{if v.OwnerID==owner{out=append(out,v)}};sort.Slice(out,func(i,j int)bool{return out[i].OccurredAt.After(out[j].OccurredAt)});if len(out)>100{out=out[:100]};return out,nil}
