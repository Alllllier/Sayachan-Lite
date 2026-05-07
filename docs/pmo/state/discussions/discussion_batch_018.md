# Discussion Batch `discussion_batch_018`

- Topic: `Engineering modernization path after MVP guardrails`
- Last updated: `2026-05-07`
- Status: `active`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `architecture`
- Origin trigger: `human discussion`
- Source channel: `human discussion`
- Why now: `The project has moved beyond early MVP complexity: it now has frontend/backend/private-core boundaries, account isolation, AI routes, UI review baselines, PMO runtime state, and repeated validation/tooling concerns. Earlier guardrails such as avoiding TypeScript, Monorepo/package tooling, or broader engineering modernization were useful during scaffold-stage development but may now block maintainability.`
- Related sprint or closeout: `Repo constraint cleanup on 2026-05-05; decision_log entry "Repo constraints are JavaScript-first, not early-stage freeze rules"`

## Why This Discussion Exists

- The human asked PMO to evaluate whether TypeScript, monorepo package tooling, and other modern engineering techniques should now be introduced to maintain the project's growing complexity.
- This batch records the modernization roadmap before any single execution slice is promoted.
- The goal is to prevent outdated MVP guardrails from remaining active while also avoiding a noisy full-stack migration that would destabilize the product runtime.

## Theme Summary

### `theme-001`

- Summary: `Sayachan now needs a staged engineering modernization path, starting with quality gates and repo-native command consolidation before heavier TypeScript or package workspace migration.`
- Why grouped: `TypeScript, package workspaces, linting, CI, API/runtime schemas, and typed module migration all address the same pressure: the codebase is now complex enough that human and AI workers need stronger mechanical guardrails.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `README and AGENT constraints still reflected scaffold-stage anti-complexity rules, while the live repo has already grown into a multi-surface system with frontend/backend/private-core boundaries and PMO-governed execution.`

### `theme-002`

- Summary: `TypeScript adoption should be treated as architecture-shaping work, not just per-file syntax conversion.`
- Why grouped: `The useful TypeScript payoff would come from making contracts explicit at module boundaries: frontend feature API/rules/composable layers, shared services, backend service/route payloads, persisted model DTOs, and public/private AI bridge inputs.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `The human asked whether TypeScript would ultimately mean optimizing every file one by one, or whether current architecture may need to change so TypeScript becomes more effective. PMO judgment: both may happen, but architecture-first boundary shaping should lead; per-file conversion should follow only where it clarifies real contracts.`

### `theme-003`

- Summary: `A successful TypeScript migration may remove some architecture scaffolding that only exists to compensate for missing static contracts.`
- Why grouped: `Some files, helper layers, duplicated shape notes, and defensive normalizers may be "no-type scaffolding" rather than durable product architecture. TypeScript could replace those with explicit domain types, discriminated unions, shared DTOs, and compile-time exhaustiveness checks.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `The human clarified that under a TypeScript framework, some current architecture files may no longer need to exist because their pain points could be solved directly by the type system. PMO judgment: this is plausible, but only after classifying which files express real runtime/product boundaries versus which merely encode implicit shape assumptions.`

## Possible Slices

### `slice-001`

- Name: `Engineering Quality Gate V1`
- Why separate: `Root-level validation, linting, and CI reduce execution drift without requiring TypeScript conversion or package-manager workspace migration. This is the lowest-risk first step.`
- Current maturity: `completed`
- Likely target: `sprint_candidates`
- Parking trigger: `Park only if another product-critical sprint must happen first and current validation drift remains manageable.`
- Reopen signal: `Worker validation confusion, repeated manual command selection, lint-preventable defects, or explicit human choice to start modernization.`
- Promoted candidate: `docs/pmo/state/sprint_candidates.md#engineering-quality-gate-v1`
- Completed output: `Root quality gate with npm run check, low-noise ESLint flat config, frontend/backend lint entrypoints, minimal GitHub Actions check workflow, and worker-facing validation docs.`
- Closeout archive: `docs/pmo/history/reports/engineering-quality-gate-v1.md`
- PMO readback: `Engineering Quality Gate V1 completed and validated on 2026-05-05. The root gate now runs lint, frontend tests, backend tests, and frontend build. UI review remains an explicit separate path. README local Node prerequisite was aligned to Node.js 22+ to match CI.`
- Return path: `Use this completed gate as the validation foundation for future slice-002 Type-Aware JavaScript Baseline, runtime schema, workspace tooling, stricter lint, formatter, or UI-review CI expansion work.`

### `slice-002`

