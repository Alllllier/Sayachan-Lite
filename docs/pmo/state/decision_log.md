# Decision Log

> Durable planning decisions that future PMO work should remember instead of rediscovering.

## Working Rules

- record approvals, deferrals, rejections, and transition rules here
- keep entries short and decision-oriented
- update this file when a discussion result or sprint closeout changes future planning
- do not leave durable decisions trapped only inside discussion batches or sprint notes
- do not use this file for ordinary candidate retention or candidate re-validation
- if a conclusion only says that a candidate still exists, keep that in `sprint_candidates.md` unless it changes future planning rules

## Entry Template

### `<decision title>`

- Date:
- Type: `approved | deferred | rejected | transition-rule`
- Scope:
- Decision:
- Reason:
- Follow-up:

## Recorded Decisions

### `Backend TypeScript migration can automate repeated execution after human architecture gates`

- Date: `2026-05-06`
- Type: `transition-rule`
- Scope: `backend TypeScript migration, PMO execution automation, sub-agent delegation, migration sequencing, and human decision gates`
- Decision: `Backend TypeScript migration should move toward automated repeated execution once the architecture direction is approved. Codex/PMO may choose migration order, timing for transitional scaffolding cleanup, and whether repeated implementation is handled by scripts or sub-agents. Human confirmation is required for key architecture decision gates such as switching backend runtime from src to dist, choosing ESM instead of CommonJS, expanding the build boundary into private_core, adopting tsx/ts-node/runtime TS loaders, changing public API/Zod behavior, or accepting broad type-check/runtime validation gate changes. Routine route/service/middleware migration steps, generated artifact cleanup after an approved cutover, test/baseline updates, and parallelizable bounded implementation slices may be delegated to one or more sub-agents without per-file human approval when the active handoff gives clear boundaries and validation.`
- Reason: `Schema, Notes route, generated-artifact guardrail, and unified tsc dry-run pilots have validated enough migration mechanics that requiring human approval for every file would slow delivery without improving architectural safety. The human wants to stay involved at real architecture forks while allowing Codex and workers to automate repetitive migration work after those forks are decided.`
- Follow-up: `Future backend TypeScript sprints should explicitly label human decision gates versus automated execution zones. If a worker hits a decision gate, it must stop and return to PMO/human review rather than silently crossing it.`

### `Runtime schema errors keep public responses stable while internal shape improves`

- Date: `2026-05-06`
- Type: `transition-rule`
- Scope: `backend runtime validation, Zod adoption, BadRequestError, and public API error responses`
- Decision: `Runtime schema adoption should preserve the current public validation response shape by default, especially { error: 'Invalid request body' } for 400 request-body failures. Zod-backed validation may carry internal BadRequestError code/source/details, but those details must not be exposed to frontend/API clients unless a separate product/API decision explicitly selects that behavior. Current route-body validation uses backend/src/middleware/requestBodyValidation.ts for BadRequestError/assertZodSchema/validateBody and backend/src/routes/schemas/mutations.ts for task/note/project mutation schemas. validateBody writes parsed data to ctx.state.validatedBody and must not overwrite ctx.request.body. Routes should adopt ctx.state.validatedBody incrementally with route-contract tests.`
- Reason: `The task, notes, and projects Zod pilots proved Zod can replace handwritten product mutation validation while preserving route behavior. Validation Error Shape V1 gave the internal error path useful schema metadata without changing public responses, Route Schema Placement V1 removed requestValidation.js in favor of Koa middleware plus route-owned schemas, Parsed Body Pilot: Notes Boundary proved ctx.state.validatedBody can serve as a trusted DTO boundary without mutating raw request input, and Parsed Body Rollout: Projects And Tasks completed the product mutation route adoption.`
- Follow-up: `Keep strip/trim/default/coerce decisions separate. Now that product mutation routes consume validated DTOs, choose whether to migrate Auth payloads, open an AI payload discussion, or pause runtime-schema adoption before expanding the boundary further.`

### `Type-aware JS pilots expand only through narrow reusable boundaries`

