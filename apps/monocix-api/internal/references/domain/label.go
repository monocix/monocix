package domain

import "time"

// Label mirrors the label table. Every access is scoped by TenantID.
type Label struct {
	ID       string    `validate:"required,uuid4"`
	Name     string    `validate:"required,notblank,max=255"`
	TenantID string    `validate:"required,uuid4"`
	IsActive bool      `validate:"-"`
	IsDelete bool      `validate:"-"`
	CreateAt time.Time `validate:"-"`
	UpdateAt time.Time `validate:"-"`
}

// CreateLabelInput is the payload to create a label.
type CreateLabelInput struct {
	ID       string `validate:"required,uuid4"`
	Name     string `validate:"required,notblank,max=255"`
	TenantID string `validate:"required,uuid4"`
	IsActive bool   `validate:"-"`
}

// UpdateLabelInput is the payload to update a label.
type UpdateLabelInput struct {
	ID       string `validate:"required,uuid4"`
	Name     string `validate:"required,notblank,max=255"`
	TenantID string `validate:"required,uuid4"`
	IsActive bool   `validate:"-"`
}
