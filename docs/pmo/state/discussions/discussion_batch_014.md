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
  - keep `chatService.js`, `taskService.js`, and `dashboardContextService.js` working unless explicitly migrated
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
