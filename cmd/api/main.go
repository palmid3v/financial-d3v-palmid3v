package main

import(
	"context"
	"log"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/app"
	"github.com/palmid3v/financial-d3v-palmid3v/internal/config"
)

func main(){cfg,err:=config.Load();if err!=nil{log.Fatal(err)};server,err:=app.NewServer(context.Background(),cfg);if err!=nil{log.Fatal(err)};defer func(){if err:=server.Close();err!=nil{log.Printf("close error: %v",err)}}();log.Printf("financial-d3v-api listening on %s env=%s firebase=%t",cfg.HTTPAddr,cfg.AppEnv,cfg.FirebaseEnabled);if err:=server.ListenAndServe();err!=nil{log.Fatal(err)}}
