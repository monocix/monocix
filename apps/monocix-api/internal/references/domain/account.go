package domain

import "time"

// Account mirrors the account table. Every access is scoped by TenantID.
type Account struct {
	ID          string    `validate:"required,uuid4"`
	Name        string    `validate:"required,notblank,max=255"`
	Description string    `validate:"max=2000"`
	TenantID    string    `validate:"required,uuid4"`
	IsActive    bool      `validate:"-"`
	IsDelete    bool      `validate:"-"`
	CreateAt    time.Time `validate:"-"`
	UpdateAt    time.Time `validate:"-"`
}

// CreateAccountInput is the payload to create an account.
type CreateAccountInput struct {
	ID          string `validate:"required,uuid4"`
	Name        string `validate:"required,notblank,max=255"`
	Description string `validate:"max=2000"`
	TenantID    string `validate:"required,uuid4"`
	IsActive    bool   `validate:"-"`
}

// UpdateAccountInput is the payload to update an account.
type UpdateAccountInput struct {
	ID          string `validate:"required,uuid4"`
	Name        string `validate:"required,notblank,max=255"`
	Description string `validate:"max=2000"`
	TenantID    string `validate:"required,uuid4"`
	IsActive    bool   `validate:"-"`
}
