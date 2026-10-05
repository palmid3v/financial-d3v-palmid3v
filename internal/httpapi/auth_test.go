package httpapi

import("context";"errors";"net/http";"net/http/httptest";"testing")

type testAuthenticator struct{}
func(testAuthenticator)VerifyIDToken(_ context.Context,token string)(AuthIdentity,error){if token!="valid"{return AuthIdentity{},errors.New("invalid")};return AuthIdentity{UID:"owner-1"},nil}

func TestAuthenticationRequired(t *testing.T){h:=WithAuthentication(http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){if ownerFromContext(r.Context())!="owner-1"{t.Fatal("missing owner")};w.WriteHeader(http.StatusNoContent)}),testAuthenticator{},true);req:=httptest.NewRequest(http.MethodGet,"/",nil);rec:=httptest.NewRecorder();h.ServeHTTP(rec,req);if rec.Code!=http.StatusUnauthorized{t.Fatalf("got %d",rec.Code)}}
func TestAuthenticationAcceptsBearer(t *testing.T){h:=WithAuthentication(http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){w.WriteHeader(http.StatusNoContent)}),testAuthenticator{},true);req:=httptest.NewRequest(http.MethodGet,"/",nil);req.Header.Set("Authorization","Bearer valid");rec:=httptest.NewRecorder();h.ServeHTTP(rec,req);if rec.Code!=http.StatusNoContent{t.Fatalf("got %d",rec.Code)}}