- Name: `Type-Aware JavaScript Baseline`
- Why separate: `TypeScript can add value before file migration by using allowJs/checkJs/noEmit and JSDoc/type annotations around high-risk boundaries. This keeps JavaScript-first execution while adding type feedback.`
- Current maturity: `promoted`
- Likely target: `sprint_candidates | idea_backlog`
- Parking trigger: `Park until root validation commands and linting are stable enough that type errors do not become a noisy second gate.`
- Reopen signal: `Quality Gate V1 lands, API/service payload bugs appear, or the human wants a TypeScript migration audit.`
- Source input after audit: `docs/pmo/state/typescript_target_architecture_mapping.md` and `docs/pmo/state/typescript_target_architecture_mapping.zh.md`
- Construction note: `Do not shape this as full TypeScript migration. If promoted, it should start as a bounded implementation slice that adds type feedback or typed boundary scaffolding around a small, high-signal area identified by the target architecture mapping.`
- Proposed pilot: `Type-Aware JS Pilot: Shared Task Boundary`
- Why shared task service first: `frontend/src/services/tasks/ already has a clean API/rules/runtime split, is imported by Notes/Projects/Dashboard through the approved package entrypoint, and has focused tests for payload construction, normalization, API calls, and active snapshot behavior. It is cross-feature enough to prove type feedback value, but smaller and less architecture-sensitive than chat/AI or auth.`
- Initial target files: `frontend/src/services/tasks/task.rules.js`, `frontend/src/services/tasks/task.api.js`, `frontend/src/services/tasks/task.runtime.js`, `frontend/src/services/tasks/index.js`, and their colocated tests as validation context.`
- Proposed implementation shape: `Add a low-noise TypeScript check path scoped to the shared task service, likely through a dedicated tsconfig or equivalent include list. Prefer JSDoc typedefs and checkJs/noEmit for the pilot rather than renaming files to .ts. Keep root npm run check stable; add typecheck as an explicit pilot command unless PMO later decides it is quiet enough for the default gate.`
- Candidate boundary: `No full-repo checkJs, no .ts migration, no workspace/shared package migration, no runtime schema library, no behavior changes, and no deletion of current task service scaffolding during the pilot.`
- Success signal: `The pilot should prove whether type feedback can express Task payload/status/provenance/archived/completed contracts with low noise, while preserving the current task service tests and runtime behavior.`
- Continuity rule: `slice-002 owns only the first type-aware JS pilot. Repository-wide TypeScript migration, checkJs expansion, typed-island conversion, runtime schema adoption, and shared contract/package design must be shaped as separate future PMO slices.`
- Closeout routing requirement: `When the pilot closes, PMO must not leave follow-up only inside the execution report. It should route the next recommended step into sprint_candidates.md, idea_backlog.md, or decision_log.md, even if the decision is to pause TypeScript expansion.`
- Promoted candidate: `docs/pmo/state/sprint_candidates.md#type-aware-js-pilot-shared-task-boundary`
- Follow-up from execution: `The task-service pilot passed but used noResolve plus a local Vue ref shim to stay scoped. PMO routed the next step as Type-Aware JS Pilot Phase 2: Shared Frontend Support Boundary, focused on deciding whether apiClient and minimal shared Vue/support typing should become a reusable typed support layer before expanding more feature boundaries.`
- Phase 2 readiness note: `Human accepted the candidate direction on 2026-05-05. PMO narrowed the ready boundary to apiClient plus minimal Vue/ref support typing only. If the import graph starts pulling in broader frontend modules, the worker should stop and report rather than expanding checkJs scope.`
- Backend DTO pilot readback: `Type-Aware Backend DTO Pilot completed and validated. It proved that route-level DTO JSDoc/checkJs can express the ctx.state.validatedBody handoff, but it needed noResolve and narrow suppression because normal module resolution quickly pulled service/model/Koa surfaces beyond the safe touch zone. PMO judgment: do not expand backend checkJs from route handlers by default.`
- Typed-island direction: `Next TypeScript work should move closer to a root/pure source file, starting with the product mutation schema/DTO module as a tiny .ts island. During migration, the .ts source can emit or maintain CommonJS-compatible .js for existing JavaScript routes; when enough backend code has migrated, the repo should retire per-island generated JS and switch to a coherent whole-backend dist runtime.`
- Current typed-island candidate: `docs/pmo/state/sprint_candidates.md#backend-schema-typed-island-pilot`

### `slice-003`

