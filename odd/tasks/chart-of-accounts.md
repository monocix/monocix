# Chart of accounts (full stack)

Objective: implementar un flujo completo `chart_of_accounts` (plan de cuentas) desde la API Go hasta la UI en `monocix-app`, espejando el patrón de `accounts`/`labels`. La tabla combina los campos de `accounts` con un `label_id` obligatorio (FK a `labels`), mostrando el label asociado en el listado y seleccionándolo con un combobox de shadcn en el formulario. Branch a crear: `feat/chart-of-accounts`. Delivery strategy: ask-on-risk.

## Specs

- S1: "Ahora de la misma manera que trabajamos para labels y accounts vamos a crear un flujo completo desde los endpoint del api hasta la ui en el app, para esto crearemos una table chart_of_accounts con los campos id -> uuid name -> varchar y label_id , y adiciona los demas campos de la tabla labels. para el fomulario para el label_id vas a usar un combobox de shadcn crea el odd para revisarlo antes de implementar" — alcance full-stack: `apps/monocix-api` (schema, queries sqlc, domain, handlers, transport, main) y `apps/monocix-app` (módulo `chart-of-account`, página, sidebar, tests).
- S2: Tabla `chart_of_accounts` con `id UUID PK`, `name VARCHAR(255) NOT NULL`, `is_active BOOLEAN NOT NULL DEFAULT TRUE`, `is_delete BOOLEAN NOT NULL DEFAULT FALSE`, `create_at/update_at TIMESTAMPTZ`, `tenant_id UUID NOT NULL FK → tenants(id)`, `label_id UUID NOT NULL FK → labels(id)`. Índice por `tenant_id` y por `label_id`. (Sin campo `description`: solo `id`, `name`, `label_id` + campos estándar/auditoría.)
- S3: Todo acceso (lecturas/escrituras) va scouteado por `tenant_id` (header `tenantId` en la API, patrón de account). Crear con `tenant_id` inexistente o `label_id` inexistente → violación de FK (23503) mapeada a `domain.ErrNotFound` (404), igual que accounts/labels.
- S4: La UI es en español (preferencia `i18n/ui-language`): títulos, botones, mensajes, toasts, etiquetas de campo ("Nombre", "Descripción", "Etiqueta", "Estado").
- S5: Listado muestra nombre de la cuenta, label asociado (nombre) y estado. Crear/editar con Dialog + react-hook-form + Zod; `label_id` se selecciona con un combobox de shadcn (basado en `Command` + `Popover`, a instalar si no existen) a partir de los labels del tenant cargados en la página. (Sin campo descripción.)
- S6: Contenedor `ChartOfAccountsContainer` (client component) recibe `tenantId`, `chartOfAccounts`, `labels` y `loadError` desde la page (server component), siguiendo `AccountsContainer`/`LabelsContainer`. Delete confirmado con `AlertDialog` + Sonner.
- S7: Navegación: entrada "Conceptos" en `app-sidebar` bajo el grupo "Datos de referencia", junto a "Etiquetas" y "Cuentas".
- S8: Checks aplicables sin cambios: Biome format, oxlint, `tsc --noEmit`, Next build, Vitest (unit). Go: `gofmt`, `go vet`, `go test` (unit; E2E opcionales). Las pruebas cubren dominio, repo HTTP (MSW), use cases, forms, contenedor y server actions; sin re-testear Zod/Radix/librerías (guía `pattern/frontend-testing-guideline`).

## Tasks

