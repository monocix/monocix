# Feature: migrate-oxlint

## Objective
Migrar el linter de `apps/monocix-app` de ESLint a Oxlint y eliminar todas las dependencias de ESLint.

## Problem
El proyecto usa ESLint con `eslint-config-next` (core-web-vitals + typescript). Se quiere la velocidad y simplicidad de Oxlint sin perder cobertura de reglas Next/React/TS.

## Why
Solicitud explícita del usuario: "si migralo y elimina todas las dependencias de eslint".

## Scope
- `apps/monocix-app`: config, scripts y dependencias.
- Fuera de alcance: cambios de código de la app salvo fixes que el nuevo linter exija; otros packages/apps si aparecen.

## Constraints
- Stack: Next 16.4.0, React 19.3.0, pnpm 12.11.2, Tailwind 4.
- No commits a `main` sin rama feature; push/PR solo con autorización.
- Eliminar por completo `eslint` y `eslint-config-next`, incluyendo `eslint.config.mjs`.

## Checklist
- [x] T1 — Generar `.oxlintrc.json` equivalente (nextjs + react + typescript + import/unicorn según paridad) y validar paridad con `--details`
- [x] T2 — Actualizar script `lint` a `oxlint`, eliminar deps `eslint`/`eslint-config-next`, borrar `apps/monocix-app/eslint.config.mjs`, limpiar lockfile
- [x] T3 — Verificación: `oxlint`, `tsc --noEmit` y `next lint`-equivalente/build ligero; cero referencias a eslint

## Authorized scope
- Leer y modificar solo dentro de `apps/monocix-app`.
- No tocar `.atl/`, `odd/` salvo este documento, ni otras apps fuera del alcance.

## Acceptance criteria
- `pnpm --filter monocix-app lint` corre Oxlint y pasa.
- No existe `eslint.config.mjs` ni dependencias `eslint*` en `apps/monocix-app/package.json` ni en lockfile para ese workspace.
- `grep -ri eslint apps/monocix-app --exclude-dir=node_modules --exclude-dir=.next` no devuelve restos (salvo comentarios intencionales documentados).
- Typecheck/build no regresan por el cambio de linter.

## Applicable checks
- `pnpm --filter monocix-app lint`
- `pnpm --filter monocix-app exec tsc --noEmit` (si el script no existe, vía exec)
- Búsqueda de restos `eslint`

## Route declaration
- Ruta: delegated direct.
- Trigger evidence: 2+ archivos no triviales (`.oxlintrc.json` nuevo + `package.json` + borrado `eslint.config.mjs` + lockfile) + lectura que prepara escritura. Requiere un writer acotado.

## Delivery strategy
- Forecast: <50 líneas autoradas (config + package.json), muy por debajo del presupuesto de ~400.
- Estrategia: `single-pr` implícita por tamaño; sin cadena. Work-unit commit(s) en rama feature `feat/migrate-oxlint`. Push/PR solo si el usuario lo pide.

## Progress
- 2026-10-11: documento creado.
- 2026-10-11: T1–T3 completados vía writer delegado + verificador independiente. Mirror Engram pendiente (servidor degradado, reintentar).
- Work-unit commit: rama `feat/migrate-oxlint`, mensaje `chore(monocix-app): migrate lint from eslint to oxlint` (hash: ver `git rev-parse feat/migrate-oxlint`).

## Verification evidence
- Writer (foreground): `pnpm --filter monocix-app lint` → pass (`$ oxlint`, `Done in 1s`, sin hallazgos); `tsc --noEmit` → pass (exit 0); `grep -ri eslint` → cero refs.
- Verificador independiente: veredicto `pass`, sin discrepancias (paridad razonable, no byte-a-byte: la config ESLint original ya no existe en el árbol).
- RDD: `off` (global). Assess nativo: `high`/`unassessable` por árbol untracked (artefacto del repo, no del cambio) → se aplicó gate completo: writer self-verification + verificador independiente.
- Gap residual conocido: `@next/next/no-location-assign-relative-destination` sin equivalente en Oxlint; bajo riesgo, sin uso en la app.

## Next step
- Delegar a `gentle-ai-worker` con superficies permitidas y verificación acotada.
