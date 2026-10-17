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
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"

	"monocix-api/internal/references/db"
	"monocix-api/internal/references/handlers"
)

// stubLabelStore is an in-memory handlers.LabelStore for route tests.
type stubLabelStore struct {
	mu      sync.Mutex
	tenants map[pgtype.UUID]bool
	rows    map[pgtype.UUID]db.FindOneLabelRow
}

func newStubLabelStore() *stubLabelStore {
	var anyTenant pgtype.UUID
	_ = anyTenant.Scan("550e8400-e29b-41d4-a716-446655440000")
	return &stubLabelStore{
		tenants: map[pgtype.UUID]bool{anyTenant: true},
		rows:    map[pgtype.UUID]db.FindOneLabelRow{},
	}
}

func (s *stubLabelStore) FindAllLabels(_ context.Context, tenantID pgtype.UUID) ([]db.FindAllLabelsRow, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	items := []db.FindAllLabelsRow{}
	for _, r := range s.rows {
		if r.TenantID == tenantID {
			items = append(items, db.FindAllLabelsRow{ID: r.ID, Name: r.Name, IsActive: r.IsActive, TenantID: r.TenantID})
		}
	}
	return items, nil
}

func (s *stubLabelStore) FindOneLabel(_ context.Context, arg db.FindOneLabelParams) (db.FindOneLabelRow, error) {
	s.mu.Lock()
	defer s.mu.Unlock()
	r, ok := s.rows[arg.ID]
	if !ok || r.TenantID != arg.TenantID {
		return db.FindOneLabelRow{}, pgx.ErrNoRows
	}
	return r, nil
}

func (s *stubLabelStore) SaveLabel(_ context.Context, arg db.SaveLabelParams) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	if !s.tenants[arg.TenantID] {
		return &pgconn.PgError{Code: "23503"}
	}
	s.rows[arg.ID] = db.FindOneLabelRow{ID: arg.ID, Name: arg.Name, IsActive: arg.IsActive, TenantID: arg.TenantID}
	return nil
}

func (s *stubLabelStore) UpdateLabel(_ context.Context, arg db.UpdateLabelParams) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	r, ok := s.rows[arg.ID]
	if !ok || r.TenantID != arg.TenantID {
		return pgx.ErrNoRows
	}
	r.Name, r.IsActive = arg.Name, arg.IsActive
	s.rows[arg.ID] = r
	return nil
}

func (s *stubLabelStore) DeleteLabel(_ context.Context, arg db.DeleteLabelParams) error {
	s.mu.Lock()
	defer s.mu.Unlock()
	r, ok := s.rows[arg.ID]
	if !ok || r.TenantID != arg.TenantID {
		return pgx.ErrNoRows
	}
	delete(s.rows, arg.ID)
	return nil
}

const labelTenant = "550e8400-e29b-41d4-a716-446655440000"

func newLabelTestServer() *httptest.Server {
	mux := http.NewServeMux()
	RegisterLabelRoutes(mux, handlers.NewLabelHandler(newStubLabelStore()))
	return httptest.NewServer(mux)
}

