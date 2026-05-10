# TypeScript Target Architecture Mapping

- Sprint: `TypeScript Target Architecture Mapping`
- Status: `planning artifact`
- Last updated: `2026-05-05`
- Scope: documentation-only audit; no TypeScript migration or runtime change

## Purpose

This artifact defines the target responsibility model for a future TypeScript-aware Sayachan and maps current JavaScript modules into that target by responsibility.

It is not a migration plan, package decision, schema-library decision, or deletion approval. Migration actions are classifications for future PMO routing:

- `keep`: preserve the responsibility as a durable boundary; typed migration can mostly annotate or sharpen it.
- `merge`: likely combine duplicated contract or shape work once typed contracts exist.
- `replace`: likely swap current ad hoc validation/normalization with a typed or runtime-schema-backed boundary in a future approved slice.
- `split`: likely separate mixed responsibilities before or during type adoption.
- `defer`: leave alone until a later architecture or product slice needs it.
- `delete-candidate`: possible removal only after tests and runtime review prove the file/layer contains no durable behavior, side effects, semantics, or boundary ownership.

## Target TypeScript-Era Responsibility Model

### 1. Domain Contracts And DTOs

Target responsibility:

- Define stable public domain types for Note, Project, Task, User, Invite, Session, cockpit snapshot, chat runtime controls, and AI request/response DTOs.
- Distinguish persisted model shape from API response shape and frontend editable form/input shape.
- Represent lifecycle and provenance as explicit unions: task status, project status, creation mode, origin module, account role/status, archived/active views.

Migration posture:

- Types should clarify boundaries first; file conversion should follow where contracts reduce real ambiguity.
- Shared contracts may start near feature/API boundaries before any workspace/shared package exists.

### 2. Runtime Schema And External Input Validation

Target responsibility:

- Keep runtime validation distinct from TypeScript.
- Validate untrusted external inputs at backend HTTP boundaries: auth/session payloads, note/project/task mutations, persisted AI note/project payloads, chat payloads, owner operations, and query parameters.
- Normalize backend error payloads at the route/middleware layer.

Migration posture:

- TypeScript should not replace runtime validation.
- A future schema-library slice may replace ad hoc validators, but dependency choice is explicitly out of scope here.

### 3. Frontend Feature API Boundaries

Target responsibility:

- Keep feature `*.api` modules as transport/endpoint boundaries.
- Typed request/response DTOs should live at or near these modules first.
- API modules should remain responsible for endpoint choice, credentialed fetch behavior through the shared client, response parsing, and transport errors.

Migration posture:

- Preserve API boundary files even if helper internals are simplified.

### 4. Frontend Feature Rules Boundaries

Target responsibility:

- Keep pure product rules separate from Vue component rendering and network effects.
- Encode display-state derivation, form validation, preview bucketing, focus eligibility, archive action derivation, markdown send rules, and task payload semantics as typed pure functions.

Migration posture:

- Rules modules are high-value typed islands because they are pure and behavior-bearing.
- Some small rules that only duplicate DTO shape may become merge/delete candidates after domain contracts exist.

### 5. Frontend Feature Composables

Target responsibility:

- Composables should orchestrate feature state, API calls, cache hydration, optimistic/local mutation sync, toast callbacks, AI fallback handling, and parent refresh hooks.
- Composables should consume typed APIs/rules rather than own domain contracts directly.

Migration posture:

- Preserve as durable product orchestration boundaries.
- Split only when a composable mixes unrelated runtime responsibilities that typed contracts expose.

### 6. Shared Frontend Services And Stores

Target responsibility:

- Shared services own cross-feature runtime bridges: API client, task runtime, resource cache, cockpit context derivation, markdown rendering.
- Stores own global UI/runtime state: auth account/session state, chat shell state, cockpit signals, runtime controls.
- Account-scoped versus device-level persistence rules should be explicit and typed.

Migration posture:

- Preserve durable runtime services and stores.
- Consider merging no-type shape normalizers only after contract definitions and tests cover the same behavior.

### 7. Frontend Components, Views, Router, And UI Primitives

Target responsibility:

- Views stay thin route page shells.
- Components own rendering, local UI-only interaction state, editor integration, and emitted UI events.
- UI primitives stay behavior-light and reusable.
- Router owns navigation guards, public/auth route metadata, and redirect semantics.

Migration posture:

- Defer SFC conversion until lower-risk API/rules/service/store typing is stable.
- Do not delete component-local UI state that owns interaction behavior merely because data contracts become typed.

### 8. Backend Routes, Services, Models, Middleware

Target responsibility:

