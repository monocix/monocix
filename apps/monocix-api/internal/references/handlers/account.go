// AccountHandler groups the account use cases. Like LabelHandler it is
// transport-agnostic; every operation is scoped by tenant id.
package handlers

import (
	"context"
	"fmt"

	"github.com/jackc/pgx/v5/pgtype"

	"monocix-api/internal/references/db"
	"monocix-api/internal/references/domain"
)

// AccountStore is the subset of queries the account handlers need.
// *db.Queries satisfies it; tests use an in-memory fake.
type AccountStore interface {
	FindAllAccounts(ctx context.Context, tenantID pgtype.UUID) ([]db.FindAllAccountsRow, error)
	FindOneAccount(ctx context.Context, arg db.FindOneAccountParams) (db.FindOneAccountRow, error)
	SaveAccount(ctx context.Context, arg db.SaveAccountParams) error
	UpdateAccount(ctx context.Context, arg db.UpdateAccountParams) error
	DeleteAccount(ctx context.Context, arg db.DeleteAccountParams) error
}

var _ AccountStore = (*db.Queries)(nil)

// AccountHandler groups the account use cases.
type AccountHandler struct {
	store AccountStore
}

// NewAccountHandler creates an AccountHandler over the given store.
func NewAccountHandler(store AccountStore) *AccountHandler {
	return &AccountHandler{store: store}
}

// List returns every account of a tenant that is not soft-deleted.
func (h *AccountHandler) List(ctx context.Context, tenantID string) ([]domain.Account, error) {
	pgTenant, err := validTenantID(tenantID)
	if err != nil {
		return nil, err
	}
	rows, err := h.store.FindAllAccounts(ctx, pgTenant)
	if err != nil {
		return nil, fmt.Errorf("list accounts: %w", err)
	}
	items := make([]domain.Account, 0, len(rows))
	for _, r := range rows {
		items = append(items, toAccount(r.ID.String(), r.Name, r.Description, r.TenantID.String(), r.IsActive))
	}
	return items, nil
}

// Get returns one account of a tenant, or domain.ErrNotFound.
func (h *AccountHandler) Get(ctx context.Context, id, tenantID string) (domain.Account, error) {
	pgID, pgTenant, err := validIDs(id, tenantID)
	if err != nil {
		return domain.Account{}, err
	}
	row, err := h.store.FindOneAccount(ctx, db.FindOneAccountParams{ID: pgID, TenantID: pgTenant})
	if err != nil {
		if isNoRows(err) {
			return domain.Account{}, domain.ErrNotFound
		}
		return domain.Account{}, fmt.Errorf("get account: %w", err)
	}
	return toAccount(row.ID.String(), row.Name, row.Description, row.TenantID.String(), row.IsActive), nil
}

// Create validates the input, generates the account UUID server-side and
// persists it. An unknown tenant violates the FK and maps to
// domain.ErrNotFound.
func (h *AccountHandler) Create(ctx context.Context, input domain.CreateAccountInput) (domain.Account, error) {
	if err := domain.Validate.Struct(input); err != nil {
		return domain.Account{}, fmt.Errorf("invalid account: %w", err)
	}
	pgTenant, err := parseUUID(input.TenantID)
	if err != nil {
		return domain.Account{}, fmt.Errorf("invalid tenant id: %w", err)
	}
	pgID, err := parseUUID(input.ID)
	if err != nil {
		return domain.Account{}, fmt.Errorf("invalid account id: %w", err)
	}
	if err := h.store.SaveAccount(ctx, db.SaveAccountParams{
		ID:          pgID,
		Name:        input.Name,
		Description: input.Description,
		IsActive:    input.IsActive,
		TenantID:    pgTenant,
	}); err != nil {
		if isForeignKeyViolation(err) {
			return domain.Account{}, domain.ErrNotFound
		}
		if isUniqueViolation(err) {
			return domain.Account{}, domain.ErrConflict
		}
		return domain.Account{}, fmt.Errorf("save account: %w", err)
	}
	return toAccount(pgID.String(), input.Name, input.Description, input.TenantID, input.IsActive), nil
}

// Update validates the input and persists it. It returns domain.ErrNotFound
// when the account does not exist in the tenant.
func (h *AccountHandler) Update(ctx context.Context, input domain.UpdateAccountInput) (domain.Account, error) {
	if err := domain.Validate.Struct(input); err != nil {
		return domain.Account{}, fmt.Errorf("invalid account: %w", err)
	}
	pgID, pgTenant, err := validIDs(input.ID, input.TenantID)
	if err != nil {
		return domain.Account{}, err
	}
	if _, err := h.store.FindOneAccount(ctx, db.FindOneAccountParams{ID: pgID, TenantID: pgTenant}); err != nil {
		if isNoRows(err) {
			return domain.Account{}, domain.ErrNotFound
		}
		return domain.Account{}, fmt.Errorf("get account: %w", err)
	}
	if err := h.store.UpdateAccount(ctx, db.UpdateAccountParams{
		Name:        input.Name,
		Description: input.Description,
		IsActive:    input.IsActive,
		ID:          pgID,
		TenantID:    pgTenant,
	}); err != nil {
		return domain.Account{}, fmt.Errorf("update account: %w", err)
	}
	return toAccount(input.ID, input.Name, input.Description, input.TenantID, input.IsActive), nil
}

// Delete soft-deletes the account. It returns domain.ErrNotFound when the
// account does not exist in the tenant.
func (h *AccountHandler) Delete(ctx context.Context, id, tenantID string) error {
	pgID, pgTenant, err := validIDs(id, tenantID)
	if err != nil {
		return err
	}
	if _, err := h.store.FindOneAccount(ctx, db.FindOneAccountParams{ID: pgID, TenantID: pgTenant}); err != nil {
		if isNoRows(err) {
			return domain.ErrNotFound
		}
		return fmt.Errorf("get account: %w", err)
	}
	if err := h.store.DeleteAccount(ctx, db.DeleteAccountParams{ID: pgID, TenantID: pgTenant}); err != nil {
		return fmt.Errorf("delete account: %w", err)
	}
	return nil
}

func toAccount(id, name, description, tenantID string, active bool) domain.Account {
	return domain.Account{ID: id, Name: name, Description: description, TenantID: tenantID, IsActive: active}
}

// validTenantID already defined in label.go of same package (shared).
// validIDs and parseUUID are shared from label.go.
