package firestore

import("time";"github.com/palmid3v/financial-d3v-palmid3v/internal/domain")
type MoneyDocument struct{MinorUnits int64;Currency string}
type AccountDocument struct{ID string;OwnerID string;Name string;Type string;Currency string;OpeningBalance MoneyDocument;CreatedAt time.Time}
type TransactionDocument struct{ID string;OwnerID string;AccountID string;Type string;Amount MoneyDocument;CategoryID string;TransferID string;Description string;OccurredAt time.Time;CreatedAt time.Time}
type CategoryDocument struct{ID string;OwnerID string;Name string;Kind string;CreatedAt time.Time}
type BudgetItemDocument struct{CategoryID string;Limit MoneyDocument}
type BudgetDocument struct{ID string;OwnerID string;Name string;StartDate time.Time;EndDate time.Time;Currency string;Items []BudgetItemDocument;CreatedAt time.Time}
type SavingsGoalDocument struct{ID string;OwnerID string;Name string;Target MoneyDocument;TargetDate *time.Time;CreatedAt time.Time}
type SavingsContributionDocument struct{ID string;OwnerID string;GoalID string;Amount MoneyDocument;SourceAccountID string;TransactionID string;ContributedAt time.Time;Note string;CreatedAt time.Time}
func moneyDocument(m domain.Money)MoneyDocument{return MoneyDocument{MinorUnits:m.MinorUnits,Currency:m.Currency}}
func AccountToDocument(v domain.Account)AccountDocument{return AccountDocument{ID:v.ID,OwnerID:v.OwnerID,Name:v.Name,Type:string(v.Type),Currency:v.Currency,OpeningBalance:moneyDocument(v.OpeningBalance),CreatedAt:v.CreatedAt}}
func TransactionToDocument(v domain.Transaction)TransactionDocument{return TransactionDocument{ID:v.ID,OwnerID:v.OwnerID,AccountID:v.AccountID,Type:string(v.Type),Amount:moneyDocument(v.Amount),CategoryID:v.CategoryID,TransferID:v.TransferID,Description:v.Description,OccurredAt:v.OccurredAt,CreatedAt:v.CreatedAt}}
func CategoryToDocument(v domain.Category)CategoryDocument{return CategoryDocument{ID:v.ID,OwnerID:v.OwnerID,Name:v.Name,Kind:string(v.Kind),CreatedAt:v.CreatedAt}}
func BudgetToDocument(v domain.Budget)BudgetDocument{items:=make([]BudgetItemDocument,0,len(v.Items));for _,i:=range v.Items{items=append(items,BudgetItemDocument{CategoryID:i.CategoryID,Limit:moneyDocument(i.Limit)})};return BudgetDocument{ID:v.ID,OwnerID:v.OwnerID,Name:v.Name,StartDate:v.Period.StartDate,EndDate:v.Period.EndDate,Currency:v.Currency,Items:items,CreatedAt:v.CreatedAt}}
func SavingsGoalToDocument(v domain.SavingsGoal)SavingsGoalDocument{return SavingsGoalDocument{ID:v.ID,OwnerID:v.OwnerID,Name:v.Name,Target:moneyDocument(v.Target),TargetDate:v.TargetDate,CreatedAt:v.CreatedAt}}
func SavingsContributionToDocument(v domain.SavingsContribution)SavingsContributionDocument{return SavingsContributionDocument{ID:v.ID,OwnerID:v.OwnerID,GoalID:v.GoalID,Amount:moneyDocument(v.Amount),SourceAccountID:v.SourceAccountID,TransactionID:v.TransactionID,ContributedAt:v.ContributedAt,Note:v.Note,CreatedAt:v.CreatedAt}}

type DebtDocument struct{ID string;OwnerID string;Name string;OriginalPrincipal MoneyDocument;Balance MoneyDocument;AnnualRateBPS int64;MinimumPayment MoneyDocument;Status string;CreatedAt time.Time}
type DebtPaymentDocument struct{ID string;OwnerID string;DebtID string;Amount MoneyDocument;Principal MoneyDocument;Interest MoneyDocument;Fees MoneyDocument;PaidAt time.Time;Note string;CreatedAt time.Time}
type AssetDocument struct{ID string;OwnerID string;Name string;Kind string;Value MoneyDocument;AsOf time.Time;CreatedAt time.Time}
type LiabilityDocument struct{ID string;OwnerID string;Name string;Kind string;Balance MoneyDocument;AsOf time.Time;CreatedAt time.Time}
func DebtToDocument(v domain.Debt)DebtDocument{return DebtDocument{ID:v.ID,OwnerID:v.OwnerID,Name:v.Name,OriginalPrincipal:moneyDocument(v.OriginalPrincipal),Balance:moneyDocument(v.Balance),AnnualRateBPS:v.AnnualRateBPS,MinimumPayment:moneyDocument(v.MinimumPayment),Status:string(v.Status),CreatedAt:v.CreatedAt}}
func DebtPaymentToDocument(v domain.DebtPayment)DebtPaymentDocument{return DebtPaymentDocument{ID:v.ID,OwnerID:v.OwnerID,DebtID:v.DebtID,Amount:moneyDocument(v.Amount),Principal:moneyDocument(v.Principal),Interest:moneyDocument(v.Interest),Fees:moneyDocument(v.Fees),PaidAt:v.PaidAt,Note:v.Note,CreatedAt:v.CreatedAt}}
func AssetToDocument(v domain.Asset)AssetDocument{return AssetDocument{ID:v.ID,OwnerID:v.OwnerID,Name:v.Name,Kind:string(v.Kind),Value:moneyDocument(v.Value),AsOf:v.AsOf,CreatedAt:v.CreatedAt}}
func LiabilityToDocument(v domain.Liability)LiabilityDocument{return LiabilityDocument{ID:v.ID,OwnerID:v.OwnerID,Name:v.Name,Kind:string(v.Kind),Balance:moneyDocument(v.Balance),AsOf:v.AsOf,CreatedAt:v.CreatedAt}}
