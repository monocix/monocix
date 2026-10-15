-- name: FindAllLabels :many
select
    id,
    "name",
    is_active,
    tenant_id
from
    label
where
    tenant_id = $1
    and is_delete = false;

-- name: FindOneLabel :one
select
    id,
    "name",
    is_active,
    tenant_id
from
    label
where
    id = $1
    and tenant_id = $2
    and is_delete = false;

-- name: SaveLabel :exec
insert
    into
    label
(id,
    "name",
    is_active,
    tenant_id)
values($1, $2, $3, $4);

-- name: UpdateLabel :exec
update
    label
set
    "name" = $1,
    is_active = $2,
    update_at = now()
where
    id = $3
    and tenant_id = $4
    and is_delete = false;

-- name: DeleteLabel :exec
update
    label
set
    update_at = now(),
    delete_at = now(),
    is_delete = true
where
    id = $1
    and tenant_id = $2;
