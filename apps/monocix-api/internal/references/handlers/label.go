// LabelHandler groups the label use cases. Like TenantHandler it is
// transport-agnostic; every operation is scoped by tenant id.
package handlers

import (
	"context"
	"errors"
	"fmt"

	"github.com/jackc/pgx/v5/pgconn"
	"github.com/jackc/pgx/v5/pgtype"

	"monocix-api/internal/references/db"
	"monocix-api/internal/references/domain"
)

// LabelStore is the subset of queries the label handlers need.
// *db.Queries satisfies it; tests use an in-memory fake.
type LabelStore interface {
	FindAllLabels(ctx context.Context, tenantID pgtype.UUID) ([]db.FindAllLabelsRow, error)
	FindOneLabel(ctx context.Context, arg db.FindOneLabelParams) (db.FindOneLabelRow, error)
	SaveLabel(ctx context.Context, arg db.SaveLabelParams) error
	UpdateLabel(ctx context.Context, arg db.UpdateLabelParams) error
	DeleteLabel(ctx context.Context, arg db.DeleteLabelParams) error
}

var _ LabelStore = (*db.Queries)(nil)

// LabelHandler groups the label use cases.
type LabelHandler struct {
	store LabelStore
}

// NewLabelHandler creates a LabelHandler over the given store.
func NewLabelHandler(store LabelStore) *LabelHandler {
	return &LabelHandler{store: store}
}

// List returns every label of a tenant that is not soft-deleted.
func (h *LabelHandler) List(ctx context.Context, tenantID string) ([]domain.Label, error) {
	pgTenant, err := validTenantID(tenantID)
	if err != nil {
		return nil, err
	}
	rows, err := h.store.FindAllLabels(ctx, pgTenant)
	if err != nil {
		return nil, fmt.Errorf("list labels: %w", err)
	}
	items := make([]domain.Label, 0, len(rows))
	for _, r := range rows {
		items = append(items, toLabel(r.ID.String(), r.Name, r.TenantID.String(), r.IsActive))
	}
	return items, nil
}

// Get returns one label of a tenant, or domain.ErrNotFound.
func (h *LabelHandler) Get(ctx context.Context, id, tenantID string) (domain.Label, error) {
	pgID, pgTenant, err := validIDs(id, tenantID)
	if err != nil {
		return domain.Label{}, err
	}
	row, err := h.store.FindOneLabel(ctx, db.FindOneLabelParams{ID: pgID, TenantID: pgTenant})
	if err != nil {
		if isNoRows(err) {
			return domain.Label{}, domain.ErrNotFound
		}
		return domain.Label{}, fmt.Errorf("get label: %w", err)
	}
	return toLabel(row.ID.String(), row.Name, row.TenantID.String(), row.IsActive), nil
}

// Create validates the input, generates the label UUID server-side and
// persists it. An unknown tenant violates the FK and maps to
// domain.ErrNotFound.
func (h *LabelHandler) Create(ctx context.Context, input domain.CreateLabelInput) (domain.Label, error) {
	if err := domain.Validate.Struct(input); err != nil {
		return domain.Label{}, fmt.Errorf("invalid label: %w", err)
	}
	pgTenant, err := parseUUID(input.TenantID)
	if err != nil {
		return domain.Label{}, fmt.Errorf("invalid tenant id: %w", err)
	}
	pgID, err := parseUUID(input.ID)
	if err != nil {
		return domain.Label{}, fmt.Errorf("invalid label id: %w", err)
	}
	if err := h.store.SaveLabel(ctx, db.SaveLabelParams{
		ID:       pgID,
		Name:     input.Name,
		IsActive: input.IsActive,
		TenantID: pgTenant,
	}); err != nil {
		if isForeignKeyViolation(err) {
			return domain.Label{}, domain.ErrNotFound
		}
		if isUniqueViolation(err) {
			return domain.Label{}, domain.ErrConflict
		}
		return domain.Label{}, fmt.Errorf("save label: %w", err)
	}
	return toLabel(pgID.String(), input.Name, input.TenantID, input.IsActive), nil
}

// Update validates the input and persists it. It returns domain.ErrNotFound
// when the label does not exist in the tenant.
func (h *LabelHandler) Update(ctx context.Context, input domain.UpdateLabelInput) (domain.Label, error) {
	if err := domain.Validate.Struct(input); err != nil {
		return domain.Label{}, fmt.Errorf("invalid label: %w", err)
	}
	pgID, pgTenant, err := validIDs(input.ID, input.TenantID)
	if err != nil {
		return domain.Label{}, err
	}
	if _, err := h.store.FindOneLabel(ctx, db.FindOneLabelParams{ID: pgID, TenantID: pgTenant}); err != nil {
		if isNoRows(err) {
			return domain.Label{}, domain.ErrNotFound
		}
		return domain.Label{}, fmt.Errorf("get label: %w", err)
	}
	if err := h.store.UpdateLabel(ctx, db.UpdateLabelParams{
		Name:     input.Name,
		IsActive: input.IsActive,
		ID:       pgID,
		TenantID: pgTenant,
	}); err != nil {
		return domain.Label{}, fmt.Errorf("update label: %w", err)
	}
	return toLabel(input.ID, input.Name, input.TenantID, input.IsActive), nil
}

// Delete soft-deletes the label. It returns domain.ErrNotFound when the
// label does not exist in the tenant.
func (h *LabelHandler) Delete(ctx context.Context, id, tenantID string) error {
	pgID, pgTenant, err := validIDs(id, tenantID)
	if err != nil {
		return err
	}
	if _, err := h.store.FindOneLabel(ctx, db.FindOneLabelParams{ID: pgID, TenantID: pgTenant}); err != nil {
		if isNoRows(err) {
			return domain.ErrNotFound
		}
		return fmt.Errorf("get label: %w", err)
	}
	if err := h.store.DeleteLabel(ctx, db.DeleteLabelParams{ID: pgID, TenantID: pgTenant}); err != nil {
		return fmt.Errorf("delete label: %w", err)
	}
	return nil
}

func toLabel(id, name, tenantID string, active bool) domain.Label {
	return domain.Label{ID: id, Name: name, TenantID: tenantID, IsActive: active}
}

func validTenantID(tenantID string) (pgtype.UUID, error) {
	if err := domain.Validate.Var(tenantID, "required,uuid4"); err != nil {
		return pgtype.UUID{}, fmt.Errorf("invalid tenant id: %w", err)
	}
	return parseUUID(tenantID)
}

func validIDs(id, tenantID string) (pgtype.UUID, pgtype.UUID, error) {
	if err := domain.Validate.Var(id, "required,uuid4"); err != nil {
		return pgtype.UUID{}, pgtype.UUID{}, fmt.Errorf("invalid label id: %w", err)
	}
	pgTenant, err := validTenantID(tenantID)
	if err != nil {
		return pgtype.UUID{}, pgtype.UUID{}, err
	}
	pgID, err := parseUUID(id)
	if err != nil {
		return pgtype.UUID{}, pgtype.UUID{}, fmt.Errorf("invalid label id: %w", err)
	}
	return pgID, pgTenant, nil
}

// isForeignKeyViolation reports a 23503 FK violation (unknown tenant).
func isForeignKeyViolation(err error) bool {
	var pgErr *pgconn.PgError
	return errors.As(err, &pgErr) && pgErr.Code == "23503"
}
