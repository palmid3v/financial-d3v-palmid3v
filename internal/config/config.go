package config

import (
	"errors"
	"os"
	"strconv"
	"strings"
)

type Config struct {
	AppEnv               string
	HTTPAddr             string
	FirebaseEnabled      bool
	FirebaseProjectID    string
	FirebaseCredentials  string
	AuthRequired         bool
	AllowedOrigins       []string
}

func Load() (Config, error) {
	cfg := Config{
		AppEnv:              getenv("APP_ENV", "development"),
		HTTPAddr:            getenv("HTTP_ADDR", ":8080"),
		FirebaseEnabled:     getbool("FIREBASE_ENABLED", false),
		FirebaseProjectID:   os.Getenv("FIREBASE_PROJECT_ID"),
		FirebaseCredentials: os.Getenv("FIREBASE_CREDENTIALS_FILE"),
		AuthRequired:        getbool("AUTH_REQUIRED", getbool("FIREBASE_ENABLED", false)),
		AllowedOrigins:      splitCSV(getenv("CORS_ALLOWED_ORIGINS", "http://localhost:5173,http://127.0.0.1:5173")),
	}
	if cfg.HTTPAddr == "" {
		return Config{}, errors.New("HTTP_ADDR must not be empty")
	}
	if cfg.FirebaseEnabled && cfg.FirebaseProjectID == "" {
		return Config{}, errors.New("FIREBASE_PROJECT_ID is required when FIREBASE_ENABLED=true")
	}
	if cfg.AppEnv == "production" {
		if !cfg.FirebaseEnabled {
			return Config{}, errors.New("FIREBASE_ENABLED must be true in production")
		}
		if !cfg.AuthRequired {
			return Config{}, errors.New("AUTH_REQUIRED must be true in production")
		}
		if len(cfg.AllowedOrigins) == 0 {
			return Config{}, errors.New("CORS_ALLOWED_ORIGINS must contain at least one origin in production")
		}
	}
	return cfg, nil
}

func getenv(key, fallback string) string {
	if value := os.Getenv(key); value != "" {
		return value
	}
	return fallback
}

func getbool(key string, fallback bool) bool {
	value := os.Getenv(key)
	if value == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(value)
	if err != nil {
		return fallback
	}
	return parsed
}

func splitCSV(value string) []string {
	parts := strings.Split(value, ",")
	out := make([]string, 0, len(parts))
	for _, part := range parts {
		if item := strings.TrimSpace(part); item != "" {
			out = append(out, strings.TrimRight(item, "/"))
		}
	}
	return out
}
