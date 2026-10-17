package domain

import (
	"strings"
	"testing"
)

const testTenantID = "550e8400-e29b-41d4-a716-446655440000"

func TestCreateLabelInput_Validation(t *testing.T) {
	tests := []struct {
		name    string
		input   CreateLabelInput
		wantErr bool
	}{
		{name: "valid", input: CreateLabelInput{ID: "123e4567-e89b-42d3-a456-426614174000", Name: "VIP", TenantID: testTenantID}, wantErr: false},
		{name: "empty name", input: CreateLabelInput{ID: "123e4567-e89b-42d3-a456-426614174000", Name: "", TenantID: testTenantID}, wantErr: true},
		{name: "blank name", input: CreateLabelInput{ID: "123e4567-e89b-42d3-a456-426614174000", Name: "   ", TenantID: testTenantID}, wantErr: true},
		{name: "name too long", input: CreateLabelInput{ID: "123e4567-e89b-42d3-a456-426614174000", Name: strings.Repeat("a", 256), TenantID: testTenantID}, wantErr: true},
		{name: "bad tenant id", input: CreateLabelInput{ID: "123e4567-e89b-42d3-a456-426614174000", Name: "VIP", TenantID: "not-a-uuid"}, wantErr: true},
		{name: "empty tenant id", input: CreateLabelInput{Name: "VIP"}, wantErr: true},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := Validate.Struct(tt.input)
			if (err != nil) != tt.wantErr {
				t.Fatalf("validate.Struct() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}

func TestUpdateLabelInput_Validation(t *testing.T) {
	tests := []struct {
		name    string
		input   UpdateLabelInput
		wantErr bool
	}{
		{
			name:    "valid",
			input:   UpdateLabelInput{ID: "123e4567-e89b-42d3-a456-426614174001", Name: "VIP", TenantID: testTenantID},
			wantErr: false,
		},
		{
			name:    "bad id",
			input:   UpdateLabelInput{ID: "nope", Name: "VIP", TenantID: testTenantID},
			wantErr: true,
		},
		{
			name:    "bad tenant id",
			input:   UpdateLabelInput{ID: "123e4567-e89b-42d3-a456-426614174001", Name: "VIP", TenantID: "nope"},
			wantErr: true,
		},
		{
			name:    "empty name",
			input:   UpdateLabelInput{ID: "123e4567-e89b-42d3-a456-426614174001", Name: "", TenantID: testTenantID},
			wantErr: true,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			err := Validate.Struct(tt.input)
			if (err != nil) != tt.wantErr {
				t.Fatalf("validate.Struct() error = %v, wantErr %v", err, tt.wantErr)
			}
		})
	}
}
