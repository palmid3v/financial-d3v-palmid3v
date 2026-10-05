package engine

import (
	"encoding/json"
	"fmt"
	"sort"
	"time"
)

type Money struct {
	MinorUnits int64  `json:"minorUnits"`
	Currency   string `json:"currency"`
}

type Account struct {
	ID               string `json:"id"`
	Currency         string `json:"currency"`
	OpeningMinorUnits int64 `json:"openingMinorUnits"`
}

type Transaction struct {
	ID               string `json:"id"`
	AccountID        string `json:"accountId"`
	ToAccountID      string `json:"toAccountId"`
	Type             string `json:"type"`
	MinorUnits       int64  `json:"minorUnits"`
	Currency         string `json:"currency"`
	CategoryID       string `json:"categoryId"`
	OccurredAt       string `json:"occurredAt"`
}

type BudgetItem struct {
	CategoryID       string `json:"categoryId"`
	LimitMinorUnits  int64  `json:"limitMinorUnits"`
}

type Budget struct {
	ID        string       `json:"id"`
	Currency  string       `json:"currency"`
	StartDate string       `json:"startDate"`
	EndDate   string       `json:"endDate"`
	Items     []BudgetItem `json:"items"`
}

type SavingsGoal struct {
	ID                string `json:"id"`
	TargetMinorUnits  int64  `json:"targetMinorUnits"`
	Currency          string `json:"currency"`
}

type SavingsContribution struct {
	GoalID           string `json:"goalId"`
	AmountMinorUnits int64  `json:"amountMinorUnits"`
}

type Debt struct {
	ID                 string `json:"id"`
	OriginalMinorUnits int64  `json:"originalMinorUnits"`
	Currency           string `json:"currency"`
}

type DebtPayment struct {
	DebtID              string `json:"debtId"`
	PrincipalMinorUnits int64  `json:"principalMinorUnits"`
}

type Asset struct {
	MinorUnits int64  `json:"minorUnits"`
	Currency   string `json:"currency"`
}

type Liability struct {
	MinorUnits int64  `json:"minorUnits"`
	Currency   string `json:"currency"`
}

type Vault struct {
	Accounts              []Account              `json:"accounts"`
	Transactions          []Transaction          `json:"transactions"`
	Budgets               []Budget               `json:"budgets"`
	SavingsGoals          []SavingsGoal          `json:"savingsGoals"`
	SavingsContributions  []SavingsContribution  `json:"savingsContributions"`
	Debts                 []Debt                 `json:"debts"`
	DebtPayments          []DebtPayment          `json:"debtPayments"`
	Assets                []Asset                `json:"assets"`
	Liabilities           []Liability             `json:"liabilities"`
}

type Period struct {
	Start string `json:"start"`
	End   string `json:"end"`
}

type CashFlow struct {
	Income       int64 `json:"income"`
	Expenses     int64 `json:"expenses"`
	NetCashFlow  int64 `json:"netCashFlow"`
}

type AccountBalance struct {
	AccountID string `json:"accountId"`
	Balance   int64  `json:"balance"`
	Currency  string `json:"currency"`
}

type BudgetLine struct {
	CategoryID string  `json:"categoryId"`
	Limit      int64   `json:"limit"`
	Spent      int64   `json:"spent"`
	Remaining  int64   `json:"remaining"`
	Percent    float64 `json:"percent"`
}

type BudgetResult struct {
	ID       string       `json:"id"`
	Lines    []BudgetLine `json:"lines"`
	TotalLimit int64      `json:"totalLimit"`
	TotalSpent int64      `json:"totalSpent"`
	Remaining int64       `json:"remaining"`
	Percent   float64     `json:"percent"`
}

type SavingsResult struct {
	GoalID   string  `json:"goalId"`
	Saved    int64   `json:"saved"`
	Target   int64   `json:"target"`
	Percent  float64 `json:"percent"`
}

