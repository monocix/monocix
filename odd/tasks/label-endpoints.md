# Label endpoints

Objective: endpoints CRUD de label espejando tenant. Branch: feature/label-endpoints (base: feature/label-table). Delivery strategy: ask-on-risk. Test runner: go test ./... (e2e con testcontainers).

## Specs

- S1: "la implementacion de los endpoint al igual que hiciste con tenant" — alcance: `domain` (modelos + validación), `handlers` (casos de uso sobre la capa db) y `transport` (rutas HTTP + `main.go` ya cablea pool) para label en `apps/monocix-api/internal/references/`.
- S2: Todo acceso va scouteado por `tenant_id`: el tenant llega por query/body según la ruta; `CreateLabelInput` exige `tenant_id` uuid4.
- S3: Crear un label con tenant inexistente viola la FK (`23503`) y se mapea a `domain.ErrNotFound` (404), igual que un id inexistente.

## Tasks

- T1 (S1, S2): `domain` — Label, CreateLabelInput, UpdateLabelInput + tests — route: inline — status: done — commit: 3dc8e0d — evidence: RED → GREEN, go test ok.
- T2 (S1, S2, S3): `handlers` — LabelHandler sobre interfaz LabelStore + tests con fake — route: inline — status: done — commit: 40d48ab — evidence: RED → GREEN (fake reproduce 23503 y ErrNoRows).
- T3 (S1, S2): `transport` — rutas `/labels` + tests httptest — route: inline — status: done — commit: ae93b85 — evidence: RED → GREEN; `main.go` registra label routes.
- T4 (S1, S2, S3): e2e de label (crea tenant primero por la FK; prueba soft-delete) — route: inline — status: done — commit: f4b5bc9 — evidence: `TestLabelE2E` PASS contra Postgres real; suite completa + vet en verde.

## Log

- L1 (2026-10-15): "Ahora en otro PR y rama vas a hacer la implementacion de los endpoint al igual que hiciste con tenant".
- L2 (2026-10-15): Rama `feature/label-endpoints` sobre `feature/label-table`. Rutas planas `/labels` espejando tenant (tenant_id por query en lecturas/delete, por body en escrituras). El e2e falló primero solo por el socket de colima ausente en el shell, no por el código.
