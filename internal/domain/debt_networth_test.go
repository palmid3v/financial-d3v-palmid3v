package domain

import (
 "testing"
 "time"
)

func TestDebtPaymentReducesPrincipalOnly(t *testing.T){
 d,_:=NewDebt("d1","o1","Loan",MustMoney(100000,"COP"),MustMoney(100000,"COP"),MustMoney(10000,"COP"),1200,time.Now())
 p,err:=NewDebtPayment("p1","o1","d1",MustMoney(12000,"COP"),MustMoney(10000,"COP"),MustMoney(1500,"COP"),MustMoney(500,"COP"),time.Now(),time.Now())
 if err!=nil{t.Fatal(err)}
 d.Balance.MinorUnits-=p.Principal.MinorUnits
 if d.Balance.MinorUnits!=90000{t.Fatalf("got %d",d.Balance.MinorUnits)}
}

func TestNetWorthIncludesDebtAndOtherLiability(t *testing.T){
 now:=time.Now().UTC()
 assets:=[]Asset{{ID:"a",OwnerID:"o",Name:"House",Kind:AssetProperty,Value:MustMoney(500000,"COP"),AsOf:now}}
 liabilities:=[]Liability{{ID:"l",OwnerID:"o",Name:"Tax",Kind:LiabilityTax,Balance:MustMoney(50000,"COP"),AsOf:now}}
 debts:=[]Debt{{ID:"d",OwnerID:"o",Name:"Loan",OriginalPrincipal:MustMoney(300000,"COP"),Balance:MustMoney(200000,"COP"),Status:DebtActive}}
 nw,err:=CalculateNetWorth("COP",assets,liabilities,debts,now)
 if err!=nil{t.Fatal(err)}
 if nw.Net.MinorUnits!=250000{t.Fatalf("got %d",nw.Net.MinorUnits)}
 if nw.DebtLiabilities.MinorUnits!=200000{t.Fatalf("debt liabilities got %d",nw.DebtLiabilities.MinorUnits)}
}
