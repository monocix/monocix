# Label queries

Objective: queries SQL de label. Branch: feature/label-table. Delivery strategy: ask-on-risk. Test runner: sqlc generate + go build ./... + go test ./...

## Specs

- S1: "crees un label.sql" "al igual que en tenant.sql" — alcance: `apps/monocix-api/db/queries/label.sql` con FindAll/FindOne/Save/Update/Delete espejando `tenant.sql`.
- S2: "considera de la misma manera el is_delete" — lecturas y update excluyen `is_delete = true`; el delete setea `is_delete = true, update_at = now()`.
- S3: "adicionalmente el tenant_id" — listados y operaciones por id van scouteados por `tenant_id` (un label solo se accede dentro de su tenant).

Fuera de alcance (follow-ups, no tareas): `domain`/`handlers`/`transport` de label y sus tests.

## Tasks

- T1 (S1, S2, S3): `label.sql` + regenerado sqlc + verificación — route: inline — status: done — commit: ee3cf10 — evidence: sqlc generate EXIT 0 (5 métodos generados), go build ok, go test -short ./... ok.

## Log

- L1 (2026-10-15): "ahora quiero que al igual que en apps/monocix-api/db/queries/tenant.sql crees un label.sql considera de la misma manera el is_delete y adicionalmente el tenant_id crea un odd para esto".
- L2 (2026-10-15): Implementado en la misma rama `feature/label-table` (el PR #8 sigue abierto y el cambio cae dentro de su alcance). `FindAllLabels` filtra por `tenant_id = $1`; `FindOne/Update/Delete` exigen `id + tenant_id` para no cruzar tenants.
