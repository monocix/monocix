# Tenant Slug

Objective: agregar `slug` único a la tabla `tenants` y exponerlo en el CRUD de tenants. Branch a crear: `feat/tenant-slug` (pendiente). Delivery strategy: ask-on-risk. Test runner: go test ./... (e2e con testcontainers).

## Specs

- S1: "agregar nuevo campo slug único en tenant". Alcance DB+domain+handlers+transport+tests para tenants en `apps/monocix-api/` (siguiendo el patrón de `label`/`accounts`).
- S2: Columna `slug VARCHAR(255) NOT NULL UNIQUE` en `tenants`. Operaciones por slug: `FindTenantBySlug :one`. Soft-delete normal (reads/updates excluyen `is_delete=true`) y delete solo actualiza `update_at + is_delete`.
- S3: Uniqueness: creación/actualización de tenant con slug ya existente → unique violation (`23505`) mapeado a un error de conflicto (`domain.ErrConflict` o equivalente), análogo al FK de labels → `ErrNotFound`.
- S4: Exposición HTTP: `slug` en list/get/create/update para tenants (`GET/POST/PUT /tenants`). El handler genera el UUID en servidor; `slug` lo envía el cliente (requerido en create).
- S5: Validación de dominio: `slug` validado con `required,notblank,max=255` (cliente decide formato; se puede endurecer con formato URL-safe en follow-up).

## Tasks

- T1 (S2): Schema — `tenants.slug VARCHAR(255) NOT NULL UNIQUE` y regenerate sqlc — status: done.
- T2 (S1, S2): `tenants.sql` — agregar slug a Select/Insert/Update (sin query por slug) — status: done.
- T3 (S3): `domain` — `Tenant`, `CreateTenantInput`, `UpdateTenantInput` suman `Slug`; agregar `ErrConflict` — status: done.
- T4 (S3, S4): `handlers` — mapeo de unique violation + tests fake (dependerá de T3) — status: done.
- T5 (S4): `transport` — request/response incluyen slug + error 409 (conflict) — status: done.
- T6 (S6): Tests — unit (`handlers`) + `TestTenantE2E` actualizado con slug — status: done.

## Notas

- Para DBs existentes se requiere migración (`ALTER TABLE tenants ADD COLUMN slug ... UNIQUE` + backfill). El esquema acá es `CREATE TABLE` (no migrations), por lo que e2e recrea la tabla desde cero.
- Para el ID del tenant sigue generándose en servidor; `slug` viene del cliente.

## Log

- L1 (2026-10-17): Solicitud del usuario: agregar campo `slug` único en `tenant`. Se desglosa en ODD y se presenta para revisión antes de implementar.
