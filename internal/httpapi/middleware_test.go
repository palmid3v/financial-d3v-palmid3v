package httpapi

import (
 "net/http"
 "net/http/httptest"
 "testing"
)

func TestSecurityHeadersMiddleware(t *testing.T) {
 h:=securityHeadersMiddleware(http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){w.WriteHeader(http.StatusNoContent)}))
 req:=httptest.NewRequest(http.MethodGet,"/",nil)
 rec:=httptest.NewRecorder()
 h.ServeHTTP(rec,req)
 for key,expected:=range map[string]string{
  "X-Content-Type-Options":"nosniff",
  "X-Frame-Options":"DENY",
  "Referrer-Policy":"no-referrer",
  "Permissions-Policy":"camera=(), microphone=(), geolocation=()",
  "Cache-Control":"no-store",
 } {
  if got:=rec.Header().Get(key);got!=expected{t.Fatalf("%s=%q, want %q",key,got,expected)}
 }
}
