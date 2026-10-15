package transport

import (
	"context"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"monocix-api/internal/references/db"
	"monocix-api/internal/references/handlers"
)

// stubStore is an in-memory handlers.TenantStore for route tests.
type stubStore struct {
	mu   sync.Mutex
	rows map[pgtype.UUID]db.FindOneTenantRow
}

func newStubStore() *stubStore {
	return &stubStore{rows: map[pgtype.UUID]db.FindOneTenantRow{}}
}

func (s *stubStore) FindAllTenants(_ context.Context) ([]db.FindAllTenantsRow, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	items := make([]db.FindAllTenantsRow, 0, len(s.rows))
	for _, r := range s.rows {
		items = append(items, db.FindAllTenantsRow{ID: r.ID, Name: r.Name, IsActive: r.IsActive})
	}
	return items, nil
}

func (s *stubStore) FindOneTenant(_ context.Context, id pgtype.UUID) (db.FindOneTenantRow, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	r, ok := s.rows[id]
	if !ok {
		return db.FindOneTenantRow{}, pgx.ErrNoRows
	}
	return r, nil
}

func (s *stubStore) SaveTenant(_ context.Context, arg db.SaveTenantParams) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	s.rows[arg.ID] = db.FindOneTenantRow{ID: arg.ID, Name: arg.Name, IsActive: arg.IsActive}
	return nil
}

func (s *stubStore) UpdateTenant(_ context.Context, arg db.UpdateTenantParams) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	r, ok := s.rows[arg.ID]
	if !ok {
		return pgx.ErrNoRows
	}
	r.Name, r.IsActive = arg.Name, arg.IsActive
	s.rows[arg.ID] = r
	return nil
}

func (s *stubStore) DeleteTenant(_ context.Context, id pgtype.UUID) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if _, ok := s.rows[id]; !ok {
		return pgx.ErrNoRows
	}
	delete(s.rows, id)
	return nil
}

func newTestServer() *httptest.Server {
	mux := http.NewServeMux()
	RegisterTenantRoutes(mux, handlers.NewTenantHandler(newStubStore()))
	return httptest.NewServer(mux)
}

func TestRoutes_CreateAndGet(t *testing.T) {
	srv := newTestServer()
	defer srv.Close()

	resp, err := http.Post(srv.URL+"/tenants", "application/json", strings.NewReader(`{"name":"Acme"}`))
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("POST status = %d, want %d", resp.StatusCode, http.StatusCreated)
	}
	var created tenantResponse
	if err := json.NewDecoder(resp.Body).Decode(&created); err != nil {
		t.Fatal(err)
	}
	if created.Name != "Acme" || created.ID == "" || !created.IsActive {
		t.Fatalf("POST body = %+v, want Acme/active with id", created)
	}

	get, err := http.Get(srv.URL + "/tenants/" + created.ID)
	if err != nil {
		t.Fatal(err)
	}
	defer get.Body.Close()
	if get.StatusCode != http.StatusOK {
		t.Fatalf("GET status = %d, want %d", get.StatusCode, http.StatusOK)
	}
}

func TestRoutes_CreateInvalid(t *testing.T) {
	srv := newTestServer()
	defer srv.Close()

	for _, body := range []string{`{"name":""}`, `not-json`} {
		resp, err := http.Post(srv.URL+"/tenants", "application/json", strings.NewReader(body))
		if err != nil {
			t.Fatal(err)
		}
		resp.Body.Close()
		if resp.StatusCode != http.StatusBadRequest {
			t.Fatalf("POST %q status = %d, want %d", body, resp.StatusCode, http.StatusBadRequest)
		}
	}
}

func TestRoutes_GetNotFound(t *testing.T) {
	srv := newTestServer()
	defer srv.Close()

	resp, err := http.Get(srv.URL + "/tenants/550e8400-e29b-41d4-a716-446655440000")
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNotFound {
		t.Fatalf("GET status = %d, want %d", resp.StatusCode, http.StatusNotFound)
	}
}

func TestRoutes_UpdateAndDelete(t *testing.T) {
	srv := newTestServer()
	defer srv.Close()

	resp, err := http.Post(srv.URL+"/tenants", "application/json", strings.NewReader(`{"name":"Acme"}`))
	if err != nil {
		t.Fatal(err)
	}
	var created tenantResponse
	if err := json.NewDecoder(resp.Body).Decode(&created); err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()

	req, _ := http.NewRequest(http.MethodPut, srv.URL+"/tenants/"+created.ID, strings.NewReader(`{"name":"Acme Inc","is_active":false}`))
	put, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer put.Body.Close()
	if put.StatusCode != http.StatusOK {
		t.Fatalf("PUT status = %d, want %d", put.StatusCode, http.StatusOK)
	}
	var updated tenantResponse
	if err := json.NewDecoder(put.Body).Decode(&updated); err != nil {
		t.Fatal(err)
	}
	if updated.Name != "Acme Inc" || updated.IsActive {
		t.Fatalf("PUT body = %+v, want Acme Inc/inactive", updated)
	}

	delReq, _ := http.NewRequest(http.MethodDelete, srv.URL+"/tenants/"+created.ID, nil)
	del, err := http.DefaultClient.Do(delReq)
	if err != nil {
		t.Fatal(err)
	}
	defer del.Body.Close()
	if del.StatusCode != http.StatusNoContent {
		t.Fatalf("DELETE status = %d, want %d", del.StatusCode, http.StatusNoContent)
	}

	delAgain, err := http.DefaultClient.Do(delReq)
	if err != nil {
		t.Fatal(err)
	}
	defer delAgain.Body.Close()
	if delAgain.StatusCode != http.StatusNotFound {
		t.Fatalf("DELETE again status = %d, want %d", delAgain.StatusCode, http.StatusNotFound)
	}
}
