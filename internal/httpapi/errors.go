package httpapi

import("encoding/json";"errors";"net/http";"github.com/palmid3v/financial-d3v-palmid3v/internal/domain";"github.com/palmid3v/financial-d3v-palmid3v/internal/persistence")
type errorResponse struct{Error string `json:"error"`}
func writeJSON(w http.ResponseWriter,status int,v any){w.Header().Set("Content-Type","application/json");w.WriteHeader(status);_ = json.NewEncoder(w).Encode(v)}
func writeError(w http.ResponseWriter,status int,msg string){writeJSON(w,status,errorResponse{Error:msg})}
func statusForError(err error)int{switch{case errors.Is(err,persistence.ErrNotFound):return http.StatusNotFound;case errors.Is(err,persistence.ErrConflict):return http.StatusConflict;case errors.Is(err,domain.ErrInvalidEntity),errors.Is(err,domain.ErrInvalidTransaction),errors.Is(err,domain.ErrInvalidBudget),errors.Is(err,domain.ErrInvalidSavingsGoal),errors.Is(err,domain.ErrInvalidPeriod),errors.Is(err,domain.ErrCurrencyMismatch):return http.StatusBadRequest;default:return http.StatusInternalServerError}}