- Name: `Runtime Schema And API Contract Guardrails`
- Why separate: `Runtime validation protects real API/AI/account-boundary inputs where TypeScript alone cannot prove safety. Good candidates include auth payloads, task/note/project mutations, AI route payloads, and frontend API response normalization.`
- Current maturity: `completed with follow-up`
- Likely target: `idea_backlog | sprint_candidates`
- Parking trigger: `Park if no concrete payload defect or route-boundary churn exists after root gates are stable.`
- Reopen signal: `New account-owned models, persisted chat/settings/runtime preferences, or API payload drift across frontend/backend.`
- Human preference: `Prefer introducing Zod rather than building another hand-written validator layer if the runtime schema boundary is likely to become durable. The concern is that hand-written validators may create a temporary architecture that later needs to be migrated again.`
- PMO shaping note: `A first runtime-schema pilot should still be bounded. The likely first candidate is a task mutation schema pilot that introduces Zod only at a narrow backend request boundary, preserves current error response behavior, and reports whether the pattern should expand to Notes, Projects, Auth, AI payloads, frontend response normalization, or localStorage snapshots.`
- Promoted candidate: `docs/pmo/state/sprint_candidates.md#task-mutation-zod-schema-pilot`
- Completed pilot: `docs/pmo/history/reports/task-mutation-zod-schema-pilot.md`
- Closeout readback: `Task create/update request validation now uses a narrow Zod-backed schema boundary while preserving public 400 error responses, unknown-field compatibility, and task lifecycle semantics. The follow-up Validation Error Shape V1 also completed, keeping BadRequestError as the single public 400 validation error type while letting Zod-backed validation carry internal code/source/details through the inlined assertZodSchema mapping.`
- Completed follow-up: `docs/pmo/history/reports/validation-error-shape-v1.md`
- Target placement direction: `If runtime schema adoption continues beyond a couple of route-body boundaries, the likely durable shape is routes/schemas/*.js or an equivalent route-owned schema folder. Do not split files yet just to satisfy a future shape; first migrate the next low-risk boundary and let real file pressure justify the extraction.`
- Next small-step candidate direction: `Promote Notes/Projects Mutation Zod Boundary before Auth/AI. This tests the schema pattern on ordinary product CRUD payloads while avoiding account/security and AI-contract complexity.`
- Completed product-boundary expansion: `docs/pmo/history/reports/notes-projects-mutation-zod-boundary.md`
- Schema placement trigger: `After the Notes/Projects expansion, requestValidation.js now carries task, note, and project Zod schemas plus shared validation behavior. PMO should promote route schema placement before Auth/AI payload migration so runtime-schema adoption continues from a cleaner boundary.`
- Middleware placement direction: `Route Schema Placement V1 should prefer backend/src/middleware/requestBodyValidation.ts for Koa middleware concerns and backend/src/routes/schemas/mutations.ts for product mutation schemas. requestValidation.js can retire rather than remain as a middleman, while routes should stay thin by declaring validateBody(schema) before handlers.`
- Parsed body long-term note: `Long-term, schema validation should likely move from validate-only to a trusted parsed-body boundary, preferably by writing parsed data to ctx.state.validatedBody rather than silently overwriting ctx.request.body. This should not be included in Route Schema Placement V1. It needs a later Parsed Body Boundary Decision/Pilot to decide passthrough vs strip, trim/default/coerce ownership, and whether services should accept validated DTOs.`
- Completed schema placement: `docs/pmo/history/reports/route-schema-placement-v1.md`
- Placement closeout readback: `Route Schema Placement V1 moved request-body validation runtime into backend/src/middleware/requestBodyValidation.ts, moved task/note/project mutation schemas into backend/src/routes/schemas/mutations.ts, deleted backend/src/routes/requestValidation.js, and kept validateBody(schema) validate-only with no parsed-body assignment.`
- Parsed-body pilot closeout: `docs/pmo/history/reports/parsed-body-pilot-notes-boundary.md`
- Parsed-body closeout readback: `validateBody now writes successful Zod parse results to ctx.state.validatedBody while preserving ctx.request.body as raw input. Notes create/update consumed the parsed DTO first; the follow-up Projects/Tasks rollout then moved product mutation routes onto the same trusted DTO boundary. Public 400 responses and schema semantics remain unchanged.`
- Completed parsed-body rollout: `docs/pmo/history/reports/parsed-body-rollout-projects-and-tasks.md`
- Next routing choice: `Runtime-schema adoption should now either move to Auth payloads, open a separate AI payload discussion, make a strip/trim/default/coerce decision, or pause so the current product mutation boundary can settle.`

### `slice-004`

- Name: `Package Workspace Tooling Review`
- Why separate: `The repo is already frontend/backend same-repo, but npm workspaces or pnpm workspace would change install, lockfile, deployment, and script behavior. This should follow command consolidation rather than lead it.`
- Current maturity: `emerging`
- Likely target: `idea_backlog`
- Parking trigger: `Park while root package scripts using npm --prefix remain sufficient.`
- Reopen signal: `Repeated dependency/script friction across frontend, backend, and private_core; need for shared packages; duplicated contract/types that should live in a local package.`

### `slice-005`

- Name: `Typed Islands Migration`
- Why separate: `Actual .ts migration should be gradual and start with pure rules/helpers, API clients/contracts, Pinia stores, backend services, then route handlers and Vue SFCs only after the lower-risk layers are proven.`
- Current maturity: `candidate-shaped`
- Likely target: `sprint_candidates | idea_backlog`
- Parking trigger: `Park until type-aware JS and contract guardrails show useful signal without excessive false positives.`
- Reopen signal: `Stable typecheck baseline plus a bounded module where TS materially reduces risk or improves worker comprehension.`
- First backend typed-island candidate: `Backend Schema Typed Island Pilot`

### `slice-006`

- Name: `Type-Effective Boundary Reshaping`
- Why separate: `Some TypeScript value may require architecture changes before file conversion: shared request/response contracts, typed DTO boundaries between backend routes and services, normalized frontend API clients, pure rules modules with exported domain types, and a public/private AI bridge contract. Without those boundaries, TypeScript would mostly annotate existing complexity instead of reducing it.`
- Current maturity: `emerging`
- Likely target: `idea_backlog | sprint_candidates`
- Parking trigger: `Park until the type-aware JS baseline identifies concrete boundary pain, or until a feature touches account/API/AI contracts enough to justify a boundary pass.`
- Reopen signal: `Repeated cross-layer payload drift, duplicated shape normalization, route/service ambiguity, or a selected TypeScript migration slice needing clearer shared contract ownership.`

