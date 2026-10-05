package application

import (
	"context"
	"time"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/persistence"
)

type SavingsService struct{goals persistence.SavingsGoalRepository;contributions persistence.SavingsContributionRepository;accounts persistence.AccountRepository}
func NewSavingsService(g persistence.SavingsGoalRepository,c persistence.SavingsContributionRepository,a persistence.AccountRepository)*SavingsService{return &SavingsService{goals:g,contributions:c,accounts:a}}
func(s *SavingsService)CreateGoal(ctx context.Context,g domain.SavingsGoal)error{return s.goals.Create(ctx,g)}
func(s *SavingsService)GetGoal(ctx context.Context,ownerID,id string)(domain.SavingsGoal,error){return s.goals.Get(ctx,ownerID,id)}
func(s *SavingsService)ListGoals(ctx context.Context,ownerID string)([]domain.SavingsGoal,error){return s.goals.List(ctx,ownerID)}
func(s *SavingsService)AddContribution(ctx context.Context,c domain.SavingsContribution)error{
	g,err:=s.goals.Get(ctx,c.OwnerID,c.GoalID);if err!=nil{return err};if c.Amount.Currency!=g.Target.Currency{return domain.ErrCurrencyMismatch}
	if c.SourceAccountID!=""{a,err:=s.accounts.Get(ctx,c.OwnerID,c.SourceAccountID);if err!=nil{return err};if a.Currency!=g.Target.Currency{return domain.ErrCurrencyMismatch}}
	return s.contributions.Create(ctx,c)
}
type SavingsGoalSummary struct{Goal domain.SavingsGoal;Progress domain.SavingsProgress;ContributionCount int;LastContributionAt *time.Time;TotalContributed domain.Money}
func(s *SavingsService)Summary(ctx context.Context,ownerID,id string,asOf time.Time)(SavingsGoalSummary,error){
	g,err:=s.goals.Get(ctx,ownerID,id);if err!=nil{return SavingsGoalSummary{},err};items,err:=s.contributions.ListByGoal(ctx,ownerID,id);if err!=nil{return SavingsGoalSummary{},err}
	total:=domain.Money{Currency:g.Target.Currency};var last *time.Time
	for _,item:=range items{if item.Amount.Currency!=g.Target.Currency{return SavingsGoalSummary{},domain.ErrCurrencyMismatch};total,err=total.Add(item.Amount);if err!=nil{return SavingsGoalSummary{},err};if last==nil||item.ContributedAt.After(*last){v:=item.ContributedAt;last=&v}}
	progress,err:=g.ProgressAt(total,asOf);if err!=nil{return SavingsGoalSummary{},err}
	return SavingsGoalSummary{Goal:g,Progress:progress,ContributionCount:len(items),LastContributionAt:last,TotalContributed:total},nil
}
