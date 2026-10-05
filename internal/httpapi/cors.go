package httpapi

import "net/http"

func corsMiddleware(next http.Handler) http.Handler {
	return corsMiddlewareWithOrigins(next, []string{"http://localhost:5173", "http://127.0.0.1:5173"})
}

func corsMiddlewareWithOrigins(next http.Handler, allowedOrigins []string) http.Handler {
	allowed := make(map[string]struct{}, len(allowedOrigins))
	for _, origin := range allowedOrigins {
		allowed[origin] = struct{}{}
	}
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		origin := r.Header.Get("Origin")
		if _, ok := allowed[origin]; ok {
			w.Header().Set("Access-Control-Allow-Origin", origin)
			w.Header().Set("Vary", "Origin")
			w.Header().Set("Access-Control-Allow-Headers", "Authorization, Content-Type, X-Owner-ID, X-Request-ID")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, PUT, PATCH, DELETE, OPTIONS")
		}
		if r.Method == http.MethodOptions {
			if origin != "" {
				if _, ok := allowed[origin]; !ok {
					w.WriteHeader(http.StatusForbidden)
					return
				}
			}
			w.WriteHeader(http.StatusNoContent)
			return
		}
		next.ServeHTTP(w, r)
	})
}
