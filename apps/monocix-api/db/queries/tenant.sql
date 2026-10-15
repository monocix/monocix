-- name: FindAllTenants :many
select
    id,
    "name",
    is_active
from
    tenant
where
    is_delete = false;

-- name: FindOneTenant :one
select
    id,
    "name",
    is_active
from
    tenant
where
    id = $1
    and is_delete = false;

-- name: SaveTenant :exec
insert
    into
    tenant
(id,
    "name",
    is_active)
values($1, $2, $3);

-- name: UpdateTenant :exec
update
    tenant
set
    "name" = $1,
    is_active = $2,
    update_at = now()
where
    id = $3
    and is_delete = false;

-- name: DeleteTenant :exec
update
    tenant
set
    update_at = now(),
    delete_at = now(),
    is_delete = true
where
    id = $1;
