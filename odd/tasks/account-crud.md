# Account CRUD

Objective: CRUD de account espejando label (incluye `description`). Branch: implementación inline en la sesión actual. Delivery strategy: ask-on-risk. Test runner: go test ./... (e2e con testcontainers).

## Specs

- S1: "nuevo crud para accounts" — alcance: `domain` (Account, CreateAccountInput, UpdateAccountInput), `handlers` (casos de uso sobre la capa db con tenant scoping), `transport` (rutas `/accounts`) y `main.go` ya cablea pool.
- S2: Todo acceso va scouteado por `tenant_id`: CreateAccountInput exige tenant_id uuid4; FindOne/Update/Delete exigen id + tenant_id.
- S3: Crear un account con tenant inexistente viola la FK (23503) y se mapea a `domain.ErrNotFound` (404).
- S4: Campo adicional `description` (TEXT, default '') incluido en Create/Update/List/Get.

## Tasks

- T1 (S1, S4): `domain` — Account + validación (incluye description max=2000) — status: done — evidence: go test ok.
- T2 (S1, S2, S3): `handlers` — AccountHandler sobre interfaz AccountStore + tests con fake (incluye tenant FK) — status: done — evidence: go test ok.
- T3 (S1, S2): `transport` — rutas `/accounts` + tests httptest — status: done — evidence: suite en verde.
- T4 (S1, S2, S3, S4): e2e de account (crea tenant primero; prueba soft-delete y description) — status: done — evidence: `TestAccountE2E` PASS contra Postgres real.

## Log

- L1 (2026-10-17): Solicitud del usuario: crear CRUD completo para account con mismos campos que label más columna description.
- L2 (2026-10-17): Implementación basada en el patrón de label: `db/queries/account.sql`, sqlc generado, domain, handlers, transport, wiring y tests.
- L3 (2026-10-17): Validado con `go build/vet/test -short` y e2e `TestAccountE2E` en colima (PASS).