- Routes own HTTP shape, middleware composition, request validation, response status mapping, and route-local fallback behavior.
- Services own product semantics, ownership-scoped data access, archive/focus cascades, and persisted lifecycle transitions.
- Models own persistence schema, indexes, allowed persisted enum values, and timestamps.
- Middleware owns auth/session loading, current-user enforcement, owner gating, and JSON error normalization.

Migration posture:

- Preserve route/service/model/middleware separation as a durable backend boundary.
- Split AI route internals before typing if route-local prompt/fallback helpers continue to grow.

### 9. Public Backend To Private AI Core Bridge

Target responsibility:

- Public repo owns `/ai/chat` route shape, runtime-control payload pass-through, fallback response behavior, and the bridge contract into private core.
- Private core owns chat orchestration, prompt kernel, provider integration, personality composition, and deeper context assembly policies.

Migration posture:

- `backend/src/privateCore/bridge.ts` remains the intended public bridge and owns a narrow public contract over private-core chat execution.
- Do not redesign private-core internals from the public repo mapping.

### 10. Validation, Tests, And PMO Documentation

Target responsibility:

- Preserve behavior-lock tests around rules, API boundaries, stores, shared services, and UI review surfaces.
- Keep PMO baselines as truth records; update only when runtime truth changes.
- Keep execution_task/report state as PMO runtime surfaces, not product code.

Migration posture:

- TypeScript should complement current behavior tests, not replace them.
- Documentation-only maps can be archived by PMO after closeout.

## Current JS To Target Mapping

