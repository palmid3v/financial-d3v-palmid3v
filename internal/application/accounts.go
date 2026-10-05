package application

import (
	"context"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/persistence"
)

type AccountService struct { accounts persistence.AccountRepository; transactions persistence.TransactionRepository }
func NewAccountService(accounts persistence.AccountRepository, transactions persistence.TransactionRepository) *AccountService { return &AccountService{accounts:accounts, transactions:transactions} }
func (s *AccountService) Create(ctx context.Context, a domain.Account) error { return s.accounts.Create(ctx,a) }
func (s *AccountService) Get(ctx context.Context, ownerID, accountID string) (domain.Account,error) { return s.accounts.Get(ctx,ownerID,accountID) }
func (s *AccountService) List(ctx context.Context, ownerID string) ([]domain.Account,error) { return s.accounts.List(ctx,ownerID) }
func (s *AccountService) Balance(ctx context.Context, ownerID, accountID string) (domain.Money,error) { a,err:=s.accounts.Get(ctx,ownerID,accountID);if err!=nil{return domain.Money{},err};tx,err:=s.transactions.ListByAccount(ctx,ownerID,accountID);if err!=nil{return domain.Money{},err};return domain.CalculateAccountBalance(a,tx) }
