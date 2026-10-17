// Package handlers implements the tenant use cases on top of the db layer.
// It is transport-agnostic: it validates domain inputs and returns domain
// values and errors, leaving HTTP/gRPC mapping to the transport package.
package handlers

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5"
	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"

	"monocix-api/internal/references/db"
	"monocix-api/internal/references/domain"
)

// TenantStore is the subset of queries the tenant handlers need.
// *db.Queries satisfies it; tests use an in-memory fake.
type TenantStore interface {
	FindAllTenants(ctx context.Context) ([]db.FindAllTenantsRow, error)
	FindOneTenant(ctx context.Context, id pgtype.UUID) (db.FindOneTenantRow, error)
	FindTenantBySlug(ctx context.Context, slug string) (db.FindTenantBySlugRow, error)
	SaveTenant(ctx context.Context, arg db.SaveTenantParams) error
	UpdateTenant(ctx context.Context, arg db.UpdateTenantParams) error
	DeleteTenant(ctx context.Context, id pgtype.UUID) error
}

var _ TenantStore = (*db.Queries)(nil)

// TenantHandler groups the tenant use cases.
type TenantHandler struct {
	store TenantStore
}

// NewTenantHandler creates a TenantHandler over the given store.
func NewTenantHandler(store TenantStore) *TenantHandler {
	return &TenantHandler{store: store}
}

// List returns every tenant that is not soft-deleted.
func (h *TenantHandler) List(ctx context.Context) ([]domain.Tenant, error) {
	rows, err := h.store.FindAllTenants(ctx)
	if err != nil {
		return nil, fmt.Errorf("list tenants: %w", err)
	}
	items := make([]domain.Tenant, 0, len(rows))
	for _, r := range rows {
		items = append(items, domain.Tenant{
			ID:       r.ID.String(),
			Name:     r.Name,
			Slug:     r.Slug,
			IsActive: r.IsActive,
		})
	}
	return items, nil
}

// Get returns one tenant by its UUID, or domain.ErrNotFound.
func (h *TenantHandler) Get(ctx context.Context, id string) (domain.Tenant, error) {
	if err := domain.Validate.Var(id, "required,uuid4"); err != nil {
		return domain.Tenant{}, fmt.Errorf("invalid tenant id: %w", err)
	}
	pgID, err := parseUUID(id)
	if err != nil {
		return domain.Tenant{}, fmt.Errorf("invalid tenant id: %w", err)
	}
	row, err := h.store.FindOneTenant(ctx, pgID)
	if err != nil {
		if isNoRows(err) {
			return domain.Tenant{}, domain.ErrNotFound
		}
		return domain.Tenant{}, fmt.Errorf("get tenant: %w", err)
	}
	return domain.Tenant{ID: row.ID.String(), Name: row.Name, Slug: row.Slug, IsActive: row.IsActive}, nil
}

// Create validates the input, generates the tenant UUID server-side and
// persists it. IsActive defaults to true.
func (h *TenantHandler) Create(ctx context.Context, input domain.CreateTenantInput) (domain.Tenant, error) {
	if err := domain.Validate.Struct(input); err != nil {
		return domain.Tenant{}, fmt.Errorf("invalid tenant: %w", err)
	}
	pgID, err := parseUUID(input.ID)
	if err != nil {
		return domain.Tenant{}, fmt.Errorf("invalid tenant id: %w", err)
	}
	if err := h.store.SaveTenant(ctx, db.SaveTenantParams{
		ID:       pgID,
		Name:     input.Name,
		Slug:     input.Slug,
		IsActive: input.IsActive,
	}); err != nil {
		if isUniqueViolation(err) {
			return domain.Tenant{}, domain.ErrConflict
		}
		return domain.Tenant{}, fmt.Errorf("save tenant: %w", err)
	}
	return domain.Tenant{ID: pgID.String(), Name: input.Name, Slug: input.Slug, IsActive: input.IsActive}, nil
}

// Update validates the input and persists it. It returns domain.ErrNotFound
// when the tenant does not exist. The existence check is a separate read
// because the UPDATE returns no rows to distinguish "missing" from "updated".
func (h *TenantHandler) Update(ctx context.Context, input domain.UpdateTenantInput) (domain.Tenant, error) {
	if err := domain.Validate.Struct(input); err != nil {
		return domain.Tenant{}, fmt.Errorf("invalid tenant: %w", err)
	}
	pgID, err := parseUUID(input.ID)
	if err != nil {
		return domain.Tenant{}, fmt.Errorf("invalid tenant id: %w", err)
	}
	if _, err := h.store.FindOneTenant(ctx, pgID); err != nil {
		if isNoRows(err) {
			return domain.Tenant{}, domain.ErrNotFound
		}
		return domain.Tenant{}, fmt.Errorf("get tenant: %w", err)
	}
	if err := h.store.UpdateTenant(ctx, db.UpdateTenantParams{
		Name:     input.Name,
		Slug:     input.Slug,
		IsActive: input.IsActive,
		ID:       pgID,
	}); err != nil {
		if isUniqueViolation(err) {
			return domain.Tenant{}, domain.ErrConflict
		}
		return domain.Tenant{}, fmt.Errorf("update tenant: %w", err)
	}
	return domain.Tenant{ID: input.ID, Name: input.Name, Slug: input.Slug, IsActive: input.IsActive}, nil
}

// Delete soft-deletes the tenant (is_delete). It returns
// domain.ErrNotFound when the tenant does not exist.
func (h *TenantHandler) Delete(ctx context.Context, id string) error {
	if err := domain.Validate.Var(id, "required,uuid4"); err != nil {
		return fmt.Errorf("invalid tenant id: %w", err)
	}
	pgID, err := parseUUID(id)
	if err != nil {
		return fmt.Errorf("invalid tenant id: %w", err)
	}
	if _, err := h.store.FindOneTenant(ctx, pgID); err != nil {
		if isNoRows(err) {
			return domain.ErrNotFound
		}
		return fmt.Errorf("get tenant: %w", err)
	}
	if err := h.store.DeleteTenant(ctx, pgID); err != nil {
		return fmt.Errorf("delete tenant: %w", err)
	}
	return nil
}

// isNoRows reports whether err means "no rows" from the store.
func isNoRows(err error) bool {
	return errors.Is(err, pgx.ErrNoRows)
}

// parseUUID converts a canonical UUID string into pgtype.UUID.
func parseUUID(s string) (pgtype.UUID, error) {
	var id pgtype.UUID
	if err := id.Scan(s); err != nil {
		return pgtype.UUID{}, err
	}
	if !id.Valid {
		return pgtype.UUID{}, fmt.Errorf("invalid uuid %q", s)
	}
	return id, nil
}

// isUniqueViolation reports a 23505 unique violation (e.g. duplicate slug).
func isUniqueViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23505"
}

// GetBySlug returns one tenant by its slug, or domain.ErrNotFound.
func (h *TenantHandler) GetBySlug(ctx context.Context, slug string) (domain.Tenant, error) {
	if err := domain.Validate.Var(slug, "required,notblank,max=255"); err != nil {
		return domain.Tenant{}, fmt.Errorf("invalid slug: %w", err)
	}
	row, err := h.store.FindTenantBySlug(ctx, slug)
	if err != nil {
		if isNoRows(err) {
			return domain.Tenant{}, domain.ErrNotFound
		}
		return domain.Tenant{}, fmt.Errorf("get tenant by slug: %w", err)
	}
	return domain.Tenant{ID: row.ID.String(), Name: row.Name, Slug: row.Slug, IsActive: row.IsActive}, nil
}
