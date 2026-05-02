# Discussion Batch `discussion_batch_014`

- Topic: `Frontend feature-layer split for Projects, Notes, and Dashboard`
- Last updated: `2026-04-26`
- Status: `active`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `frontend architecture / feature-layer migration`
- Origin trigger: `follow-up from discussion_batch_013 stable closeout after Projects, Notes, Dashboard, ChatEntry, and selected support-layer behavior coverage landed`
- Source channel: `human discussion`
- Why now: `The frontend behavior baseline is now strong enough to support a safer separation of rules, API access, and stateful feature orchestration without changing product behavior. The previous discussion deliberately avoided feature-layer migration; this batch is the home for that migration.`
- Related baseline: `FRONTEND_ARCHITECTURE_AUDIT_2026-04-23.md`
- Related stable discussion: `discussion_batch_013`

## Source Trace

- Parent batch: `state/discussions/discussion_batch_013.md`
- Parent outcome: `Frontend behavior rules and selected support-layer tests stabilized.`
- Why split out: `Feature-layer migration should not be hidden inside the testing baseline. It needs its own discussion because it changes frontend ownership boundaries even when product behavior stays unchanged.`

## Why This Discussion Exists

- Current large feature components still mix view rendering, local state, API calls, async orchestration, validation state, toast/error handling, and feature behavior.
- `*.behavior.js` helpers are now tested and useful, but they only cover pure rules. They do not solve stateful orchestration inside `ProjectsPanel.vue`, `NotesPanel.vue`, and `Dashboard.vue`.
- The intended target shape is a small, repo-native frontend feature layer:
  - `*.api.js` for feature transport / endpoint calls
  - `*.rules.js` or existing `*.behavior.js` for pure rules
  - `use*.js` for stateful feature orchestration
- Human direction for Dashboard: `Dashboard AI workflow is not expected to reopen short-term. The current saved-task Dashboard business should be treated as the formal Dashboard business for this migration, not as a temporary placeholder waiting for old AI workflow revival.`

## Theme Summary

### `theme-001`

