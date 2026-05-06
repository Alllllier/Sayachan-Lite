# Backend Dist Runtime Cutover Plan V1

Status: planning artifact for future PMO execution
Last updated: 2026-05-06

## Purpose

Define the PMO battle map for moving the backend from the current source runtime to a unified `tsc` dist runtime:

- Current runtime: `node src/server.js`
- Target runtime: `node dist/server.js`
- Target build shape: `backend/src/**/*.ts` and remaining allowed `backend/src/**/*.js` emit to `backend/dist/**/*.js`

This document is a plan only. It does not approve a runtime cutover, ESM migration, private core inclusion, runtime TS loader, API/Zod behavior change, or deletion of current generated artifacts.

## Current State Inventory

| Area | Current evidence | Cutover implication |
| --- | --- | --- |
| Backend runtime | `backend/package.json` uses `"type": "commonjs"`, `start` and `dev` run `node src/server.js`. | Runtime still loads source files. Dist is dry-run only. |
| Unified dry-run build | `backend/tsconfig.json` emits JS from `src` to `dist` with `allowJs: true`, `checkJs: false`, `noResolve: true`; `npm --prefix backend run check:backend-build` runs `tsc` plus `scripts/checkBackendDistBuild.js`. | Dist generation exists but is not authoritative runtime. `noResolve` is a boundary marker, not final architecture. |
| Schema module | Source: `backend/src/routes/schemas/mutations.ts`; emitted artifact: `backend/dist/routes/schemas/mutations.js`. | Schema facade/generated scaffolding has been retired. |
| Notes route | Source: `backend/src/routes/notesRoutes.ts`; emitted artifact: `backend/dist/routes/notesRoutes.js`. | Notes island facade/generated scaffolding has been retired. |
| DTO pilot | `backend/tsconfig.dto-pilot.json` remains as a narrow middleware/schema bridge check after product routes moved to TS. | Retire when the remaining middleware/schema bridge is either covered by route TS types or no longer adds signal. |
| Product routes | `backend/src/routes/notesRoutes.ts`, `projectsRoutes.ts`, `tasksRoutes.ts` remain public runtime entrypoints through compiled dist output. | Notes, Projects, and Tasks now compile from normal TS route paths. |
| Services/models/middleware | Plain CommonJS JS under `backend/src/services`, `backend/src/models`, `backend/src/middleware`. | They can remain JS during early dist runtime if emitted unchanged; type migration is separable. |
| Private core | `backend/src/ai/bridge.js` crosses into `backend/private_core/sayachan-ai-core`. | Inclusion in backend build is a human architecture gate. Do not absorb implicitly. |
| Root check | Root `npm run check` includes lint, schema island check, backend dist runtime readiness, tests, frontend build. | Dist validation has been added after human approval. |
| Baselines | `docs/pmo/baselines/backend-api.md`, `runtime-baseline.md`, `system-baseline.md`. | Use as public behavior guards before and after cutover. |

## Target Architecture Recommendation

Default to CommonJS for the backend dist runtime unless a human explicitly opens an ESM decision gate.

Recommended final shape:

- `backend/package.json`
  - Keep `"type": "commonjs"` for the first dist runtime cutover.
  - `build:backend`: `tsc -p tsconfig.json`
  - `start`: eventually `node dist/server.js`
  - `dev`: eventually source watcher plus build/restart, or a documented source runtime until a separate dev-runtime decision.
- `backend/tsconfig.json`
  - `rootDir: "src"`
  - `outDir: "dist"`
  - `module: "CommonJS"`
  - `target` aligned with current Node support.
  - Include both TS and allowed JS during transition.
  - Prefer explicit project boundary over accidental resolution into `backend/private_core`.
- Runtime imports
  - Keep CommonJS `require` semantics through the first cutover.
  - Do not introduce `tsx`, `ts-node`, or a runtime loader as part of this path.
- Generated island retirement
  - Retire facade/generated artifacts only after the corresponding real source file is compiled by unified `tsc` and contract tests pass against the dist runtime.

## Human Stop Gates

The following require explicit human/architecture approval before implementation:

- Switching from CommonJS to ESM.
- Including `backend/private_core/**` in the backend build boundary.
- Introducing `tsx`, `ts-node`, Babel, or any runtime TS loader.
- Changing `start` or production runtime from `node src/server.js` to `node dist/server.js`.
- Changing public API contracts, validation status codes, Zod behavior, or response bodies.
- Adding heavy dist/runtime validation to root `npm run check`.
- Deleting schema or Notes island generated artifacts/facades.
- Changing deploy/runtime assumptions outside local backend package scripts.

