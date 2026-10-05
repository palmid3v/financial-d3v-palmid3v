package application

import (
 "context"
 "sort"
 "time"
 "github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
)

type CategoryReport struct { CategoryID string `json:"categoryId"`; CategoryName string `json:"categoryName"`; Amount domain.Money `json:"amount"` }
type FinancialReport struct {
 Currency string `json:"currency"`
 Period domain.FinancialPeriod `json:"period"`
 Income domain.Money `json:"income"`
 Expenses domain.Money `json:"expenses"`
 NetCashFlow domain.Money `json:"netCashFlow"`
 SpendingByCategory []CategoryReport `json:"spendingByCategory"`
 BudgetSummaries []domain.BudgetSummary `json:"budgetSummaries"`
 Savings []SavingsGoalSummary `json:"savings"`
 DebtBalance domain.Money `json:"debtBalance"`
 NetWorth domain.NetWorth `json:"netWorth"`
}

type ReportService struct {
 accounts *AccountService
 transactions *TransactionService
 categories *CategoryService
 budgets *BudgetService
 savings *SavingsService
 debts *DebtService
 position *FinancialPositionService
}
func NewReportService(a *AccountService,t *TransactionService,c *CategoryService,b *BudgetService,s *SavingsService,d *DebtService,p *FinancialPositionService)*ReportService{return &ReportService{accounts:a,transactions:t,categories:c,budgets:b,savings:s,debts:d,position:p}}

func summarizeTransactions(transactions []domain.Transaction,currency string,names map[string]string)(domain.Money,domain.Money,domain.Money,[]CategoryReport,error){
 income,expenses,net,categoryReport,err:=summarizeTransactions(tx,currency,names);if err!=nil{return FinancialReport{},err}
 budgets,err:=s.budgets.ListByPeriod(ctx,ownerID,p);if err!=nil{return FinancialReport{},err};budgetSummaries:=make([]domain.BudgetSummary,0,len(budgets));for _,b:=range budgets{v,e:=s.budgets.Summary(ctx,ownerID,b.ID);if e!=nil{return FinancialReport{},e};budgetSummaries=append(budgetSummaries,budgetSummary(v))}
 goals,err:=s.savings.ListGoals(ctx,ownerID);if err!=nil{return FinancialReport{},err};savings:=make([]SavingsGoalSummary,0,len(goals));for _,g:=range goals{v,e:=s.savings.Summary(ctx,ownerID,g.ID,asOf);if e!=nil{return FinancialReport{},e};savings=append(savings,v)}
 debts,err:=s.debts.List(ctx,ownerID);if err!=nil{return FinancialReport{},err};debtTotal:=domain.Money{Currency:currency};for _,d:=range debts{if d.Balance.Currency==currency{debtTotal,err=debtTotal.Add(d.Balance);if err!=nil{return FinancialReport{},err}}}
 nw,err:=s.position.NetWorth(ctx,ownerID,currency,asOf);if err!=nil{return FinancialReport{},err}
 return FinancialReport{Currency:currency,Period:p,Income:income,Expenses:expenses,NetCashFlow:net,SpendingByCategory:categoryReport,BudgetSummaries:budgetSummaries,Savings:savings,DebtBalance:debtTotal,NetWorth:nw},nil
}
func budgetSummary(v domain.BudgetSummary)domain.BudgetSummary{return v}

type DashboardReport struct { GeneratedAt time.Time `json:"generatedAt"`; Summary FinancialReport `json:"summary"` }
func(s *ReportService)Dashboard(ctx context.Context,ownerID,currency string,p domain.FinancialPeriod,asOf time.Time)(DashboardReport,error){v,err:=s.Summary(ctx,ownerID,currency,p,asOf);if err!=nil{return DashboardReport{},err};return DashboardReport{GeneratedAt:asOf.UTC(),Summary:v},nil}
