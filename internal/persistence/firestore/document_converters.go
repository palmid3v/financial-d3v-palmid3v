package firestore

import("time";"github.com/palmid3v/financial-d3v-palmid3v/internal/domain")
func moneyFromDocument(v MoneyDocument)domain.Money{return domain.Money{MinorUnits:v.MinorUnits,Currency:v.Currency}}
func AccountFromDocument(v AccountDocument)(domain.Account,error){return domain.NewAccount(v.ID,v.OwnerID,v.Name,domain.AccountType(v.Type),moneyFromDocument(v.OpeningBalance),v.CreatedAt)}
func TransactionFromDocument(v TransactionDocument)(domain.Transaction,error){t,err:=domain.NewTransaction(v.ID,v.OwnerID,v.AccountID,domain.TransactionType(v.Type),moneyFromDocument(v.Amount),v.OccurredAt);if err!=nil{return domain.Transaction{},err};t.CategoryID=v.CategoryID;t.TransferID=v.TransferID;t.Description=v.Description;t.CreatedAt=v.CreatedAt.UTC();return t,nil}
func CategoryFromDocument(v CategoryDocument)(domain.Category,error){return domain.NewCategory(v.ID,v.OwnerID,v.Name,domain.CategoryKind(v.Kind),v.CreatedAt)}
func BudgetFromDocument(v BudgetDocument)(domain.Budget,error){p,err:=domain.NewFinancialPeriod(v.StartDate,v.EndDate);if err!=nil{return domain.Budget{},err};b,err:=domain.NewBudget(v.ID,v.OwnerID,v.Name,v.Currency,p,v.CreatedAt);if err!=nil{return domain.Budget{},err};for _,i:=range v.Items{if err:=b.AddItem(i.CategoryID,moneyFromDocument(i.Limit));err!=nil{return domain.Budget{},err}};return b,nil}
func SavingsGoalFromDocument(v SavingsGoalDocument)(domain.SavingsGoal,error){var d *time.Time;if v.TargetDate!=nil{x:=v.TargetDate.UTC();d=&x};return domain.NewSavingsGoal(v.ID,v.OwnerID,v.Name,moneyFromDocument(v.Target),d,v.CreatedAt)}
func SavingsContributionFromDocument(v SavingsContributionDocument)(domain.SavingsContribution,error){c,err:=domain.NewSavingsContribution(v.ID,v.OwnerID,v.GoalID,moneyFromDocument(v.Amount),v.SourceAccountID,v.TransactionID,v.ContributedAt,v.CreatedAt);if err!=nil{return domain.SavingsContribution{},err};c.Note=v.Note;return c,nil}

func DebtFromDocument(v DebtDocument)(domain.Debt,error){return domain.NewDebt(v.ID,v.OwnerID,v.Name,moneyFromDocument(v.OriginalPrincipal),moneyFromDocument(v.Balance),moneyFromDocument(v.MinimumPayment),v.AnnualRateBPS,v.CreatedAt)}
func DebtPaymentFromDocument(v DebtPaymentDocument)(domain.DebtPayment,error){p,err:=domain.NewDebtPayment(v.ID,v.OwnerID,v.DebtID,moneyFromDocument(v.Amount),moneyFromDocument(v.Principal),moneyFromDocument(v.Interest),moneyFromDocument(v.Fees),v.PaidAt,v.CreatedAt);if err!=nil{return domain.DebtPayment{},err};p.Note=v.Note;return p,nil}
func AssetFromDocument(v AssetDocument)(domain.Asset,error){return domain.NewAsset(v.ID,v.OwnerID,v.Name,domain.AssetKind(v.Kind),moneyFromDocument(v.Value),v.AsOf,v.CreatedAt)}
func LiabilityFromDocument(v LiabilityDocument)(domain.Liability,error){return domain.NewLiability(v.ID,v.OwnerID,v.Name,domain.LiabilityKind(v.Kind),moneyFromDocument(v.Balance),v.AsOf,v.CreatedAt)}