## Phased Sequence

### Phase 0: Current Checkpoint

Current checkpoint after dist runtime cutover has retired the schema and Notes island guardrails.

Expected validation:

- `npm --prefix backend run typecheck:dto-pilot`
- `npm --prefix backend run check:backend-build`
- `npm --prefix backend test`
- `npm run check`

Exit condition: PMO has a green baseline and this plan accepted.

### Phase 1: Dist Build Boundary Hardening

Goal: make the dry-run unified build more explicit and less surprising while keeping source runtime.

Likely work:

- Confirm exactly which `backend/src/**` files should emit to `backend/dist`.
- Decide whether `noResolve: true` remains a temporary guard or is replaced by explicit excludes/ambient declarations.
- Keep `backend/private_core/**` outside the build unless the human opens that gate.
- Expand `scripts/checkBackendDistBuild.js` only enough to prove expected dist entrypoints are emitted and current runtime scripts still point to source.

Automation fit:

- Script-automatable: dist artifact inventory, forbidden path checks, runtime script assertions.
- Sub-agent-automatable: small tsconfig/check-script edits after the build boundary policy is explicit.

Exit condition: `check:backend-build` reliably proves dist is generated for current runtime graph without changing runtime.

### Phase 2: Pre-Cutover Dist Runtime Smoke Harness

Goal: prepare validation for `dist/server.js` before switching package scripts.

Likely work:

- Add a dist-only smoke command that builds backend and starts or imports `dist/server.js` in an isolated test harness.
- Keep `start` and `dev` unchanged.
- Keep source-route contract tests as the default until human approves dist runtime validation expansion.

Automation fit:

- Script-automatable: build-then-smoke command, port isolation, dist entrypoint existence check.
- Human gate: whether this smoke becomes part of root `npm run check`.

Exit condition: dist can be tested without becoming the default runtime.

### Phase 3: Schema Island Retirement

Goal: retire checked-in generated schema artifacts so `mutations.ts` is consumed from normal dist output.

Likely work:

- `backend/src/routes/schemas/mutations.ts` now emits to `dist/routes/schemas/mutations.js`.
- Dist runtime route modules consume the compiled schema module.
- Confirm API/Zod behavior baseline is unchanged.

Retired:

- `backend/src/routes/schemas/mutations.js`
- `backend/src/routes/schemas/__generated__/mutations.js`
- `backend/src/routes/schemas/__generated__/mutations.d.ts`
- `check:schema-island`

Exit condition: schema generated artifacts are removed and dist validation remains green.

### Phase 4: Notes Route Island Retirement

Goal: retire the Notes route source-runtime facade and generated artifacts after unified build owns runtime output.

Likely work:

- Notes route source now lives at `backend/src/routes/notesRoutes.ts`.
- Confirm `backend/dist/routes/index.js` continues requiring compiled `./notesRoutes` in the dist runtime.
- Confirm the dist build emits `dist/routes/notesRoutes.js` from the real TS source.

Retired:

- `backend/src/routes/notesRoutes.js` facade
- `backend/src/routes/__generated__/notesRoutes.js`
- `backend/src/routes/__generated__/notesRoutes.d.ts`
- `check:notes-route-island`

Exit condition: PMO has an approved Notes facade retirement batch and repeatable validation.

### Phase 5: Product Route Migration Batches

Goal: migrate remaining product routers after Notes proves the runtime path.

Recommended sub-agent batches:

- Projects route batch completed: `backend/src/routes/projectsRoutes.ts` compiles through the unified backend build with existing service/model imports preserved.
- Tasks route batch completed: `backend/src/routes/tasksRoutes.ts` compiles through the unified backend build with existing validation behavior and route __test__ export preserved.
- Route index batch only if required by emitted dist layout; otherwise leave `backend/src/routes/index.js` CommonJS until a broader cleanup.

Hard boundaries:

- No service/model/middleware TS conversion inside route batches unless required by the handoff.
- No DTO shape duplication; consume schema/types from the mutation schema source.
- Public validation responses must remain unchanged.

Exit condition: product routers compile through unified build and contract tests remain green.

### Phase 6: Service, Middleware, and Model Type Expansion

Goal: improve type coverage behind routes once the runtime path is stable.

Recommended order:

- Middleware surfaces used by product routes.
- Product services called by migrated routes.
- Models/persistence helpers only when they block route correctness or provide high value.

Automation fit:

- Sub-agent-automatable in narrow batches with contract tests.
- Avoid large hand-written `.d.ts` surfaces that become parallel truth.

Exit condition: type graph expansion is intentional, test-backed, and does not pull in private core accidentally.

