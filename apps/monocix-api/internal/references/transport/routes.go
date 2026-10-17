// Package transport exposes the tenant handlers over HTTP with the
// standard library mux. It maps domain errors to status codes and owns
// the JSON shapes, keeping handlers transport-agnostic.
package transport

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-playground/validator/v10"

	"monocix-api/internal/references/domain"
	"monocix-api/internal/references/handlers"
)

// tenantResponse is the JSON shape of a tenant.
type tenantResponse struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	IsActive bool   `json:"is_active"`
}

func toResponse(t domain.Tenant) tenantResponse {
	return tenantResponse{ID: t.ID, Name: t.Name, Slug: t.Slug, IsActive: t.IsActive}
}

// createTenantRequest decouples the JSON body from the domain input so an
// omitted is_active defaults to true instead of Go's false zero value.
type createTenantRequest struct {
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	IsActive *bool  `json:"is_active"`
}

func (r createTenantRequest) toInput() domain.CreateTenantInput {
	active := true
	if r.IsActive != nil {
		active = *r.IsActive
	}
	return domain.CreateTenantInput{Name: r.Name, Slug: r.Slug, IsActive: active}
}

type updateTenantRequest struct {
	Name     string `json:"name"`
	Slug     string `json:"slug"`
	IsActive bool   `json:"is_active"`
}

// RegisterTenantRoutes wires the tenant CRUD endpoints into mux.
func RegisterTenantRoutes(mux *http.ServeMux, h *handlers.TenantHandler) {
	mux.HandleFunc("GET /tenants", func(w http.ResponseWriter, r *http.Request) {
		items, err := h.List(r.Context())
		if err != nil {
			writeError(w, err)
			return
		}
		out := make([]tenantResponse, 0, len(items))
		for _, t := range items {
			out = append(out, toResponse(t))
		}
		writeJSON(w, http.StatusOK, out)
	})

	mux.HandleFunc("POST /tenants", func(w http.ResponseWriter, r *http.Request) {
		var req createTenantRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, errors.Join(errBadRequest, err))
			return
		}
		created, err := h.Create(r.Context(), req.toInput())
		if err != nil {
			writeError(w, err)
			return
		}
		writeJSON(w, http.StatusCreated, toResponse(created))
	})

	mux.HandleFunc("GET /tenants/{id}", func(w http.ResponseWriter, r *http.Request) {
		got, err := h.Get(r.Context(), r.PathValue("id"))
		if err != nil {
			writeError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, toResponse(got))
	})

	mux.HandleFunc("PUT /tenants/{id}", func(w http.ResponseWriter, r *http.Request) {
		var req updateTenantRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, errors.Join(errBadRequest, err))
			return
		}
		updated, err := h.Update(r.Context(), domain.UpdateTenantInput{
			ID:       r.PathValue("id"),
			Name:     req.Name,
			Slug:     req.Slug,
			IsActive: req.IsActive,
		})
		if err != nil {
			writeError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, toResponse(updated))
	})

	mux.HandleFunc("DELETE /tenants/{id}", func(w http.ResponseWriter, r *http.Request) {
		if err := h.Delete(r.Context(), r.PathValue("id")); err != nil {
			writeError(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
}

func writeJSON(w http.ResponseWriter, status int, v any) {
	w.Header().Set("Content-Type", "application/json; charset=utf-8")
	w.WriteHeader(status)
	_ = json.NewEncoder(w).Encode(v)
}

// errorResponse is the JSON shape of API errors.
type errorResponse struct {
	Error   string   `json:"error"`
	Details []string `json:"details,omitempty"`
}

func writeError(w http.ResponseWriter, err error) {
	var validationErrs validator.ValidationErrors
	switch {
	case errors.As(err, &validationErrs):
		details := make([]string, 0, len(validationErrs))
		for _, e := range validationErrs {
			details = append(details, e.Field()+": "+e.Tag())
		}
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: "validation failed", Details: details})
	case errors.Is(err, domain.ErrConflict):
		writeJSON(w, http.StatusConflict, errorResponse{Error: "tenant slug already exists"})
	case errors.Is(err, domain.ErrNotFound):
		writeJSON(w, http.StatusNotFound, errorResponse{Error: "tenant not found"})
	case errors.Is(err, errBadRequest):
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: "bad request"})
	default:
		writeJSON(w, http.StatusInternalServerError, errorResponse{Error: "internal error"})
	}
}

// errBadRequest marks malformed JSON bodies.
var errBadRequest = errors.New("bad request")
