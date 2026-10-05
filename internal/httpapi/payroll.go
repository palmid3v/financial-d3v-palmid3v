package httpapi

import(
 "net/http"
 "strings"
 "time"
 "github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
)

type payrollEmployeeRequest struct{Name string `json:"name"`;BaseSalaryMinor int64 `json:"baseSalaryMinorUnits"`;Currency string `json:"currency"`;Active bool `json:"active"`}
type payrollPeriodRequest struct{EmployeeID string `json:"employeeId"`;StartDate string `json:"startDate"`;EndDate string `json:"endDate"`;GrossMinor int64 `json:"grossMinorUnits"`;DeductionsMinor int64 `json:"deductionsMinorUnits"`;Currency string `json:"currency"`}

func(s *Server)createPayrollEmployee(w http.ResponseWriter,r *http.Request){if s.payroll==nil{writeError(w,http.StatusServiceUnavailable,"payroll service is unavailable");return};owner,ok:=requireOwner(w,r);if !ok{return};var q payrollEmployeeRequest;if !decodeJSON(w,r,&q){return};v,err:=domain.NewPayrollEmployee(newID(),owner,strings.TrimSpace(q.Name),domain.Money{MinorUnits:q.BaseSalaryMinor,Currency:strings.ToUpper(strings.TrimSpace(q.Currency))},q.Active,time.Now().UTC());if err!=nil{writeError(w,statusForError(err),err.Error());return};if err=s.payroll.CreateEmployee(r.Context(),v);err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusCreated,v)}
func(s *Server)listPayrollEmployees(w http.ResponseWriter,r *http.Request){if s.payroll==nil{writeError(w,http.StatusServiceUnavailable,"payroll service is unavailable");return};owner,ok:=requireOwner(w,r);if !ok{return};v,err:=s.payroll.ListEmployees(r.Context(),owner);if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,v)}
func(s *Server)createPayrollPeriod(w http.ResponseWriter,r *http.Request){if s.payroll==nil{writeError(w,http.StatusServiceUnavailable,"payroll service is unavailable");return};owner,ok:=requireOwner(w,r);if !ok{return};var q payrollPeriodRequest;if !decodeJSON(w,r,&q){return};a,e1:=time.Parse(time.RFC3339,q.StartDate);b,e2:=time.Parse(time.RFC3339,q.EndDate);if e1!=nil||e2!=nil{writeError(w,http.StatusBadRequest,"startDate and endDate must be RFC3339");return};cur:=strings.ToUpper(strings.TrimSpace(q.Currency));v,err:=domain.NewPayrollPeriod(newID(),owner,strings.TrimSpace(q.EmployeeID),a,b,domain.Money{MinorUnits:q.GrossMinor,Currency:cur},domain.Money{MinorUnits:q.DeductionsMinor,Currency:cur},time.Now().UTC());if err!=nil{writeError(w,statusForError(err),err.Error());return};if err=s.payroll.CreatePeriod(r.Context(),v);err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusCreated,v)}
func(s *Server)listPayrollPeriods(w http.ResponseWriter,r *http.Request){if s.payroll==nil{writeError(w,http.StatusServiceUnavailable,"payroll service is unavailable");return};owner,ok:=requireOwner(w,r);if !ok{return};employeeID:=strings.TrimSpace(r.URL.Query().Get("employeeId"));if employeeID==""{writeError(w,http.StatusBadRequest,"employeeId is required");return};v,err:=s.payroll.ListPeriods(r.Context(),owner,employeeID);if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,v)}
