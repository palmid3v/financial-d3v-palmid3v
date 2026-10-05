package application

import (
 "context"
 "github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
 "github.com/palmid3v/financial-d3v-palmid3v/internal/persistence"
)

type PayrollService struct{employees persistence.PayrollEmployeeRepository;periods persistence.PayrollPeriodRepository}
func NewPayrollService(e persistence.PayrollEmployeeRepository,p persistence.PayrollPeriodRepository)*PayrollService{return &PayrollService{employees:e,periods:p}}
func(s *PayrollService)CreateEmployee(ctx context.Context,v domain.PayrollEmployee)error{return s.employees.Create(ctx,v)}
func(s *PayrollService)ListEmployees(ctx context.Context,ownerID string)([]domain.PayrollEmployee,error){return s.employees.List(ctx,ownerID)}
func(s *PayrollService)CreatePeriod(ctx context.Context,v domain.PayrollPeriod)error{if _,err:=s.employees.Get(ctx,v.OwnerID,v.EmployeeID);err!=nil{return err};return s.periods.Create(ctx,v)}
func(s *PayrollService)ListPeriods(ctx context.Context,ownerID,employeeID string)([]domain.PayrollPeriod,error){return s.periods.ListByEmployee(ctx,ownerID,employeeID)}
