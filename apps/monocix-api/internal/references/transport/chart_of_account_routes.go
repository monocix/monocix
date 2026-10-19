// Chart of account routes expose the chart_of_account handlers over HTTP.
package transport

import (
	"encoding/json"
	"errors"
	"net/http"

	"github.com/go-playground/validator/v10"

	"monocix-api/internal/references/domain"
	"monocix-api/internal/references/handlers"
)

// chartOfAccountResponse is the JSON shape of a chart of account.
type chartOfAccountResponse struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	IsActive bool   `json:"is_active"`
	LabelID  string `json:"label_id"`
}

func toChartOfAccountResponse(c domain.ChartOfAccount) chartOfAccountResponse {
	return chartOfAccountResponse{ID: c.ID, Name: c.Name, IsActive: c.IsActive, LabelID: c.LabelID}
}

type createChartOfAccountRequest struct {
	ID       string `json:"id"`
	Name     string `json:"name"`
	LabelID  string `json:"label_id"`
	IsActive *bool  `json:"is_active"`
}

func (r createChartOfAccountRequest) toInput(tenantID string) domain.CreateChartOfAccountInput {
	active := true
	if r.IsActive != nil {
		active = *r.IsActive
	}
	return domain.CreateChartOfAccountInput{ID: r.ID, Name: r.Name, TenantID: tenantID, LabelID: r.LabelID, IsActive: active}
}

type updateChartOfAccountRequest struct {
	Name     string `json:"name"`
	LabelID  string `json:"label_id"`
	IsActive bool   `json:"is_active"`
}

// RegisterChartOfAccountRoutes wires the chart_of_account CRUD endpoints into mux.
func RegisterChartOfAccountRoutes(mux *http.ServeMux, h *handlers.ChartOfAccountHandler) {
	mux.HandleFunc("GET /chart-of-accounts", func(w http.ResponseWriter, r *http.Request) {
		tenantID := r.Header.Get("tenantId")
		if err := domain.Validate.Var(tenantID, "required,uuid4"); err != nil {
			writeChartOfAccountError(w, errors.Join(errBadRequest, err))
			return
		}
		items, err := h.List(r.Context(), tenantID)
		if err != nil {
			writeChartOfAccountError(w, err)
			return
		}
		out := make([]chartOfAccountResponse, 0, len(items))
		for _, c := range items {
			out = append(out, toChartOfAccountResponse(c))
		}
		writeJSON(w, http.StatusOK, out)
	})

	mux.HandleFunc("POST /chart-of-accounts", func(w http.ResponseWriter, r *http.Request) {
		var req createChartOfAccountRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeChartOfAccountError(w, errors.Join(errBadRequest, err))
			return
		}
		tenantID := r.Header.Get("tenantId")
		if err := domain.Validate.Var(tenantID, "required,uuid4"); err != nil {
			writeChartOfAccountError(w, errors.Join(errBadRequest, err))
			return
		}
		created, err := h.Create(r.Context(), req.toInput(tenantID))
		if err != nil {
			writeChartOfAccountError(w, err)
			return
		}
		writeJSON(w, http.StatusCreated, toChartOfAccountResponse(created))
	})

	mux.HandleFunc("GET /chart-of-accounts/{id}", func(w http.ResponseWriter, r *http.Request) {
		tenantID := r.Header.Get("tenantId")
		if err := domain.Validate.Var(tenantID, "required,uuid4"); err != nil {
			writeChartOfAccountError(w, errors.Join(errBadRequest, err))
			return
		}
		got, err := h.Get(r.Context(), r.PathValue("id"), tenantID)
		if err != nil {
			writeChartOfAccountError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, toChartOfAccountResponse(got))
	})

	mux.HandleFunc("PUT /chart-of-accounts/{id}", func(w http.ResponseWriter, r *http.Request) {
		var req updateChartOfAccountRequest
		if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
			writeChartOfAccountError(w, errors.Join(errBadRequest, err))
			return
		}
		tenantID := r.Header.Get("tenantId")
		if err := domain.Validate.Var(tenantID, "required,uuid4"); err != nil {
			writeChartOfAccountError(w, errors.Join(errBadRequest, err))
			return
		}
		updated, err := h.Update(r.Context(), domain.UpdateChartOfAccountInput{
			ID:       r.PathValue("id"),
			Name:     req.Name,
			TenantID: tenantID,
			LabelID:  req.LabelID,
			IsActive: req.IsActive,
		})
		if err != nil {
			writeChartOfAccountError(w, err)
			return
		}
		writeJSON(w, http.StatusOK, toChartOfAccountResponse(updated))
	})

	mux.HandleFunc("DELETE /chart-of-accounts/{id}", func(w http.ResponseWriter, r *http.Request) {
		tenantID := r.Header.Get("tenantId")
		if err := domain.Validate.Var(tenantID, "required,uuid4"); err != nil {
			writeChartOfAccountError(w, errors.Join(errBadRequest, err))
			return
		}
		if err := h.Delete(r.Context(), r.PathValue("id"), tenantID); err != nil {
			writeChartOfAccountError(w, err)
			return
		}
		w.WriteHeader(http.StatusNoContent)
	})
}

func writeChartOfAccountError(w http.ResponseWriter, err error) {
	var validationErrs validator.ValidationErrors
	switch {
	case errors.As(err, &validationErrs):
		details := make([]string, 0, len(validationErrs))
		for _, e := range validationErrs {
			details = append(details, e.Field()+": "+e.Tag())
		}
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: "validation failed", Details: details})
	case errors.Is(err, domain.ErrNotFound):
		writeJSON(w, http.StatusNotFound, errorResponse{Error: "chart of account not found"})
	case errors.Is(err, domain.ErrConflict):
		writeJSON(w, http.StatusConflict, errorResponse{Error: "chart of account conflict"})
	case errors.Is(err, errBadRequest):
		writeJSON(w, http.StatusBadRequest, errorResponse{Error: "bad request"})
	default:
		writeJSON(w, http.StatusInternalServerError, errorResponse{Error: "internal error"})
	}
}
