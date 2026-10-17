package domain

import "errors"

// ErrNotFound is returned when a tenant does not exist (or is soft-deleted).
var ErrNotFound = errors.New("tenant not found")

// ErrConflict is returned when a tenant violates a uniqueness constraint
// (e.g. duplicate slug).
var ErrConflict = errors.New("tenant conflict")
