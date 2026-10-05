package domain

import (
 "fmt"
 "time"
)

var ErrInvalidPayroll = fmt.Errorf("invalid payroll")

type PayrollEmployee struct {
 ID string
 OwnerID string
 Name string
 BaseSalary Money
 Currency string
 Active bool
 CreatedAt time.Time
}

func NewPayrollEmployee(id,ownerID,name string,baseSalary Money,active bool,createdAt time.Time)(PayrollEmployee,error){
 if id==""||ownerID==""||name==""||!baseSalary.IsPositive()||baseSalary.Currency==""{return PayrollEmployee{},ErrInvalidPayroll}
 if createdAt.IsZero(){createdAt=time.Now().UTC()}
 return PayrollEmployee{ID:id,OwnerID:ownerID,Name:name,BaseSalary:baseSalary,Currency:baseSalary.Currency,Active:active,CreatedAt:createdAt.UTC()},nil
}

type PayrollPeriod struct {
 ID string
 OwnerID string
 EmployeeID string
 StartDate time.Time
 EndDate time.Time
 GrossPay Money
 Deductions Money
 NetPay Money
 CreatedAt time.Time
}

func NewPayrollPeriod(id,ownerID,employeeID string,startDate,endDate time.Time,gross,deductions Money,createdAt time.Time)(PayrollPeriod,error){
 if id==""||ownerID==""||employeeID==""||startDate.IsZero()||endDate.IsZero()||!startDate.Before(endDate)||!gross.IsPositive()||deductions.MinorUnits<0||deductions.Currency!=gross.Currency{return PayrollPeriod{},ErrInvalidPayroll}
 net,err:=gross.Subtract(deductions);if err!=nil||net.MinorUnits<0{return PayrollPeriod{},ErrInvalidPayroll}
 if createdAt.IsZero(){createdAt=time.Now().UTC()}
 return PayrollPeriod{ID:id,OwnerID:ownerID,EmployeeID:employeeID,StartDate:startDate.UTC(),EndDate:endDate.UTC(),GrossPay:gross,Deductions:deductions,NetPay:net,CreatedAt:createdAt.UTC()},nil
}
