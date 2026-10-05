package app

import("context";"net/http";"net/http/httptest";"testing";"github.com/palmid3v/financial-d3v-palmid3v/internal/config")
func TestNewServerWithoutFirebase(t *testing.T){s,err:=NewServer(context.Background(),config.Config{HTTPAddr:":0",FirebaseEnabled:false});if err!=nil{t.Fatal(err)};if s.HTTP==nil{t.Fatal("expected HTTP server")};if err:=s.Close();err!=nil{t.Fatal(err)}}

func TestLocalServerDashboard(t *testing.T){s,err:=NewServer(context.Background(),config.Config{AppEnv:"test",HTTPAddr:":0",FirebaseEnabled:false,AuthRequired:false});if err!=nil{t.Fatal(err)};defer s.Close();req:=httptest.NewRequest(http.MethodGet,"/api/v1/dashboard?start=2026-10-01T00:00:00Z&end=2026-11-01T00:00:00Z&currency=COP",nil);req.Header.Set("X-Owner-ID","local-owner");rec:=httptest.NewRecorder();s.HTTP.Handler.ServeHTTP(rec,req);if rec.Code!=http.StatusOK{t.Fatalf("got status %d: %s",rec.Code,rec.Body.String())}}

func TestLocalServerIsReadyWithoutFirebase(t *testing.T){s,err:=NewServer(context.Background(),config.Config{AppEnv:"development",HTTPAddr:":0",FirebaseEnabled:false,AuthRequired:false,AllowedOrigins:[]string{"http://localhost:5173"}});if err!=nil{t.Fatal(err)};defer s.Close();req:=httptest.NewRequest(http.MethodGet,"/ready",nil);rec:=httptest.NewRecorder();s.HTTP.Handler.ServeHTTP(rec,req);if rec.Code!=http.StatusOK{t.Fatalf("got %d: %s",rec.Code,rec.Body.String())}}
