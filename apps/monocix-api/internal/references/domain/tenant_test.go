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
		{name: "valid", input: CreateTenantInput{Name: "Acme", IsActive: true}, wantErr: false},
		{name: "empty name", input: CreateTenantInput{Name: ""}, wantErr: true},
		{name: "blank name", input: CreateTenantInput{Name: "   "}, wantErr: true},
		{name: "name too long", input: CreateTenantInput{Name: strings.Repeat("a", 256)}, wantErr: true},
		{name: "name max length", input: CreateTenantInput{Name: strings.Repeat("a", 255)}, wantErr: false},
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
			input:   UpdateTenantInput{ID: "550e8400-e29b-41d4-a716-446655440000", Name: "Acme"},
			wantErr: false,
		},
		{
			name:    "bad uuid",
			input:   UpdateTenantInput{ID: "not-a-uuid", Name: "Acme"},
			wantErr: true,
		},
		{
			name:    "empty name",
			input:   UpdateTenantInput{ID: "550e8400-e29b-41d4-a716-446655440000", Name: ""},
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
