package httpapi

import("net/http";"net/http/httptest";"strings";"testing")
func TestHealth(t *testing.T){s:=NewServer(nil,nil,false);req:=httptest.NewRequest(http.MethodGet,"/health",nil);rec:=httptest.NewRecorder();s.Handler().ServeHTTP(rec,req);if rec.Code!=http.StatusOK{t.Fatalf("got %d",rec.Code)};if !strings.Contains(rec.Body.String(),"financial-d3v-api"){t.Fatal("missing service name")}}
func TestOwnerRequired(t *testing.T){s:=NewServer(nil,nil,false);req:=httptest.NewRequest(http.MethodGet,"/api/v1/accounts",nil);rec:=httptest.NewRecorder();s.Handler().ServeHTTP(rec,req);if rec.Code!=http.StatusServiceUnavailable{t.Fatalf("got %d",rec.Code)}}
