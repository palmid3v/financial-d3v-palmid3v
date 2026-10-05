package firestore

import (
	"context"
	"errors"
	"fmt"

	gcpfirestore "cloud.google.com/go/firestore"
	"google.golang.org/api/iterator"
	"google.golang.org/grpc/codes"
	"google.golang.org/grpc/status"

	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/persistence"
)

type Repositories struct { db *gcpfirestore.Client }

func NewRepositories(db *gcpfirestore.Client) *Repositories { return &Repositories{db:db} }
func (r *Repositories) Accounts() *AccountRepository { return &AccountRepository{db:r.db} }
func (r *Repositories) Transactions() *TransactionRepository { return &TransactionRepository{db:r.db} }
func (r *Repositories) Categories() *CategoryRepository { return &CategoryRepository{db:r.db} }
func (r *Repositories) Budgets() *BudgetRepository { return &BudgetRepository{db:r.db} }
func (r *Repositories) SavingsGoals() *SavingsGoalRepository { return &SavingsGoalRepository{db:r.db} }

type AccountRepository struct{ db *gcpfirestore.Client }

func (r *AccountRepository) Create(ctx context.Context, v domain.Account) error {
	_,err:=r.db.Collection("users").Doc(v.OwnerID).Collection("accounts").Doc(v.ID).Create(ctx,AccountToDocument(v))
	return mapFirestoreError(err)
}
func (r *AccountRepository) Get(ctx context.Context,ownerID,id string)(domain.Account,error){
	s,err:=r.db.Collection("users").Doc(ownerID).Collection("accounts").Doc(id).Get(ctx)
	if err!=nil{return domain.Account{},mapFirestoreError(err)}
	var d AccountDocument
	if err:=s.DataTo(&d);err!=nil{return domain.Account{},fmt.Errorf("decode account: %w",err)}
	return AccountFromDocument(d)
}
func (r *AccountRepository) List(ctx context.Context,ownerID string)([]domain.Account,error){
	q:=r.db.Collection("users").Doc(ownerID).Collection("accounts").OrderBy("createdAt",gcpfirestore.Asc)
	iter:=q.Documents(ctx);defer iter.Stop()
	var out []domain.Account
	for{ s,err:=iter.Next();if errors.Is(err,iterator.Done){return out,nil};if err!=nil{return nil,mapFirestoreError(err)};var d AccountDocument;if err:=s.DataTo(&d);err!=nil{return nil,err};v,err:=AccountFromDocument(d);if err!=nil{return nil,err};out=append(out,v)}
}

type TransactionRepository struct{ db *gcpfirestore.Client }

func (r *TransactionRepository) Create(ctx context.Context,v domain.Transaction) error {
	_,err:=r.db.Collection("users").Doc(v.OwnerID).Collection("transactions").Doc(v.ID).Create(ctx,TransactionToDocument(v))
	return mapFirestoreError(err)
}
func (r *TransactionRepository) Get(ctx context.Context,ownerID,id string)(domain.Transaction,error){
	s,err:=r.db.Collection("users").Doc(ownerID).Collection("transactions").Doc(id).Get(ctx)
	if err!=nil{return domain.Transaction{},mapFirestoreError(err)}
	var d TransactionDocument;if err:=s.DataTo(&d);err!=nil{return domain.Transaction{},err};return TransactionFromDocument(d)
}
func (r *TransactionRepository) ListByAccount(ctx context.Context,ownerID,accountID string)([]domain.Transaction,error){
	q:=r.db.Collection("users").Doc(ownerID).Collection("transactions").Where("accountId","==",accountID).OrderBy("occurredAt",gcpfirestore.Desc)
	return r.listTransactions(ctx,q)
}
func (r *TransactionRepository) ListByPeriod(ctx context.Context,ownerID string,p domain.FinancialPeriod)([]domain.Transaction,error){
	q:=r.db.Collection("users").Doc(ownerID).Collection("transactions").Where("occurredAt",">=",p.StartDate).Where("occurredAt","<",p.EndDate).OrderBy("occurredAt",gcpfirestore.Asc).OrderBy("createdAt",gcpfirestore.Desc)
	return r.listTransactions(ctx,q)
}
func (r *TransactionRepository) listTransactions(ctx context.Context,q gcpfirestore.Query)([]domain.Transaction,error){
	iter:=q.Documents(ctx);defer iter.Stop();var out []domain.Transaction
	for{s,err:=iter.Next();if errors.Is(err,iterator.Done){return out,nil};if err!=nil{return nil,mapFirestoreError(err)};var d TransactionDocument;if err:=s.DataTo(&d);err!=nil{return nil,err};v,err:=TransactionFromDocument(d);if err!=nil{return nil,err};out=append(out,v)}
}

