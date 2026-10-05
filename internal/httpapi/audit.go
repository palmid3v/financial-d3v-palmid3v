package httpapi
import("context";"net/http";"time";"github.com/palmid3v/financial-d3v-palmid3v/internal/application")
type AuditRecorder interface{Record(context.Context,domainAuditEvent)error}
type domainAuditEvent struct{ID string;OwnerID string;Action string;Path string;RequestID string;OccurredAt time.Time}
type auditRecorderAdapter struct{service *application.AuditService}
func(a auditRecorderAdapter)Record(ctx context.Context,e domainAuditEvent)error{return a.service.Record(ctx,domainAuditEventToDomain(e))}
func domainAuditEventToDomain(e domainAuditEvent)domain.AuditEvent{v,_:=domain.NewAuditEvent(e.ID,e.OwnerID,e.Action,e.Path,e.RequestID,e.OccurredAt);return v}
func AuditMiddleware(next http.Handler,service *application.AuditService)http.Handler{return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){owner:=ownerFromContext(r.Context());if owner==""{next.ServeHTTP(w,r);return};next.ServeHTTP(w,r);if r.Method=="POST"||r.Method=="PUT"||r.Method=="PATCH"||r.Method=="DELETE"{_ = service.Record(context.Background(),domainAuditEventToDomain(domainAuditEvent{ID:newID(),OwnerID:owner,Action:r.Method,Path:r.URL.Path,RequestID:w.Header().Get("X-Request-ID"),OccurredAt:time.Now().UTC()}))}})}