### `slice-007`

- Name: `No-Type Scaffolding Audit`
- Why separate: `Before removing architecture files during TypeScript migration, PMO should identify which layers are durable product/runtime boundaries and which are compensating for missing static contracts. This prevents accidental deletion of real domain semantics while still allowing TypeScript to simplify duplicated helper, normalizer, and documentation surfaces.`
- Current maturity: `emerging`
- Likely target: `sprint_candidates | idea_backlog`
- Parking trigger: `Park until a TS baseline exists or a selected typed-island migration exposes removable scaffolding.`
- Reopen signal: `A TypeScript migration slice wants to delete helper/rules/normalizer files, or repeated review shows files whose only role is shape explanation rather than runtime behavior.`

### `slice-008`

- Name: `TypeScript Target Architecture Mapping`
- Why separate: `Instead of auditing the current JavaScript files one by one and arguing whether each should survive, first define the target TypeScript-era architecture for Sayachan, then map current JS modules into that target by responsibility. This turns migration into a gap-fill and classification exercise rather than a defensive preservation debate.`
- Current maturity: `completed`
- Likely target: `sprint_candidates`
- Parking trigger: `Park only if the team chooses to ship Engineering Quality Gate V1 first and delay TS architecture planning until root validation is stable.`
- Reopen signal: `Human wants to start TypeScript planning, no-type scaffolding deletion feels unclear, or a TS migration candidate needs a target architecture before implementation can be scoped.`
- Expected output: `A target TypeScript architecture map with rows like target responsibility -> current JS modules/files -> migration action. Actions should include keep, merge, replace, split, defer, and delete-candidate.`
- Boundary note: `This slice should produce planning artifacts, not perform the migration. It should define which responsibilities belong in typed contracts, runtime schema, feature API/rules/composable layers, backend DTO/service boundaries, shared services, tests, and PMO/runtime documentation.`
- Completed output: `docs/pmo/state/typescript_target_architecture_mapping.md` and Chinese companion `docs/pmo/state/typescript_target_architecture_mapping.zh.md`
- PMO readback: `The audit confirms TypeScript migration is a large staged architecture program, not a simple per-file conversion. Its main value is to define target contract boundaries, then use those boundaries to decide which JavaScript-era scaffolding can later be merged, replaced, split, deferred, or deleted.`
- Return path: `Use the completed mapping as the source artifact for future concrete implementation slices, especially slice-002 Type-Aware JavaScript Baseline and later typed-boundary pilots.`

## Open Questions

- Should `Engineering Quality Gate V1` become the next selectable sprint candidate immediately, or remain behind the current Dashboard day-phase discussion?
- Should the repo prefer plain npm root scripts first, then npm workspaces later, or should workspace adoption be evaluated at the same time as root command consolidation?
- Should TypeScript start as JS checking only, or should a tiny first `.ts` island be allowed once the typecheck baseline exists?
- Which boundaries should be reshaped before file conversion so TypeScript has leverage: frontend API clients, shared task contracts, backend DTO/service boundaries, Mongoose model adapters, or AI bridge payloads?
- Should TypeScript types live locally beside feature modules first, or should a shared contract package wait until workspace tooling exists?
- Which current architecture files are durable runtime/product boundaries, and which are no-type scaffolding that could disappear after typed contracts exist?
- Should `TypeScript Target Architecture Mapping` happen before `Type-Aware JavaScript Baseline`, so the repo knows what type architecture it is moving toward before adding typecheck pressure?
- What deletion rule should govern TS simplification so workers do not remove behavior-bearing files just because types can describe their inputs?
- Which runtime schema library, if any, fits the project best when that slice opens?
- Should CI be local-only at first, or should GitHub Actions be introduced as part of Quality Gate V1?

## Current PMO Judgment

- The project should not jump directly to full TypeScript, pnpm/Turbo/Nx, or a broad monorepo package migration.
- The best first modernization slice is likely `Engineering Quality Gate V1`: root validation commands, ESLint flat config, low-noise lint rules, and CI for existing frontend/backend test/build paths.
- TypeScript should become a staged path rather than a permanent prohibition: first type-aware JavaScript, then typed islands where the risk/reward is obvious.
- TypeScript should not be executed as a mechanical per-file rewrite. The target shape should be contract-led: introduce or sharpen typed boundaries first, then convert files inside those boundaries when doing so improves correctness, readability, or worker confidence.
- Backend route files are poor first TS islands because normal module resolution pulls in services, models, Koa ctx, and runtime package typing quickly. Prefer pure schema/DTO/rules modules as the first .ts islands, then move outward only after interop is proven.
- Backend typed islands may temporarily use generated or facade-backed CommonJS JavaScript so existing JS routes can keep running under plain Node while .ts source becomes the authority. Treat that artifact as migration scaffolding to delete when the backend eventually moves to an overall dist runtime.
- TypeScript may let the repo delete some no-type scaffolding, but the deletion decision must be classification-driven: keep files that own behavior, side effects, product semantics, runtime validation, or public/private boundaries; simplify or remove files whose main job is duplicating shape assumptions that can become typed contracts.
- A stronger planning route is to define the TypeScript-era target architecture first, then map the current JavaScript repo into it by responsibility. This makes migration a structured fill-in exercise and identifies delete/merge candidates without making every current file feel like a special case.
- Package workspace tooling should be delayed until root command consolidation proves insufficient or a real shared package/contract need appears.
- Runtime schema guardrails may be as important as TypeScript for account/API/AI boundaries because they protect live inputs.
- The runtime-schema placement is now `backend/src/middleware/requestBodyValidation.ts` plus `backend/src/routes/schemas/mutations.ts` for product mutation schemas. Product mutation routes now use `ctx.state.validatedBody` as the parsed DTO boundary while preserving raw `ctx.request.body`; Auth/AI migration, strip/trim/default/coerce semantics, and broader payload validation remain separate decisions.

