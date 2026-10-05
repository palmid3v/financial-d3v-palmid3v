package application
import("context";"github.com/palmid3v/financial-d3v-palmid3v/internal/domain";"github.com/palmid3v/financial-d3v-palmid3v/internal/persistence")
type AuditService struct{repo persistence.AuditRepository}
func NewAuditService(r persistence.AuditRepository)*AuditService{return &AuditService{repo:r}}
func(s *AuditService)Record(ctx context.Context,e domain.AuditEvent)error{return s.repo.Create(ctx,e)}
func(s *AuditService)List(ctx context.Context,ownerID string)([]domain.AuditEvent,error){return s.repo.List(ctx,ownerID)}