func TestLabelRoutes_CreateAndGet(t *testing.T) {
	srv := newLabelTestServer()
	defer srv.Close()

	creReq, err := http.NewRequest(http.MethodPost, srv.URL+"/labels", strings.NewReader(`{"id":"123e4567-e89b-42d3-a456-426614174000","name":"VIP"}`))
	if err != nil {
		t.Fatal(err)
	}
	creReq.Header.Set("Content-Type", "application/json")
	creReq.Header.Set("tenantId", labelTenant)
	resp, err := http.DefaultClient.Do(creReq)
	if err != nil {
		t.Fatal(err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated {
		t.Fatalf("POST status = %d, want %d", resp.StatusCode, http.StatusCreated)
	}
	var created labelResponse
	if err := json.NewDecoder(resp.Body).Decode(&created); err != nil {
		t.Fatal(err)
	}
	if created.Name != "VIP" || created.TenantID != labelTenant || created.ID == "" {
		t.Fatalf("POST body = %+v, want VIP with ids", created)
	}

	getReq, err := http.NewRequest(http.MethodGet, srv.URL+"/labels/"+created.ID, nil)
	if err != nil {
		t.Fatal(err)
	}
	getReq.Header.Set("tenantId", labelTenant)
	get, err := http.DefaultClient.Do(getReq)
	if err != nil {
		t.Fatal(err)
	}
	defer get.Body.Close()
	if get.StatusCode != http.StatusOK {
		t.Fatalf("GET status = %d, want %d", get.StatusCode, http.StatusOK)
	}
}

func TestLabelRoutes_RequiresTenant(t *testing.T) {
	srv := newLabelTestServer()
	defer srv.Close()

	resp, err := http.Get(srv.URL + "/labels")
	if err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()
	if resp.StatusCode != http.StatusBadRequest {
		t.Fatalf("GET without tenant_id status = %d, want %d", resp.StatusCode, http.StatusBadRequest)
	}

	bad, err := http.Post(srv.URL+"/labels", "application/json",
		strings.NewReader(`{"id":"123e4567-e89b-42d3-a456-426614174000","name":"VIP","tenant_id":"nope"}`))
	if err != nil {
		t.Fatal(err)
	}
	bad.Body.Close()
	if bad.StatusCode != http.StatusBadRequest {
		t.Fatalf("POST bad tenant status = %d, want %d", bad.StatusCode, http.StatusBadRequest)
	}
}

func TestLabelRoutes_UpdateAndDelete(t *testing.T) {
	srv := newLabelTestServer()
	defer srv.Close()

	creReq, err := http.NewRequest(http.MethodPost, srv.URL+"/labels", strings.NewReader(`{"id":"123e4567-e89b-42d3-a456-426614174000","name":"VIP"}`))
	if err != nil {
		t.Fatal(err)
	}
	creReq.Header.Set("Content-Type", "application/json")
	creReq.Header.Set("tenantId", labelTenant)
	resp, err := http.DefaultClient.Do(creReq)
	if err != nil {
		t.Fatal(err)
	}
	var created labelResponse
	if err := json.NewDecoder(resp.Body).Decode(&created); err != nil {
		t.Fatal(err)
	}
	resp.Body.Close()

	req, _ := http.NewRequest(http.MethodPut, srv.URL+"/labels/"+created.ID,
		strings.NewReader(`{"id":"123e4567-e89b-42d3-a456-426614174000","name":"VIP+","is_active":false}`))
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("tenantId", labelTenant)
	put, err := http.DefaultClient.Do(req)
	if err != nil {
		t.Fatal(err)
	}
	defer put.Body.Close()
	if put.StatusCode != http.StatusOK {
		t.Fatalf("PUT status = %d, want %d", put.StatusCode, http.StatusOK)
	}

	delReq, _ := http.NewRequest(http.MethodDelete, srv.URL+"/labels/"+created.ID, nil)
	delReq.Header.Set("tenantId", labelTenant)
	del, err := http.DefaultClient.Do(delReq)
	if err != nil {
		t.Fatal(err)
	}
	defer del.Body.Close()
	if del.StatusCode != http.StatusNoContent {
		t.Fatalf("DELETE status = %d, want %d", del.StatusCode, http.StatusNoContent)
	}

	getReq, err := http.NewRequest(http.MethodGet, srv.URL+"/labels/"+created.ID, nil)
	if err != nil {
		t.Fatal(err)
	}
	getReq.Header.Set("tenantId", labelTenant)
	get, err := http.DefaultClient.Do(getReq)
	if err != nil {
		t.Fatal(err)
	}
	defer get.Body.Close()
	if get.StatusCode != http.StatusNotFound {
		t.Fatalf("GET after DELETE status = %d, want %d", get.StatusCode, http.StatusNotFound)
	}
}
