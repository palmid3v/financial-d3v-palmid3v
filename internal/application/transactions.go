package application

import (
	"context"
	"fmt"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/persistence"
)

type TransactionService struct { transactions persistence.TransactionRepository; accounts persistence.AccountRepository }
func NewTransactionService(transactions persistence.TransactionRepository, accounts persistence.AccountRepository) *TransactionService { return &TransactionService{transactions:transactions,accounts:accounts} }
func (s *TransactionService) Create(ctx context.Context, t domain.Transaction) error { a,err:=s.accounts.Get(ctx,t.OwnerID,t.AccountID);if err!=nil{return err};if t.Amount.Currency!=a.Currency{return fmt.Errorf("%w: transaction currency must match account currency",domain.ErrInvalidTransaction)};if t.Type==domain.TransactionTransfer&&t.TransferID==""{return fmt.Errorf("%w: transferId is required for transfers",domain.ErrInvalidTransaction)};return s.transactions.Create(ctx,t) }
func (s *TransactionService) Get(ctx context.Context, ownerID,id string)(domain.Transaction,error){return s.transactions.Get(ctx,ownerID,id)}
func (s *TransactionService) ListByAccount(ctx context.Context, ownerID,accountID string)([]domain.Transaction,error){return s.transactions.ListByAccount(ctx,ownerID,accountID)}
func (s *TransactionService) ListByPeriod(ctx context.Context, ownerID string,p domain.FinancialPeriod)([]domain.Transaction,error){return s.transactions.ListByPeriod(ctx,ownerID,p)}
