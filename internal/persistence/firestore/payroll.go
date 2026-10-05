package firestore

import(
 "context"
 "github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
 "github.com/palmid3v/financial-d3v-palmid3v/internal/persistence"
 gcpfirestore "cloud.google.com/go/firestore"
 "google.golang.org/api/iterator"
)

type PayrollEmployeeDocument struct{ID string;OwnerID string;Name string;BaseSalary MoneyDocument;Currency string;Active bool;CreatedAt time.Time}
type PayrollPeriodDocument struct{ID string;OwnerID string;EmployeeID string;StartDate time.Time;EndDate time.Time;GrossPay MoneyDocument;Deductions MoneyDocument;NetPay MoneyDocument;CreatedAt time.Time}

func payrollEmployeeToDocument(v domain.PayrollEmployee)PayrollEmployeeDocument{return PayrollEmployeeDocument{ID:v.ID,OwnerID:v.OwnerID,Name:v.Name,BaseSalary:moneyDocument(v.BaseSalary),Currency:v.Currency,Active:v.Active,CreatedAt:v.CreatedAt}}
func payrollEmployeeFromDocument(d PayrollEmployeeDocument)(domain.PayrollEmployee,error){return domain.NewPayrollEmployee(d.ID,d.OwnerID,d.Name,domain.Money{MinorUnits:d.BaseSalary.MinorUnits,Currency:d.BaseSalary.Currency},d.Active,d.CreatedAt)}
func payrollPeriodToDocument(v domain.PayrollPeriod)PayrollPeriodDocument{return PayrollPeriodDocument{ID:v.ID,OwnerID:v.OwnerID,EmployeeID:v.EmployeeID,StartDate:v.StartDate,EndDate:v.EndDate,GrossPay:moneyDocument(v.GrossPay),Deductions:moneyDocument(v.Deductions),NetPay:moneyDocument(v.NetPay),CreatedAt:v.CreatedAt}}

type PayrollEmployeeRepository struct{db *gcpfirestore.Client}
func(r *PayrollEmployeeRepository)Create(ctx context.Context,v domain.PayrollEmployee)error{_,err:=r.db.Collection("users").Doc(v.OwnerID).Collection("payrollEmployees").Doc(v.ID).Create(ctx,payrollEmployeeToDocument(v));return mapFirestoreError(err)}
func(r *PayrollEmployeeRepository)Get(ctx context.Context,ownerID,id string)(domain.PayrollEmployee,error){s,err:=r.db.Collection("users").Doc(ownerID).Collection("payrollEmployees").Doc(id).Get(ctx);if err!=nil{return domain.PayrollEmployee{},mapFirestoreError(err)};var d PayrollEmployeeDocument;if err:=s.DataTo(&d);err!=nil{return domain.PayrollEmployee{},err};return payrollEmployeeFromDocument(d)}
func(r *PayrollEmployeeRepository)List(ctx context.Context,ownerID string)([]domain.PayrollEmployee,error){iter:=r.db.Collection("users").Doc(ownerID).Collection("payrollEmployees").OrderBy("createdAt",gcpfirestore.Asc).Documents(ctx);defer iter.Stop();var out []domain.PayrollEmployee;for{s,err:=iter.Next();if errors.Is(err,iterator.Done){return out,nil};if err!=nil{return nil,mapFirestoreError(err)};var d PayrollEmployeeDocument;if err:=s.DataTo(&d);err!=nil{return nil,err};v,err:=payrollEmployeeFromDocument(d);if err!=nil{return nil,err};out=append(out,v)}}

type PayrollPeriodRepository struct{db *gcpfirestore.Client}
func(r *PayrollPeriodRepository)Create(ctx context.Context,v domain.PayrollPeriod)error{_,err:=r.db.Collection("users").Doc(v.OwnerID).Collection("payrollPeriods").Doc(v.ID).Create(ctx,payrollPeriodToDocument(v));return mapFirestoreError(err)}
func(r *PayrollPeriodRepository)ListByEmployee(ctx context.Context,ownerID,employeeID string)([]domain.PayrollPeriod,error){q:=r.db.Collection("users").Doc(ownerID).Collection("payrollPeriods").Where("employeeId","==",employeeID).OrderBy("startDate",gcpfirestore.Desc);iter:=q.Documents(ctx);defer iter.Stop();var out []domain.PayrollPeriod;for{s,err:=iter.Next();if errors.Is(err,iterator.Done){return out,nil};if err!=nil{return nil,mapFirestoreError(err)};var d PayrollPeriodDocument;if err:=s.DataTo(&d);err!=nil{return nil,err};gross:=domain.Money{MinorUnits:d.GrossPay.MinorUnits,Currency:d.GrossPay.Currency};ded:=domain.Money{MinorUnits:d.Deductions.MinorUnits,Currency:d.Deductions.Currency};v,err:=domain.NewPayrollPeriod(d.ID,d.OwnerID,d.EmployeeID,d.StartDate,d.EndDate,gross,ded,d.CreatedAt);if err!=nil{return nil,err};out=append(out,v)}}

func(r *Repositories)PayrollEmployees()*PayrollEmployeeRepository{return &PayrollEmployeeRepository{db:r.db}}
func(r *Repositories)PayrollPeriods()*PayrollPeriodRepository{return &PayrollPeriodRepository{db:r.db}}
var _ persistence.PayrollEmployeeRepository=(*PayrollEmployeeRepository)(nil)
var _ persistence.PayrollPeriodRepository=(*PayrollPeriodRepository)(nil)