type CategoryRepository struct{ db *gcpfirestore.Client }
func (r *CategoryRepository) Create(ctx context.Context,v domain.Category)error{_,err:=r.db.Collection("users").Doc(v.OwnerID).Collection("categories").Doc(v.ID).Create(ctx,CategoryToDocument(v));return mapFirestoreError(err)}
func (r *CategoryRepository) Get(ctx context.Context,ownerID,id string)(domain.Category,error){s,err:=r.db.Collection("users").Doc(ownerID).Collection("categories").Doc(id).Get(ctx);if err!=nil{return domain.Category{},mapFirestoreError(err)};var d CategoryDocument;if err:=s.DataTo(&d);err!=nil{return domain.Category{},err};return CategoryFromDocument(d)}
func (r *CategoryRepository) List(ctx context.Context,ownerID string)([]domain.Category,error){iter:=r.db.Collection("users").Doc(ownerID).Collection("categories").OrderBy("createdAt",gcpfirestore.Asc).Documents(ctx);defer iter.Stop();var out []domain.Category;for{s,err:=iter.Next();if errors.Is(err,iterator.Done){return out,nil};if err!=nil{return nil,mapFirestoreError(err)};var d CategoryDocument;if err:=s.DataTo(&d);err!=nil{return nil,err};v,err:=CategoryFromDocument(d);if err!=nil{return nil,err};out=append(out,v)}}

type BudgetRepository struct{ db *gcpfirestore.Client }
func (r *BudgetRepository) Create(ctx context.Context,v domain.Budget)error{_,err:=r.db.Collection("users").Doc(v.OwnerID).Collection("budgets").Doc(v.ID).Create(ctx,BudgetToDocument(v));return mapFirestoreError(err)}
func (r *BudgetRepository) Get(ctx context.Context,ownerID,id string)(domain.Budget,error){s,err:=r.db.Collection("users").Doc(ownerID).Collection("budgets").Doc(id).Get(ctx);if err!=nil{return domain.Budget{},mapFirestoreError(err)};var d BudgetDocument;if err:=s.DataTo(&d);err!=nil{return domain.Budget{},err};return BudgetFromDocument(d)}
func (r *BudgetRepository) ListByPeriod(ctx context.Context,ownerID string,p domain.FinancialPeriod)([]domain.Budget,error){q:=r.db.Collection("users").Doc(ownerID).Collection("budgets").Where("startDate",">=",p.StartDate).Where("startDate","<",p.EndDate).OrderBy("startDate",gcpfirestore.Asc).OrderBy("endDate",gcpfirestore.Asc);iter:=q.Documents(ctx);defer iter.Stop();var out []domain.Budget;for{s,err:=iter.Next();if errors.Is(err,iterator.Done){return out,nil};if err!=nil{return nil,mapFirestoreError(err)};var d BudgetDocument;if err:=s.DataTo(&d);err!=nil{return nil,err};v,err:=BudgetFromDocument(d);if err!=nil{return nil,err};out=append(out,v)}}

type SavingsGoalRepository struct{ db *gcpfirestore.Client }
func (r *SavingsGoalRepository) Create(ctx context.Context,v domain.SavingsGoal)error{_,err:=r.db.Collection("users").Doc(v.OwnerID).Collection("savingsGoals").Doc(v.ID).Create(ctx,SavingsGoalToDocument(v));return mapFirestoreError(err)}
func (r *SavingsGoalRepository) Get(ctx context.Context,ownerID,id string)(domain.SavingsGoal,error){s,err:=r.db.Collection("users").Doc(ownerID).Collection("savingsGoals").Doc(id).Get(ctx);if err!=nil{return domain.SavingsGoal{},mapFirestoreError(err)};var d SavingsGoalDocument;if err:=s.DataTo(&d);err!=nil{return domain.SavingsGoal{},err};return SavingsGoalFromDocument(d)}
func (r *SavingsGoalRepository) List(ctx context.Context,ownerID string)([]domain.SavingsGoal,error){iter:=r.db.Collection("users").Doc(ownerID).Collection("savingsGoals").OrderBy("createdAt",gcpfirestore.Asc).Documents(ctx);defer iter.Stop();var out []domain.SavingsGoal;for{s,err:=iter.Next();if errors.Is(err,iterator.Done){return out,nil};if err!=nil{return nil,mapFirestoreError(err)};var d SavingsGoalDocument;if err:=s.DataTo(&d);err!=nil{return nil,err};v,err:=SavingsGoalFromDocument(d);if err!=nil{return nil,err};out=append(out,v)}}

func mapFirestoreError(err error)error{
	if err==nil{return nil}
	switch status.Code(err){case codes.NotFound:return persistence.ErrNotFound;case codes.AlreadyExists:return persistence.ErrConflict;default:return err}
}
