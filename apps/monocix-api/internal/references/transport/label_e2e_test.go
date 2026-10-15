package transport

import (
	"context"
	"encoding/json"
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

// TestLabelE2E runs the label HTTP CRUD against a real Postgres: it creates
// the parent tenant first (FK), proves unknown tenants 404, and proves the
// delete is soft. Needs Docker; `go test -short` skips it.
func TestLabelE2E(t *testing.T) {
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
	queries := db.New(pool)
	RegisterTenantRoutes(mux, handlers.NewTenantHandler(queries))
	RegisterLabelRoutes(mux, handlers.NewLabelHandler(queries))
	srv := httptest.NewServer(mux)
	defer srv.Close()
	client := srv.Client()

	post := func(path, body string) (int, map[string]any) {
		t.Helper()
		resp, err := client.Post(srv.URL+path, "application/json", strings.NewReader(body))
		if err != nil {
			t.Fatal(err)
		}
		defer resp.Body.Close()
		var out map[string]any
		_ = json.NewDecoder(resp.Body).Decode(&out)
		return resp.StatusCode, out
	}

	// Parent tenant first: labels cannot exist without one.
	status, tenant := post("/tenants", `{"name":"Acme"}`)
	if status != http.StatusCreated {
		t.Fatalf("POST /tenants status = %d, want %d", status, http.StatusCreated)
	}
	tenantID, _ := tenant["id"].(string)
	if tenantID == "" {
		t.Fatalf("POST /tenants body = %v, want id", tenant)
	}

	// Unknown tenant -> 404 (FK violation mapped).
	status, _ = post("/labels", `{"name":"Ghost","tenant_id":"550e8400-e29b-41d4-a716-446655440000"}`)
	if status != http.StatusNotFound {
		t.Fatalf("POST unknown tenant status = %d, want %d", status, http.StatusNotFound)
	}

	// Create.
	status, created := post("/labels", `{"name":"VIP","tenant_id":"`+tenantID+`"}`)
	if status != http.StatusCreated {
		t.Fatalf("POST /labels status = %d, want %d", status, http.StatusCreated)
	}
	labelID, _ := created["id"].(string)
	if labelID == "" || created["tenant_id"] != tenantID {
		t.Fatalf("POST /labels body = %v, want ids", created)
	}

	// List scoped by tenant.
	listResp, err := client.Get(srv.URL + "/labels?tenant_id=" + tenantID)
	if err != nil {
		t.Fatal(err)
	}
	var items []map[string]any
	if err := json.NewDecoder(listResp.Body).Decode(&items); err != nil {
		t.Fatal(err)
	}
	listResp.Body.Close()
	if len(items) != 1 {
		t.Fatalf("GET /labels = %d items, want 1", len(items))
	}

	// Delete then prove the row survives as soft-deleted.
	req, _ := http.NewRequest(http.MethodDelete, srv.URL+"/labels/"+labelID+"?tenant_id="+tenantID, nil)
	del, err := client.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	del.Body.Close()
	if del.StatusCode != http.StatusNoContent {
		t.Fatalf("DELETE status = %d, want %d", del.StatusCode, http.StatusNoContent)
	}

	var isDelete bool
	var deleteAt *time.Time
	err = pool.QueryRow(ctx, `select is_delete, delete_at from label where id = $1`, labelID).Scan(&isDelete, &deleteAt)
	if err != nil {
		t.Fatalf("row must survive delete: %v", err)
	}
	if !isDelete || deleteAt == nil {
		t.Fatalf("is_delete = %v delete_at = %v, want true and set", isDelete, deleteAt)
	}
}
