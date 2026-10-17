-- name: FindAllTenants :many
select
    id,
    "name",
    slug,
    is_active
from
    tenants
where
    is_delete = false;

-- name: FindOneTenant :one
select
    id,
    "name",
    slug,
    is_active
from
    tenants
where
    id = $1
    and is_delete = false;

-- name: SaveTenant :exec
insert
    into
    tenants
(id,
    "name",
    slug,
    is_active)
values($1, $2, $3, $4);

-- name: UpdateTenant :exec
-- name: DeleteTenant :exec
update
    tenants
set
    "name" = $1,
    slug = $2,
    is_active = $3,
    update_at = now()
where
    id = $4
    and is_delete = false;

-- name: FindTenantBySlug :one
select
    id,
    "name",
    slug,
    is_active
from
    tenants
where
    slug = $1
    and is_delete = false;
-- name: DeleteTenant :exec
update
    tenants
set
    update_at = now(),
    is_delete = true
where
    id = $1;