- Date: `2026-05-05`
- Type: `transition-rule`
- Scope: `Type-aware JavaScript pilots, scoped checkJs expansion, shared frontend support typing, and future TypeScript migration planning`
- Decision: `Type-aware JavaScript work should expand by proving narrow, reusable boundaries rather than by spreading JSDoc/checkJs across the repo. The shared task service and apiClient support pilots show that scoped checkJs can work when the import graph stays explicit and narrow. Future pilots may reuse the pattern for import-free or similarly small shared support modules, but should stop and return to PMO when the import graph begins pulling in feature modules, Vue SFCs, broad runtime surfaces, or behavior-sensitive support code. JSDoc/checkJs should be treated as a boundary-discovery tool and typed-island precursor, not as a requirement to annotate the whole JavaScript repo before TypeScript migration.`
- Reason: `The task-service pilot passed with JSDoc/checkJs/noEmit but needed noResolve and a local Vue ref shim. The Phase 2 apiClient pilot proved a minimal shared support boundary can be included without broadening the graph, while also confirming that the shim remains a pilot artifact rather than durable frontend-wide typing.`
- Follow-up: `For the next TypeScript step, choose either another narrow shared support/service pilot or pause to design a durable frontend type-support plan if the next target imports feature modules, Vue SFCs, or broad shared runtime code. Do not promote full-repo checkJs or full TypeScript migration directly from these pilots.`

### `Backend TypeScript should start from pure typed islands, not route checkJs expansion`

- Date: `2026-05-06`
- Type: `transition-rule`
- Scope: `backend TypeScript migration, DTO typing, route/service boundaries, and typed-island sequencing`
- Decision: `Do not expand backend TypeScript by broadly enabling checkJs from route handlers. Route-level DTO JSDoc/checkJs may be useful as a diagnostic pilot, but durable backend TypeScript migration should start from pure, low-dependency typed islands such as product mutation schemas/DTOs before moving outward to services and routes.`
- Reason: `The Type-Aware Backend DTO Pilot passed validation but required noResolve and narrow suppression to avoid TypeScript pulling services, models, Koa ctx, and runtime package surfaces into the check graph. That is a useful signal that route handlers are integration hubs, not good first typed islands.`
- Follow-up: `Shape Backend Schema Typed Island Pilot next. Before activation, confirm CommonJS route interop and build/typecheck conventions so the schema island does not force broad module-system or route conversion work.`

### `Backend typed islands may use transitional generated CommonJS artifacts`

- Date: `2026-05-06`
- Type: `transition-rule`
- Scope: `backend TypeScript migration interop, CommonJS runtime, generated JavaScript artifacts, and final dist migration`
- Decision: `During gradual backend TypeScript migration, a typed island may use a .ts source file as the authority and provide generated or facade-backed CommonJS-compatible .js for existing JavaScript consumers. This is a transitional migration pattern, not the final backend runtime shape. As typed islands expand and the backend can run through a coherent build output, the generated per-island JavaScript should be deleted or retired in favor of a whole-backend dist runtime.`
- Reason: `The backend currently runs plain CommonJS through node src/server.js, so existing routes cannot directly require .ts files. A transitional generated-JS/facade convention lets the repo gain typed source-of-truth files without immediately redesigning backend startup, deployment, or every route/service import.`
- Follow-up: `Backend Schema Typed Island Pilot may proceed with this convention. Closeout should document where generated/facade JS lives, whether it is committed or build-produced, and what condition later triggers cleanup into the final dist-based backend runtime.`

### `Repo constraints are JavaScript-first, not early-stage freeze rules`

