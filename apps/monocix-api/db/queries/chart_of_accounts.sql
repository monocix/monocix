-- name: FindAllChartOfAccounts :many
select
    id,
    "name",
    is_active,
    tenant_id,
    label_id
from
    chart_of_accounts
where
    tenant_id = $1
    and is_delete = false;

-- name: FindOneChartOfAccount :one
select
    id,
    "name",
    is_active,
    tenant_id,
    label_id
from
    chart_of_accounts
where
    id = $1
    and tenant_id = $2
    and is_delete = false;

-- name: SaveChartOfAccount :exec
insert
    into
    chart_of_accounts
(id,
    "name",
    is_active,
    tenant_id,
    label_id)
values($1, $2, $3, $4, $5);

-- name: UpdateChartOfAccount :exec
update
    chart_of_accounts
set
    "name" = $1,
    label_id = $2,
    is_active = $3,
    update_at = now()
where
    id = $4
    and tenant_id = $5
    and is_delete = false;

-- name: DeleteChartOfAccount :exec
update
    chart_of_accounts
set
    update_at = now(),
    is_delete = true
where
    id = $1
    and tenant_id = $2;