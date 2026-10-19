# Front-supplied IDs en create

Objective: cambiar endpoints de creación (`POST`) de tenants, labels y accounts para que el `id` lo envíe el frontend, validándolo y persistiéndolo directamente. Branch pendiente: `feat/front-supplied-ids` (a crear). Delivery strategy: ask-on-risk. Test runner: go test ./... (e2e con testcontainers).

## Specs

- S1: Alcance: domain (`Create*Input`), handlers (`Create`), transport (`POST` routes) y tests para tenants, labels y accounts en `apps/monocix-api/`; sin cambios en Update/Delete/List/Get más allá de usar el ID provisto.
- S2: El frontend envía `id` (UUID v4) en el body de creación (`{"id":"...", ...}`). El backend valida que sea `required,uuid4` antes de persistir.
- S3: El handler deja de generar `uuid.NewRandom()` automáticamente y usa el `id` validado para `Save*`, manteniendo el chequeo de FK (tenant inexistente → 404 en label/account).
- S4: IDs duplicados se traducen desde la unique violation del PK (`23505`) a error de conflicto (`domain.ErrConflict`) y HTTP `409`.
- S5: Compatibilidad: en create, `id` se vuelve requerido (el cliente siempre lo provee). Si no se envía o no es UUID válido → 400 (validación).
- S6: Tests actualizados (unit con fake store + e2e) para validar creación con ID propio y conflicto por ID duplicado.

## Tasks

- T1 (S2, S5): `domain` — `ID` agregado a `CreateTenantInput`, `CreateLabelInput`, `CreateAccountInput` (validación required,uuid4) — status: done — evidence: código en main, go test ok.
- T2 (S3): `handlers` — `Create` usa `input.ID` y mapea unique violation → `ErrConflict` (tenants, labels, accounts) — status: done — evidence: código en main, go test ok.
- T3 (S2, S4): `transport` — request bodies aceptan `id` y lo pasan al handler (tenants, labels, accounts) — status: done — evidence: código en main, go test ok.
- T4 (S6): tests — unit + `TestTenantE2E`/`TestLabelE2E`/`TestAccountE2E` con ID propio y caso de ID duplicado (409) — status: done — evidence: go test ./... ok (incluye e2e contra Postgres real).

Nota: feature mergeado en main vía PR #13 (2026-10-17). ODD doc actualizado retroactivamente.

## Riesgos / decisiones a revisar

- R1: El cliente es ahora responsable de generar IDs válidos; si se envían IDs mal formados se responde 400. Se puede documentar generación con `crypto.randomUUID()` en frontend.
- R2: Se deja la política de autenticación/protección de IDs para más adelante (aún no se protegen endpoints).
- R3: No se genera ID por defecto en servidor; esto rompe compatibilidad con callers actuales que no envían `id`.

## Log

- L1 (2026-10-17): Solicitud del usuario: cambiar endpoints de registro para que el ID lo pase el frontend. Se desglosa en ODD sin implementar.