## Backend Migration Lessons For Frontend TypeScript

The backend migration produced several rules that should guide frontend TypeScript work before PMO promotes the next frontend TS candidate.

### 1. Do not start from the integration hub

- Backend lesson: route handlers looked like a convenient place to type because they see the whole request/response path, but they immediately pulled in Koa generics, services, models, ObjectId parsing, auth state, runtime validation, and module-system decisions.
- Frontend implication: do not start frontend TS from Vue SFCs, page shells, router-wide guards, or large composables if the goal is low-risk migration. Those are frontend integration hubs and will pull UI state, stores, API calls, refs, lifecycle hooks, CSS-facing props, router metadata, and component emits into the same decision.
- Better first targets: pure rules, DTO modules, API response/request contracts, shared service helpers, and small stores only after their API/rules dependencies are typed enough.

### 2. Prove the build/runtime path before expanding files

- Backend lesson: the biggest migration risk was not syntax; it was runtime loading. CommonJS vs ESM, source vs dist, generated artifacts, package import boundaries, and private_core all mattered more than converting one file.
- Frontend implication: Vite can compile `.ts` and Vue SFC TypeScript more naturally than plain Node, but PMO still needs a clear typecheck/build story before broad conversion. Decide whether the frontend path is checkJs, typed islands, `vue-tsc`, Vite-only transpilation, or a staged combination before touching many files.
- Guardrail: a `.ts` file that Vite can bundle is not automatically part of a useful typecheck gate. The frontend should not confuse successful dev/build transpilation with a coherent TypeScript validation boundary.

### 3. Treat transitional scaffolding as explicit debt

- Backend lesson: generated JS, DTO pilots, route facades, `__generated__`, external module declarations, and shared route-state aliases were acceptable only because PMO named them as transitional and later removed or consolidated them.
- Frontend implication: `frontend/src/services/tasks/typecheck-shims.d.ts`, scoped tsconfig `noResolve`, JSDoc typedefs, and any local Vue/ref shims must be labeled as pilot scaffolding. They should not silently become the permanent frontend TS architecture.
- Guardrail: each frontend TS candidate should say which scaffolding is expected to remain, shrink, or be deleted during closeout.

### 4. Let TypeScript expose architecture debt, then classify before deleting

- Backend lesson: TypeScript exposed real issues such as route state duplication, weak middleware typing, ObjectId assumptions, model typing gaps, and JS-era normalizers. Some were deleted or simplified; others were confirmed as durable runtime boundaries.
- Frontend implication: when TS exposes frontend duplication, PMO should classify it before action:
  - durable product/runtime boundary: keep and type
  - no-type shape scaffolding: merge or delete only after typed contracts and tests exist
  - mixed integration surface: split before converting
- Guardrail: do not delete feature rules, composables, stores, API modules, or UI-local state merely because a type can describe their inputs. Delete only after proving the file has no behavior, side effects, product semantics, or public boundary value.

### 5. Keep runtime validation separate from type safety

- Backend lesson: Zod and TypeScript solved different problems. TypeScript clarified internal contracts; Zod protected external HTTP inputs and produced parsed DTOs.
- Frontend implication: TS should not replace runtime checks for untrusted API responses, localStorage/resource-cache snapshots, runtimeControls persistence, markdown sanitation, or future AI payloads. Types can describe expected shape, but runtime guards still protect persisted and external data.
- Guardrail: frontend TS work should explicitly name which data is trusted internal state and which data remains runtime-validated or normalized.

### 6. Expand through reusable boundaries, not blanket checkJs

- Backend lesson: broad checkJs from route handlers was noisy; pure typed islands worked better. The useful pattern was to expand through boundaries that could become reusable architecture.
- Frontend implication: the completed task-service and apiClient pilots are useful, but the next step should not be full-repo checkJs. It should either:
  - create a durable frontend type-support plan, or
  - promote another narrow typed boundary with low import-graph risk.
- Good next candidates may include frontend DTO/type placement, API result helper typing, resource-cache snapshot typing, runtimeControls store typing, or a pure rules typed island. Poor next candidates are broad Vue SFC conversion, router-wide conversion, or feature composable conversion before API/rules contracts are stable.

### 7. Human gates should be architecture gates, not per-file gates

