package application

import (
 "context"
 "fmt"
 "github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
 "github.com/palmid3v/financial-d3v-palmid3v/internal/persistence"
)

type DebtService struct{debts persistence.DebtRepository;payments persistence.DebtPaymentRepository}
type DebtSummary struct{Debt domain.Debt;Payments []domain.DebtPayment;TotalPaid domain.Money}
func NewDebtService(d persistence.DebtRepository,p persistence.DebtPaymentRepository)*DebtService{return &DebtService{debts:d,payments:p}}
func(s *DebtService)Create(ctx context.Context,v domain.Debt)error{return s.debts.Create(ctx,v)}
func(s *DebtService)Get(ctx context.Context,ownerID,id string)(domain.Debt,error){return s.debts.Get(ctx,ownerID,id)}
func(s *DebtService)List(ctx context.Context,ownerID string)([]domain.Debt,error){return s.debts.List(ctx,ownerID)}
func(s *DebtService)Payment(ctx context.Context,v domain.DebtPayment)error{
 d,err:=s.debts.Get(ctx,v.OwnerID,v.DebtID);if err!=nil{return err}
 if v.Amount.Currency!=d.Balance.Currency{return domain.ErrCurrencyMismatch}
 if v.Principal.MinorUnits>d.Balance.MinorUnits{return fmt.Errorf("%w: principal payment exceeds debt balance",domain.ErrInvalidDebtPayment)}
 next:=d.Balance.MinorUnits-v.Principal.MinorUnits
 d.Balance.MinorUnits=next
 if next==0{d.Status=domain.DebtPaid}
 if err=s.debts.Update(ctx,d);err!=nil{return err}
 return s.payments.Create(ctx,v)
}
func(s *DebtService)Summary(ctx context.Context,ownerID,id string)(DebtSummary,error){
 d,err:=s.debts.Get(ctx,ownerID,id);if err!=nil{return DebtSummary{},err}
 items,err:=s.payments.ListByDebt(ctx,ownerID,id);if err!=nil{return DebtSummary{},err}
 total:=domain.Money{Currency:d.OriginalPrincipal.Currency}
 for _,p:=range items{total,err=total.Add(p.Amount);if err!=nil{return DebtSummary{},err}}
 return DebtSummary{Debt:d,Payments:items,TotalPaid:total},nil
}
