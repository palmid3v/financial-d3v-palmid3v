package httpapi

import (
 "net/http"
)

func(s *Server)listAudit(w http.ResponseWriter,r *http.Request){
 if s.audit==nil{writeError(w,http.StatusServiceUnavailable,"audit service is unavailable");return}
 owner,ok:=requireOwner(w,r);if !ok{return}
 v,err:=s.audit.List(r.Context(),owner);if err!=nil{writeError(w,statusForError(err),err.Error());return}
 writeJSON(w,http.StatusOK,v)
}
