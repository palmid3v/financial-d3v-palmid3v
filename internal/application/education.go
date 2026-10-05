package application

import (
	"context"
	"fmt"
	"strings"
	"time"

	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
)

type EducationService struct {
	budgets *BudgetService
	savings *SavingsService
}

type EducationInsight struct {
	Card domain.EducationCard
	MetricKey string
	MetricMinorUnits *int64
	Currency string
	ObservedAt time.Time
}

func NewEducationService(budgets *BudgetService, savings *SavingsService) *EducationService {
	return &EducationService{budgets:budgets, savings:savings}
}

func (s *EducationService) Cards(topic string) []domain.EducationCard {
	cards := educationCards()
	topic = strings.TrimSpace(strings.ToLower(topic))
	if topic == "" { return cards }
	filtered := make([]domain.EducationCard, 0)
	for _, card := range cards {
		if card.Topic == topic { filtered = append(filtered, card) }
	}
	return filtered
}

func (s *EducationService) Insights(ctx context.Context, ownerID, budgetID, goalID string, asOf time.Time) ([]EducationInsight, error) {
	if strings.TrimSpace(ownerID) == "" { return nil, domain.ErrInvalidEntity }
	if asOf.IsZero() { asOf = time.Now().UTC() }
	insights := make([]EducationInsight, 0, 2)
	if budgetID != "" {
		if s.budgets == nil { return nil, fmt.Errorf("%w: budget education is unavailable", domain.ErrInvalidBudget) }
		summary, err := s.budgets.Summary(ctx, ownerID, budgetID)
		if err != nil { return nil, err }
		card := cardByID("budget-utilization")
		minor := summary.TotalSpent.MinorUnits
		insights = append(insights, EducationInsight{Card:card, MetricKey:"budget_utilization_percentage", MetricMinorUnits:&minor, Currency:summary.Currency, ObservedAt:asOf})
	}
	if goalID != "" {
		if s.savings == nil { return nil, fmt.Errorf("%w: savings education is unavailable", domain.ErrInvalidSavingsGoal) }
		summary, err := s.savings.Summary(ctx, ownerID, goalID, asOf)
		if err != nil { return nil, err }
		card := cardByID("savings-progress")
		minor := summary.TotalContributed.MinorUnits
		insights = append(insights, EducationInsight{Card:card, MetricKey:"savings_contributed_minor_units", MetricMinorUnits:&minor, Currency:summary.TotalContributed.Currency, ObservedAt:asOf})
	}
	return insights, nil
}

func cardByID(id string) domain.EducationCard {
	for _, card := range educationCards() { if card.ID == id { return card } }
	return domain.EducationCard{}
}

func educationCards() []domain.EducationCard {
	return []domain.EducationCard{
		domain.NewEducationCard("cash-flow","cash-flow","Cash flow: what changed?","Cash flow compares money entering and leaving during a period.","Net cash flow = income − expenses for the selected period.","A positive result means more money entered than left during that period; a negative result means the opposite. This describes the period, not your long-term financial health by itself.","Review the largest movements for the period and identify one change you can plan for next period."),
		domain.NewEducationCard("budget-utilization","budget","Budget utilization","Budget utilization compares actual spending with the amount planned for the budget.","Utilization = actual budgeted spending ÷ planned budget × 100.","Lower than 100% means spending is below the planned limit; above 100% means the planned limit has been exceeded. It does not explain why the difference happened.","Look at the categories with the largest variance before changing the next budget."),
		domain.NewEducationCard("savings-progress","savings","Savings progress","Savings progress compares contributions recorded for a goal with its target amount.","Progress = contributions ÷ target × 100, capped at 100% for display.","A higher percentage means more of the target has been recorded. Progress alone does not tell you whether the target is affordable or appropriate.","Compare progress with the remaining amount and target date, then choose a contribution pace you can sustain."),
		domain.NewEducationCard("transaction-categories","transactions","Why categorize transactions?","Categories turn individual money movements into groups that can be analyzed over time.","Category spending = sum of expense transactions assigned to that category.","Consistent categorization makes comparisons more meaningful. A category total is a measurement of recorded transactions, not a judgment about whether spending was good or bad.","Use a small, consistent category structure and review unclear transactions before drawing conclusions."),
		domain.NewEducationCard("debt-basics","debt","Debt: the basic distinction","Debt is an obligation that remains outstanding until it is paid or otherwise settled.","A debt balance represents the amount still owed; a payment reduces the outstanding obligation according to the debt terms.","Debt balance, cash payment and interest expense are related but are not automatically the same financial measure.","Before analyzing debt, identify the outstanding balance, payment terms and interest or fees separately."),
	}
}
