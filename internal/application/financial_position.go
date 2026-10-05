package application

import (
 "context"
 "time"
 "github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
 "github.com/palmid3v/financial-d3v-palmid3v/internal/persistence"
)

type AssetService struct{assets persistence.AssetRepository}
func NewAssetService(a persistence.AssetRepository)*AssetService{return &AssetService{assets:a}}
func(s *AssetService)Create(ctx context.Context,v domain.Asset)error{return s.assets.Create(ctx,v)}
func(s *AssetService)Get(ctx context.Context,ownerID,id string)(domain.Asset,error){return s.assets.Get(ctx,ownerID,id)}
func(s *AssetService)List(ctx context.Context,ownerID string)([]domain.Asset,error){return s.assets.List(ctx,ownerID)}

type LiabilityService struct{liabilities persistence.LiabilityRepository}
func NewLiabilityService(l persistence.LiabilityRepository)*LiabilityService{return &LiabilityService{liabilities:l}}
func(s *LiabilityService)Create(ctx context.Context,v domain.Liability)error{return s.liabilities.Create(ctx,v)}
func(s *LiabilityService)Get(ctx context.Context,ownerID,id string)(domain.Liability,error){return s.liabilities.Get(ctx,ownerID,id)}
func(s *LiabilityService)List(ctx context.Context,ownerID string)([]domain.Liability,error){return s.liabilities.List(ctx,ownerID)}

type FinancialPositionService struct{accounts *AccountService;assets *AssetService;liabilities *LiabilityService;debts *DebtService}
func NewFinancialPositionService(a *AccountService,as *AssetService,l *LiabilityService,d *DebtService)*FinancialPositionService{return &FinancialPositionService{accounts:a,assets:as,liabilities:l,debts:d}}
func(s *FinancialPositionService)NetWorth(ctx context.Context,ownerID,currency string,asOf time.Time)(domain.NetWorth,error){
 accounts,err:=s.accounts.List(ctx,ownerID);if err!=nil{return domain.NetWorth{},err}
 assets,err:=s.assets.List(ctx,ownerID);if err!=nil{return domain.NetWorth{},err}
 liabilities,err:=s.liabilities.List(ctx,ownerID);if err!=nil{return domain.NetWorth{},err}
 debts,err:=s.debts.List(ctx,ownerID);if err!=nil{return domain.NetWorth{},err}
 allAssets:=make([]domain.Asset,0,len(accounts)+len(assets))
 for _,a:=range accounts{
  if a.Currency!=currency{continue}
  balance,err:=s.accounts.Balance(ctx,ownerID,a.ID);if err!=nil{return domain.NetWorth{},err}
  if balance.MinorUnits>0{kind:=domain.AssetOther;if a.Type==domain.AccountTypeCash||a.Type==domain.AccountTypeBank{kind=domain.AssetCash};if a.Type==domain.AccountTypeInvestment{kind=domain.AssetInvestment};value,_:=domain.NewAsset("account-"+a.ID,ownerID,a.Name,kind,balance,asOf,time.Now().UTC());allAssets=append(allAssets,value)}
 }
 for _,a:=range assets{if a.Value.Currency==currency{allAssets=append(allAssets,a)}}
 return domain.CalculateNetWorth(currency,allAssets,liabilities,debts,asOf)
}
