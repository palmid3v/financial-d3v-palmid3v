package httpapi

import (
 "context"
 "net/http"
 "time"
 "github.com/palmid3v/financial-d3v-palmid3v/internal/application"
 "github.com/palmid3v/financial-d3v-palmid3v/internal/domain"
)

func AuditMiddleware(next http.Handler, service *application.AuditService) http.Handler {
 return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){
  owner:=ownerFromContext(r.Context())
  next.ServeHTTP(w,r)
  if service==nil || owner=="" { return }
  if r.Method!="POST" && r.Method!="PUT" && r.Method!="PATCH" && r.Method!="DELETE" { return }
  event,err:=domain.NewAuditEvent(newID(),owner,r.Method,r.URL.Path,w.Header().Get("X-Request-ID"),time.Now().UTC())
  if err==nil { _=service.Record(context.Background(),event) }
 })
}
