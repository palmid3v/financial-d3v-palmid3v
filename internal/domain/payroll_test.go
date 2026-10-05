package domain

import("testing";"time")

func TestPayrollPeriodCalculatesNetPay(t *testing.T){
 gross:=MustMoney(500000,"COP");deductions:=MustMoney(50000,"COP")
 v,err:=NewPayrollPeriod("p1","o1","e1",time.Date(2026,10,1,0,0,0,0,time.UTC),time.Date(2026,11,1,0,0,0,0,time.UTC),gross,deductions,time.Now())
 if err!=nil{t.Fatal(err)}
 if v.NetPay.MinorUnits!=450000{t.Fatalf("expected net 450000, got %d",v.NetPay.MinorUnits)}
}
func TestPayrollRejectsDeductionsAboveGross(t *testing.T){
 _,err:=NewPayrollPeriod("p1","o1","e1",time.Now(),time.Now().Add(24*time.Hour),MustMoney(100,"COP"),MustMoney(101,"COP"),time.Now())
 if err==nil{t.Fatal("expected invalid payroll")}
}
