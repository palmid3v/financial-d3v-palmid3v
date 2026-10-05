package domain
import "time"
type AuditEvent struct{ID string;OwnerID string;Action string;Path string;RequestID string;OccurredAt time.Time}
func NewAuditEvent(id,ownerID,action,path,requestID string,occurredAt time.Time)(AuditEvent,error){if id==""||ownerID==""||action==""||path==""||requestID==""{return AuditEvent{},ErrInvalidEntity};if occurredAt.IsZero(){return AuditEvent{},ErrInvalidEntity};return AuditEvent{ID:id,OwnerID:ownerID,Action:action,Path:path,RequestID:requestID,OccurredAt:occurredAt.UTC()},nil}