- Summary: `Separate Projects, Notes, and Dashboard feature ownership into API, rules, and composable/controller layers while preserving current product behavior.`
- Why grouped: `The same architectural gap appears across the three main surfaces: pure rules now exist, but data access and stateful orchestration remain trapped inside large SFCs.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `discussion_batch_013 made rules safer to move, so the next architectural question is where runtime feature ownership should live.`

## Target Layer Model

### API Layer

- Purpose: endpoint calls, request payloads, response parsing, feature-specific transport naming.
- Possible names:
  - `frontend/src/features/projects/projects.api.js`
  - `frontend/src/features/notes/notes.api.js`
  - `frontend/src/features/dashboard/dashboard.api.js`
- Relationship to shared services:
  - a future `services/apiClient.js` can own base URL, fetch wrapper, JSON parsing, and error construction
  - feature API files should call that shared client rather than repeating `API_BASE`

### Rules Layer

- Purpose: pure business/display derivation already safe to unit-test.
- Existing sources:
  - `frontend/src/components/projectsPanel.behavior.js`
  - `frontend/src/components/notesPanel.behavior.js`
  - `frontend/src/components/dashboard.behavior.js`
- Possible future names:
  - `projects.rules.js`
  - `notes.rules.js`
  - `dashboard.rules.js`
- Constraint: preserve current tests and behavior before moving names/paths.

### Feature Composable / Controller Layer

- Purpose: stateful orchestration between API, rules, stores, and components.
- Possible names:
  - `useProjects.js` or `useProjectsFeature.js`
  - `useNotes.js` or `useNotesFeature.js`
  - `useDashboardTasks.js`
- Should own:
  - loading/error/toast-facing state where appropriate
  - fetch/refresh flows
  - create/edit/delete/archive/restore/pin/unpin actions
  - task capture orchestration for Projects
  - edit snapshot orchestration for Notes
  - saved-task active/archive view orchestration for Dashboard
- Should not own:
  - visual layout
  - shared UI primitive behavior
  - broad product redesign
  - old Dashboard AI workflow revival

## Possible Slices

### `slice-001`

- Name: `Shared API client and feature API boundaries`
- Why separate: `Projects, Notes, and Dashboard all repeat API base URL and direct fetch logic. A shared API client lowers migration risk before extracting large composables.`
- Current maturity: `shaping`
- Likely target: `sprint_candidates`
- Candidate coverage:
  - introduce `frontend/src/services/apiClient.js`
  - move feature endpoint calls behind `projects.api.js`, `notes.api.js`, and dashboard task API helpers where useful
  - preserve existing endpoints and payloads
  - keep chat API behavior, `taskService.js`, and cockpit context service working unless explicitly migrated
- Out of scope:
  - backend API changes
  - retry/cache library introduction
  - route redesign
  - feature UI changes
- Parking trigger: `If endpoint ownership cannot be separated without first deciding feature state ownership.`
- Reopen signal: `If PMO can name the smallest endpoint set that should move first with tests preserved.`

### `slice-002`

- Name: `Projects feature-layer split`
- Why separate: `ProjectsPanel is still the largest and highest-risk component because it owns project CRUD, task capture, AI suggestion actions, focus management, archive/pin flows, and project-card task previews.`
- Current maturity: `shaping`
- Likely target: `sprint_candidates`
- Candidate coverage:
  - create a Projects feature layer such as `frontend/src/features/projects/`
  - move project endpoint calls into `projects.api.js`
  - move or alias current project behavior helpers into a rules layer without breaking tests
  - extract stateful orchestration into `useProjects.js` / `useProjectsFeature.js`
  - keep `ProjectsPanel.vue` as mostly rendering and event binding
  - preserve all current behavior tests from discussion_batch_013
- Out of scope:
  - Projects redesign
  - new AI suggestion semantics
  - backend route/model changes
  - browser/UI review baseline
- Parking trigger: `If Projects extraction would require changing product behavior instead of moving ownership boundaries.`
- Reopen signal: `If PMO can define a bounded first Projects slice, likely around API + CRUD state before task-capture/focus orchestration.`

### `slice-003`

- Name: `Notes feature-layer split`
- Why separate: `NotesPanel owns API calls, draft persistence, CodeMirror edit state, validation, archive/pin flows, AI task generation, and local note state. It needs orchestration separation but should avoid editor redesign.`
- Current maturity: `shaping`
- Likely target: `sprint_candidates`
- Candidate coverage:
  - create a Notes feature layer such as `frontend/src/features/notes/`
  - move note endpoint calls into `notes.api.js`
  - move or alias current note behavior helpers into a rules layer without breaking tests
  - extract stateful orchestration into `useNotes.js` / `useNotesFeature.js`
  - keep CodeMirror hosting and rendering stable unless a narrow extraction is safe
  - preserve all current behavior tests from discussion_batch_013
- Out of scope:
  - CodeMirror redesign
  - markdown identity/style refresh
  - note backend changes
  - AI task reveal/list redesign
  - browser/UI review baseline
- Parking trigger: `If extraction becomes entangled with editor comfort or rendered markdown identity changes.`
- Reopen signal: `If PMO can define the first safe Notes split, likely API + validation/edit snapshot orchestration before editor-host changes.`

### `slice-004`

- Name: `Dashboard saved-task feature-layer split`
- Why separate: `Dashboard is now a formal saved-task surface plus cockpit-signal bridge, not a waiting room for the removed AI workflow. Its current business can be separated into a saved-task feature layer.`
- Current maturity: `shaping`
- Likely target: `sprint_candidates`
- Candidate coverage:
  - create a Dashboard feature layer such as `frontend/src/features/dashboard/`
  - treat current saved-task behavior as the official Dashboard business boundary
  - move saved-task endpoint/update/delete flows into dashboard task API helpers or reuse a clearer task API boundary
  - move current dashboard behavior helpers into a rules layer without breaking tests
  - extract saved-task view state and actions into `useDashboardTasks.js`
  - preserve cockpit-signal publishing behavior unless a separate AI context architecture discussion replaces it
- Out of scope:
  - reopening Weekly Review, Focus Recommendation, Action Plan, or Task Drafts
  - Dashboard AI workflow redesign
  - replacing cockpitSignals with formal AI context architecture
  - broad Dashboard information architecture redesign
  - browser/UI review baseline
- Parking trigger: `If Dashboard work starts depending on old removed AI workflow assumptions.`
- Reopen signal: `If saved-task behavior remains the explicit target and the cockpit bridge is preserved or separately scoped.`

## Current PMO Judgment

- This batch should be treated as architecture migration planning, not another behavior-test coverage batch.
- The correct sequencing is probably:
  - start with a shared API client or one feature API boundary
  - extract one feature composable at a time
  - keep existing behavior tests green throughout
  - add new composable/API tests only where a new layer owns real behavior
- Projects is likely the highest-value first feature split because it has the most orchestration density.
- Notes is a close second but has editor-host complexity that should be kept out of the first extraction.
- Dashboard is now eligible for feature-layer splitting because the human has clarified that current saved-task Dashboard behavior is formal enough; it should not wait for short-term AI workflow revival.
- ChatEntry does not need to be part of this batch unless future chat orchestration becomes more complex. It already has service/store/rules coverage and is not the main source of frontend feature-layer debt.

## Open Questions

- Should the first execution slice introduce `services/apiClient.js` before any feature composable extraction?
- Should feature code live under `frontend/src/features/{feature}/` immediately, or should existing component-adjacent files be moved later after a first composable lands?
- Should `*.behavior.js` be renamed to `*.rules.js` during the migration, or should renaming wait until imports are already stable?
- For Projects, should the first split focus on project CRUD and archive/pin flows before task capture and focus orchestration?
- For Notes, should draft localStorage ownership move into `useNotesFeature()` or remain inside `NotesPanel.vue` until editor concerns are separated?
- For Dashboard, should saved-task mutation flows continue using `taskService.js` or move behind a dashboard-specific task API wrapper?

## Suggested Next PMO Action

- Review actual `ProjectsPanel.vue`, `NotesPanel.vue`, and `Dashboard.vue` code before promoting any slice.
- Prefer promoting only one feature split at a time.
- Do not promote a broad all-at-once migration unless the candidate explicitly separates write scopes and validation gates.
- Keep behavior baseline from `discussion_batch_013` as the acceptance guardrail for this discussion.

## Implementation Checkpoint - Projects Feature-Layer Split v1

- Date: `2026-05-01`
- Status: `landed / cleanup pass completed`
- Scope: `Projects only`

### What Landed

- Created `frontend/src/features/projects/` as the first frontend feature-module home.
- Added:
  - `projects.api.js` for Projects endpoint boundaries
  - `projects.rules.js` for pure Projects rules migrated from the old component-adjacent behavior helper
  - `useProjectsFeature.js` for Projects stateful orchestration
- Kept `frontend/src/components/projectsPanel.behavior.js` as a compatibility re-export to avoid breaking older imports.
- Updated `ProjectsPanel.vue` to consume `useProjectsFeature()` for project list state, CRUD, archive/restore, pin/unpin, AI suggestion fetch, saved suggestion handling, focus update, and project task-card refresh.
- Moved project task-capture orchestration into `useProjectsFeature.js`, including single/batch capture state, validation errors, manual task saves, batch task saves, capture closeout, and project task-card refresh.
- Added API boundary tests and composable orchestration tests for the new Projects feature layer.
- Retargeted the existing Projects rules behavior test to import the new `features/projects/projects.rules.js` path directly.

### Deliberate Remainder

- Preview expansion/filter UI state remains in `ProjectsPanel.vue` for now.
- The old `projectsPanel.behavior.js` compatibility path remains for now.
- No Notes, Dashboard, BJD/module registry, backend route, or product UI behavior changes were included.

### PMO Reading

- The feature-module direction is now proven enough to use as the template for later Notes and Dashboard migration.
- ProjectsPanel now mainly retains rendering, card/list preview derivation, menu state, and UI expansion/filter state; that remaining state is acceptable to leave component-local unless future work needs a still thinner view layer.

## Implementation Checkpoint - Notes Feature-Layer Split v1

- Date: `2026-05-03`
- Status: `landed / validation passed`
- Scope: `Notes only`

### What Landed

- Created `frontend/src/features/notes/` as the Notes feature-module home.
- Added:
  - `notes.api.js` for Notes endpoint boundaries
  - `notes.rules.js` for pure Notes rules migrated from the old component-adjacent behavior helper
  - `useNotesFeature.js` for Notes stateful orchestration
- Kept `frontend/src/components/notesPanel.behavior.js` as a compatibility re-export to avoid breaking older imports.
- Updated `NotesPanel.vue` to consume `useNotesFeature()` for note list state, CRUD, archive/restore, pin/unpin, edit snapshots, validation errors, note draft fallback, AI task generation, and AI task saving.
- Left CodeMirror editor host lifecycle in `NotesPanel.vue`; the feature layer owns note state and orchestration, while the component still owns concrete editor instances and DOM refs.
- Added API boundary tests and composable orchestration tests for the new Notes feature layer.
- Retargeted the existing Notes rules behavior test to import the new `features/notes/notes.rules.js` path directly.

### Deliberate Remainder

- CodeMirror setup/binding remains component-local by design.
- Note overflow menu state and toast rendering remain component-local UI concerns.
- The old `notesPanel.behavior.js` compatibility path remains for now.
- No Dashboard, BJD/module registry, backend route, or product UI behavior changes were included.

### Validation

- `npm test`: passed, `13` files / `93` tests.
- `npm run build`: passed; existing Vite large chunk warning remains.

### PMO Reading

- Notes now matches the Projects split pattern: `api`, `rules`, and `useXXFeature`.
- The core-module migration now has two proven examples. Dashboard is the natural next core module to migrate if we continue this architecture pass.

## Implementation Checkpoint - Dashboard Feature-Layer Split v1

- Date: `2026-05-03`
- Status: `landed / validation passed`
- Scope: `Dashboard only`

### What Landed

- Created `frontend/src/features/dashboard/` as the Dashboard feature-module home.
- Added:
  - `dashboard.rules.js` for pure Dashboard saved-task rules migrated from the old component-adjacent behavior helper
  - `useDashboardFeature.js` for Dashboard saved-task orchestration
- Extended `frontend/src/services/taskService.js` with shared `updateTask()` and `deleteTask()` helpers instead of creating a duplicate Dashboard API wrapper.
- Kept `frontend/src/components/dashboard.behavior.js` as a compatibility re-export to avoid breaking older imports.
- Updated `Dashboard.vue` to consume `useDashboardFeature()` for saved-task list state, quick add, completion/reactivation, archive/restore, delete, archived tab switching, preview expansion, and task menu closeout.
- Left cockpit signal hydration in `Dashboard.vue` as a deliberate temporary AI context bridge; it should move only when the AI context/runtime layer is addressed.
- Added composable orchestration tests for the new Dashboard feature layer and taskService mutation tests for the shared task API boundary.
- Retargeted the existing Dashboard rules behavior test to import the new `features/dashboard/dashboard.rules.js` path directly.

### Deliberate Remainder

- Dashboard page-level project prefetch remains in `DashboardPage.vue`.
- Cockpit signal bridge remains component-local for now.
- The old `dashboard.behavior.js` compatibility path remains for now.
- No Projects, Notes, BJD/module registry, backend route, or product UI behavior changes were included.

## Closeout - Frontend Feature-Layer Migration

- Date: `2026-05-03`
- Status: `closed / completed`
- Final validation:
  - `npm test`: passed, `15` files / `105` tests.
  - `npm run build`: passed; existing Vite large chunk warning remains.

### Completed Scope

- Established `frontend/src/features/` as the home for module-level frontend feature logic.
- Migrated core modules:
  - `features/projects/`: `projects.api.js`, `projects.rules.js`, `useProjectsFeature.js`
  - `features/notes/`: `notes.api.js`, `notes.rules.js`, `useNotesFeature.js`
  - `features/dashboard/`: `dashboard.rules.js`, `useDashboardFeature.js`
  - `features/chat/`: `chat.api.js`, `chat.rules.js`, `useChatFeature.js`
- Removed component-adjacent `*.behavior.js` compatibility files and renamed rule tests into feature folders.
- Converted `ProjectsPage.vue`, `NotesPage.vue`, and `DashboardPage.vue` into pure page shells.
- Removed Dashboard's proactive cockpit-signal preheat path.
- Renamed dashboard context service to `cockpitContextService.js`.
- Moved chat endpoint behavior from `services/chatService.js` into `features/chat/chat.api.js`.

### Final Architecture Reading

- `views/*Page.vue` are route/page shells only.
- `components/*Panel.vue` and `components/Chat.vue` own rendering, DOM refs, local UI affordances, and visual composition.
- `features/{module}` owns module API boundaries, pure rules, and stateful orchestration composables.
- `services/` is now reserved for true shared/app-level services:
  - `taskService.js`
  - `cockpitContextService.js`

### Explicit Remainders

- `taskService.js` still combines task API helpers with shared task runtime refs; this is acceptable for now because tasks are cross-feature shared state.
- `cockpitContextService.js` is still a lightweight bridge, not a formal AI context runtime.
- CodeMirror editor hosting remains in `NotesPanel.vue` by design.
- Project task preview expansion/filter state remains in `ProjectsPanel.vue` as local UI state.
- Existing Vite large chunk warning remains outside this migration closeout.

### Next Discussion Candidates

- Optional module boundary and future `bjd` feature/module registration.
- Whether `taskService.js` should later split into task API plus shared task runtime.
- Whether cockpit context should graduate into a formal AI context runtime.
- Whether page shell wrapping should become router/meta driven if more modules remain thin shells.

## Implementation Checkpoint - Chat Feature Split and Naming Cleanup v1

- Date: `2026-05-03`
- Status: `landed / validation passed`
- Scope: `ChatEntry` rename and chat orchestration extraction

### What Landed

- Renamed `frontend/src/components/ChatEntry.vue` to `frontend/src/components/Chat.vue`.
- Updated `App.vue` to render `<Chat />`.
- Added `frontend/src/features/chat/useChatFeature.js` for chat popup state and send orchestration:
  - open/close popup
  - runtime panel toggle
  - input draft state
  - hydration state
  - send button disabled/label derivation
  - typed and preset send flow
  - cold cockpit-context hydration
  - `sendChat()` request orchestration
  - assistant fallback reply on send failure
- Kept DOM-specific scroll handling and `messageListRef` inside `Chat.vue`.
- Kept `chat.rules.js` for pure chat send/context rules.
- Added `useChatFeature.test.js` for stateful chat orchestration coverage.

### PMO Reading

- The old `ChatEntry` naming is retired from frontend source.
- Chat now follows the same split shape as the core modules where it matters: `rules` plus `useChatFeature`.
- Chat API behavior was later moved into `features/chat/chat.api.js`; see the Chat API Relocation checkpoint.

### Validation

- `npm test`: passed, `15` files / `105` tests.
- `npm run build`: passed; existing Vite large chunk warning remains.

## Implementation Checkpoint - Chat API Relocation v1

- Date: `2026-05-03`
- Status: `landed / validation passed`
- Scope: `services/chatService.js` relocation

### What Landed

- Moved chat endpoint boundary from `services/chatService.js` into `features/chat/chat.api.js`.
- Moved chat API tests from `services/chatService.test.js` into `features/chat/chat.api.test.js`.
- Removed `services/chatService.js`.
- Updated `useChatFeature.js` to import `sendChat()` from the feature-local API.
- Removed runtime store access from the chat API boundary:
  - `useChatFeature()` reads runtime controls.
  - `chat.api.js` only builds the request payload and validates the response.

### PMO Reading

- Chat now has the same three-part feature shape as Projects and Notes: `api`, `rules`, and `useChatFeature`.
- `services/` is reduced to true shared/app-level services: task runtime and cockpit context hydration.

### Validation

- `npm test`: passed, `15` files / `105` tests.
- `npm run build`: passed; existing Vite large chunk warning remains.

## Implementation Checkpoint - Behavior Compatibility Removal v1

- Date: `2026-05-03`
- Status: `landed / validation passed`
- Scope: `frontend/src/components/*.behavior.js` compatibility cleanup

### What Landed

- Removed component-adjacent behavior compatibility files:
  - `frontend/src/components/projectsPanel.behavior.js`
  - `frontend/src/components/notesPanel.behavior.js`
  - `frontend/src/components/dashboard.behavior.js`
  - `frontend/src/components/chatEntry.behavior.js`
- Moved rule tests into feature folders and renamed them to `*.rules.test.js`:
  - `features/projects/projects.rules.test.js`
  - `features/notes/notes.rules.test.js`
  - `features/dashboard/dashboard.rules.test.js`
  - `features/chat/chat.rules.test.js`
- Added `features/chat/chat.rules.js` and updated `ChatEntry.vue` to import chat send/context rules from the feature layer.
- Confirmed frontend source no longer contains `*.behavior.js` or `*.behavior.test.js` files.

### PMO Reading

- The temporary compatibility bridge is closed.
- Component-adjacent behavior naming is retired for migrated UI rules.
- Future rule extraction should land directly under `frontend/src/features/{module}/*.rules.js` or an appropriate service/store boundary.

### Validation

- `npm test`: passed, `14` files / `100` tests.
- `npm run build`: passed; existing Vite large chunk warning remains.

### PMO Reading

- Projects, Notes, and Dashboard now all have feature-module homes.
- Dashboard confirms the lighter variant of the pattern: feature rules + feature composable, with shared services carrying generic task API mutations.
- The next cleanup candidate is page-level direct fetch cleanup for `ProjectsPage.vue`, `NotesPage.vue`, and `DashboardPage.vue`, not more Dashboard decomposition.

## Implementation Checkpoint - Page Fetch and Cockpit Preheat Cleanup v1

- Date: `2026-05-03`
- Status: `landed / validation passed`
- Scope: `ProjectsPage`, `NotesPage`, `DashboardPage`, `Dashboard`

### What Landed

- Removed page-level direct fetch from `ProjectsPage.vue` and made it a pure `Panel` shell around `ProjectsPanel`.
- Removed page-level direct fetch from `NotesPage.vue` and made it a pure `Panel` shell around `NotesPanel`.
- Removed `projects` prop synchronization from `ProjectsPanel.vue`; Projects now owns its initial fetch through `useProjectsFeature()`.
- Removed Dashboard's proactive cockpit signal preheat path:
  - `DashboardPage.vue` no longer fetches projects or passes them to `Dashboard`.
  - `Dashboard.vue` no longer imports `useCockpitSignals()`, reads `activeTasksSnapshotRef`, computes dashboard context signals, or emits parent refresh events.
- Kept Chat's existing cold-start hydration path as the single cockpit context refresh mechanism:
  - `Chat.vue` checks `cockpitSignals.hasHydrated`.
  - If cold, it calls `refreshCockpitContext()`.
  - `cockpitContextService.js` fetches `/projects` and `/tasks`, derives the snapshot, and writes cockpit signals.

### PMO Reading

- Core feature pages are now presentation shells rather than data owners.
- Cockpit signals are no longer Dashboard-owned; they are Chat-demand hydrated app-level context.
- The remaining direct cockpit context fetch lives intentionally in `cockpitContextService.js`, not in page or feature UI code.

## Implementation Checkpoint - Cockpit Context Service Rename v1

- Date: `2026-05-03`
- Status: `landed / validation passed`
- Scope: `frontend/src/services/dashboardContextService.*` naming cleanup

### What Landed

- Renamed `dashboardContextService.js` to `cockpitContextService.js`.
- Renamed `dashboardContextService.test.js` to `cockpitContextService.test.js`.
- Renamed exported functions:
  - `deriveDashboardSnapshot()` -> `deriveCockpitSnapshot()`
  - `refreshDashboardContext()` -> `refreshCockpitContext()`
- Updated Chat feature rules and orchestration tests to use cockpit context naming.

### PMO Reading

- The service now names what it actually owns: app-level cockpit context hydration for Chat.
- Dashboard is no longer implied as the owner of cockpit context.
- Future context work should build from `cockpitContextService.js` or replace it with a formal AI context runtime, not route through Dashboard UI.

### Validation

- `npm test`: passed, `15` files / `105` tests.
- `npm run build`: passed; existing Vite large chunk warning remains.

### Validation

- `npm test`: passed, `14` files / `100` tests.
- `npm run build`: passed; existing Vite large chunk warning remains.
