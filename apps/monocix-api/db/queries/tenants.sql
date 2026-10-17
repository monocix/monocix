-- name: FindAllTenants :many
select
    id,
    "name",
    is_active
from
    tenants
where
    is_delete = false;

-- name: FindOneTenant :one
select
    id,
    "name",
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
    is_active)
values($1, $2, $3);

-- name: UpdateTenant :exec
update
    tenants
set
    "name" = $1,
    is_active = $2,
    update_at = now()
where
    id = $3
    and is_delete = false;

-- name: DeleteTenant :exec
update
    tenants
set
    update_at = now(),
    is_delete = true
where
    id = $1;