- Date: `2026-05-05`
- Type: `transition-rule`
- Scope: `repo engineering constraints, worker guidance, frontend/backend workspace shape, and future TypeScript/tooling migration planning`
- Decision: `Sayachan should keep the current repo JavaScript-first and should not introduce TypeScript opportunistically inside routine feature, fix, or cleanup work. TypeScript is no longer treated as a permanent forbidden path; it must be promoted as a bounded PMO architecture candidate before adoption. The current frontend/backend same-repo layout is the active repo shape, so old "do not use monorepo" style constraints should not be applied. Package-manager workspace tooling such as npm workspaces or pnpm workspace should also not be introduced incidentally; it needs a separate tooling/maintenance window if repeated script or dependency friction makes it worthwhile. Pinia and Vue Router are current stack facts, not prohibited additions.`
- Reason: `Early project constraints in README still described the scaffold-stage freeze, including prohibitions that no longer matched the audited repository. The live PMO baseline already records a frontend-backend monorepo and the frontend now uses Pinia and Vue Router. Keeping outdated freeze rules active would mislead future workers and block deliberate architecture improvement while failing to protect the genuinely sensitive areas.`
- Follow-up: `Use README and AGENT.md as the lightweight worker-facing expression of this rule. Reopen as a sprint candidate only if the human wants a real TypeScript migration audit, npm/pnpm workspace tooling review, or broader dependency hygiene refresh.`

### `Medium-term account model stays personal-account scoped`

- Date: `2026-05-04`
- Type: `approved`
- Scope: `account ownership schema, product route/service boundaries, and future model planning`
- Decision: `For the visible medium-term product direction, Sayachan should remain a personal-account product rather than introducing Workspace, Organization, Membership, or team-sharing models. User-authored product data should be owned directly by userId; current Note, Project, Task, and persisted AI context route pipelines attach current-user middleware before model access; new user-authored models should add ownership from the start. Workspace/membership/sharing should only be introduced if real collaboration or shared-space requirements appear.`
- Reason: `The expected medium-term product is personal accounts with isolated user data, not team collaboration. Direct userId ownership is simpler and appropriate for that shape, while route/service current-user guards and ownership indexes prevent the current model from feeling like a loose post-auth patch. Bootstrap owner remains the only legacy single-user migration path.`
- Follow-up: `When adding future content models such as settings, chat history, attachments, runtime preferences that are account-owned, or generated artifacts, decide explicitly whether the data is user-owned, device-level, public template data, or private-core-owned before shipping the schema. Do not reintroduce unowned product-content service fallbacks unless a new migration path is explicitly approved.`

### `Owner-led invite-gated auth uses a lightweight phase-one boundary`

- Date: `2026-05-04`
- Type: `approved`
- Scope: `first-phase authentication, tester onboarding, owner capabilities, account isolation, and private-core access boundary`
- Decision: `Phase-one auth should use an owner/tester role model with a reusable registration page gated by invite code. Registration requires email, password, and invite code; invite codes are not email-bound, are single-use, expire after one month, and can be revoked by the owner. Sessions should be cookie-backed. Email is the account identifier, while email/phone verification is deferred with verification fields reserved. Tester accounts start with empty product data and get the normal current product experience scoped to their own data. The in-product owner surface stays small: manage invites, view tester account metadata, disable or restore tester login, and view basic system status. Owner should not view/edit tester content, impersonate testers, manage provider/API keys, control prompt/private-core internals, use full-site import/export, manage complex permissions, or hard-delete users in phase one.`
- Reason: `Friend testing needs real account isolation and owner-controlled entry without prematurely building a full multi-tenant system or broad admin console. The human owner already has code and local environment access for deeper operations, so product-level owner controls should stay focused on convenient tester management.`
- Follow-up: `Promote implementation as two bounded candidates: Auth Invite Session Owner Skeleton first, then Account Data Isolation And AI Context Boundary after reliable current-user identity exists. Revisit verification, broader admin, sharing, public-launch abuse prevention, and private-core-facing controls only when those pressures become real.`

### `PMO runtime transitions use templates and tools as the apply layer`