- Backend lesson: after the big decisions were approved, repeated migration could be automated. Human review mattered at architecture forks: dist runtime, ESM, private_core boundary, runtime loaders, public behavior changes.
- Frontend implication: PMO can automate repetitive conversion once the frontend TS path is decided, but should stop for real gates:
  - whether to introduce `vue-tsc`
  - whether frontend typecheck enters root `npm run check`
  - whether to convert Vue SFCs
  - whether to introduce shared contract packages/workspaces
  - whether to change API response normalization/runtime validation
  - whether to remove pilot shims or no-type scaffolding

### 8. Candidate shape for the next frontend TS move

- Recommended next PMO move is not full migration. It should be a planning or bounded implementation candidate such as `Frontend TypeScript Support Boundary Plan`.
- Expected output should answer:
  - what the frontend TS validation command should be
  - whether `typecheck:tasks` remains explicit or enters root `npm run check`
  - whether `noResolve` and `typecheck-shims.d.ts` remain pilot-only
  - where frontend DTO/domain types should live before any workspace/shared package exists
  - which first typed island should follow after support boundary cleanup
  - which frontend surfaces are explicitly out of scope until lower layers are typed

## Backend Type-Aware Lint Findings And Follow-Up Slices

The Backend TS Quality Gate Cleanup sprint briefly tried `typescript-eslint` type-aware recommended rules before settling on a low-noise non-type-aware TS lint setup. The stricter rule set surfaced useful signals, but most findings crossed the quality-gate slice boundary. Record them here so they do not get lost or accidentally forced into unrelated work.

### Finding classification

#### `private_core bridge contract is still trust-based`

- Signal: `backend/src/ai/bridge.ts` imports `@allier/sayachan-ai-core` through an `unknown` module declaration and asserts it to `{ chat: Chat }`.
- Classification: `real boundary weakness`.
- Current rationale: this is a deliberate migration boundary that keeps private_core out of the backend TypeScript build/runtime cutover.
- Risk: private core can change its public `chat` API without backend TypeScript catching the mismatch.
- Do not fix by: pulling `backend/private_core/**` into backend build or lint.

#### `public DTO contracts are still wider than final form`

- Signal: product DTOs still use `Record<string, unknown>` and auth public DTOs expose many fields as `unknown`.
- Classification: `real boundary weakness plus compatibility compromise`.
- Current rationale: broad DTOs preserved current Mongoose `toObject()` output and public response compatibility during migration.
- Risk: backend TypeScript confirms DTO adapters exist, but does not yet strongly describe public API response contracts.
- Do not fix by: casually deleting extra fields or changing API response shapes without route/API contract tests.

#### `route middleware state still uses optional state plus route-local assertions`

- Signal: `validatedBody` and `objectIds` are optional in shared route state, while routes read them via local typed accessors or `as` casts.
- Classification: `real type-safety weakness and practical Koa middleware compromise`.
- Current rationale: Koa/@koa/router middleware ordering and state refinement are hard to express cleanly without over-engineering route composition.
- Risk: a future route middleware ordering mistake may be caught by tests rather than the compiler.
- Do not fix by: forcing app-level middleware and route-level helpers into a single giant context type.

#### `type-aware lint found several local rule frictions`

- Signal examples: redundant `unknown` union in bridge input, `unknown` stringification warnings in auth service, async route handler without `await`, and enum-comparison lint friction in health route.
- Classification: `mixed`.
- Current rationale: some are symptoms of the broader bridge/DTO/route-state boundaries; some are local cleanup opportunities.
- Risk: enabling type-aware recommended rules globally now would force several unrelated architecture cleanups into one lint sprint.
- Do not fix by: turning on strict semantic lint without a candidate that owns the resulting noise.

### Follow-up slice candidates

#### `backend-hardening-001`

