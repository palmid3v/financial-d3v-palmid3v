package httpapi

import("net/http";"net/http/httptest";"strings";"testing"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/application")
func TestHealth(t *testing.T){s:=NewServer(nil,nil,nil,nil,nil,application.NewEducationService(nil,nil),false);req:=httptest.NewRequest(http.MethodGet,"/health",nil);rec:=httptest.NewRecorder();s.Handler().ServeHTTP(rec,req);if rec.Code!=http.StatusOK{t.Fatalf("got %d",rec.Code)};if !strings.Contains(rec.Body.String(),"financial-d3v-api"){t.Fatal("missing service name")}}
func TestOwnerRequired(t *testing.T){s:=NewServer(nil,nil,nil,nil,nil,nil,false);req:=httptest.NewRequest(http.MethodGet,"/api/v1/accounts",nil);rec:=httptest.NewRecorder();s.Handler().ServeHTTP(rec,req);if rec.Code!=http.StatusServiceUnavailable{t.Fatalf("got %d",rec.Code)}}

func TestEducationCatalog(t *testing.T){s:=NewServer(nil,nil,nil,nil,nil,application.NewEducationService(nil,nil),false);req:=httptest.NewRequest(http.MethodGet,"/api/v1/education?topic=budget",nil);rec:=httptest.NewRecorder();s.Handler().ServeHTTP(rec,req);if rec.Code!=http.StatusOK{t.Fatalf("got %d",rec.Code)};if !strings.Contains(rec.Body.String(),"Budget utilization"){t.Fatal("missing budget education card")}}
func TestEducationInsightsRequireContext(t *testing.T){s:=NewServer(nil,nil,nil,nil,nil,application.NewEducationService(nil,nil),false);req:=httptest.NewRequest(http.MethodGet,"/api/v1/education/insights",nil);req.Header.Set(ownerHeader,"owner-1");rec:=httptest.NewRecorder();s.Handler().ServeHTTP(rec,req);if rec.Code!=http.StatusBadRequest{t.Fatalf("got %d",rec.Code)}}
