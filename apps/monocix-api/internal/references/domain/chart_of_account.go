package domain

import "time"

// ChartOfAccount mirrors the chart_of_accounts table. Every access is scoped by TenantID.
type ChartOfAccount struct {
	ID       string    `validate:"required,uuid4"`
	Name     string    `validate:"required,notblank,max=255"`
	IsActive bool      `validate:"-"`
	IsDelete bool      `validate:"-"`
	CreateAt time.Time `validate:"-"`
	UpdateAt time.Time `validate:"-"`
	TenantID string    `validate:"required,uuid4"`
	LabelID  string    `validate:"required,uuid4"`
}

// CreateChartOfAccountInput is the payload to create a chart of account.
type CreateChartOfAccountInput struct {
	ID       string `validate:"required,uuid4"`
	Name     string `validate:"required,notblank,max=255"`
	TenantID string `validate:"required,uuid4"`
	LabelID  string `validate:"required,uuid4"`
	IsActive bool   `validate:"-"`
}

// UpdateChartOfAccountInput is the payload to update a chart of account.
type UpdateChartOfAccountInput struct {
	ID       string `validate:"required,uuid4"`
	Name     string `validate:"required,notblank,max=255"`
	TenantID string `validate:"required,uuid4"`
	LabelID  string `validate:"required,uuid4"`
	IsActive bool   `validate:"-"`
}