| Target responsibility | Current JS modules/files | Migration action | Rationale | Risk / dependency notes |
| --- | --- | --- | --- | --- |
| Domain contracts and DTOs | Currently implicit across `frontend/src/features/**/*.api.js`, `frontend/src/services/tasks/task.rules.js`, `backend/src/models/*.ts`, `packages/contracts/src/product.ts`, PMO baselines | `replace` | Target needs explicit types for persisted models, API responses, editable inputs, and AI DTOs instead of shape assumptions spread through API/rules/validation docs. | Do not treat Mongoose model shape as identical to public DTO shape. Product request DTOs now live in shared contracts; response contract review remains a separate decision. |
| Runtime schema / external input validation | `backend/src/middleware/route/requestBodyValidation.ts`, route-level body/query checks in `backend/src/routes/*.ts`, `packages/contracts/src/product.ts`, `backend/src/middleware/app/errorBoundary.ts` | `replace` | Current Zod-backed validators and route checks are doing real runtime protection; future schema guardrails may replace implementation, not responsibility. | Runtime validation must remain even with TS. Broader schema coverage is a future PMO slice. |
| Shared HTTP client / session transport | `frontend/src/services/apiClient.js` | `keep` | Centralizes base URL, credentials, bearer fallback token storage, and request transport. | Type should clarify fetch options and error/result shapes; do not merge into feature APIs. |
| Auth feature API | `frontend/src/features/auth/auth.api.js` | `keep` | Durable endpoint boundary for current user, login/logout, tester registration, owner management calls. | Future DTOs should distinguish public auth routes from owner-only operations. |
| Auth account store | `frontend/src/stores/auth.js` | `keep` | Owns current-user/session state and account-scoped runtime reset of chat, cockpit signals, and resource cache. | Account-boundary behavior is durable; do not delete as no-type scaffolding. |
| Auth and owner UI | `frontend/src/views/LoginPage.vue`, `frontend/src/views/RegisterPage.vue`, `frontend/src/views/OwnerPage.vue`, `frontend/src/App.vue` | `defer` | SFCs own UI state, navigation, shell, owner management presentation, and logout flow. | Convert after auth API/store contracts are stable. |
| Frontend router guard | `frontend/src/router/index.js` | `keep` | Owns public/auth route metadata, owner-only route guard, current-user hydration, and redirects. | Durable runtime boundary; route meta types can sharpen but should not absorb auth store logic. |
| Notes API | `frontend/src/features/notes/notes.api.js` | `keep` | Durable transport boundary for note CRUD, pin/archive/restore, and note AI task generation. | Typed responses should distinguish persisted Note from AI draft payloads. |
| Notes rules | `frontend/src/features/notes/notes.rules.js` | `keep` | Pure behavior for form validation, edit snapshots, AI state, and allowed actions across active/archived notes. | High-value typed island; action derivation is product behavior. |
| Notes composable | `frontend/src/features/notes/useNotesFeature.js` | `keep` | Orchestrates note state, account-scoped cache, failed draft residue, API calls, AI draft save flow, and refresh notifications. | Durable runtime/product boundary; draft/cache key rules must survive TS migration. |
| Notes component/editor surface | `frontend/src/components/NotesPanel.vue`, `frontend/src/views/NotesPage.vue` | `split` | NotesPanel mixes rendering, CodeMirror lifecycle, toast/menu local state, and feature orchestration. | Defer SFC typing. A future split could isolate editor integration without changing note behavior. |
| Projects API | `frontend/src/features/projects/projects.api.js` | `keep` | Durable transport boundary for project CRUD, pin/archive/restore, next-action AI, and focus update. | Focus update DTO should make task-based focus explicit. |
| Projects rules | `frontend/src/features/projects/projects.rules.js` | `keep` | Pure behavior for validation, task capture, preview buckets, archived branch separation, focus eligibility, and focus title derivation. | High-value typed island; focus/archive semantics are architecture-sensitive. |
| Projects composable | `frontend/src/features/projects/useProjectsFeature.js` | `keep` | Orchestrates project state, project-card task cache, task capture, AI suggestion save flow, and focus updates. | Durable runtime boundary; cross-feature task service dependency should be typed carefully. |
| Projects component surface | `frontend/src/components/ProjectsPanel.vue`, `frontend/src/views/ProjectsPage.vue` | `split` | ProjectsPanel owns a large amount of UI-only preview/filter/menu/toast state beside feature orchestration. | Future split may extract preview UI state helpers; do not alter focus/archive behavior in this mapping. |
| Shared task frontend contract | `frontend/src/services/tasks/index.js`, `task.api.js`, `task.rules.js`, `task.runtime.js` | `keep` | This is the canonical frontend shared task boundary for payload construction, normalization, API calls, shared refs, active snapshots, and mutation sync. | `normalizeSavedTask` may later shrink after API response DTOs are typed, but shared task service itself is durable. |
| Dashboard rules/composable | `frontend/src/features/dashboard/dashboard.rules.js`, `frontend/src/features/dashboard/useDashboardFeature.js`, `frontend/src/components/Dashboard.vue`, `frontend/src/views/DashboardPage.vue` | `keep` | Dashboard saved-task behavior is routed through shared task runtime, with product rules for completion/archive/delete, preview expansion, and provenance display. | Dashboard AI remains parked; do not revive removed fallback helper path. |
| Chat API boundary | `frontend/src/features/chat/chat.api.js` | `keep` | Owns `/ai/chat` request shape, runtime-control payload construction, last-user-message derivation, future slots, and reply validation. | Should align with public bridge DTO without pulling private-core internals into frontend. |
| Chat rules/composable/store/UI | `frontend/src/features/chat/chat.rules.js`, `useChatFeature.js`, `frontend/src/stores/chat.js`, `frontend/src/components/Chat.vue` | `keep` | Owns send gating, fallback reply choice, cockpit hydration decision, shell open/close state, messages, and rendering behavior. | Durable public product behavior; assistant markdown vs user plaintext rendering should stay explicit. |
| Cockpit context bridge | `frontend/src/services/cockpitContextService.js`, `frontend/src/stores/cockpitSignals.js` | `keep` | Owns current dashboard/chat context snapshot derivation from projects/tasks and transient signal storage. | Architecture-sensitive dashboard-to-chat contract; type it before expanding it. |
| Runtime controls store | `frontend/src/stores/runtimeControls.js` | `keep` | Owns device-level AI behavior preferences and persistence. | Should become typed enum/range boundary; runtime range checks remain useful. |
| Resource cache | `frontend/src/services/resourceCache.js` | `keep` | Owns account-scoped snapshot persistence for Notes, Projects, project-card tasks, and Dashboard saved tasks. | Account scoping is durable. Serialization parsing may be typed but not deleted. |
| Markdown rendering helper | `frontend/src/utils/markdown.js` | `keep` | Shared sanitized markdown rendering for notes and assistant chat replies. | Security/runtime sanitation boundary; TS does not replace DOMPurify sanitization. |
| UI primitive components | `frontend/src/components/ui/**` | `defer` | Behavior-light shared presentation primitives with prop contracts. | Convert after app-level SFC typing patterns are settled. |
| Backend server composition | `backend/src/server.ts`, `backend/src/database.ts`, `backend/src/routes/index.ts` | `keep` | Owns Koa app composition, CORS/body/auth/error middleware order, database startup, route aggregation. | Middleware order is behavior; type changes must not reorder it. |
| Backend auth/session/owner service | `backend/src/services/authService.ts`, `backend/src/routes/authRoutes.ts`, `backend/src/middleware/app/auth.ts`, `backend/src/http/sessionCookies.ts`, `backend/src/models/User.ts`, `Invite.ts`, `Session.ts` | `keep` | Owns phase-one auth, invite flow, owner bootstrap, sessions, owner operations, role/status model shape. Legacy product-data assignment from owner bootstrap has been retired. | Security/account boundary; future DTO/schema types should be conservative. |
| Backend current-user ownership boundary | `backend/src/middleware/route/currentUser.ts`, product service `{ userId }` / `{ _id, userId }` filters | `keep` | Owns user id resolution and explicit owner-scoped query filters used by product services. | Durable account isolation boundary; never classify as scaffolding. |
| Backend Notes route/service/model | `backend/src/routes/notesRoutes.ts`, `backend/src/services/notesService.ts`, `backend/src/models/Note.ts` | `keep` | Durable route/service/model separation for scoped note CRUD, pinning, archive/restore, and note-origin task cascades. | Service behavior owns archive cascade semantics; route validation may be replaced later. |
| Backend Projects route/service/model | `backend/src/routes/projectsRoutes.ts`, `backend/src/services/projectsService.ts`, `backend/src/models/Project.ts` | `keep` | Durable separation for scoped project CRUD, status, focus task id, pinning, archive/restore, project-task cascades. | Focus/archive behavior is architecture-sensitive. |
| Backend Tasks route/service/model | `backend/src/routes/tasksRoutes.ts`, `backend/src/services/tasksService.ts`, `backend/src/models/Task.ts` | `keep` | Durable separation for scoped task reads/writes, provenance, lifecycle status, archive visibility, focus clearing. | Model/API response separation matters; task status/completed/archived typing should be explicit. |
| Backend cascade/service query/domain lifecycle helpers | `backend/src/services/cascadeService.ts`, `backend/src/services/queryFilters.ts`, `backend/src/domain/lifecycle.ts` | `split` | Service-owned cascade orchestration handles focus clearing and archive/restore task cascades; service query helpers retain Mongo query composition reused by services; domain lifecycle keeps reusable rule derivation. | Cascade/query behavior is model-touching service orchestration; lifecycle derivation remains a reusable rule helper. |
| Backend AI routes | `backend/src/routes/aiRoutes.ts` | `split` | Currently owns note/project AI routes, provider/fallback prompt construction, persisted ownership reloads, project focus context, chat route bridge invocation, and route-local test exports. | Split route-local DTO/runtime validation and provider/fallback helpers only in a future AI/API boundary slice; preserve fallbacks and ownership checks. |
| Public/private AI bridge | `backend/src/privateCore/bridge.ts`, `backend/private_core/sayachan-ai-core/**` boundary docs | `keep` | Public bridge is the intended narrow contract into private-core chat execution. | Architecture-sensitive; public mapping may define contract shape but not private-core implementation. |
| Behavior-lock tests | `frontend/src/**/*.test.js`, `frontend/tests/ui-review/**/review.spec.js` | `keep` | Existing tests lock API boundaries, rules, stores, services, orchestration, markdown rendering, and UI review surfaces. | Typecheck should add a gate, not replace these tests. |
| PMO truth/runtime docs | `AGENT.md`, `docs/pmo/baselines/*.md`, `docs/pmo/state/execution_task.md`, `docs/pmo/state/execution_report.md`, discussion batch 018 | `keep` | PMO docs carry execution boundaries, current runtime truth, and modernization rationale. | Generated sprint artifacts can be archived later by PMO closeout. |
| Local duplicated parseJsonResponse helpers | `frontend/src/features/auth/auth.api.js`, `notes.api.js`, `projects.api.js` | `merge` | Similar response parsing exists across feature APIs and may become a shared typed API result helper. | Merge only if error behavior stays consistent and tests cover endpoint-specific messages. |
| Backend route validation helper implementation | `backend/src/middleware/route/requestBodyValidation.ts`, `packages/contracts/src/product.ts` | `replace` | Responsibility is durable, but implementation may evolve with runtime schema declarations aligned with DTOs. | Do not remove current validation without equivalent runtime checks. |
| Frontend shape normalizers | `frontend/src/services/tasks/task.rules.js` `normalizeSavedTask`, project/task preview derivation helpers where they only backfill omitted fields | `merge` | Some defensive defaults compensate for implicit API response shape and may shrink after typed DTOs and runtime schemas exist. | Not a deletion approval: current normalizers encode compatibility behavior and are covered by tests. |
| Backend `normalizeNote`, `normalizeProject`, `normalizeTask` helper pieces | `backend/src/services/responses/productResponses.ts` | `merge` | Some normalization can continue to live in model-to-DTO adapters in a typed backend boundary. | Keep lifecycle/focus/archive orchestration separate from pure DTO adapters. |
| Barrel/index modules without durable package-boundary meaning | `frontend/src/components/ui/**/index.js` and future barrels that only duplicate direct imports | `delete-candidate` | Some barrels may become unnecessary if typed imports and IDE tooling make direct imports clearer. The shared task package entrypoint is explicitly excluded because PMO has already approved it as the canonical cross-feature import boundary. | Delete only if no public import boundary value remains and no package/export pattern depends on them. Do not classify `frontend/src/services/tasks/index.js` as a deletion candidate under the current shared task service decision. |
| Purely explanatory shape docs duplicated by future contracts | Selected PMO discussion or mapping notes after closeout | `delete-candidate` | Once stable contracts exist, some planning notes may be archived instead of kept as live truth. | PMO owns archival; baselines remain canonical until runtime truth changes. |

