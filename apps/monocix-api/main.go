package main

import (
	"context"
	"log"
	"net/http"
	"os"

	"github.com/jackc/pgx/v5/pgxpool"

	"monocix-api/internal/references/db"
	"monocix-api/internal/references/handlers"
	"monocix-api/internal/references/transport"
)

func main() {
	ctx := context.Background()

	pool, err := pgxpool.New(ctx, os.Getenv("DATABASE_URL"))
	if err != nil {
		log.Fatal("invalid DATABASE_URL: ", err)
	}
	defer pool.Close()
	if err := pool.Ping(ctx); err != nil {
		log.Fatal("database unreachable: ", err)
	}

	mux := http.NewServeMux()
	transport.RegisterTenantRoutes(mux, handlers.NewTenantHandler(db.New(pool)))

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	log.Println("Monocix API starting on port", port)
	if err := http.ListenAndServe(":"+port, mux); err != nil {
		log.Fatal(err)
	}
}
