package config

import (
	"os"
	"path/filepath"
	"testing"
)

func writeFile(t *testing.T, body string) string {
	t.Helper()
	path := filepath.Join(t.TempDir(), "config.yaml")
	if err := os.WriteFile(path, []byte(body), 0o600); err != nil {
		t.Fatal(err)
	}
	return path
}

func clearEnv(t *testing.T) {
	t.Helper()
	for _, k := range []string{"MONOCIX_DATABASE_URL", "MONOCIX_PORT"} {
		if err := os.Unsetenv(k); err != nil {
			t.Fatal(err)
		}
	}
}

func TestLoad_FromFile(t *testing.T) {
	clearEnv(t)
	path := writeFile(t, "database_url: postgres://localhost:5432/monocix\nport: \"9090\"\n")

	cfg, err := Load(path)
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.DatabaseURL != "postgres://localhost:5432/monocix" || cfg.Port != "9090" {
		t.Fatalf("Load() = %+v, want file values", cfg)
	}
}

func TestLoad_DefaultPort(t *testing.T) {
	clearEnv(t)
	path := writeFile(t, "database_url: postgres://localhost:5432/monocix\n")

	cfg, err := Load(path)
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.Port != "8080" {
		t.Fatalf("Load() port = %q, want default 8080", cfg.Port)
	}
}

func TestLoad_RequiresDatabaseURL(t *testing.T) {
	clearEnv(t)
	path := writeFile(t, "port: \"9090\"\n")

	if _, err := Load(path); err == nil {
		t.Fatal("Load() without database_url, want error")
	}
}

func TestLoad_EnvOverridesFile(t *testing.T) {
	clearEnv(t)
	path := writeFile(t, "database_url: postgres://localhost:5432/monocix\nport: \"9090\"\n")
	t.Setenv("MONOCIX_PORT", "7070")

	cfg, err := Load(path)
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.Port != "7070" {
		t.Fatalf("Load() port = %q, want env value 7070", cfg.Port)
	}
}

func TestLoad_EnvOnly(t *testing.T) {
	clearEnv(t)
	t.Setenv("MONOCIX_DATABASE_URL", "postgres://localhost:5432/monocix")
	t.Setenv("MONOCIX_PORT", "7070")

	cfg, err := Load(filepath.Join(t.TempDir(), "missing.yaml"))
	if err != nil {
		t.Fatalf("Load() error = %v", err)
	}
	if cfg.DatabaseURL != "postgres://localhost:5432/monocix" || cfg.Port != "7070" {
		t.Fatalf("Load() = %+v, want env values", cfg)
	}
}
