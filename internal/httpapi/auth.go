package httpapi

import (
 "context"
 "fmt"
 "net/http"
 "strings"
)

type authContextKey string
const ownerContextKey authContextKey="financial-d3v-owner"

type AuthIdentity struct{UID string}
type Authenticator interface{VerifyIDToken(context.Context,string)(AuthIdentity,error)}

func WithAuthentication(next http.Handler,a Authenticator,required bool)http.Handler{
 if !required{return next}
 return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){
  h:=strings.TrimSpace(r.Header.Get("Authorization"))
  if !strings.HasPrefix(h,"Bearer "){writeError(w,http.StatusUnauthorized,"Authorization Bearer token is required");return}
  token:=strings.TrimSpace(strings.TrimPrefix(h,"Bearer "))
  if token==""{writeError(w,http.StatusUnauthorized,"Authorization Bearer token is required");return}
  id,err:=a.VerifyIDToken(r.Context(),token);if err!=nil||strings.TrimSpace(id.UID)==""{writeError(w,http.StatusUnauthorized,"invalid authentication token");return}
  ctx:=context.WithValue(r.Context(),ownerContextKey,id.UID)
  next.ServeHTTP(w,r.WithContext(ctx))
 })
}
func ownerFromContext(ctx context.Context)string{v,_:=ctx.Value(ownerContextKey).(string);return strings.TrimSpace(v)}
func requireOwner(w http.ResponseWriter,r *http.Request)(string,bool){id:=ownerFromContext(r.Context());if id!=""{return id,true};id=strings.TrimSpace(r.Header.Get(ownerHeader));if id==""{writeError(w,http.StatusBadRequest,fmt.Sprintf("%s header is required until Firebase Auth is implemented",ownerHeader));return "",false};return id,true}
