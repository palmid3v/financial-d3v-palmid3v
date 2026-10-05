package application

import (
	"context"
	"fmt"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/persistence"
)

type BudgetService struct{budgets persistence.BudgetRepository;categories persistence.CategoryRepository;transactions persistence.TransactionRepository}
func NewBudgetService(b persistence.BudgetRepository,c persistence.CategoryRepository,t persistence.TransactionRepository)*BudgetService{return &BudgetService{budgets:b,categories:c,transactions:t}}
func(s *BudgetService)Create(ctx context.Context,b domain.Budget)error{
	for _,item:=range b.Items{category,err:=s.categories.Get(ctx,b.OwnerID,item.CategoryID);if err!=nil{return err};if category.Kind!=domain.CategoryExpense{return fmt.Errorf("%w: budgets can only track expense categories",domain.ErrInvalidBudget)}}
	return s.budgets.Create(ctx,b)
}
func(s *BudgetService)Get(ctx context.Context,ownerID,id string)(domain.Budget,error){return s.budgets.Get(ctx,ownerID,id)}
func(s *BudgetService)ListByPeriod(ctx context.Context,ownerID string,p domain.FinancialPeriod)([]domain.Budget,error){return s.budgets.ListByPeriod(ctx,ownerID,p)}
func(s *BudgetService)Summary(ctx context.Context,ownerID,id string)(domain.BudgetSummary,error){b,err:=s.budgets.Get(ctx,ownerID,id);if err!=nil{return domain.BudgetSummary{},err};tx,err:=s.transactions.ListByPeriod(ctx,ownerID,b.Period);if err!=nil{return domain.BudgetSummary{},err};return b.Summarize(tx)}
