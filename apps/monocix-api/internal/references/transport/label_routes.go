// Label routes expose the label handlers over HTTP. Reads scope by the
// tenant_id query param; writes carry tenant_id in the JSON body.
package transport

import (
	"encoding/json"
	"errors"
	"net/http"

	"monocix-api/internal/references/domain"
	"monocix-api/internal/references/handlers"
)

// labelResponse is the JSON shape of a label.
type labelResponse struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	TenantID string `json:"tenant_id"`
	IsActive bool   `json:"is_active"`
}

func toLabelResponse(l domain.Label) labelResponse {
	return labelResponse{ID: l.ID, Name: l.Name, TenantID: l.TenantID, IsActive: l.IsActive}
}

type createLabelRequest struct {
	Name     string `json:"name"`
	TenantID string `json:"tenant_id"`
	IsActive *bool  `json:"is_active"`
}

func (r createLabelRequest) toInput() domain.CreateLabelInput {
	active := true
	if r.IsActive != nil {
		active = *r.IsActive
	}
	return domain.CreateLabelInput{Name: r.Name, TenantID: r.TenantID, IsActive: active}
}

type updateLabelRequest struct {
	Name     string `json:"name"`
	TenantID string `json:"tenant_id"`
	IsActive bool   `json:"is_active"`
}

// RegisterLabelRoutes wires the label CRUD endpoints into mux.
func RegisterLabelRoutes(mux *http.ServeMux, h *handlers.LabelHandler) {
	mux.HandleFunc("GET /labels", func(w http.ResponseWriter, r *http.Request) {
		items, err := h.List(r.Context(), r.URL.Query().Get("tenant_id"))
		if err != nil {
			writeError(w, err)
			return
		}
		out := make([]labelResponse, 0, len(items))
		for _, l := range items {
			out = append(out, toLabelResponse(l))
		}
		writeJSON(w, http.StatusOK, out)
	})

	mux.HandleFunc("POST /labels", func(w http.ResponseWriter, r *http.Request) {
		var req createLabelRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, errors.Join(errBadRequest, err))
			return
		}
		created, err := h.Create(r.Context(), req.toInput())
		if err != nil {
			writeError(w, err)
			return
		}
		writeJSON(w, http.StatusCreated, toLabelResponse(created))
	})

	mux.HandleFunc("GET /labels/{id}", func(w http.ResponseWriter, r *http.Request) {
		got, err := h.Get(r.Context(), r.PathValue("id"), r.URL.Query().Get("tenant_id"))
		if err != nil {
			writeError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, toLabelResponse(got))
	})

	mux.HandleFunc("PUT /labels/{id}", func(w http.ResponseWriter, r *http.Request) {
		var req updateLabelRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeError(w, errors.Join(errBadRequest, err))
			return
		}
		updated, err := h.Update(r.Context(), domain.UpdateLabelInput{
			ID:       r.PathValue("id"),
			Name:     req.Name,
			TenantID: req.TenantID,
			IsActive: req.IsActive,
		})
		if err != nil {
			writeError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, toLabelResponse(updated))
	})

	mux.HandleFunc("DELETE /labels/{id}", func(w http.ResponseWriter, r *http.Request) {
		if err := h.Delete(r.Context(), r.PathValue("id"), r.URL.Query().Get("tenant_id")); err != nil {
			writeError(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
}