## Durable Runtime / Product Boundaries

These should not be collapsed into deletion candidates merely because TypeScript can describe their inputs:

- `backend/src/privateCore/bridge.ts` and the public/private AI responsibility split.
- Account/session/ownership boundaries: `frontend/src/stores/auth.js`, `frontend/src/services/resourceCache.js`, `backend/src/middleware/app/auth.ts`, `backend/src/middleware/route/currentUser.ts`, explicit product-service owner filters, `backend/src/http/sessionCookies.ts`, `backend/src/services/authService.ts`, auth models/routes.
- Focus/task workflow semantics: project `currentFocusTaskId`, task provenance, active/completed/archived lifecycle, and focus clearing.
- Backend ObjectId parsing boundary: `backend/src/middleware/objectIdParsing.ts`, product route params/query/body focus ids, and `currentUser` state user id.
- Archive/restore cascades in note/project/task services and backend task runtime helpers.
- Dashboard-to-chat cockpit context: `frontend/src/services/cockpitContextService.js`, `frontend/src/stores/cockpitSignals.js`, chat context hydration rules.
- Public AI routes and fallback behavior for note tasks, project next action, and chat.
- Sanitized markdown rendering as a runtime security/presentation boundary.
- Behavior-lock tests and UI review surfaces.

## No-Type Scaffolding Candidates

