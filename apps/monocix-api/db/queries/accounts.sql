-- name: FindAllAccounts :many
select
    id,
    "name",
    description,
    is_active,
    tenant_id
from
    accounts
where
    tenant_id = $1
    and is_delete = false;

-- name: FindOneAccount :one
select
    id,
    "name",
    description,
    is_active,
    tenant_id
from
    accounts
where
    id = $1
    and tenant_id = $2
    and is_delete = false;

-- name: SaveAccount :exec
insert
    into
    accounts
(id,
    "name",
    description,
    is_active,
    tenant_id)
values($1, $2, $3, $4, $5);

-- name: UpdateAccount :exec
update
    accounts
set
    "name" = $1,
    description = $2,
    is_active = $3,
    update_at = now()
where
    id = $4
    and tenant_id = $5
    and is_delete = false;

-- name: DeleteAccount :exec
update
    accounts
set
    update_at = now(),
    is_delete = true
where
    id = $1
    and tenant_id = $2;