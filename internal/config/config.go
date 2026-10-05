package config

import (
	"errors"
	"os"
	"strconv"
)

type Config struct {
	AppEnv string
	HTTPAddr string
	FirebaseEnabled bool
	FirebaseProjectID string
	FirebaseCredentials string
}

func Load() (Config, error) {
	cfg := Config{AppEnv: getenv("APP_ENV", "development"), HTTPAddr: getenv("HTTP_ADDR", ":8080"), FirebaseEnabled: getbool("FIREBASE_ENABLED", false), FirebaseProjectID: os.Getenv("FIREBASE_PROJECT_ID"), FirebaseCredentials: os.Getenv("FIREBASE_CREDENTIALS_FILE")}
	if cfg.HTTPAddr == "" { return Config{}, errors.New("HTTP_ADDR must not be empty") }
	if cfg.FirebaseEnabled && cfg.FirebaseProjectID == "" { return Config{}, errors.New("FIREBASE_PROJECT_ID is required when FIREBASE_ENABLED=true") }
	return cfg, nil
}
func getenv(key, fallback string) string { if value := os.Getenv(key); value != "" { return value }; return fallback }
func getbool(key string, fallback bool) bool { value := os.Getenv(key); if value == "" { return fallback }; parsed, err := strconv.ParseBool(value); if err != nil { return fallback }; return parsed }
