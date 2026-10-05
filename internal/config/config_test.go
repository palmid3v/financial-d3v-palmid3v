package config

import (
	"os"
	"testing"
)

func TestLoadDevelopmentDefaults(t *testing.T) {
	t.Setenv("APP_ENV", "development")
	t.Setenv("FIREBASE_ENABLED", "false")
	t.Setenv("AUTH_REQUIRED", "false")
	t.Setenv("CORS_ALLOWED_ORIGINS", "")
	cfg, err := Load()
	if err != nil { t.Fatal(err) }
	if cfg.FirebaseEnabled || cfg.AuthRequired { t.Fatal("development defaults should allow local mode") }
	if len(cfg.AllowedOrigins) != 2 { t.Fatalf("origins=%v", cfg.AllowedOrigins) }
}

func TestLoadProductionRequiresFirebaseAndAuth(t *testing.T) {
	t.Setenv("APP_ENV", "production")
	t.Setenv("FIREBASE_ENABLED", "false")
	t.Setenv("AUTH_REQUIRED", "false")
	if _, err := Load(); err == nil { t.Fatal("expected production Firebase validation error") }

	t.Setenv("FIREBASE_ENABLED", "true")
	t.Setenv("FIREBASE_PROJECT_ID", "financial-d3v-prod")
	t.Setenv("AUTH_REQUIRED", "false")
	if _, err := Load(); err == nil { t.Fatal("expected production auth validation error") }

	t.Setenv("AUTH_REQUIRED", "true")
	t.Setenv("CORS_ALLOWED_ORIGINS", "https://financial.example.com/")
	cfg, err := Load()
	if err != nil { t.Fatal(err) }
	if len(cfg.AllowedOrigins) != 1 || cfg.AllowedOrigins[0] != "https://financial.example.com" {
		t.Fatalf("origins=%v", cfg.AllowedOrigins)
	}
}

func TestLoadUsesExplicitCredentialPath(t *testing.T) {
	_ = os.Unsetenv("FIREBASE_CREDENTIALS_FILE")
	t.Setenv("FIREBASE_CREDENTIALS_FILE", "/secure/firebase.json")
	t.Setenv("APP_ENV", "development")
	t.Setenv("FIREBASE_ENABLED", "false")
	cfg, err := Load()
	if err != nil { t.Fatal(err) }
	if cfg.FirebaseCredentials != "/secure/firebase.json" { t.Fatalf("credential path=%q", cfg.FirebaseCredentials) }
}
