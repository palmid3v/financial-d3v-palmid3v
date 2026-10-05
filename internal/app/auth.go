package app

import (
 "context"
 firebaseauth "firebase.google.com/go/v4/auth"
 "github.com/palmid3v/financial-d3v-palmid3v/internal/httpapi"
)

type FirebaseAuthenticator struct{client *firebaseauth.Client}
func NewFirebaseAuthenticator(client *firebaseauth.Client)*FirebaseAuthenticator{return &FirebaseAuthenticator{client:client}}
func(a *FirebaseAuthenticator)VerifyIDToken(ctx context.Context,token string)(httpapi.AuthIdentity,error){v,err:=a.client.VerifyIDToken(ctx,token);if err!=nil{return httpapi.AuthIdentity{},err};return httpapi.AuthIdentity{UID:v.UID},nil}
