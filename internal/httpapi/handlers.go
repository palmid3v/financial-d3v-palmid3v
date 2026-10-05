package httpapi

import (
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"time"

	"github.com/palmid3v/financial-d3v-palmid3v/internal/application"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
)

const ownerHeader="X-Owner-ID"

type Server struct{accounts *application.AccountService;transactions *application.TransactionService;categories *application.CategoryService;budgets *application.BudgetService;savings *application.SavingsService;education *application.EducationService;firebaseReady bool}
func NewServer(a *application.AccountService,t *application.TransactionService,c *application.CategoryService,b *application.BudgetService,s *application.SavingsService,e *application.EducationService,ready bool)*Server{return &Server{accounts:a,transactions:t,categories:c,budgets:b,savings:s,education:e,firebaseReady:ready}}
func(s *Server)Handler()http.Handler{
	mux:=http.NewServeMux()
	mux.HandleFunc("GET /health",s.health);mux.HandleFunc("GET /ready",s.ready)
	mux.HandleFunc("POST /api/v1/accounts",s.createAccount);mux.HandleFunc("GET /api/v1/accounts",s.listAccounts);mux.HandleFunc("GET /api/v1/accounts/{accountID}",s.getAccount);mux.HandleFunc("GET /api/v1/accounts/{accountID}/balance",s.getBalance)
	mux.HandleFunc("POST /api/v1/transactions",s.createTransaction);mux.HandleFunc("GET /api/v1/transactions",s.listTransactions);mux.HandleFunc("GET /api/v1/transactions/{transactionID}",s.getTransaction)
	mux.HandleFunc("POST /api/v1/categories",s.createCategory);mux.HandleFunc("GET /api/v1/categories",s.listCategories)
	mux.HandleFunc("POST /api/v1/budgets",s.createBudget);mux.HandleFunc("GET /api/v1/budgets",s.listBudgets);mux.HandleFunc("GET /api/v1/budgets/{budgetID}",s.getBudget);mux.HandleFunc("GET /api/v1/budgets/{budgetID}/summary",s.getBudgetSummary)
	mux.HandleFunc("POST /api/v1/savings-goals",s.createSavingsGoal);mux.HandleFunc("GET /api/v1/savings-goals",s.listSavingsGoals);mux.HandleFunc("GET /api/v1/savings-goals/{goalID}",s.getSavingsGoal);mux.HandleFunc("GET /api/v1/savings-goals/{goalID}/summary",s.getSavingsSummary);mux.HandleFunc("POST /api/v1/savings-goals/{goalID}/contributions",s.createSavingsContribution);mux.HandleFunc("GET /api/v1/education",s.listEducation);mux.HandleFunc("GET /api/v1/education/insights",s.educationInsights)
	return requestIDMiddleware(loggingMiddleware(mux))
}
func(s *Server)health(w http.ResponseWriter,_ *http.Request){writeJSON(w,http.StatusOK,map[string]any{"status":"ok","service":"financial-d3v-api"})}
func(s *Server)ready(w http.ResponseWriter,_ *http.Request){code,status:=http.StatusOK,"ready";if !s.firebaseReady{code,status=http.StatusServiceUnavailable,"degraded"};writeJSON(w,code,map[string]any{"status":status,"service":"financial-d3v-api","dependencies":map[string]bool{"firebase":s.firebaseReady}})}
func(s *Server)servicesReady(w http.ResponseWriter)bool{if s.accounts==nil||s.transactions==nil||s.categories==nil||s.budgets==nil||s.savings==nil{writeError(w,http.StatusServiceUnavailable,"financial services are unavailable; enable Firebase first");return false};return true}
func requireOwner(w http.ResponseWriter,r *http.Request)(string,bool){id:=strings.TrimSpace(r.Header.Get(ownerHeader));if id==""{writeError(w,http.StatusBadRequest,fmt.Sprintf("%s header is required until Firebase Auth is implemented",ownerHeader));return "",false};return id,true}
func decodeJSON(w http.ResponseWriter,r *http.Request,v any)bool{defer r.Body.Close();d:=json.NewDecoder(r.Body);d.DisallowUnknownFields();if err:=d.Decode(v);err!=nil{writeError(w,http.StatusBadRequest,"invalid JSON payload");return false};return true}

