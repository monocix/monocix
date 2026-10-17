package domain

import (
	"strings"
	"time"

	"github.com/go-playground/validator/v10"
)

// Validate is the shared validator for domain inputs.
// It extends go-playground/validator with a "notblank" rule that rejects
// whitespace-only strings (the built-in "required" lets them through).
var Validate = validator.New()

func init() {
	_ = Validate.RegisterValidation("notblank", func(fl validator.FieldLevel) bool {
		return strings.TrimSpace(fl.Field().String()) != ""
	})
}

// Tenant mirrors the tenant table.
type Tenant struct {
	ID        string     `validate:"required,uuid4"`
	Name      string     `validate:"required,notblank,max=255"`
	IsActive  bool       `validate:"-"`
	IsDelete  bool       `validate:"-"`
	CreateAt  time.Time  `validate:"-"`
	UpdateAt  time.Time  `validate:"-"`
}

// CreateTenantInput is the payload to create a tenant.
// IsActive defaults to true when omitted by the caller.
type CreateTenantInput struct {
	Name     string `validate:"required,notblank,max=255"`
	IsActive bool   `validate:"-"`
}

// UpdateTenantInput is the payload to update a tenant.
type UpdateTenantInput struct {
	ID       string `validate:"required,uuid4"`
	Name     string `validate:"required,notblank,max=255"`
	IsActive bool   `validate:"-"`
}
