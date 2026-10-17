package transport

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"net/http/httptest"
	"os"
	"strings"
	"testing"
	"time"

	"github.com/jackc/pgx/v5/pgxpool"
	"github.com/testcontainers/testcontainers-go/modules/postgres"

	"monocix-api/internal/references/db"
	"monocix-api/internal/references/handlers"
)

// TestTenantE2E runs the full HTTP CRUD against a real Postgres and proves
// the delete is soft (row stays with is_delete + delete_at set).
// It needs Docker; `go test -short` skips it.
func TestTenantE2E(t *testing.T) {
	if testing.Short() {
		t.Skip("e2e needs Docker; skipped in short mode")
	}
	ctx := context.Background()

	pg, err := postgres.Run(ctx, "postgres:17-alpine",
		postgres.WithDatabase("monocix"),
		postgres.WithUsername("postgres"),
		postgres.WithPassword("postgres"),
		postgres.BasicWaitStrategies(),
	)
	if err != nil {
		t.Fatalf("start postgres: %v", err)
	}
	t.Cleanup(func() {
		if err := pg.Terminate(context.Background()); err != nil {
			t.Logf("terminate postgres: %v", err)
		}
	})

	connStr, err := pg.ConnectionString(ctx, "sslmode=disable")
	if err != nil {
		t.Fatalf("connection string: %v", err)
	}
	pool, err := pgxpool.New(ctx, connStr)
	if err != nil {
		t.Fatalf("pool: %v", err)
	}
	defer pool.Close()

	schema, err := os.ReadFile("../../../db/schema/schema.sql")
	if err != nil {
		t.Fatalf("read schema: %v", err)
	}
	if _, err := pool.Exec(ctx, string(schema)); err != nil {
		t.Fatalf("apply schema: %v", err)
	}

	mux := http.NewServeMux()
	RegisterTenantRoutes(mux, handlers.NewTenantHandler(db.New(pool)))
	srv := httptest.NewServer(mux)
	defer srv.Close()
	client := srv.Client()

	do := func(method, path, body string) (int, tenantResponse) {
		t.Helper()
		var reader *strings.Reader
		if body == "" {
			reader = strings.NewReader("")
		} else {
			reader = strings.NewReader(body)
		}
		req, err := http.NewRequest(method, srv.URL+path, reader)
		if err != nil {
			t.Fatal(err)
		}
		if body != "" {
			req.Header.Set("Content-Type", "application/json")
		}
		resp, err := client.Do(req)
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close()
		var out tenantResponse
		_ = json.NewDecoder(resp.Body).Decode(&out)
		return resp.StatusCode, out
	}

	// Create (is_active omitted -> defaults true).
	status, created := do(http.MethodPost, "/tenants", `{"id":"550e8400-e29b-41d4-a716-446655440000","name":"Acme","slug":"acme"}`)
	if status != http.StatusCreated {
		t.Fatalf("POST status = %d, want %d", status, http.StatusCreated)
	}
	if created.ID == "" || created.Name != "Acme" || !created.IsActive {
		t.Fatalf("POST body = %+v, want Acme/active with id", created)
	}

	// List contains it.
	listResp, err := client.Get(srv.URL + "/tenants")
	if err != nil {
		t.Fatal(err)
	}
	var items []tenantResponse
	if err := json.NewDecoder(listResp.Body).Decode(&items); err != nil {
		t.Fatal(err)
	}
	listResp.Body.Close()
	if len(items) != 1 || items[0].ID != created.ID {
		t.Fatalf("GET /tenants = %+v, want one item %s", items, created.ID)
	}

	// Update.
	status, updated := do(http.MethodPut, "/tenants/"+created.ID, `{"name":"Acme Inc","slug":"acme-inc","is_active":false}`)
	if status != http.StatusOK || updated.Name != "Acme Inc" || updated.IsActive {
		t.Fatalf("PUT status = %d body = %+v, want Acme Inc/inactive", status, updated)
	}

	// Delete.
	status, _ = do(http.MethodDelete, "/tenants/"+created.ID, "")
	if status != http.StatusNoContent {
		t.Fatalf("DELETE status = %d, want %d", status, http.StatusNoContent)
	}

	// Gone from the API...
	status, _ = do(http.MethodGet, "/tenants/"+created.ID, "")
	if status != http.StatusNotFound {
		t.Fatalf("GET after DELETE status = %d, want %d", status, http.StatusNotFound)
	}

	// ...but still in the table as soft-deleted.
	var isDelete bool
	var updatedAt time.Time
	err = pool.QueryRow(ctx, `select is_delete, update_at from tenants where id = $1`, created.ID).Scan(&isDelete, &updatedAt)
	if err != nil {
		t.Fatalf("row must survive delete: %v", err)
	}
	if !isDelete || updatedAt.IsZero() {
		t.Fatalf("is_delete = %v update_at = %v, want true and set timestamp", isDelete, updatedAt)
	}
	fmt.Println("e2e ok:", created.ID)
}