type accountRequest struct{Name string `json:"name"`;Type string `json:"type"`;Currency string `json:"currency"`;OpeningMinor int64 `json:"openingMinorUnits"`}
type accountResponse struct{ID string `json:"id"`;Name string `json:"name"`;Type string `json:"type"`;Currency string `json:"currency"`;OpeningMinor int64 `json:"openingMinorUnits"`;CreatedAt string `json:"createdAt"`}
func(s *Server)createAccount(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};var req accountRequest;if !decodeJSON(w,r,&req){return};v,err:=domain.NewAccount(newID(),owner,strings.TrimSpace(req.Name),domain.AccountType(req.Type),domain.Money{MinorUnits:req.OpeningMinor,Currency:strings.ToUpper(strings.TrimSpace(req.Currency))},time.Now().UTC());if err!=nil{writeError(w,statusForError(err),err.Error());return};if err=s.accounts.Create(r.Context(),v);err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusCreated,map[string]any{"id":v.ID,"name":v.Name,"type":string(v.Type),"currency":v.Currency,"openingMinorUnits":v.OpeningBalance.MinorUnits,"createdAt":v.CreatedAt.Format(time.RFC3339)})}
func(s *Server)listAccounts(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};v,err:=s.accounts.List(r.Context(),owner);if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,v)}
func(s *Server)getAccount(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};v,err:=s.accounts.Get(r.Context(),owner,r.PathValue("accountID"));if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,v)}
func(s *Server)getBalance(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};v,err:=s.accounts.Balance(r.Context(),owner,r.PathValue("accountID"));if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,map[string]any{"currency":v.Currency,"minorUnits":v.MinorUnits})}

type transactionRequest struct{AccountID string `json:"accountId"`;Type string `json:"type"`;MinorUnits int64 `json:"minorUnits"`;Currency string `json:"currency"`;CategoryID string `json:"categoryId"`;TransferID string `json:"transferId"`;Description string `json:"description"`;OccurredAt string `json:"occurredAt"`}
func(s *Server)createTransaction(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};var req transactionRequest;if !decodeJSON(w,r,&req){return};at,err:=time.Parse(time.RFC3339,req.OccurredAt);if err!=nil{writeError(w,http.StatusBadRequest,"occurredAt must be RFC3339");return};v,err:=domain.NewTransaction(newID(),owner,strings.TrimSpace(req.AccountID),domain.TransactionType(req.Type),domain.Money{MinorUnits:req.MinorUnits,Currency:strings.ToUpper(strings.TrimSpace(req.Currency))},at);if err!=nil{writeError(w,statusForError(err),err.Error());return};v.CategoryID=strings.TrimSpace(req.CategoryID);v.TransferID=strings.TrimSpace(req.TransferID);v.Description=strings.TrimSpace(req.Description);if err=s.transactions.Create(r.Context(),v);err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusCreated,v)}
func(s *Server)listTransactions(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};if id:=strings.TrimSpace(r.URL.Query().Get("accountId"));id!=""{v,err:=s.transactions.ListByAccount(r.Context(),owner,id);if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,v);return};start,end:=r.URL.Query().Get("start"),r.URL.Query().Get("end");if start==""||end==""{writeError(w,http.StatusBadRequest,"provide accountId or both start and end");return};a,e1:=time.Parse(time.RFC3339,start);b,e2:=time.Parse(time.RFC3339,end);if e1!=nil||e2!=nil{writeError(w,http.StatusBadRequest,"start and end must be RFC3339");return};p,err:=domain.NewFinancialPeriod(a,b);if err!=nil{writeError(w,statusForError(err),err.Error());return};v,err:=s.transactions.ListByPeriod(r.Context(),owner,p);if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,v)}
func(s *Server)getTransaction(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};v,err:=s.transactions.Get(r.Context(),owner,r.PathValue("transactionID"));if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,v)}

type categoryRequest struct{Name string `json:"name"`;Kind string `json:"kind"`}
func(s *Server)createCategory(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};var req categoryRequest;if !decodeJSON(w,r,&req){return};v,err:=domain.NewCategory(newID(),owner,strings.TrimSpace(req.Name),domain.CategoryKind(req.Kind),time.Now().UTC());if err!=nil{writeError(w,statusForError(err),err.Error());return};if err=s.categories.Create(r.Context(),v);err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusCreated,v)}
func(s *Server)listCategories(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};v,err:=s.categories.List(r.Context(),owner);if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,v)}

type budgetItemRequest struct{CategoryID string `json:"categoryId"`;LimitMinor int64 `json:"limitMinorUnits"`}
type budgetRequest struct{Name string `json:"name"`;Currency string `json:"currency"`;StartDate string `json:"startDate"`;EndDate string `json:"endDate"`;Items []budgetItemRequest `json:"items"`}
func(s *Server)createBudget(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};var req budgetRequest;if !decodeJSON(w,r,&req){return};start,e1:=time.Parse(time.RFC3339,req.StartDate);end,e2:=time.Parse(time.RFC3339,req.EndDate);if e1!=nil||e2!=nil{writeError(w,http.StatusBadRequest,"startDate and endDate must be RFC3339");return};period,err:=domain.NewFinancialPeriod(start,end);if err!=nil{writeError(w,statusForError(err),err.Error());return};v,err:=domain.NewBudget(newID(),owner,strings.TrimSpace(req.Name),strings.ToUpper(strings.TrimSpace(req.Currency)),period,time.Now().UTC());if err!=nil{writeError(w,statusForError(err),err.Error());return};for _,item:=range req.Items{if err=v.AddItem(strings.TrimSpace(item.CategoryID),domain.Money{MinorUnits:item.LimitMinor,Currency:v.Currency});err!=nil{writeError(w,statusForError(err),err.Error());return}};if err=s.budgets.Create(r.Context(),v);err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusCreated,v)}
func(s *Server)listBudgets(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};start,end:=r.URL.Query().Get("start"),r.URL.Query().Get("end");if start==""||end==""{writeError(w,http.StatusBadRequest,"start and end are required");return};a,e1:=time.Parse(time.RFC3339,start);b,e2:=time.Parse(time.RFC3339,end);if e1!=nil||e2!=nil{writeError(w,http.StatusBadRequest,"start and end must be RFC3339");return};p,err:=domain.NewFinancialPeriod(a,b);if err!=nil{writeError(w,statusForError(err),err.Error());return};v,err:=s.budgets.ListByPeriod(r.Context(),owner,p);if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,v)}
func(s *Server)getBudget(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};v,err:=s.budgets.Get(r.Context(),owner,r.PathValue("budgetID"));if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,v)}
func(s *Server)getBudgetSummary(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};v,err:=s.budgets.Summary(r.Context(),owner,r.PathValue("budgetID"));if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,v)}