- Date: `2026-05-04`
- Type: `transition-rule`
- Scope: `PMO activation, handoff, closeout, and archival workflow`
- Decision: `Active PMO runtime transitions should instantiate from the canonical state and history templates, and may use `docs/pmo/tools/pmo.mjs` for mechanical activation, closeout, archive, and idle-reset file writes. PMO judgment remains human/Codex-owned: sprint selection, validation status, documentation-sync outcome, commit state, residual risk, and follow-up routing must be chosen before the tool applies state changes.`
- Reason: `The earlier handoff flow depended on live manual translation between candidate context, active runtime files, archive templates, and idle resets. That made the process paperwork-heavy and increased drift risk. The PMO automation V1 work moved those repetitive writes into a local apply layer while preserving the role boundary between judgment and mechanical state updates.`
- Follow-up: `Use `docs/pmo/tools/README.md`, `docs/pmo/protocols/sprint-workflow.md`, and `docs/pmo/protocols/execution-handoff-protocol.md` as the canonical operating references. Reopen only if future PMO runs show that the tool-generated handoff is too rigid, misses required judgment slots, or needs integration with a worker launch path.`

### `Removed Dashboard AI workflow is not active scope`

- Date: `2026-05-04`
- Type: `rejected`
- Scope: `Dashboard product runtime and PMO planning`
- Decision: `The old fallback-only Dashboard AI workflow, including Weekly Review, Focus Recommendation, Action Plan, Task Drafts, and the Dashboard AI Assistant block, is deprecated and should not be treated as active Dashboard scope or as a parked near-term sprint. Current Dashboard planning should use the saved-task surface and cockpit-signal bridge as the formal runtime surface.`
- Reason: `The old workflow has already been removed from the real frontend and baseline docs. Keeping it as an active backlog item made Dashboard review planning sound as if a parallel AI workflow still needed to be protected or redesigned soon.`
- Follow-up: `Only reopen Dashboard AI from a fresh product/AI discussion if the human explicitly asks for a new Dashboard AI concept. Do not revive the removed fallback workflow by default.`

### `UI review screenshots are review artifacts`

- Date: `2026-05-04`
- Type: `transition-rule`
- Scope: `PMO validation and UI review reporting`
- Decision: `Repo-native UI review screenshots should be treated as low-noise review artifacts, not golden snapshots or automated visual assertions. Stable committed screenshots may live under surface-local `frontend/tests/ui-review/<surface>/screenshots/` directories, while temporary debug screenshots should stay out of git. Closeout reports must distinguish browser validation, artifact capture, and actual inspected UI review.`
- Reason: `Notes and Projects now both have Playwright UI review paths that can generate screenshots. Without a durable rule, PMO closeouts could confuse a passing command or captured screenshot with actual visual inspection, and future surfaces could create inconsistent binary artifact churn.`
- Follow-up: `Use `docs/pmo/policies/testing-and-ui-review-guide.md` as the canonical reporting and artifact-retention rule. Reopen only if screenshot churn becomes noisy or future UI review surfaces need stronger artifact conventions.`

### `Shared task service uses API rules runtime split`

- Date: `2026-05-03`
- Type: `approved`
- Scope: `frontend shared services`
- Decision: Shared task behavior should live under `frontend/src/services/tasks/` as `task.api.js`, `task.rules.js`, and `task.runtime.js`. Feature code should import shared task behavior through the task package entrypoint, not through the removed legacy `taskService.js` path.
- Reason: Tasks are cross-feature shared state rather than a Notes, Projects, or Dashboard-owned feature. Splitting the service by responsibility keeps future project-note mounting work from coupling module UI code to task HTTP and cockpit snapshot internals.
- Follow-up: Do not restore implementation or compatibility exports into `taskService.js`; add future shared task capabilities under `frontend/src/services/tasks/`.

### `Frontend feature code lives under feature modules`

- Date: `2026-05-03`
- Type: `approved`
- Scope: `frontend architecture`
- Decision: `Module-level API boundaries, pure rules, and stateful orchestration composables should live under `frontend/src/features/{module}/`. Page components should stay route shells, while visual components should keep rendering, DOM refs, and local UI affordances. Shared services should be reserved for cross-feature or app-level runtime concerns.`
- Reason: `discussion_batch_014 migrated Projects, Notes, Dashboard, and Chat into feature-layer homes, removed component-adjacent behavior helpers, and clarified that task runtime and cockpit context hydration are shared services rather than module UI logic.`
- Follow-up: `Use this as the default placement rule for future BJD/optional modules, taskService splitting, cockpit context runtime work, and any new feature extraction.`

### `Sprint selection remains human-gated`

