// ChartOfAccountHandler groups the chart_of_account use cases. Like
// AccountHandler it is transport-agnostic; every operation is scoped by tenant id.
package handlers

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"

	"monocix-api/internal/references/db"
	"monocix-api/internal/references/domain"
)

// ChartOfAccountStore is the subset of queries the chart_of_account handlers need.
type ChartOfAccountStore interface {
	FindAllChartOfAccounts(ctx context.Context, tenantID pgtype.UUID) ([]db.FindAllChartOfAccountsRow, error)
	FindOneChartOfAccount(ctx context.Context, arg db.FindOneChartOfAccountParams) (db.FindOneChartOfAccountRow, error)
	SaveChartOfAccount(ctx context.Context, arg db.SaveChartOfAccountParams) error
	UpdateChartOfAccount(ctx context.Context, arg db.UpdateChartOfAccountParams) error
	DeleteChartOfAccount(ctx context.Context, arg db.DeleteChartOfAccountParams) error
}

var _ ChartOfAccountStore = (*db.Queries)(nil)

// ChartOfAccountHandler groups the chart_of_account use cases.
type ChartOfAccountHandler struct {
	store ChartOfAccountStore
}

// NewChartOfAccountHandler creates a ChartOfAccountHandler over the given store.
func NewChartOfAccountHandler(store ChartOfAccountStore) *ChartOfAccountHandler {
	return &ChartOfAccountHandler{store: store}
}

// List returns every chart of account of a tenant that is not soft-deleted.
func (h *ChartOfAccountHandler) List(ctx context.Context, tenantID string) ([]domain.ChartOfAccount, error) {
	pgTenant, err := validTenantID(tenantID)
	if err != nil {
		return nil, err
	}
	rows, err := h.store.FindAllChartOfAccounts(ctx, pgTenant)
	if err != nil {
		return nil, fmt.Errorf("list chart of accounts: %w", err)
	}
	items := make([]domain.ChartOfAccount, 0, len(rows))
	for _, r := range rows {
		items = append(items, toChartOfAccount(r.ID.String(), r.Name, r.TenantID.String(), r.LabelID.String(), r.IsActive))
	}
	return items, nil
}

// Get returns one chart of account of a tenant, or domain.ErrNotFound.
func (h *ChartOfAccountHandler) Get(ctx context.Context, id, tenantID string) (domain.ChartOfAccount, error) {
	pgID, pgTenant, err := validIDs(id, tenantID)
	if err != nil {
		return domain.ChartOfAccount{}, err
	}
	row, err := h.store.FindOneChartOfAccount(ctx, db.FindOneChartOfAccountParams{ID: pgID, TenantID: pgTenant})
	if err != nil {
		if isNoRows(err) {
			return domain.ChartOfAccount{}, domain.ErrNotFound
		}
		return domain.ChartOfAccount{}, fmt.Errorf("get chart of account: %w", err)
	}
	return toChartOfAccount(row.ID.String(), row.Name, row.TenantID.String(), row.LabelID.String(), row.IsActive), nil
}

// Create validates the input and persists it. An unknown tenant or label violates
// the FK and maps to domain.ErrNotFound.
func (h *ChartOfAccountHandler) Create(ctx context.Context, input domain.CreateChartOfAccountInput) (domain.ChartOfAccount, error) {
	if err := domain.Validate.Struct(input); err != nil {
		return domain.ChartOfAccount{}, fmt.Errorf("invalid chart of account: %w", err)
	}
	pgTenant, err := parseUUID(input.TenantID)
	if err != nil {
		return domain.ChartOfAccount{}, fmt.Errorf("invalid tenant id: %w", err)
	}
	pgID, err := parseUUID(input.ID)
	if err != nil {
		return domain.ChartOfAccount{}, fmt.Errorf("invalid chart of account id: %w", err)
	}
	pgLabel, err := parseUUID(input.LabelID)
	if err != nil {
		return domain.ChartOfAccount{}, fmt.Errorf("invalid label id: %w", err)
	}
	if err := h.store.SaveChartOfAccount(ctx, db.SaveChartOfAccountParams{
		ID:       pgID,
		Name:     input.Name,
		IsActive: input.IsActive,
		TenantID: pgTenant,
		LabelID:  pgLabel,
	}); err != nil {
		if isForeignKeyViolation(err) {
			return domain.ChartOfAccount{}, domain.ErrNotFound
		}
		if isUniqueViolation(err) {
			return domain.ChartOfAccount{}, domain.ErrConflict
		}
		return domain.ChartOfAccount{}, fmt.Errorf("save chart of account: %w", err)
	}
	return toChartOfAccount(pgID.String(), input.Name, input.TenantID, input.LabelID, input.IsActive), nil
}

// Update validates the input and persists it. It returns domain.ErrNotFound
// when the chart of account does not exist in the tenant.
func (h *ChartOfAccountHandler) Update(ctx context.Context, input domain.UpdateChartOfAccountInput) (domain.ChartOfAccount, error) {
	if err := domain.Validate.Struct(input); err != nil {
		return domain.ChartOfAccount{}, fmt.Errorf("invalid chart of account: %w", err)
	}
	pgID, pgTenant, err := validIDs(input.ID, input.TenantID)
	if err != nil {
		return domain.ChartOfAccount{}, err
	}
	if _, err := h.store.FindOneChartOfAccount(ctx, db.FindOneChartOfAccountParams{ID: pgID, TenantID: pgTenant}); err != nil {
		if isNoRows(err) {
			return domain.ChartOfAccount{}, domain.ErrNotFound
		}
		return domain.ChartOfAccount{}, fmt.Errorf("get chart of account: %w", err)
	}
	pgLabel, err := parseUUID(input.LabelID)
	if err != nil {
		return domain.ChartOfAccount{}, fmt.Errorf("invalid label id: %w", err)
	}
	if err := h.store.UpdateChartOfAccount(ctx, db.UpdateChartOfAccountParams{
		Name:     input.Name,
		LabelID:  pgLabel,
		IsActive: input.IsActive,
		ID:       pgID,
		TenantID: pgTenant,
	}); err != nil {
		return domain.ChartOfAccount{}, fmt.Errorf("update chart of account: %w", err)
	}
	return toChartOfAccount(input.ID, input.Name, input.TenantID, input.LabelID, input.IsActive), nil
}

// Delete soft-deletes the chart of account. Returns domain.ErrNotFound when absent.
func (h *ChartOfAccountHandler) Delete(ctx context.Context, id, tenantID string) error {
	pgID, pgTenant, err := validIDs(id, tenantID)
	if err != nil {
		return err
	}
	if _, err := h.store.FindOneChartOfAccount(ctx, db.FindOneChartOfAccountParams{ID: pgID, TenantID: pgTenant}); err != nil {
		if isNoRows(err) {
			return domain.ErrNotFound
		}
		return fmt.Errorf("get chart of account: %w", err)
	}
	if err := h.store.DeleteChartOfAccount(ctx, db.DeleteChartOfAccountParams{ID: pgID, TenantID: pgTenant}); err != nil {
		return fmt.Errorf("delete chart of account: %w", err)
	}
	return nil
}

func toChartOfAccount(id, name, tenantID, labelID string, active bool) domain.ChartOfAccount {
	return domain.ChartOfAccount{ID: id, Name: name, TenantID: tenantID, LabelID: labelID, IsActive: active}
}