type savingsGoalRequest struct{Name string `json:"name"`;TargetMinor int64 `json:"targetMinorUnits"`;Currency string `json:"currency"`;TargetDate string `json:"targetDate,omitempty"`}
type savingsContributionRequest struct{AmountMinor int64 `json:"amountMinorUnits"`;Currency string `json:"currency"`;SourceAccountID string `json:"sourceAccountId"`;TransactionID string `json:"transactionId"`;ContributedAt string `json:"contributedAt"`;Note string `json:"note"`}
func(s *Server)createSavingsGoal(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};var req savingsGoalRequest;if !decodeJSON(w,r,&req){return};var targetDate *time.Time;if req.TargetDate!=""{v,err:=time.Parse(time.RFC3339,req.TargetDate);if err!=nil{writeError(w,http.StatusBadRequest,"targetDate must be RFC3339");return};targetDate=&v};v,err:=domain.NewSavingsGoal(newID(),owner,strings.TrimSpace(req.Name),domain.Money{MinorUnits:req.TargetMinor,Currency:strings.ToUpper(strings.TrimSpace(req.Currency))},targetDate,time.Now().UTC());if err!=nil{writeError(w,statusForError(err),err.Error());return};if err=s.savings.CreateGoal(r.Context(),v);err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusCreated,v)}
func(s *Server)listSavingsGoals(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};v,err:=s.savings.ListGoals(r.Context(),owner);if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,v)}
func(s *Server)getSavingsGoal(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};v,err:=s.savings.GetGoal(r.Context(),owner,r.PathValue("goalID"));if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,v)}
func(s *Server)getSavingsSummary(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};v,err:=s.savings.Summary(r.Context(),owner,r.PathValue("goalID"),time.Now().UTC());if err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusOK,v)}
func(s *Server)createSavingsContribution(w http.ResponseWriter,r *http.Request){if !s.servicesReady(w){return};owner,ok:=requireOwner(w,r);if !ok{return};var req savingsContributionRequest;if !decodeJSON(w,r,&req){return};at,err:=time.Parse(time.RFC3339,req.ContributedAt);if err!=nil{writeError(w,http.StatusBadRequest,"contributedAt must be RFC3339");return};v,err:=domain.NewSavingsContribution(newID(),owner,r.PathValue("goalID"),domain.Money{MinorUnits:req.AmountMinor,Currency:strings.ToUpper(strings.TrimSpace(req.Currency))},strings.TrimSpace(req.SourceAccountID),strings.TrimSpace(req.TransactionID),at,time.Now().UTC());if err!=nil{writeError(w,statusForError(err),err.Error());return};v.Note=strings.TrimSpace(req.Note);if err=s.savings.AddContribution(r.Context(),v);err!=nil{writeError(w,statusForError(err),err.Error());return};writeJSON(w,http.StatusCreated,v)}


func (s *Server) listEducation(w http.ResponseWriter, r *http.Request) {
	if s.education == nil { writeError(w, http.StatusServiceUnavailable, "education service is unavailable"); return }
	writeJSON(w, http.StatusOK, s.education.Cards(r.URL.Query().Get("topic")))
}

func (s *Server) educationInsights(w http.ResponseWriter, r *http.Request) {
	if s.education == nil { writeError(w, http.StatusServiceUnavailable, "education service is unavailable"); return }
	owner, ok := requireOwner(w, r); if !ok { return }
	budgetID := strings.TrimSpace(r.URL.Query().Get("budgetId"))
	goalID := strings.TrimSpace(r.URL.Query().Get("goalId"))
	if budgetID == "" && goalID == "" { writeError(w, http.StatusBadRequest, "budgetId or goalId is required"); return }
	v, err := s.education.Insights(r.Context(), owner, budgetID, goalID, time.Now().UTC())
	if err != nil { writeError(w, statusForError(err), err.Error()); return }
	writeJSON(w, http.StatusOK, v)
}
