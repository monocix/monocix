package handlers

import (
	"context"
	"errors"
	"sync"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"

	"monocix-api/internal/references/db"
	"monocix-api/internal/references/domain"
)

// fakeLabelStore is an in-memory LabelStore. Unknown tenants fail SaveLabel
// with a 23503 FK violation like real Postgres.
type fakeLabelStore struct {
	mu      sync.Mutex
	tenants map[pgtype.UUID]bool
	rows    map[pgtype.UUID]db.FindOneLabelRow
}

func newFakeLabelStore(tenants ...pgtype.UUID) *fakeLabelStore {
	s := &fakeLabelStore{tenants: map[pgtype.UUID]bool{}, rows: map[pgtype.UUID]db.FindOneLabelRow{}}
	for _, id := range tenants {
		s.tenants[id] = true
	}
	return s
}

var errTenantFK = &pgconn.PgError{Code: "23503"}

func (f *fakeLabelStore) FindAllLabels(_ context.Context, tenantID pgtype.UUID) ([]db.FindAllLabelsRow, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	items := []db.FindAllLabelsRow{}
	for _, r := range f.rows {
		if r.TenantID == tenantID {
			items = append(items, db.FindAllLabelsRow{ID: r.ID, Name: r.Name, IsActive: r.IsActive, TenantID: r.TenantID})
		}
	}
	return items, nil
}

func (f *fakeLabelStore) FindOneLabel(_ context.Context, arg db.FindOneLabelParams) (db.FindOneLabelRow, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	r, ok := f.rows[arg.ID]
	if !ok || r.TenantID != arg.TenantID {
		return db.FindOneLabelRow{}, pgx.ErrNoRows
	}
	return r, nil
}

func (f *fakeLabelStore) SaveLabel(_ context.Context, arg db.SaveLabelParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	if !f.tenants[arg.TenantID] {
		return errTenantFK
	}
	f.rows[arg.ID] = db.FindOneLabelRow{ID: arg.ID, Name: arg.Name, IsActive: arg.IsActive, TenantID: arg.TenantID}
	return nil
}

func (f *fakeLabelStore) UpdateLabel(_ context.Context, arg db.UpdateLabelParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	r, ok := f.rows[arg.ID]
	if !ok || r.TenantID != arg.TenantID {
		return pgx.ErrNoRows
	}
	r.Name, r.IsActive = arg.Name, arg.IsActive
	f.rows[arg.ID] = r
	return nil
}

func (f *fakeLabelStore) DeleteLabel(_ context.Context, arg db.DeleteLabelParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	r, ok := f.rows[arg.ID]
	if !ok || r.TenantID != arg.TenantID {
		return pgx.ErrNoRows
	}
	delete(f.rows, arg.ID)
	return nil
}

func mustUUID(t *testing.T, s string) pgtype.UUID {
	t.Helper()
	var id pgtype.UUID
	if err := id.Scan(s); err != nil || !id.Valid {
		t.Fatalf("bad test uuid %q", s)
	}
	return id
}

func TestLabelHandler_Create(t *testing.T) {
	h := NewLabelHandler(newFakeLabelStore(mustUUID(t, "550e8400-e29b-41d4-a716-446655440000")))
	ctx := context.Background()

	got, err := h.Create(ctx, domain.CreateLabelInput{Name: "VIP", TenantID: "550e8400-e29b-41d4-a716-446655440000"})
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if got.Name != "VIP" || got.TenantID != "550e8400-e29b-41d4-a716-446655440000" || got.ID == "" {
		t.Fatalf("Create() = %+v, want VIP with ids", got)
	}

	if _, err := h.Create(ctx, domain.CreateLabelInput{Name: "", TenantID: "550e8400-e29b-41d4-a716-446655440000"}); err == nil {
		t.Fatal("Create() with empty name, want validation error")
	}

	if _, err := h.Create(ctx, domain.CreateLabelInput{Name: "Ghost", TenantID: "550e8400-e29b-41d4-a716-446655440001"}); !errors.Is(err, domain.ErrNotFound) {
		t.Fatalf("Create() unknown tenant error = %v, want %v", err, domain.ErrNotFound)
	}
}

func TestLabelHandler_ScopedAccess(t *testing.T) {
	tenantA := "550e8400-e29b-41d4-a716-446655440000"
	tenantB := "550e8400-e29b-41d4-a716-446655440001"
	h := NewLabelHandler(newFakeLabelStore(mustUUID(t, tenantA), mustUUID(t, tenantB)))
	ctx := context.Background()

	created, err := h.Create(ctx, domain.CreateLabelInput{Name: "VIP", TenantID: tenantA})
	if err != nil {
		t.Fatal(err)
	}

	if _, err := h.Get(ctx, created.ID, tenantB); !errors.Is(err, domain.ErrNotFound) {
		t.Fatalf("Get() cross-tenant error = %v, want %v", err, domain.ErrNotFound)
	}

	items, err := h.List(ctx, tenantB)
	if err != nil {
		t.Fatal(err)
	}
	if len(items) != 0 {
		t.Fatalf("List() other tenant = %d items, want 0", len(items))
	}

	if err := h.Delete(ctx, created.ID, tenantB); !errors.Is(err, domain.ErrNotFound) {
		t.Fatalf("Delete() cross-tenant error = %v, want %v", err, domain.ErrNotFound)
	}
}

func TestLabelHandler_UpdateDelete(t *testing.T) {
	tenant := "550e8400-e29b-41d4-a716-446655440000"
	h := NewLabelHandler(newFakeLabelStore(mustUUID(t, tenant)))
	ctx := context.Background()

	created, err := h.Create(ctx, domain.CreateLabelInput{Name: "VIP", TenantID: tenant})
	if err != nil {
		t.Fatal(err)
	}

	updated, err := h.Update(ctx, domain.UpdateLabelInput{ID: created.ID, Name: "VIP+", TenantID: tenant, IsActive: true})
	if err != nil {
		t.Fatal(err)
	}
	if updated.Name != "VIP+" {
		t.Fatalf("Update() name = %q, want VIP+", updated.Name)
	}

	if err := h.Delete(ctx, created.ID, tenant); err != nil {
		t.Fatal(err)
	}
	if _, err := h.Get(ctx, created.ID, tenant); !errors.Is(err, domain.ErrNotFound) {
		t.Fatalf("Get() after Delete error = %v, want %v", err, domain.ErrNotFound)
	}
}
