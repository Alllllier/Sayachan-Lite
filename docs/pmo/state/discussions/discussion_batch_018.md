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
- Current maturity: `emerging`
- Likely target: `sprint_candidates | idea_backlog`
- Parking trigger: `Park until root validation commands and linting are stable enough that type errors do not become a noisy second gate.`
- Reopen signal: `Quality Gate V1 lands, API/service payload bugs appear, or the human wants a TypeScript migration audit.`
- Source input after audit: `docs/pmo/state/typescript_target_architecture_mapping.md` and `docs/pmo/state/typescript_target_architecture_mapping.zh.md`
- Construction note: `Do not shape this as full TypeScript migration. If promoted, it should start as a bounded implementation slice that adds type feedback or typed boundary scaffolding around a small, high-signal area identified by the target architecture mapping.`

### `slice-003`

- Name: `Runtime Schema And API Contract Guardrails`
- Why separate: `Runtime validation protects real API/AI/account-boundary inputs where TypeScript alone cannot prove safety. Good candidates include auth payloads, task/note/project mutations, AI route payloads, and frontend API response normalization.`
- Current maturity: `emerging`
- Likely target: `idea_backlog | sprint_candidates`
- Parking trigger: `Park if no concrete payload defect or route-boundary churn exists after root gates are stable.`
- Reopen signal: `New account-owned models, persisted chat/settings/runtime preferences, or API payload drift across frontend/backend.`

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
- Current maturity: `not-shaped`
- Likely target: `idea_backlog`
- Parking trigger: `Park until type-aware JS and contract guardrails show useful signal without excessive false positives.`
- Reopen signal: `Stable typecheck baseline plus a bounded module where TS materially reduces risk or improves worker comprehension.`

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
- TypeScript may let the repo delete some no-type scaffolding, but the deletion decision must be classification-driven: keep files that own behavior, side effects, product semantics, runtime validation, or public/private boundaries; simplify or remove files whose main job is duplicating shape assumptions that can become typed contracts.
- A stronger planning route is to define the TypeScript-era target architecture first, then map the current JavaScript repo into it by responsibility. This makes migration a structured fill-in exercise and identifies delete/merge candidates without making every current file feel like a special case.
- Package workspace tooling should be delayed until root command consolidation proves insufficient or a real shared package/contract need appears.
- Runtime schema guardrails may be as important as TypeScript for account/API/AI boundaries because they protect live inputs.

## Promotion Outcome

- `slice-001` was promoted to `docs/pmo/state/sprint_candidates.md` as `Engineering Quality Gate V1`, executed, validated through root `npm run check`, and accepted for closeout.
- Completed quality-gate report: `docs/pmo/history/reports/engineering-quality-gate-v1.md`
- `slice-008` was promoted to `docs/pmo/state/sprint_candidates.md` as `TypeScript Target Architecture Mapping`, executed, and accepted for closeout.
- Completed audit artifact: `docs/pmo/state/typescript_target_architecture_mapping.md`
- Completed Chinese companion: `docs/pmo/state/typescript_target_architecture_mapping.zh.md`
- `slice-002` is now the main discussion home for a future concrete TypeScript construction slice, using the completed mapping as its source input.
- `slice-003` through `slice-007` remain discussion-shaped follow-ons until Quality Gate V1, target architecture mapping, or a concrete architecture pressure makes them execution-ready.
