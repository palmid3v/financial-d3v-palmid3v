package persistence

import (
 "context"
 "github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
)

type PayrollEmployeeRepository interface{Create(context.Context,domain.PayrollEmployee)error;Get(context.Context,string,string)(domain.PayrollEmployee,error);List(context.Context,string)([]domain.PayrollEmployee,error)}
type PayrollPeriodRepository interface{Create(context.Context,domain.PayrollPeriod)error;ListByEmployee(context.Context,string,string)([]domain.PayrollPeriod,error)}
