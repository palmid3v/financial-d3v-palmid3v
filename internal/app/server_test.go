package app

import("context";"testing";"github.com/palmid3v/financial-d3v-palmid3v/internal/config")
func TestNewServerWithoutFirebase(t *testing.T){s,err:=NewServer(context.Background(),config.Config{HTTPAddr:":0",FirebaseEnabled:false});if err!=nil{t.Fatal(err)};if s.HTTP==nil{t.Fatal("expected HTTP server")};if err:=s.Close();err!=nil{t.Fatal(err)}}