### Phase 7: Dist Runtime Human Cutover Gate

Before changing runtime scripts, a human must explicitly approve:

- `start` switch to `node dist/server.js`.
- Whether `dev` remains source-based temporarily or becomes build/restart based.
- Whether dist smoke/contract validation joins root `npm run check`.
- Whether any deploy docs or environment assumptions change.
- Whether schema/Notes generated artifacts may be deleted in the same sprint or must wait for a cleanup sprint.

Minimum evidence required:

- Source runtime contract tests green.
- Dist smoke green.
- Dist route contract baseline green or equivalently justified.
- `backend/dist` generated cleanly from `tsc`.
- No public API/Zod behavior delta.

### Phase 8: Runtime Cutover Execution

Goal: switch backend runtime to dist after the human gate.

Likely work:

- Update `backend/package.json` `start` to `node dist/server.js`.
- Decide and implement `dev` strategy approved in Phase 7.
- Ensure build-before-start workflow is documented or scripted.
- Run full source and dist validation matrix.

Exit condition: dist runtime is the default and rollback instructions are documented.

### Phase 9: Post-Cutover Cleanup

Goal: remove temporary scaffolding only after dist runtime is stable.

Cleanup candidates:

- Per-island build/check scripts.
- `backend/tsconfig.dto-pilot.json`, once route TS coverage replaces it.
- PMO references that describe islands as active runtime requirements.

Exit condition: unified backend build is the source of runtime JS, and obsolete guardrails are removed without reducing behavior coverage.

## Automation Boundaries

Script-automatable:

- Dist artifact presence checks.
- Runtime script assertions, such as preventing accidental `start` cutover before approval.
- Generated-artifact drift checks while islands exist.
- Source/dist contract command orchestration.
- Rollback-friendly artifact cleanup checks.

Sub-agent-automatable:

- Single-route TS migration batches after Notes pattern is approved.
- Mechanical import/path updates within one route family.
- Test updates tied to one route family.
- Removing one retired island scaffold after dist runtime is already authoritative.

Human-owned:

- ESM versus CommonJS.
- Private core build boundary.
- Runtime loader policy.
- Runtime script cutover.
- Public API/Zod behavior changes.
- Root check expansion to heavier backend dist validation.
- Any broad service/model/middleware type graph expansion.

## Validation Matrix

| Phase | Required validation |
| --- | --- |
| Current checkpoint | `npm --prefix backend run typecheck:dto-pilot`; `npm --prefix backend run check:backend-build`; `npm --prefix backend test`; `npm run check` |
| Dist build hardening | `npm --prefix backend run build:backend`; `npm --prefix backend run check:backend-build`; targeted script tests if added |
| Dist smoke prep | dist smoke/check command; dist backend tests; contract baseline |
| Schema/Notes retirement prep | remaining island checks still green before retirement; unified build emits expected dist modules |
| Product route batches | unified build; route contract baseline; full backend tests for any route behavior change |
| Runtime cutover | build; dist smoke; dist contract baseline; source-to-dist API comparison where practical; `npm run check` after approved root changes |
| Post-cutover cleanup | unified build; no references to retired facades/generated artifacts; backend tests; root check |

## Rollback And Checkpoint Strategy

- Keep each phase in a separate PMO sprint or clearly separable commit.
- Do not combine runtime cutover with broad cleanup.
- Do not delete generated artifacts/facades before the corresponding dist runtime path is green and approved.
- Keep validated commits as rollback checkpoints during the migration window.
- For cutover rollback, restore `backend/package.json` runtime scripts to source, keep dist build commands available, and leave generated artifacts in place unless a later cleanup already has a separate rollback plan.
- Treat baseline documents as checkpoints: update them only after validation proves behavior did not change or after a human accepts the behavior change.
- If `private_core` resolution, ESM interop, or runtime loader pressure appears, stop the migration batch and return to PMO for an architecture decision.

## Recommended Next Executable Sprint

Name: `Backend Dist Build Boundary Hardening V1`

Scope:

- Keep dist runtime unchanged.
- Strengthen the existing unified backend build dry-run boundary.
- Make private core exclusion explicit or document why the current `noResolve` guard remains temporary.
- Extend backend dist build smoke checks only for artifact/layout verification.
- Confirm root `npm run check` inclusion policy for backend dist checks, but do not expand root check without approval.

Non-goals:

- No runtime cutover.
- No route/service/model migration.
- No island/facade deletion.
- No ESM/runtime loader/private core inclusion.
- No public API/Zod changes.

Suggested validation:

- `npm --prefix backend run check:backend-build`
- `npm --prefix backend test`
- `npm run check`
