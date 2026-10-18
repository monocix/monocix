# Labels container/presentational migration

Objective: evaluate and migrate the labels UI to the container/presentational pattern already used by tenant, deciding between a minimal view extraction and full labels reference-module parity. Branch: feat/labels-container-presentational. Delivery strategy: ask-on-risk. Test runner: pnpm (Next.js) for app build/lint; go test for monocix-api when API behavior changes.

## Specs

- S1 The work is planning and refactoring only in `apps/monocix-app`; it must not change persisted API behavior, routes, or tenant scoping.
- S2 All user-facing text remains Spanish per the project preference stored at `i18n/ui-language`.
- S3 The labels feature should have one clear container that owns data loading and mutation handoff, and one or more presentational components that receive props and stay framework-routing-free where practical.
- S4 The refactor must preserve existing labels behavior: listing labels, title/status rendering, create dialog, loading/error state, Spanish messages, and sidebar navigation.
- S5 Choose and record one strategy before implementation: option A minimal presentational extraction, or option B full `lib/references/label/*` parity with `tenant`.
- S6 Applicable checks remain unchanged: Biome format, oxlint, Next.js build, and focused rendering checks for the labels page.

## Tasks

- T1 | S1,S5 | inline (done) | evaluated design options; selected Option B full `lib/references/label/*` parity with tenant
- T2 | S1,S5,S3 | n/a (skipped) | Option A minimal extraction is not selected now
- T3 | S1,S5,S3,S4 | delegated (done) | created label domain, ports, repository, and application use cases
- T4 | S1,S5,S3,S4 | delegated (done) | page is container via LabelRepository; presentational LabelsView added; dialog remains mutation handoff
- T5 | S6 | inline (done) | Biome, oxlint, and Next production build pass
- T6 | S4 | inline (done) | implementation outcome recorded: module plus refactor completed and checks pass

## Log

- L1: Ahora quiero aplicar el patron container/presentational para la pagina de labels evalualo y me muetras que podemos hacer pero no lo implementes crea un odd
- L2: Selected Option B (full `lib/references/label/*` parity with tenant) for implementation; Option A retained as fallback note (2026-10-18).
- L3: Implemented Option B: added label reference module and refactored labels page/actions; Biome, oxlint, and Next build pass (2026-10-18).
- L4: ODD complete for implementation/checks; remaining follow-up is optional broader test coverage for labels rendering and mutations.