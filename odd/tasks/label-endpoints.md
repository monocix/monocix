# Label endpoints

Objective: endpoints CRUD de label espejando tenant. Branch: feature/label-endpoints (base: feature/label-table). Delivery strategy: ask-on-risk. Test runner: go test ./... (e2e con testcontainers).

## Specs

- S1: "la implementacion de los endpoint al igual que hiciste con tenant" — alcance: `domain` (modelos + validación), `handlers` (casos de uso sobre la capa db) y `transport` (rutas HTTP + `main.go` ya cablea pool) para label en `apps/monocix-api/internal/references/`.
- S2: Todo acceso va scouteado por `tenant_id`: el tenant llega por query/body según la ruta; `CreateLabelInput` exige `tenant_id` uuid4.
- S3: Crear un label con tenant inexistente viola la FK (`23503`) y se mapea a `domain.ErrNotFound` (404), igual que un id inexistente.

## Tasks

- T1 (S1, S2): `domain` — Label, CreateLabelInput, UpdateLabelInput + tests — route: inline — status: pending — commit: -.
- T2 (S1, S2, S3): `handlers` — LabelHandler sobre interfaz LabelStore + tests con fake — route: inline — status: pending — commit: -.
- T3 (S1, S2): `transport` — rutas `/labels` + tests httptest — route: inline — status: pending — commit: -.
- T4 (S1, S2, S3): e2e de label (crea tenant primero por la FK; prueba soft-delete) — route: inline — status: pending — commit: -.

## Log

- L1 (2026-10-15): "Ahora en otro PR y rama vas a hacer la implementacion de los endpoint al igual que hiciste con tenant".
