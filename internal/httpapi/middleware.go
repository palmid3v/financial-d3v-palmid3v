package httpapi

import("log";"net/http";"time")
func loggingMiddleware(next http.Handler)http.Handler{return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){start:=time.Now();next.ServeHTTP(w,r);log.Printf("http method=%s path=%s duration=%s",r.Method,r.URL.Path,time.Since(start).Round(time.Millisecond))})}
func requestIDMiddleware(next http.Handler)http.Handler{return http.HandlerFunc(func(w http.ResponseWriter,r *http.Request){id:=r.Header.Get("X-Request-ID");if id==""{id=newID()};w.Header().Set("X-Request-ID",id);next.ServeHTTP(w,r)})}
