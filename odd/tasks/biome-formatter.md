# Feature: biome-formatter

## Objective
Agregar Biome como formateador (solo formato) en `apps/monocix-app`, manteniendo Oxlint como linter.

## Problem
El proyecto no tiene formateador: el formato del código depende del editor de cada persona. Sin una herramienta compartida, el estilo diverge y el ruido en los diffs crece.

## Why
Solicitud explícita del usuario (opción 1: Biome solo formato, Oxlint sigue como linter). Evita diagnósticos duplicados de dos linters corriendo a la vez.

## Scope
- `apps/monocix-app`: config `biome.json`, dep `@biomejs/biome`, scripts `format`/`format:check`, formateo inicial de los fuentes existentes.
- Fuera de alcance: activar el linter de Biome (`linter.enabled: false`), editor settings (`.vscode/`), CI workflows, push/PR (decisión del usuario).

## Constraints
- Stack: Next 16.4.0, React 19.3.0, pnpm 12.11.2.
- Linter de Biome APAGADO para no duplicar a Oxlint.
- Rama apilada: `feat/biome-formatter` sobre `feat/migrate-oxlint` (PR #1 aún abierta). Al mergearse #1, retarget a `main`.
- No tocar `odd/`, `.oxlintrc.json` ni otros untracked fuera de superficies.

## Checklist
- [x] B1 — Crear `apps/monocix-app/biome.json` formatter-only (`linter.enabled: false`, ignores: `.next`, `out`, `build`, `next-env.d.ts`)
- [x] B2 — Agregar devDep `@biomejs/biome` y scripts `format` (`biome format --write .`) + `format:check` (`biome format .`); lockfile consistente
- [x] B3 — Formateo inicial (`biome format --write` sobre superficies) + verificación: `format:check` limpio, `oxlint` limpio, `tsc --noEmit` limpio

## Authorized scope
- Leer y modificar solo las superficies listadas en la delegación. No tocar `odd/`, `.oxlintrc.json`, resto de untracked.

## Acceptance criteria
- `pnpm --filter monocix-app format:check` pasa limpio.
- `pnpm --filter monocix-app lint` (oxlint) sigue pasando.
- `tsc --noEmit` sigue pasando.
- `linter.enabled: false` presente en `biome.json`.

## Applicable checks
- `pnpm --filter monocix-app exec biome format .`
- `pnpm --filter monocix-app lint`
- `pnpm --filter monocix-app exec tsc --noEmit`

## Route declaration
- Ruta: delegated direct.
- Trigger evidence: 2+ archivos no triviales (biome.json nuevo + package.json + lockfile + 6 fuentes a formatear) + lectura que prepara escritura.

## Delivery strategy
- Forecast: <100 líneas autoradas (config + scripts + deltas de formato), bajo el presupuesto de ~400.
- Estrategia: `single-pr` apilado sobre #1; work-unit commit en `feat/biome-formatter`. Push/PR solo si el usuario lo pide.

## Progress
- 2026-10-11: documento creado.
- 2026-10-11: B1–B3 completados vía writer delegado + verificador independiente. Mirror Engram pendiente (servidor degradado).
- Work-unit commit: rama `feat/biome-formatter` (apilada sobre `feat/migrate-oxlint`), mensaje `chore(monocix-app): add biome as formatter-only` (hash: ver `git rev-parse feat/biome-formatter`).

## Verification evidence
- Writer (foreground): `biome format .` → `Checked 7 files, No fixes applied`; `lint` (oxlint) → limpio; `tsc --noEmit` → limpio.
- Verificador independiente: `pass`, sin discrepancias. `.oxlintrc.json` sin diff contra HEAD.
- Desvíos intencionales: (1) Biome 2.x usa `files.includes` con negaciones (ya no existe `files.ignore`); (2) `.oxlintrc.json` excluido del alcance de Biome para evitar churn entre herramientas (tras revertir un formateo accidental, byte-idéntico a HEAD); (3) lockfile modificado es el raíz `pnpm-lock.yaml` (el anidado es resto del scaffold, ver nota).
- Nota: existen `pnpm-workspace.yaml` + `pnpm-lock.yaml` anidados en `apps/monocix-app` (restos del scaffold standalone). pnpm resolvió contra el workspace raíz; limpieza de duplicados queda como follow-up fuera de alcance.
- Estilo: Biome aplicó su default (tabs). Cambiar a espacios requeriría `formatter.indentStyle: space` — decisión del usuario.

## Next step
- Crear rama `feat/biome-formatter` y delegar a `gentle-ai-worker`.
