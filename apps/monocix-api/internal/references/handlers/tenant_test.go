package handlers

import (
	"context"
	"errors"
	"sync"
	"testing"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgtype"

	"monocix-api/internal/references/db"
	"monocix-api/internal/references/domain"
)

// fakeStore is an in-memory TenantStore. It mimics sqlc/pgx semantics:
// FindOneTenant returns pgx.ErrNoRows when the id does not exist.
type fakeStore struct {
	mu   sync.Mutex
	rows map[pgtype.UUID]db.FindOneTenantRow
}

func newFakeStore() *fakeStore {
	return &fakeStore{rows: map[pgtype.UUID]db.FindOneTenantRow{}}
}

func (f *fakeStore) FindAllTenants(_ context.Context) ([]db.FindAllTenantsRow, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	items := make([]db.FindAllTenantsRow, 0, len(f.rows))
	for _, r := range f.rows {
		items = append(items, db.FindAllTenantsRow{ID: r.ID, Name: r.Name, IsActive: r.IsActive})
	}
	return items, nil
}

func (f *fakeStore) FindOneTenant(_ context.Context, id pgtype.UUID) (db.FindOneTenantRow, error) {
	f.mu.Lock()
	defer f.mu.Unlock()
	r, ok := f.rows[id]
	if !ok {
		return db.FindOneTenantRow{}, pgx.ErrNoRows
	}
	return r, nil
}

func (f *fakeStore) SaveTenant(_ context.Context, arg db.SaveTenantParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	f.rows[arg.ID] = db.FindOneTenantRow{ID: arg.ID, Name: arg.Name, IsActive: arg.IsActive}
	return nil
}

func (f *fakeStore) UpdateTenant(_ context.Context, arg db.UpdateTenantParams) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	r, ok := f.rows[arg.ID]
	if !ok {
		return pgx.ErrNoRows
	}
	r.Name, r.IsActive = arg.Name, arg.IsActive
	f.rows[arg.ID] = r
	return nil
}

func (f *fakeStore) DeleteTenant(_ context.Context, id pgtype.UUID) error {
	f.mu.Lock()
	defer f.mu.Unlock()
	if _, ok := f.rows[id]; !ok {
		return pgx.ErrNoRows
	}
	delete(f.rows, id)
	return nil
}

func TestTenantHandler_Create(t *testing.T) {
	h := NewTenantHandler(newFakeStore())
	ctx := context.Background()

	got, err := h.Create(ctx, domain.CreateTenantInput{Name: "Acme", IsActive: true})
	if err != nil {
		t.Fatalf("Create() error = %v", err)
	}
	if got.Name != "Acme" || !got.IsActive || got.ID == "" {
		t.Fatalf("Create() = %+v, want Acme/active with generated ID", got)
	}

	if _, err := h.Create(ctx, domain.CreateTenantInput{Name: ""}); err == nil {
		t.Fatal("Create() with empty name, want validation error")
	}
}

func TestTenantHandler_Get_NotFound(t *testing.T) {
	h := NewTenantHandler(newFakeStore())

	_, err := h.Get(context.Background(), "550e8400-e29b-41d4-a716-446655440000")
	if !errors.Is(err, domain.ErrNotFound) {
		t.Fatalf("Get() error = %v, want %v", err, domain.ErrNotFound)
	}
}

func TestTenantHandler_Get_BadID(t *testing.T) {
	h := NewTenantHandler(newFakeStore())

	if _, err := h.Get(context.Background(), "not-a-uuid"); err == nil {
		t.Fatal("Get() with bad uuid, want validation error")
	}
}

func TestTenantHandler_List(t *testing.T) {
	h := NewTenantHandler(newFakeStore())
	ctx := context.Background()

	if _, err := h.Create(ctx, domain.CreateTenantInput{Name: "A"}); err != nil {
		t.Fatal(err)
	}
	if _, err := h.Create(ctx, domain.CreateTenantInput{Name: "B"}); err != nil {
		t.Fatal(err)
	}

	items, err := h.List(ctx)
	if err != nil {
		t.Fatal(err)
	}
	if len(items) != 2 {
		t.Fatalf("List() len = %d, want 2", len(items))
	}
}

func TestTenantHandler_Update(t *testing.T) {
	h := NewTenantHandler(newFakeStore())
	ctx := context.Background()

	created, err := h.Create(ctx, domain.CreateTenantInput{Name: "Acme"})
	if err != nil {
		t.Fatal(err)
	}

	updated, err := h.Update(ctx, domain.UpdateTenantInput{ID: created.ID, Name: "Acme Inc", IsActive: true})
	if err != nil {
		t.Fatal(err)
	}
	if updated.Name != "Acme Inc" {
		t.Fatalf("Update() name = %q, want %q", updated.Name, "Acme Inc")
	}

	if _, err := h.Update(ctx, domain.UpdateTenantInput{ID: "550e8400-e29b-41d4-a716-446655440000", Name: "Ghost"}); !errors.Is(err, domain.ErrNotFound) {
		t.Fatalf("Update() missing error = %v, want %v", err, domain.ErrNotFound)
	}
}

func TestTenantHandler_Delete(t *testing.T) {
	h := NewTenantHandler(newFakeStore())
	ctx := context.Background()

	created, err := h.Create(ctx, domain.CreateTenantInput{Name: "Acme"})
	if err != nil {
		t.Fatal(err)
	}

	if err := h.Delete(ctx, created.ID); err != nil {
		t.Fatal(err)
	}
	if _, err := h.Get(ctx, created.ID); !errors.Is(err, domain.ErrNotFound) {
		t.Fatalf("Get() after Delete error = %v, want %v", err, domain.ErrNotFound)
	}

	if err := h.Delete(ctx, "550e8400-e29b-41d4-a716-446655440000"); !errors.Is(err, domain.ErrNotFound) {
		t.Fatalf("Delete() missing error = %v, want %v", err, domain.ErrNotFound)
	}
}
