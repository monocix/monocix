# monocix

Monorepo with a Go API (`apps/monocix-api`) and a Next.js app (`apps/monocix-app`).

## Prerequisites

- Node.js + pnpm
- Go 1.26+
- Docker (for the local Postgres)

## Local database

```bash
pnpm db:up       # starts Postgres and applies schema + dev seed
pnpm db:reset    # recreates the DB if you need to reseed
```

Postgres runs on `localhost:5432` with user `postgres`, password `postgres`, and database `monocix`.
The dev seed creates a tenant with slug `demo` (URL: `/demo/dashboard`).

## Run the API

```bash
cd apps/monocix-api
pnpm dev   # air, hot reload; or: go run .
```

Config defaults live in `config.yaml`; override with `MONOCIX_*` env vars (e.g. `MONOCIX_DATABASE_URL`, `MONOCIX_PORT`).

## Run the app

```bash
cd apps/monocix-app
pnpm dev
```

The app reads the API base URL from `API_BASE_URL` (defaults to `http://localhost:8080`).
Set it via `apps/monocix-app/.env.local` if needed.

API endpoints are served under `/api/v1`. Example:
`curl http://localhost:8080/api/v1/tenants/slug/demo`

## Tests

```bash
pnpm test          # unit tests (app + api, no Docker needed)
pnpm test:app      # Vitest (frontend)
pnpm test:api      # Go unit tests (short mode, no Docker)
pnpm test:e2e      # Go E2E tests (require Docker)
```

The E2E tests use testcontainers to spin up Postgres. If you use Colima instead of Docker Desktop, point testcontainers at the Colima socket before running them:

```bash
export DOCKER_HOST=unix://$HOME/.colima/default/docker.sock
export TESTCONTAINERS_RYUK_DISABLED=true
pnpm test:e2e
```
