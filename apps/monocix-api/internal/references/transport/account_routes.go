// Account routes expose the account handlers over HTTP. Reads scope by the
// tenant_id query param; writes carry tenant_id in the JSON body.
package transport

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-playground/validator/v10"

	"monocix-api/internal/references/domain"
	"monocix-api/internal/references/handlers"
)

// accountResponse is the JSON shape of an account.
type accountResponse struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	TenantID    string `json:"tenant_id"`
	IsActive    bool   `json:"is_active"`
}

func toAccountResponse(a domain.Account) accountResponse {
	return accountResponse{ID: a.ID, Name: a.Name, Description: a.Description, TenantID: a.TenantID, IsActive: a.IsActive}
}

type createAccountRequest struct {
	ID          string `json:"id"`
	Name        string `json:"name"`
	Description string `json:"description"`
	TenantID    string `json:"tenant_id"`
	IsActive    *bool  `json:"is_active"`
}

func (r createAccountRequest) toInput() domain.CreateAccountInput {
	active := true
	if r.IsActive != nil {
		active = *r.IsActive
	}
	return domain.CreateAccountInput{ID: r.ID, Name: r.Name, Description: r.Description, TenantID: r.TenantID, IsActive: active}
}

type updateAccountRequest struct {
	Name        string `json:"name"`
	Description string `json:"description"`
	TenantID    string `json:"tenant_id"`
	IsActive    bool   `json:"is_active"`
}

// RegisterAccountRoutes wires the account CRUD endpoints into mux.
func RegisterAccountRoutes(mux *http.ServeMux, h *handlers.AccountHandler) {
	mux.HandleFunc("GET /accounts", func(w http.ResponseWriter, r *http.Request) {
		items, err := h.List(r.Context(), r.URL.Query().Get("tenant_id"))
		if err != nil {
			writeAccountError(w, err)
			return
		}
		out := make([]accountResponse, 0, len(items))
		for _, a := range items {
			out = append(out, toAccountResponse(a))
		}
		writeJSON(w, http.StatusOK, out)
	})

	mux.HandleFunc("POST /accounts", func(w http.ResponseWriter, r *http.Request) {
		var req createAccountRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeAccountError(w, errors.Join(errBadRequest, err))
			return
		}
		created, err := h.Create(r.Context(), req.toInput())
		if err != nil {
			writeAccountError(w, err)
			return
		}
		writeJSON(w, http.StatusCreated, toAccountResponse(created))
	})

	mux.HandleFunc("GET /accounts/{id}", func(w http.ResponseWriter, r *http.Request) {
		got, err := h.Get(r.Context(), r.PathValue("id"), r.URL.Query().Get("tenant_id"))
		if err != nil {
			writeAccountError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, toAccountResponse(got))
	})

	mux.HandleFunc("PUT /accounts/{id}", func(w http.ResponseWriter, r *http.Request) {
		var req updateAccountRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeAccountError(w, errors.Join(errBadRequest, err))
			return
		}
		updated, err := h.Update(r.Context(), domain.UpdateAccountInput{
			ID:          r.PathValue("id"),
			Name:        req.Name,
			Description: req.Description,
			TenantID:    req.TenantID,
			IsActive:    req.IsActive,
		})
		if err != nil {
			writeAccountError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, toAccountResponse(updated))
	})

	mux.HandleFunc("DELETE /accounts/{id}", func(w http.ResponseWriter, r *http.Request) {
		if err := h.Delete(r.Context(), r.PathValue("id"), r.URL.Query().Get("tenant_id")); err != nil {
			writeAccountError(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
}
func writeAccountError(w http.ResponseWriter, err error) {
	var validationErrs validator.ValidationErrors
	switch {
	case errors.As(err, &validationErrs):
		details := make([]string, 0, len(validationErrs))
		for _, e := range validationErrs {
			details = append(details, e.Field()+": "+e.Tag())
		}
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: "validation failed", Details: details})
	case errors.Is(err, domain.ErrNotFound):
		writeJSON(w, http.StatusNotFound, errorResponse{Error: "account not found"})
	case errors.Is(err, domain.ErrConflict):
		writeJSON(w, http.StatusConflict, errorResponse{Error: "account conflict"})
	case errors.Is(err, errBadRequest):
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: "bad request"})
	default:
		writeJSON(w, http.StatusInternalServerError, errorResponse{Error: "internal error"})
	}
}
