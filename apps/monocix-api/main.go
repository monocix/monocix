package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"

	"monocix-api/internal/config"
	"monocix-api/internal/references/db"
	"monocix-api/internal/references/handlers"
	"monocix-api/internal/references/transport"
)

func main() {
	ctx := context.Background()

	configPath := os.Getenv("CONFIG_FILE")
	if configPath == "" {
		configPath = "config.yaml"
	}
	cfg, err := config.Load(configPath)
	if err != nil {
		log.Fatal("invalid config: ", err)
	}

	pool, err := pgxpool.New(ctx, cfg.DatabaseURL)
	if err != nil {
		log.Fatal("invalid DATABASE_URL: ", err)
	}
	defer pool.Close()
	if err := pool.Ping(ctx); err != nil {
		log.Fatal("database unreachable: ", err)
	}

	mux := http.NewServeMux()
	transport.RegisterTenantRoutes(mux, handlers.NewTenantHandler(db.New(pool)))
	transport.RegisterLabelRoutes(mux, handlers.NewLabelHandler(db.New(pool)))
	transport.RegisterAccountRoutes(mux, handlers.NewAccountHandler(db.New(pool)))

	log.Println("Monocix API starting on port", cfg.Port)
	if err := http.ListenAndServe(":"+cfg.Port, mux); err != nil {
		log.Fatal(err)
	}
}