type DebtResult struct {
	DebtID    string `json:"debtId"`
	Original  int64  `json:"original"`
	PrincipalPaid int64 `json:"principalPaid"`
	Balance   int64  `json:"balance"`
}

type NetWorthResult struct {
	Assets       int64 `json:"assets"`
	Liabilities  int64 `json:"liabilities"`
	DebtLiabilities int64 `json:"debtLiabilities"`
	Net          int64 `json:"net"`
	Currency     string `json:"currency"`
}

type Analysis struct {
	CashFlow       CashFlow          `json:"cashFlow"`
	AccountBalances []AccountBalance `json:"accountBalances"`
	Budgets        []BudgetResult    `json:"budgets"`
	Savings        []SavingsResult   `json:"savings"`
	Debts          []DebtResult      `json:"debts"`
	NetWorth       NetWorthResult    `json:"netWorth"`
}

func Analyze(v Vault, period Period, currency string) (Analysis, error) {
	start, end, err := parsePeriod(period)
	if err != nil {
		return Analysis{}, err
	}
	if currency == "" {
		currency = "COP"
	}

	result := Analysis{
		AccountBalances: make([]AccountBalance, 0, len(v.Accounts)),
		Budgets: make([]BudgetResult, 0, len(v.Budgets)),
		Savings: make([]SavingsResult, 0, len(v.SavingsGoals)),
		Debts: make([]DebtResult, 0, len(v.Debts)),
		NetWorth: NetWorthResult{Currency: currency},
	}

	for _, tx := range v.Transactions {
		if !inPeriod(tx.OccurredAt, start, end) || tx.Currency != currency {
			continue
		}
		amount := abs(tx.MinorUnits)
		switch tx.Type {
		case "income":
			result.CashFlow.Income += amount
		case "expense":
			result.CashFlow.Expenses += amount
		}
	}
	result.CashFlow.NetCashFlow = result.CashFlow.Income - result.CashFlow.Expenses

	for _, account := range v.Accounts {
		balance := account.OpeningMinorUnits
		for _, tx := range v.Transactions {
			if tx.Currency != account.Currency {
				continue
			}
			amount := abs(tx.MinorUnits)
			if tx.AccountID == account.ID {
				switch tx.Type {
				case "income":
					balance += amount
				case "expense", "transfer":
					balance -= amount
				}
			}
			if tx.Type == "transfer" && tx.ToAccountID == account.ID {
				balance += amount
			}
		}
		result.AccountBalances = append(result.AccountBalances, AccountBalance{
			AccountID: account.ID, Balance: balance, Currency: account.Currency,
		})
	}

	for _, budget := range v.Budgets {
		budgetStart, budgetEnd, err := parsePeriod(Period{Start: budget.StartDate, End: budget.EndDate})
		if err != nil {
			return Analysis{}, fmt.Errorf("budget %s: %w", budget.ID, err)
		}
		if budget.Currency != currency {
			continue
		}
		lineMap := make(map[string]int64, len(budget.Items))
		for _, item := range budget.Items {
			lineMap[item.CategoryID] = 0
		}
		for _, tx := range v.Transactions {
			if tx.Type == "expense" && tx.Currency == currency && inPeriod(tx.OccurredAt, budgetStart, budgetEnd) {
				if _, ok := lineMap[tx.CategoryID]; ok {
					lineMap[tx.CategoryID] += abs(tx.MinorUnits)
				}
			}
		}
		budgetResult := BudgetResult{ID: budget.ID, Lines: make([]BudgetLine, 0, len(budget.Items))}
		for _, item := range budget.Items {
			spent := lineMap[item.CategoryID]
			percent := 0.0
			if item.LimitMinorUnits > 0 {
				percent = float64(spent) / float64(item.LimitMinorUnits) * 100
			}
			budgetResult.Lines = append(budgetResult.Lines, BudgetLine{
				CategoryID: item.CategoryID,
				Limit: item.LimitMinorUnits,
				Spent: spent,
				Remaining: item.LimitMinorUnits - spent,
				Percent: percent,
			})
			budgetResult.TotalLimit += item.LimitMinorUnits
			budgetResult.TotalSpent += spent
		}
		budgetResult.Remaining = budgetResult.TotalLimit - budgetResult.TotalSpent
		if budgetResult.TotalLimit > 0 {
			budgetResult.Percent = float64(budgetResult.TotalSpent) / float64(budgetResult.TotalLimit) * 100
		}
		result.Budgets = append(result.Budgets, budgetResult)
	}

	for _, goal := range v.SavingsGoals {
		saved := int64(0)
		for _, contribution := range v.SavingsContributions {
			if contribution.GoalID == goal.ID {
				saved += abs(contribution.AmountMinorUnits)
			}
		}
		target := max(0, goal.TargetMinorUnits)
		percent := 0.0
		if target > 0 {
			percent = float64(saved) / float64(target) * 100
			if percent > 100 {
				percent = 100
			}
		}
		result.Savings = append(result.Savings, SavingsResult{
			GoalID: goal.ID, Saved: saved, Target: target, Percent: percent,
		})
	}

	for _, debt := range v.Debts {
		principalPaid := int64(0)
		for _, payment := range v.DebtPayments {
			if payment.DebtID == debt.ID {
				principalPaid += abs(payment.PrincipalMinorUnits)
			}
		}
		balance := max(0, debt.OriginalMinorUnits-principalPaid)
		result.Debts = append(result.Debts, DebtResult{
			DebtID: debt.ID, Original: debt.OriginalMinorUnits,
			PrincipalPaid: principalPaid, Balance: balance,
		})
	}

	for _, asset := range v.Assets {
		if asset.Currency == currency {
			result.NetWorth.Assets += asset.MinorUnits
		}
	}
	for _, liability := range v.Liabilities {
		if liability.Currency == currency {
			result.NetWorth.Liabilities += liability.MinorUnits
		}
	}
	for _, debt := range result.Debts {
		result.NetWorth.DebtLiabilities += debt.Balance
	}
	result.NetWorth.Liabilities += result.NetWorth.DebtLiabilities
	result.NetWorth.Net = result.NetWorth.Assets - result.NetWorth.Liabilities

	sort.Slice(result.AccountBalances, func(i, j int) bool {
		return result.AccountBalances[i].AccountID < result.AccountBalances[j].AccountID
	})
	return result, nil
}

