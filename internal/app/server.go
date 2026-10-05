package app

import(
	"context"
	"errors"
	"fmt"
	"net/http"
	"time"
	firebase "firebase.google.com/go/v4"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/application"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/config"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/httpapi"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/persistence/firestore"
)

type Server struct{HTTP *http.Server;Close func()error}
func NewServer(ctx context.Context,cfg config.Config)(*Server,error){
	if !cfg.FirebaseEnabled{return newHTTPOnlyServer(cfg),nil}
	fb,err:=NewFirebase(ctx,cfg);if err!=nil{return nil,fmt.Errorf("initialize firebase: %w",err)}
	db,err:=fb.App.Firestore(ctx);if err!=nil{return nil,fmt.Errorf("initialize firestore: %w",err)}
	repos:=firestore.NewRepositories(db)
	accounts:=application.NewAccountService(repos.Accounts(),repos.Transactions())
	transactions:=application.NewTransactionService(repos.Transactions(),repos.Accounts())
	categories:=application.NewCategoryService(repos.Categories())
	budgets:=application.NewBudgetService(repos.Budgets(),repos.Categories(),repos.Transactions())
	savings:=application.NewSavingsService(repos.SavingsGoals(),repos.SavingsContributions(),repos.Accounts())
	debts:=application.NewDebtService(repos.Debts(),repos.DebtPayments())
	assets:=application.NewAssetService(repos.Assets())
	liabilities:=application.NewLiabilityService(repos.Liabilities())
	position:=application.NewFinancialPositionService(accounts,assets,liabilities,debts)
	education:=application.NewEducationService(budgets,savings)
	reports:=application.NewReportService(accounts,transactions,categories,budgets,savings,debts,position)
	authClient,authErr:=fb.App.Auth(ctx);if authErr!=nil{return nil,fmt.Errorf("initialize firebase auth: %w",authErr)}
	authenticator:=NewFirebaseAuthenticator(authClient)
	handler:=httpapi.NewServerWithAuth(accounts,transactions,categories,budgets,savings,education,debts,assets,liabilities,position,reports,authenticator,cfg.AuthRequired,true).Handler()
	h:=&http.Server{Addr:cfg.HTTPAddr,Handler:handler,ReadHeaderTimeout:5*time.Second,ReadTimeout:15*time.Second,WriteTimeout:15*time.Second,IdleTimeout:60*time.Second}
	return &Server{HTTP:h,Close:db.Close},nil
}
func newHTTPOnlyServer(cfg config.Config)*Server{return &Server{HTTP:&http.Server{Addr:cfg.HTTPAddr,Handler:httpapi.NewServer(nil,nil,nil,nil,nil,application.NewEducationService(nil,nil),false).Handler(),ReadHeaderTimeout:5*time.Second,ReadTimeout:15*time.Second,WriteTimeout:15*time.Second,IdleTimeout:60*time.Second},Close:func()error{return nil}}}
func(s *Server)ListenAndServe()error{err:=s.HTTP.ListenAndServe();if errors.Is(err,http.ErrServerClosed){return nil};return err}
var _ *firebase.App