- Name: `AI Core Public Bridge Contract`
- Maturity: `candidate-shaped`
- Goal: `Replace the public backend's private-core bridge trust boundary with an explicit narrow contract for the imported AI core surface, without pulling private_core into backend build or changing AI route behavior.`
- Likely scope: `backend/src/ai/privateCoreContract.d.ts`, `backend/src/ai/bridge.ts`, possibly a small bridge contract/test around chat invocation shape.`
- Non-goals: `No private_core TypeScript/ESM migration, no provider orchestration redesign, no prompt/kernel changes, no AI route response changes.`
- Validation: `backend build, backend tests, AI route tests, root npm run check.`
- Escalation: `Stop if the fix requires changing private_core package internals or expanding backend build/lint into private_core.`

#### `backend-hardening-002`

- Name: `Backend Public DTO Contract Tightening`
- Maturity: `emerging`
- Goal: `Tighten public DTO response types for auth/product records where the API contract is already stable, while preserving public response behavior and Mongoose model separation.`
- Likely scope: `backend/src/domain/dtos/*.ts`, route/service tests that lock response fields, possibly focused model-to-DTO adapter tests.`
- Non-goals: `No frontend API client changes unless tests prove an existing contract mismatch; no deletion of compatibility fields without explicit approval; no model schema redesign.`
- Validation: `backend tests plus root npm run check; add focused DTO tests if response contract risk increases.`
- Escalation: `Stop if tightening types implies public API response shape changes or frontend contract changes.`
- Split outcome: `Auth Public DTO Contract Tightening completed and validated as the safe first cut because auth DTOs already had an explicit public field list. Product DTOs remain intentionally compatibility-wide through Record<string, unknown> plus ...normalized spreading, so the next safe product step is Product DTO Contract Characterization before any type narrowing or field whitelist change.`

#### `backend-hardening-002b`

- Name: `Product DTO Contract Characterization`
- Maturity: `candidate-shaped`
- Goal: `Add focused characterization tests for current task/project/note DTO output behavior so later product DTO tightening can distinguish existing public response facts from desired API cleanup.`
- Likely scope: `backend/src/domain/dtos/productDtos.ts` only as read context; new focused backend DTO contract tests under backend/test; no production behavior change expected.`
- Non-goals: `No product DTO implementation changes unless needed only to expose existing behavior to tests; no field removal or whitelist adoption; no frontend API changes; no route/service behavior changes; no model schema redesign.`
- Validation: `focused product DTO contract test, backend tests, root npm run check.`
- Escalation: `Stop if characterization reveals disagreement about whether currently spread fields such as userId, originId, originModule, createdAt, updatedAt, currentFocusTaskId, title/content/name/summary should remain public API fields.`
- Split outcome: `Product DTO Contract Characterization completed and validated. It proved current broad spread-compatible behavior and confirmed that true API exposure reduction requires a response/use-case mapper ownership split before field whitelist design.`

#### `backend-hardening-002c`

- Name: `Product Response Mapper Ownership Split`
- Maturity: `candidate-shaped`
- Goal: `Move product response mapper ownership out of domain/dtos and into a service-owned response mapper location, preserving current DTO behavior so future use-case-specific response DTOs can be introduced without overloading one generic product DTO.`
- Likely scope: `backend/src/services/responses/productResponses.ts` or equivalent service-owned response mapper files; service imports currently using productDtos; existing product DTO characterization tests; optional compatibility removal if no references remain.`
- Non-goals: `No field whitelist adoption, no field removal, no public API response behavior change, no frontend API changes, no route/service behavior changes beyond import ownership, no task/project/note use-case mapper split yet.`
- Validation: `focused product DTO/response mapper contract test, backend tests, root npm run check.`
- Escalation: `Stop if moving ownership requires changing response fields, splitting task/project/note use cases, or redesigning service folder structure beyond the minimal responses location.`
- Split outcome: `Product Response Mapper Ownership Split completed and validated. Response mappers now live under backend/src/services/responses/productResponses.ts while shared lifecycle helpers live under backend/src/domain/tasks/lifecycle.ts. The next safe step before field whitelist implementation is a frontend/backend usage audit that proposes public response field sets per model/use case.`

#### `backend-hardening-002d`

- Name: `Product Response Field Usage Audit`
- Maturity: `candidate-shaped`
- Goal: `Audit frontend and backend usage of task/project/note response fields and produce a proposed public field whitelist for future response mapper tightening, without changing runtime behavior.`
- Likely scope: `frontend/src/**`, `backend/src/services/responses/productResponses.ts`, product route/service tests, and a new PMO audit artifact under docs/pmo/state if useful.`
- Non-goals: `No product response mapper implementation changes; no field removal; no API behavior change; no frontend behavior change; no route/service/model changes.`
- Validation: `read-only/code-search audit plus focused documentation artifact review; root validation only if code or tests are changed.`
- Escalation: `Stop if the audit reveals fields whose public/private status needs human product decision, especially userId, originId/originModule, currentFocusTaskId, createdAt/updatedAt, or AI/dashboard-only context fields.`
- Split outcome: `Product Response Field Usage Audit completed and validated. The human approved the ordinary non-AI product response whitelist decisions; AI endpoint payloads remain separate and should be audited by prompt/service usage before any AI-specific DTO narrowing.`

#### `backend-hardening-002e`

- Name: `AI Product Payload Field Audit`
- Maturity: `candidate-shaped`
- Goal: `Audit frontend-to-backend AI note/project payloads and backend prompt/service field usage to propose narrow AI-specific DTO fields, without changing AI route behavior.`
- Likely scope: `frontend/src/features/notes/notes.api.js`, `frontend/src/features/projects/projects.api.js`, `backend/src/routes/schemas/ai.ts`, `backend/src/services/aiService.ts`, AI route tests, and a new PMO audit artifact under docs/pmo/state if useful.`
- Non-goals: `No AI route implementation change; no frontend payload change; no prompt text change; no private_core/provider change; no product response whitelist implementation.`
- Validation: `read-only/code-search audit plus documentation artifact review; root validation only if code or tests are changed.`
- Escalation: `Stop if narrowing AI payload fields requires deciding prompt behavior, fallback behavior, private-core contracts, or whether AI should reload entities only by id instead of consuming frontend-supplied content.`

#### `backend-hardening-003`

- Name: `Route State Accessor Refinement`
- Maturity: `emerging`
- Goal: `Reduce route-local casts around validated bodies and parsed ObjectIds with shared accessors or runtime assertions, without redesigning Koa middleware composition.`
- Likely scope: `backend/src/routes/routeTypes.ts`, route helper/accessor module if needed, route files that currently read `ctx.state.validatedBody` or `ctx.state.objectIds`.`
- Non-goals: `No app-level middleware unification, no route behavior changes, no broad router abstraction, no removal of tests that currently protect middleware order.`
- Validation: `backend tests, route contract tests, root npm run check.`
- Escalation: `Stop if the implementation needs a new route composition framework or changes middleware ordering semantics.`

#### `backend-hardening-004`

- Name: `Backend Type-Aware ESLint Readiness`
- Maturity: `emerging`
- Goal: `Re-evaluate a type-aware backend ESLint subset after bridge/DTO/route-state hardening has removed the noisiest findings.`
- Likely scope: `eslint.config.mjs`, root lint scripts, possibly a small allowlist of semantic rules with known value.`
- Non-goals: `No blanket adoption of recommendedTypeChecked if it forces unrelated architecture work; no frontend lint changes.`
- Validation: `npm run lint:backend, npm run check.`
- Escalation: `Stop if the rule set creates more architectural work than lint value.`

## Promotion Outcome

- `slice-001` was promoted to `docs/pmo/state/sprint_candidates.md` as `Engineering Quality Gate V1`, executed, validated through root `npm run check`, and accepted for closeout.
- Completed quality-gate report: `docs/pmo/history/reports/engineering-quality-gate-v1.md`
- `slice-002` has been promoted to `docs/pmo/state/sprint_candidates.md` as `Type-Aware JS Pilot: Shared Task Boundary`.
- Follow-up candidate created from slice-002 execution: `Type-Aware JS Pilot Phase 2: Shared Frontend Support Boundary`.
- `slice-008` was promoted to `docs/pmo/state/sprint_candidates.md` as `TypeScript Target Architecture Mapping`, executed, and accepted for closeout.
- Completed audit artifact: `docs/pmo/state/typescript_target_architecture_mapping.md`
- Completed Chinese companion: `docs/pmo/state/typescript_target_architecture_mapping.zh.md`
- `slice-003` was promoted to `docs/pmo/state/sprint_candidates.md` as `Task Mutation Zod Schema Pilot`, executed, validated through focused backend tests, full backend tests, and root `npm run check`, and accepted for closeout.
- Completed runtime-schema pilot report: `docs/pmo/history/reports/task-mutation-zod-schema-pilot.md`
- Follow-up candidate created from slice-003 execution: `Validation Error Shape V1`, executed, validated through focused backend tests, full backend tests, and root `npm run check`, and accepted for closeout.
- Completed validation-error report: `docs/pmo/history/reports/validation-error-shape-v1.md`
- Follow-up candidate shaped from slice-003 direction: `Notes/Projects Mutation Zod Boundary`.
- Notes/Projects candidate executed, validated through focused backend tests, full backend tests, and root `npm run check`, and accepted for closeout.
- Completed Notes/Projects runtime-schema report: `docs/pmo/history/reports/notes-projects-mutation-zod-boundary.md`
- Follow-up candidate created from Notes/Projects execution: `Route Schema Placement V1`.
- Route Schema Placement V1 executed, validated through focused backend tests, full backend tests, and root `npm run check`, and accepted for closeout.
- Completed route schema placement report: `docs/pmo/history/reports/route-schema-placement-v1.md`
- Follow-up candidate created from Route Schema Placement V1: `Parsed Body Boundary Decision`.
- Parsed Body Pilot: Notes Boundary executed, validated through focused backend tests, full backend tests, and root `npm run check`, and accepted for closeout.
- Completed parsed-body pilot report: `docs/pmo/history/reports/parsed-body-pilot-notes-boundary.md`
- Follow-up candidate created from parsed-body pilot: `Parsed Body Rollout: Projects And Tasks`.
- Parsed Body Rollout: Projects And Tasks executed, validated through focused backend tests, full backend tests, and root `npm run check`, and accepted for closeout.
- Completed parsed-body rollout report: `docs/pmo/history/reports/parsed-body-rollout-projects-and-tasks.md`
- Follow-up candidate created from parsed-body rollout and slice-002 direction: `Type-Aware Backend DTO Pilot`.
- Type-Aware Backend DTO Pilot executed, validated through backend DTO typecheck, focused backend tests, full backend tests, and root `npm run check`, and accepted for closeout.
- Completed backend DTO pilot report: `docs/pmo/history/reports/type-aware-backend-dto-pilot.md`
- Follow-up candidate created from backend DTO pilot: `Backend Schema Typed Island Pilot`.
- Backend TypeScript/ESM migration through route/service/model/middleware cleanup and Route Middleware Typing Cleanup produced the frontend migration lessons recorded above. Use them before promoting the next frontend TS candidate.
- Backend TS Quality Gate Cleanup completed the low-noise lint/guardrail layer and recorded type-aware lint findings as backend-hardening follow-up slices above.
- `slice-004` through `slice-007` remain discussion-shaped follow-ons until Quality Gate V1, target architecture mapping, or a concrete architecture pressure makes them execution-ready.
