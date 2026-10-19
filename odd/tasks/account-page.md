# Account page (frontend)

Objective: implementar la página de accounts en `apps/monocix-app` espejando el patrón de labels: carga por tenant, listado, creación, edición y eliminación (soft-delete vía API), siguiendo container/presentational. Branch a crear: `feat/account-page`. Delivery strategy: ask-on-risk. Test runner: pnpm (Vitest + Playwright).

## Specs

- S1: "analiza el flujo y todo los implementado en labels/page.tsx y crees un doc odd para hacer la implementacion para accounts" — alcance: `apps/monocix-app` (rutas, componentes, módulo `lib/references/account/*`, server actions), espejando el módulo `label` y la página de labels. Sin cambios en la API ni en el scoping por tenant.
- S2: Toda la interfaz en español (preferencia `i18n/ui-language`): títulos, botones, mensajes, toasts y etiquetas de campos, incluida la descripción ("Descripción").
- S3: El tenant se resuelve por slug con `getTenantBySlug` y `notFound()` si no existe, idéntico a labels. La lista viene de `GET /accounts` scouteada por header `tenantId`.
- S4: Campos del account: `name` (requerido, máx 255), `description` (opcional, máx 2000) y `isActive`. El create genera el `id` en el cliente; el backend valida uuid4 y mapea 23505 → 409 (`ErrConflict`).
- S5: El contenedor (`AccountsContainer`) es client component y recibe `tenantId`, `accounts` y `loadError` desde la page (server component), idéntico a `LabelsContainer`. Errores de carga se muestran sin romper la página.
- S6: Eliminación confirmada con `AlertDialog` de shadcn y notificación Sonner, idéntico a labels. Creación/edición con formularios react-hook-form + Zod.
- S7: Navegación: agregar entrada "Cuentas" en `app-sidebar` (NavLink) apuntando a `/[slug]/accounts`, idéntico a "Etiquetas".
- S8: Checks aplicables: Biome format, oxlint, Next build, TypeScript (`tsc --noEmit`) y Vitest (unit). Los tests deben cubrir schemas, forms, contenedor, repositorio HTTP (MSW) y server actions; no re-testear librerías (Zod/Radix).

## Tasks

- T1 (S1, S4): `domain` — `Account`, `CreateAccountInput`, `UpdateAccountInput`, `AccountNotFoundError` + schemas Zod (`createAccountSchema`: name required max 255; description max 2000; `editAccountSchema` suma isActive) — route: inline — status: done — evidence: implementation + checks green (format/lint/tsc/build/vitest).
- T2 (S1, S4): `ports` + `infrastructure` — `AccountRepository` (findAll/create/update/remove) y `HttpAccountRepository` (GET/POST/PUT/DELETE `/accounts`, header `tenantId`, mapeo de respuesta y errores) + tests MSW — route: delegated — status: done — evidence: implementation + checks green (format/lint/tsc/build/vitest).
- T3 (S1): `application` — `getAccounts`, `createAccount`, `updateAccount`, `deleteAccount` (use cases) — route: inline — status: done — evidence: implementation + checks green (format/lint/tsc/build/vitest).
- T4 (S1, S6): `presentation` — `AccountList` (tabla: Nombre, Descripción, Estado, Acciones con dropdown Editar/Eliminar) — route: inline — status: done — evidence: implementation + checks green (format/lint/tsc/build/vitest).
- T5 (S1, S4, S6): `presentation` — `CreateAccountForm` (Dialog: nombre + descripción + submit) y `EditAccountForm` (Dialog: nombre + descripción + Switch activo, reset al cambiar account) — route: delegated — status: done — evidence: implementation + checks green (format/lint/tsc/build/vitest).
- T6 (S1, S5, S6): `presentation` — `AccountsContainer` (estado de edición/eliminación, `useTransition` para delete, AlertDialog, sonner) — route: delegated — status: done — evidence: implementation + checks green (format/lint/tsc/build/vitest).
- T7 (S1, S3): `server actions` — `create-account`, `update-account`, `delete-account` (validación + mapeo de errores) — route: inline — status: done — evidence: implementation + checks green (format/lint/tsc/build/vitest).
- T8 (S1, S3, S5): `route` — `app/(protected)/[slug]/accounts/page.tsx` (server component, carga tenant + accounts, `loadError`) y `loading.tsx` skeleton — route: inline — status: done — evidence: implementation + checks green (format/lint/tsc/build/vitest).
- T9 (S7): `sidebar` — entrada "Cuentas" en `app-sidebar.tsx` — route: inline — status: done — evidence: implementation + checks green (format/lint/tsc/build/vitest).
- T10 (S8): `tests` — schemas (implicitos via forms), forms (create/edit), contenedor, repositorio HTTP (MSW), server actions — route: delegated — status: done — evidence: 21 tests added, vitest green.
- T11 (S8): `checks` — Biome format, oxlint, tsc, Next build, Vitest en verde — route: inline — status: done — evidence: checks green.

## Log

- L1 (2026-10-19): "analiza el flujo y todo los implementado en labels/page.tsx y crees un doc odd para hacer la implementacion para accounts me lo muestras antes de implementar".
- L2 (2026-10-19): Implementación completada en branch feat/account-page (modulos account, rutas, server actions, sidebar). Checks en verde.