These are candidates for future simplification only after typed contracts and behavior tests prove the replacement:

- Duplicated frontend API response parsing helpers across feature `*.api.js` modules.
- Defensive defaulting in frontend task response normalization where it only compensates for missing explicit API response contracts.
- Backend normalization helpers that could move into explicit model-to-DTO adapters.
- Some barrel `index.js` files if they do not represent a useful public module boundary after typed imports settle. This excludes `frontend/src/services/tasks/index.js`, which remains the approved shared task service entrypoint.
- PMO planning artifacts that become historical once contracts and baselines are updated.

These are not current deletion targets:

- rules modules with product decisions
- composables with orchestration or side effects
- route/service/model boundaries
- middleware and ownership helpers
- runtime validation
- public/private AI bridge files
- files that own UI interaction state, editor lifecycle, fallback behavior, archive/focus semantics, or account-scoped persistence

## PMO-Routable Follow-Up Recommendations

1. `Type-Aware JavaScript Baseline`: introduce low-noise type feedback using `allowJs/checkJs/noEmit` or equivalent after root validation commands are stable.
2. `Runtime Schema And API Contract Guardrails`: evaluate a runtime schema approach for auth, note/project/task mutations, AI route payloads, owner endpoints, and API response adapters.
3. `Frontend Typed Boundary Pilot`: start with pure rules plus API DTOs for one surface, likely Tasks or Chat, because they expose cross-surface contracts without requiring SFC conversion first.
4. `Backend DTO / Service Boundary Pilot`: define model-to-DTO adapters and typed service inputs for Tasks, including status/completed/archived and provenance contracts.
5. `Public AI Bridge Contract Slice`: define the public `/ai/chat` and bridge DTO contract without redesigning private-core internals.
6. `No-Type Scaffolding Follow-Up Audit`: after the first typed boundary lands, re-evaluate merge/delete candidates with tests and import graph evidence.
7. `Package Workspace Tooling Review`: keep deferred until shared contract package pressure is real or root command consolidation proves insufficient.

## Validation Notes

This artifact was validated by read-only audit against:

- active sprint handoff and PMO state
- PMO baselines for system, runtime, backend API, and private-core boundary
- architecture-sensitive area and documentation-sync policy guides
- frontend feature, service, store, router, component, view, utility, and UI-review test file inventory
- backend route, service, model, middleware, server, database, and AI bridge file inventory

No runtime tests, browser validation, UI review, dependency installation, or executable code edits were required.
