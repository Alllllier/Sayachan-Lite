# Discussion Batch `discussion_batch_018`

- Topic: `Engineering modernization path after MVP guardrails`
- Last updated: `2026-05-05`
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
- Middleware placement direction: `Route Schema Placement V1 should prefer backend/src/middleware/requestBodyValidation.js for Koa middleware concerns and backend/src/routes/schemas/mutations.js for product mutation schemas. requestValidation.js can retire rather than remain as a middleman, while routes should stay thin by declaring validateBody(schema) before handlers.`
- Parsed body long-term note: `Long-term, schema validation should likely move from validate-only to a trusted parsed-body boundary, preferably by writing parsed data to ctx.state.validatedBody rather than silently overwriting ctx.request.body. This should not be included in Route Schema Placement V1. It needs a later Parsed Body Boundary Decision/Pilot to decide passthrough vs strip, trim/default/coerce ownership, and whether services should accept validated DTOs.`
- Completed schema placement: `docs/pmo/history/reports/route-schema-placement-v1.md`
- Placement closeout readback: `Route Schema Placement V1 moved request-body validation runtime into backend/src/middleware/requestBodyValidation.js, moved task/note/project mutation schemas into backend/src/routes/schemas/mutations.js, deleted backend/src/routes/requestValidation.js, and kept validateBody(schema) validate-only with no parsed-body assignment.`
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
- The runtime-schema placement is now `backend/src/middleware/requestBodyValidation.js` plus `backend/src/routes/schemas/mutations.js` for product mutation schemas. Product mutation routes now use `ctx.state.validatedBody` as the parsed DTO boundary while preserving raw `ctx.request.body`; Auth/AI migration, strip/trim/default/coerce semantics, and broader payload validation remain separate decisions.

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
- `slice-004` through `slice-007` remain discussion-shaped follow-ons until Quality Gate V1, target architecture mapping, or a concrete architecture pressure makes them execution-ready.