func AnalyzeJSON(payload []byte) ([]byte, error) {
	var request struct {
		Vault    Vault  `json:"vault"`
		Period   Period `json:"period"`
		Currency string `json:"currency"`
	}
	if err := json.Unmarshal(payload, &request); err != nil {
		return nil, fmt.Errorf("invalid engine request: %w", err)
	}
	result, err := Analyze(request.Vault, request.Period, request.Currency)
	if err != nil {
		return nil, err
	}
	return json.Marshal(result)
}

func parsePeriod(period Period) (time.Time, time.Time, error) {
	start, err := time.Parse(time.RFC3339, period.Start)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("invalid period start: %w", err)
	}
	end, err := time.Parse(time.RFC3339, period.End)
	if err != nil {
		return time.Time{}, time.Time{}, fmt.Errorf("invalid period end: %w", err)
	}
	if !start.Before(end) {
		return time.Time{}, time.Time{}, fmt.Errorf("period start must be before end")
	}
	return start.UTC(), end.UTC(), nil
}

func inPeriod(value string, start, end time.Time) bool {
	timestamp, err := time.Parse(time.RFC3339, value)
	if err != nil {
		return false
	}
	timestamp = timestamp.UTC()
	return !timestamp.Before(start) && timestamp.Before(end)
}

func abs(value int64) int64 {
	if value < 0 {
		return -value
	}
	return value
}

func max(a, b int64) int64 {
	if a > b {
		return a
	}
	return b
}
