package domain

import (
 "fmt"
 "time"
)

var (
	ErrInvalidDebt = fmt.Errorf("invalid debt")
	ErrInvalidDebtPayment = fmt.Errorf("invalid debt payment")
	ErrInvalidAsset = fmt.Errorf("invalid asset")
	ErrInvalidLiability = fmt.Errorf("invalid liability")
)

type DebtStatus string
const (
	DebtActive DebtStatus = "active"
	DebtPaid DebtStatus = "paid"
)
func (s DebtStatus) Valid() bool { return s == DebtActive || s == DebtPaid }

type Debt struct {
	ID string
	OwnerID string
	Name string
	OriginalPrincipal Money
	Balance Money
	AnnualRateBPS int64
	MinimumPayment Money
	Status DebtStatus
	CreatedAt time.Time
}

func NewDebt(id, ownerID, name string, originalPrincipal, balance, minimumPayment Money, annualRateBPS int64, createdAt time.Time) (Debt,error) {
	if id==""||ownerID==""||name==""||!originalPrincipal.IsPositive()||balance.MinorUnits<0||balance.Currency!=originalPrincipal.Currency||minimumPayment.MinorUnits<0||minimumPayment.Currency!=originalPrincipal.Currency||annualRateBPS<0 { return Debt{},ErrInvalidDebt }
	if balance.MinorUnits>originalPrincipal.MinorUnits { return Debt{},ErrInvalidDebt }
	if minimumPayment.MinorUnits>0 && minimumPayment.MinorUnits>balance.MinorUnits && balance.MinorUnits>0 { return Debt{},ErrInvalidDebt }
	if createdAt.IsZero(){createdAt=time.Now().UTC()}
	status:=DebtActive
	if balance.IsZero(){status=DebtPaid}
	return Debt{ID:id,OwnerID:ownerID,Name:name,OriginalPrincipal:originalPrincipal,Balance:balance,AnnualRateBPS:annualRateBPS,MinimumPayment:minimumPayment,Status:status,CreatedAt:createdAt.UTC()},nil
}

type DebtPayment struct {
	ID string
	OwnerID string
	DebtID string
	Amount Money
	Principal Money
	Interest Money
	Fees Money
	PaidAt time.Time
	Note string
	CreatedAt time.Time
}

func NewDebtPayment(id,ownerID,debtID string,amount,principal,interest,fees Money,paidAt,createdAt time.Time)(DebtPayment,error){
	if id==""||ownerID==""||debtID==""||!amount.IsPositive()||paidAt.IsZero(){return DebtPayment{},ErrInvalidDebtPayment}
	if principal.MinorUnits<0||interest.MinorUnits<0||fees.MinorUnits<0||principal.Currency!=amount.Currency||interest.Currency!=amount.Currency||fees.Currency!=amount.Currency{return DebtPayment{},ErrInvalidDebtPayment}
	parts,err:=principal.Add(interest);if err!=nil{return DebtPayment{},err};parts,err=parts.Add(fees);if err!=nil{return DebtPayment{},err}
	if parts.MinorUnits!=amount.MinorUnits{return DebtPayment{},ErrInvalidDebtPayment}
	if createdAt.IsZero(){createdAt=time.Now().UTC()}
	return DebtPayment{ID:id,OwnerID:ownerID,DebtID:debtID,Amount:amount,Principal:principal,Interest:interest,Fees:fees,PaidAt:paidAt.UTC(),CreatedAt:createdAt.UTC()},nil
}

type AssetKind string
const(AssetCash AssetKind="cash";AssetInvestment AssetKind="investment";AssetProperty AssetKind="property";AssetVehicle AssetKind="vehicle";AssetOther AssetKind="other")
func(k AssetKind)Valid()bool{return k==AssetCash||k==AssetInvestment||k==AssetProperty||k==AssetVehicle||k==AssetOther}

type Asset struct { ID string;OwnerID string;Name string;Kind AssetKind;Value Money;AsOf time.Time;CreatedAt time.Time }
func NewAsset(id,ownerID,name string,kind AssetKind,value Money,asOf,createdAt time.Time)(Asset,error){
	if id==""||ownerID==""||name==""||!kind.Valid()||!value.IsPositive()||asOf.IsZero(){return Asset{},ErrInvalidAsset}
	if createdAt.IsZero(){createdAt=time.Now().UTC()}
	return Asset{ID:id,OwnerID:ownerID,Name:name,Kind:kind,Value:value,AsOf:asOf.UTC(),CreatedAt:createdAt.UTC()},nil
}

type LiabilityKind string
const(LiabilityOther LiabilityKind="other";LiabilityTax LiabilityKind="tax";LiabilityLegal LiabilityKind="legal";LiabilityOtherDebt LiabilityKind="other-debt")
func(k LiabilityKind)Valid()bool{return k==LiabilityOther||k==LiabilityTax||k==LiabilityLegal||k==LiabilityOtherDebt}

type Liability struct { ID string;OwnerID string;Name string;Kind LiabilityKind;Balance Money;AsOf time.Time;CreatedAt time.Time }
func NewLiability(id,ownerID,name string,kind LiabilityKind,balance Money,asOf,createdAt time.Time)(Liability,error){
	if id==""||ownerID==""||name==""||!kind.Valid()||balance.MinorUnits<0||balance.Currency==""||asOf.IsZero(){return Liability{},ErrInvalidLiability}
	if createdAt.IsZero(){createdAt=time.Now().UTC()}
	return Liability{ID:id,OwnerID:ownerID,Name:name,Kind:kind,Balance:balance,AsOf:asOf.UTC(),CreatedAt:createdAt.UTC()},nil
}

type NetWorth struct {
	Currency string
	Assets Money
	Liabilities Money
	DebtLiabilities Money
	Net Money
	AsOf time.Time
}

func CalculateNetWorth(currency string,assets []Asset,liabilities []Liability,debts []Debt,asOf time.Time)(NetWorth,error){
	if currency==""||asOf.IsZero(){return NetWorth{},ErrInvalidEntity}
	totalAssets,totalLiabilities,debtLiabilities:=Money{Currency:currency},Money{Currency:currency},Money{Currency:currency}
	for _,a:=range assets{if a.Value.Currency!=currency{return NetWorth{},ErrCurrencyMismatch};var err error;totalAssets,err=totalAssets.Add(a.Value);if err!=nil{return NetWorth{},err}}
	for _,l:=range liabilities{if l.Balance.Currency!=currency{return NetWorth{},ErrCurrencyMismatch};var err error;totalLiabilities,err=totalLiabilities.Add(l.Balance);if err!=nil{return NetWorth{},err}}
	for _,d:=range debts{if d.Balance.Currency!=currency{return NetWorth{},ErrCurrencyMismatch};var err error;debtLiabilities,err=debtLiabilities.Add(d.Balance);if err!=nil{return NetWorth{},err}}
	allLiabilities,err:=totalLiabilities.Add(debtLiabilities);if err!=nil{return NetWorth{},err}
	net,err:=totalAssets.Subtract(allLiabilities);if err!=nil{return NetWorth{},err}
	return NetWorth{Currency:currency,Assets:totalAssets,Liabilities:allLiabilities,DebtLiabilities:debtLiabilities,Net:net,AsOf:asOf.UTC()},nil
}
