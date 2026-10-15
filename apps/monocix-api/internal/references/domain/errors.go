package domain

import "errors"

// ErrNotFound is returned when a tenant does not exist (or is soft-deleted).
var ErrNotFound = errors.New("tenant not found")
