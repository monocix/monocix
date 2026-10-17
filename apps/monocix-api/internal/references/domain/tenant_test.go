package domain

import (
	"strings"
	"testing"
)

func TestCreateTenantInput_Validation(t *testing.T) {
	validate := Validate

	tests := []struct {
		name    string
		input   CreateTenantInput
		wantErr bool
	}{
		{name: "valid", input: CreateTenantInput{ID: "550e8400-e29b-41d4-a716-446655440000", Name: "Acme", Slug: "acme", IsActive: true}, wantErr: false},
		{name: "empty name", input: CreateTenantInput{ID: "550e8400-e29b-41d4-a716-446655440000", Name: "", Slug: "acme"}, wantErr: true},
		{name: "blank name", input: CreateTenantInput{ID: "550e8400-e29b-41d4-a716-446655440000", Name: "   ", Slug: "acme"}, wantErr: true},
		{name: "name too long", input: CreateTenantInput{ID: "550e8400-e29b-41d4-a716-446655440000", Name: strings.Repeat("a", 256), Slug: "acme"}, wantErr: true},
		{name: "name max length", input: CreateTenantInput{ID: "550e8400-e29b-41d4-a716-446655440000", Name: strings.Repeat("a", 255), Slug: "acme"}, wantErr: false},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validate.Struct(tt.input)
			if (err != nil) != tt.wantErr {
				t.Fatalf("validate.Struct() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestUpdateTenantInput_Validation(t *testing.T) {
	validate := Validate

	tests := []struct {
		name    string
		input   UpdateTenantInput
		wantErr bool
	}{
		{
			name:    "valid",
			input:   UpdateTenantInput{ID: "550e8400-e29b-41d4-a716-446655440000", Name: "Acme", Slug: "acme"},
			wantErr: false,
		},
		{
			name:    "bad uuid",
			input:   UpdateTenantInput{ID: "not-a-uuid", Name: "Acme", Slug: "acme"},
			wantErr: true,
		},
		{
			name:    "empty name",
			input:   UpdateTenantInput{ID: "550e8400-e29b-41d4-a716-446655440000", Name: "", Slug: "acme"},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := validate.Struct(tt.input)
			if (err != nil) != tt.wantErr {
				t.Fatalf("validate.Struct() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
