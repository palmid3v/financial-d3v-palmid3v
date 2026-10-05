package application

import (
	"context"
	"testing"
	"time"

	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
)

type educationBudgetRepo struct{budget domain.Budget}
func(r educationBudgetRepo) Create(context.Context,domain.Budget)error{return nil}
func(r educationBudgetRepo) Get(context.Context,string,string)(domain.Budget,error){return r.budget,nil}
func(r educationBudgetRepo) ListByPeriod(context.Context,string,domain.FinancialPeriod)([]domain.Budget,error){return []domain.Budget{r.budget},nil}

type educationCategoryRepo struct{}
func(educationCategoryRepo) Create(context.Context,domain.Category)error{return nil}
func(educationCategoryRepo) Get(context.Context,string,string)(domain.Category,error){return domain.Category{},nil}
func(educationCategoryRepo) List(context.Context,string)([]domain.Category,error){return nil,nil}

type educationTransactionRepo struct{items []domain.Transaction}
func(educationTransactionRepo) Create(context.Context,domain.Transaction)error{return nil}
func(educationTransactionRepo) Get(context.Context,string,string)(domain.Transaction,error){return domain.Transaction{},nil}
func(educationTransactionRepo) ListByAccount(context.Context,string,string)([]domain.Transaction,error){return nil,nil}
func(r educationTransactionRepo) ListByPeriod(context.Context,string,domain.FinancialPeriod)([]domain.Transaction,error){return r.items,nil}

func TestEducationCards(t *testing.T){
	s:=NewEducationService(nil,nil)
	cards:=s.Cards("")
	if len(cards)!=5{t.Fatalf("got %d cards",len(cards))}
	for _,card:=range cards{if !card.Valid(){t.Fatalf("invalid card %q",card.ID)}}
	if got:=len(s.Cards("budget"));got!=1{t.Fatalf("budget cards: got %d",got)}
}

func TestEducationInsightsUseBudgetContext(t *testing.T){
	period,_:=domain.NewFinancialPeriod(time.Date(2026,10,1,0,0,0,0,time.UTC),time.Date(2026,11,1,0,0,0,0,time.UTC))
	budget,_:=domain.NewBudget("b1","owner-1","October","COP",period,time.Time{})
	budget.AddItem("food",domain.Money{MinorUnits:100000,Currency:"COP"})
	tx,_:=domain.NewTransaction("t1","owner-1","a1",domain.TransactionExpense,domain.Money{MinorUnits:25000,Currency:"COP"},time.Date(2026,10,10,0,0,0,0,time.UTC))
	tx.CategoryID="food"
	budgetService:=NewBudgetService(educationBudgetRepo{budget},educationCategoryRepo{},educationTransactionRepo{[]domain.Transaction{tx}})
	s:=NewEducationService(budgetService,nil)
	insights,err:=s.Insights(context.Background(),"owner-1","b1","",time.Date(2026,10,15,0,0,0,0,time.UTC))
	if err!=nil{t.Fatal(err)}
	if len(insights)!=1{t.Fatalf("got %d insights",len(insights))}
	if insights[0].MetricKey!="budget_utilization_percentage"||insights[0].MetricValue!=25{t.Fatalf("unexpected metric: %#v",insights[0])}
}