- Date: `2026-04-18`
- Type: `transition-rule`
- Scope: `PMO sprint activation`
- Decision: `Candidate drafting and PMO momentum do not authorize automatic sprint activation. A sprint starts only after explicit human selection.`
- Reason: `Recent PMO testing showed that generic "continue" language can be over-read by the host and cause premature sprint activation if the selection gate is not written down clearly.`
- Follow-up: `Keep this rule explicit in current_sprint.md, sprint workflow, and any future host behavior layer.`

### `Rendered note identity work is deferred into a broader Sayachan style refresh`

- Date: `2026-04-19`
- Type: `deferred`
- Scope: `Notes follow-up discussion_batch_002 and future Sayachan presentation planning`
- Decision: `The current Notes follow-up should stop at editing-surface comfort fixes. Rendered-surface identity changes should not be folded into this follow-up and are instead deferred into a later broader Sayachan style refresh.`
- Reason: `The current discussion stabilized the editing-side comfort corrections enough to bound a near-term slice, but the stronger visual identity direction belongs to a wider product-level styling pass rather than a narrow editor follow-up.`
- Follow-up: `Keep the future style-refresh work visible in idea_backlog.md and avoid re-expanding the Notes comfort slice into rendered-surface identity work unless the broader refresh is intentionally reopened.`

### `Archive is orthogonal to lifecycle status across task, project, and note`

- Date: `2026-04-20`
- Type: `approved`
- Scope: `Task, project, and note model semantics plus future parent-child/reference planning`
- Decision: `Archive should be treated as a separate dimension rather than as one more lifecycle status value. Task lifecycle should move toward \`active | completed\`; project status should express progress only; note should follow the same archive-separation rule even if its lifecycle remains simple for now. Container archive behavior must not overwrite the object's own lifecycle semantics.`
- Reason: `Project archive/restore exposed that mixing lifecycle meaning and archive meaning inside one status field causes semantics loss, especially when restoring completed tasks. The same ambiguity would likely recur as soon as project-subproject, project-note, or note-note relationships become real.`
- Follow-up: `Use this rule as the design boundary for shaping the next execution slice. The immediate implementation candidate is a task/project/note archive-model alignment pass, while any legacy-data compatibility should stay minimal and development-stage appropriate.`

### `Display-list disclosure may mount on the primary ListSection`

- Date: `2026-04-23`
- Type: `transition-rule`
- Scope: `Frontend display-list baseline shaping after the first Projects task-preview implementation`
- Decision: `Display-list disclosure should not be treated as universally list-level by rule. When a surface is organized around one main readable section plus one or more secondary sections, the primary `ListSection` may own the effective `preview / expanded` control and corresponding disclosure state.`
- Reason: `Real implementation and human review on the Projects task preview showed that outer-list disclosure made the list shell feel artificially empty and blurred the difference between the main task reading surface and the secondary archived section. Section-mounted disclosure matched the product semantics more cleanly and required independent expand state to avoid unrelated sections opening together.`
- Follow-up: `Use this rule when shaping the later Dashboard pass and any future list-baseline follow-ons. Keep `discussion_batch_012.md` as the living discussion home for how far this rule should generalize beyond the current validated Projects surface.`

### `AI reveal list cleanup is deferred until AI core ownership is clearer`

- Date: `2026-04-24`
- Type: `deferred`
- Scope: `discussion_batch_012 display-list follow-on for NotesPanel ai-task-item and ProjectsPanel ai-suggestion-item`
- Decision: `Do not promote the previously expected display-list pass-3 for `ai-task-item` and `ai-suggestion-item` as near-term UI cleanup. Park those surfaces until future AI core and product-runtime ownership is clearer.`
- Reason: `Projects task preview and Dashboard saved tasks already validated the shared display-list anchors. The AI reveal/list surfaces are likely to be substantially reshaped by future AI core integration, so normalizing them now risks polishing interim UI that may be replaced rather than reused.`
- Follow-up: `Use the landed list primitives as reference only when AI/list convergence reopens from a concrete AI core integration need or a blocking UI cleanup surface.`