### Backend (Go)
- T1 (S2, S3): Schema — tabla `chart_of_accounts` + índices + FKs a `tenants` y `labels` en `db/schema/schema.sql` (y seed si aplica) — route: inline — status: done — evidence: implementation merged (PR #41); checks green.
- T2 (S2, S3): `chart_of_accounts.sql` — `FindAllChartOfAccounts :many`, `FindOneChartOfAccount :one`, `SaveChartOfAccount :exec`, `UpdateChartOfAccount :exec`, `DeleteChartOfAccount :exec`, scouteado por `tenant_id` y, en lecturas/updates por id, también por `tenant_id` — route: inline — status: done — evidence: implementation merged (PR #41); checks green.
- T3 (T1, T2): sqlc generate + verificación `go build ./...` — route: inline — status: done — evidence: implementation merged (PR #41); checks green.
- T4 (S2, S3): `domain` — `ChartOfAccount`, `CreateChartOfAccountInput`, `UpdateChartOfAccountInput` (tags de validación): `name` required max255, `labelId` required uuid4; sin description. Reusa `domain.ErrNotFound`/`ErrConflict` — route: inline — status: done — evidence: implementation merged (PR #41); checks green.
- T5 (S3, T4): `handlers` — `ChartOfAccountHandler` sobre interfaz `ChartOfAccountStore` + tests con fake — route: inline — status: done — evidence: implementation merged (PR #41); checks green.
- T6 (S2, S3, T4, T5): `transport` — rutas `GET/POST/GET/{id}/PUT/{id}/DELETE/{id} /chart-of-accounts` + tests httptest + `writeChartOfAccountError` — route: inline — status: done — evidence: implementation merged (PR #41); checks green.
- T7 (T4..T6): `main.go` — registrar `RegisterChartOfAccountRoutes` con el handler cableado al pool (`db.New(pool)`) — route: inline — status: done — evidence: implementation merged (PR #41); checks green.

### Frontend (monocix-app)
- T8 (S4, S5, S8): Instalar/crear componentes shadcn `command` + `popover` (si no existen) en `components/ui` para el combobox — route: inline — status: done — evidence: implementation merged (PR #41); checks green.
- T9 (S4, S5): Módulo `lib/references/chart-of-account`:
  - `domain/chart-of-account.ts` (`ChartOfAccount`, `CreateChartOfAccountInput`, `UpdateChartOfAccountInput`, `ChartOfAccountNotFoundError`).
  - `domain/chart-of-account-schema.ts` (`createChartOfAccountSchema`: name required max255, labelId required uuid4; `editChartOfAccountSchema` suma isActive). Sin description.
  - `ports/chart-of-account-repository.ts`.
  - `container.ts` (`createChartOfAccountRepository`).
  - `infrastructure/http/chart-of-account-http.repository.ts` (GET/POST/PUT/DELETE, header `tenantId`, mapeo incluyendo `label` nombre o id).
  - `application/*`: `get-chart-of-accounts`, `create-chart-of-account`, `update-chart-of-account`, `delete-chart-of-account`.
  - `presentation`: `chart-of-account-list.tsx` (tabla: Nombre, Etiqueta, Estado, Acciones), `create-chart-of-account-form.tsx` (combobox de labels, sin descripción), `edit-chart-of-account-form.tsx` (combobox + Switch activo), `chart-of-accounts-container.tsx`.
  - (Los tests de schema no se añaden por la guía `pattern/frontend-testing-guideline`.)
  — route: delegated — status: done — evidence: implementation merged (PR #41); checks green.
- T10 (S3, S5, S6): Ruta `app/(protected)/[slug]/chart-of-accounts/page.tsx` (server component): resolver tenant, cargar accounts y labels, pasarlos al container, manejar `loadError`; + `loading.tsx` skeleton — route: inline — status: done — evidence: implementation merged (PR #41); checks green.
- T11 (S7): Sidebar: entrada "Conceptos" en el grupo "Datos de referencia" (collapsible) — route: inline — status: done — evidence: implementation merged (PR #41); checks green.
- T12 (S5, S4): Server actions `create-chart-of-account`, `update-chart-of-account`, `delete-chart-of-account` (validación + mapeo de errores, generando `id` en el cliente) — route: inline — status: done — evidence: implementation merged (PR #41); checks green.

### Tests y checks
- T13 (S8): Tests (forms, contenedor, repo HTTP MSW, server actions y use cases clave) siguiendo la guía anti-sobre-ingeniería — route: delegated — status: done — evidence: implementation merged (PR #41); checks green.
- T14 (S8): Checks en verde — Biome format, oxlint, `tsc --noEmit`, Next build, Vitest; Go: gofmt + go vet + go test — route: inline — status: done — evidence: implementation merged (PR #41); checks green.

## Log

- L1 (2026-10-19): "Ahora de la misma manera que trabajamos para labels y accounts vamos a crear un flujo completo desde los endpoint del api hasta la ui en el app, para esto crearemos una table chart_of_accounts con los campos id -> uuid name -> varchar y label_id , y adiciona los demas campos de la tabla labels. para el fomulario para el label_id vas a usar un combobox de shadcn crea el odd para revisarlo antes de implementar".
- L2 (2026-10-19): Ajuste: el campo `description` no va; solo `id`, `name`, `label_id` + campos estándar/auditoría."
- L3 (2026-10-19): Implementación completa (backend + frontend + sidebar) mergeada en main (PR #41). Checks en verde.
