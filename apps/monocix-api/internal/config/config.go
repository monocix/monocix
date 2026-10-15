// Package config loads the API configuration with koanf.
// Precedence (lowest to highest): config file, environment.
// The file holds local defaults; real secrets travel via MONOCIX_* env vars.
package config

import (
	"errors"
	"fmt"
	"os"
	"strings"

	"github.com/go-playground/validator/v10"
	"github.com/knadh/koanf/parsers/yaml"
	"github.com/knadh/koanf/providers/env"
	"github.com/knadh/koanf/providers/file"
	"github.com/knadh/koanf/v2"
)

// DefaultPort is used when no port is configured.
const DefaultPort = "8080"

// Config is the API configuration.
type Config struct {
	DatabaseURL string `koanf:"database_url" validate:"required"`
	Port        string `koanf:"port"`
}

// Load reads path (YAML, optional) and then the MONOCIX_* environment,
// unmarshals into Config, applies defaults and validates it.
func Load(path string) (Config, error) {
	k := koanf.New(".")

	if path != "" {
		if _, err := os.Stat(path); err == nil {
			if err := k.Load(file.Provider(path), yaml.Parser()); err != nil {
				return Config{}, fmt.Errorf("load config file: %w", err)
			}
		} else if !errors.Is(err, os.ErrNotExist) {
			return Config{}, fmt.Errorf("stat config file: %w", err)
		}
	}

	if err := k.Load(env.Provider("MONOCIX_", ".", func(s string) string {
		return strings.ToLower(strings.TrimPrefix(s, "MONOCIX_"))
	}), nil); err != nil {
		return Config{}, fmt.Errorf("load env: %w", err)
	}

	var cfg Config
	if err := k.Unmarshal("", &cfg); err != nil {
		return Config{}, fmt.Errorf("unmarshal config: %w", err)
	}
	if cfg.Port == "" {
		cfg.Port = DefaultPort
	}
	if err := validator.New().Struct(cfg); err != nil {
		return Config{}, fmt.Errorf("invalid config: %w", err)
	}
	return cfg, nil
}
