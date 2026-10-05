package application

import("testing";"time";"github.com/palmid3v/financial-d3v-palmid3v/internal/domain")

func TestSummarizeTransactions(t *testing.T){
 now:=time.Now().UTC()
 tx:=[]domain.Transaction{}
 a,_:=domain.NewTransaction("1","o","a",domain.TransactionIncome,domain.Money{MinorUnits:500000,Currency:"COP"},now);tx=append(tx,a)
 b,_:=domain.NewTransaction("2","o","a",domain.TransactionExpense,domain.Money{MinorUnits:120000,Currency:"COP"},now);b.CategoryID="food";tx=append(tx,b)
 c,_:=domain.NewTransaction("3","o","a",domain.TransactionExpense,domain.Money{MinorUnits:80000,Currency:"COP"},now);c.CategoryID="transport";tx=append(tx,c)
 d,_:=domain.NewTransaction("4","o","a",domain.TransactionTransfer,domain.Money{MinorUnits:200000,Currency:"COP"},now);tx=append(tx,d)
 income,expenses,net,cats,err:=summarizeTransactions(tx,"COP",map[string]string{"food":"Food","transport":"Transport"})
 if err!=nil{t.Fatal(err)}
 if income.MinorUnits!=500000||expenses.MinorUnits!=200000||net.MinorUnits!=300000{t.Fatalf("unexpected totals: income=%d expenses=%d net=%d",income.MinorUnits,expenses.MinorUnits,net.MinorUnits)}
 if len(cats)!=2||cats[0].CategoryID!="food"||cats[1].CategoryID!="transport"{t.Fatalf("unexpected categories: %#v",cats)}
}
