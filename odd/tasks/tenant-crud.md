# Tenant CRUD

Objective: CRUD de tenant. Branch: feature/tenant-crud. Delivery strategy: ask-on-risk. Test runner: go test ./... (db layer: sqlc generate + go build ./...).

## Specs

- S1: "CRUD de tenant" — alcance: create, read (all/one), update y delete sobre la tabla `tenant` (`apps/monocix-api/db/`). Estructura por módulos: el módulo se llama `references` (`apps/monocix-api/internal/references/`); dentro lleva `handlers` (se conecta con la capa de db), `transport` (aquí van definidos los routes) y `domain` (modelos con tags de validación con `go-playground/validator`). Supuesto: `go-playground/validator` aún no está en `go.mod` — agregarlo como dependencia.
- S2: Borrado es soft-delete: `DeleteTenant` setea `is_delete = true, delete_at = now(), update_at = now()`; `FindAllTenants`, `FindOneTenant` y `UpdateTenant` excluyen `is_delete = true`. (Decisión autorizada por el usuario esta sesión.)
- S3: Tabla con `create_at / update_at / delete_at` (`TIMESTAMPTZ`, `delete_at` anulable) e `is_delete BOOLEAN DEFAULT FALSE`. (Columnas pedidas por el usuario; ya en `db/schema/schema.sql`.)

## Tasks

- T1 (S2, S3): DB layer tenant — schema timestamps + queries soft-delete + regenerado sqlc — route: inline — status: done — commit: 46fa8fb — evidence: sqlc generate EXIT 0, go build EXIT 0.
- T2 (S1): `domain` — modelos con tags de validación (`go-playground/validator` v10.30.5) + agregar dependencia — route: inline — status: done — commit: 7882f8a — evidence: RED (test sin modelo, build failed) → GREEN (go test ./... ok, go vet clean).
- T3 (S1): `handlers` — conectados con la capa de db — route: TBD (default inline) — status: pending — commit: -.
- T4 (S1): `transport` — routes del CRUD — route: TBD (default inline) — status: pending — commit: -.
- T5 (S1): Tests Go del CRUD tenant (`go test ./...`; hoy no existe ningún `*_test.go`) — route: TBD — status: pending — commit: -.

## Log

- L1 (2026-10-15): "CRUD de tenant".
- L2 (2026-10-15): Pedido previo de la sesión: "Ahora quiero prepara un odd". Exploración: `main.go` solo hello-world sin rutas; sin handlers ni `*_test.go`; branch actual `fix/pnpm-dev`; `sqlc.yaml` con `emit_prepared_queries: true` + `emit_methods_with_db_argument: false` (fix de exclusión mutua aplicado). Gap abierto: `internal/db/` (out de sqlc) existía tras regenerar y ya no está en el árbol — solo queda `internal/references/db/`; re-verificar ruta de generación antes de T2.
- L3 (2026-10-15): "Quiero que hagas una modificacion en el odd, pero antes si esto sera en otra rama, quiero separa el codigo por modulos por eso cree references que sera el nombre del modulo, dentro de este modulo ira una carpeta handlers -> este se conectara con con la capa de db, otro carpeta transport -> aqui iran definidos los routes y domain -> donde iran los modelos con tags de validacion para lo cual usaremos go-playground/validator". Cambio aplicado: S1 reescrito con estructura `references/{handlers,transport,domain}` + `go-playground/validator`; T2 anterior (handlers+routes) dividido en T2/T3/T4 y tests pasa a T5; implementación queda asignada a feature branch por crear.
- L4 (2026-10-15): "dale empieza con la implemetacion". Branch `feature/tenant-crud` creada desde `fix/pnpm-dev`; T1 cerrada con commit 46fa8fb. T2: RED (tenant_test.go sin modelo → build failed) → GREEN tras `domain/tenant.go` (Tenant, CreateTenantInput, UpdateTenantInput; regla custom `notblank` porque el `required` nativo deja pasar strings de solo espacios); `go get github.com/go-playground/validator/v10@v10.30.5`; commit 7882f8a. Detalle: el UUID de prueba inicial no era v4 y falló el tag `uuid4` — se usó `550e8400-e29b-41d4-a716-446655440000`.
