# Discussion Batch `discussion_batch_013`

- Topic: `Frontend panel behavior coverage baseline`
- Last updated: `2026-04-26`
- Status: `stable`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `testing / architecture`
- Origin trigger: `split-out from discussion_batch_010 slice-002 after human direction to shape Projects, Notes, and Dashboard together as one panel-behavior coverage batch`
- Source channel: `human discussion`
- Why now: `Project display semantics, frontend shell/card/list baselines, and Dashboard saved-task list structure have all stabilized enough that the next useful frontend testing discussion is no longer whether panel behavior coverage matters, but how to slice the first multi-panel coverage baseline without freezing still-fluid Dashboard AI workflow behavior.`
- Related sprint or closeout: `Project Surface Display Semantics Cleanup; Frontend style baseline refactor; Frontend Display-List Baseline Pass 1: Projects Task Preview; Frontend Display-List Baseline Pass 2: Dashboard Saved Tasks`

## Source Trace

- Parent batch: `state/discussions/discussion_batch_010.md`
- Parent slice: `slice-002 Frontend panel behavior coverage buildout`
- Why split out: `The panel coverage line is now durable enough to need its own discussion surface. Keeping it nested inside discussion_batch_010 would blur the already-completed display-semantics cleanup with the next testing-baseline discussion.`

## Why This Discussion Exists

- Frontend automated coverage exists through `frontend/package.json -> npm test`, backed by `vitest`.
- Existing frontend tests already cover some services and panel helper behavior, but first-pass product-surface behavior coverage is still uneven.
- PMO and human direction have converged on covering `ProjectsPanel`, `NotesPanel`, and `Dashboard` in the same discussion, while keeping their depth different:
  - `ProjectsPanel` should be the strongest first-pass target because it is currently the most stable and important working surface.
  - `NotesPanel` should receive core long-lived behavior coverage, especially around stable note object flows.
  - `Dashboard` should receive narrow guardrail coverage around stabilized saved-task behavior, not broad AI workflow coverage.
- This discussion should therefore shape a single possible sprint with three execution slices rather than three disconnected testing efforts.

## Theme Summary

### `theme-001`

- Summary: `Shape a first frontend panel behavior coverage baseline across Projects, Notes, and Dashboard, with depth matched to each surface's product stability.`
- Why grouped: `The shared problem is frontend panel behavior protection, but the three panels have different maturity and different risk of over-locking transient behavior.`
- Current focus: `no`
- Status: `completed`
- For follow-up mode, the concrete issue exposed was: `discussion_batch_010 reached the point where panel behavior coverage should be shaped directly, and human direction is to include all three main panels in this batch rather than limiting the first pass to Projects only.`

## Possible Slices

### `slice-001`

- Name: `ProjectsPanel behavior coverage`
- Why separate: `ProjectsPanel is the strongest first target because project task preview semantics, archived-task display rules, focus behavior, and list/card baselines are now materially stable.`
- Current maturity: `completed`
- Likely target: `sprint_candidates`
- Candidate coverage:
  - project task preview branching for active, completed, and archived tasks
  - archived tasks staying non-interactive as focus/select targets
  - completed-task lifecycle presentation remaining distinct from archive state
  - preview versus expanded behavior where it is helper-testable without requiring screenshot review
  - current-focus selection behavior that already exists as stable panel behavior
- Out of scope:
  - broader ProjectsPanel redesign
  - new task workflow semantics
  - visual screenshot review baseline
  - AI suggestion/list convergence parked under future AI core ownership
- Parking trigger: `If Projects behavior is found to depend on unstable implementation details rather than stable helper-level contracts.`
- Reopen signal: `If PMO can name the exact Projects behaviors that should be protected without expanding into visual review or product redesign.`
- Promotion outcome: `Promoted on 2026-04-26 as sprint candidate Projects Rules Behavior Coverage.`
- Closeout outcome: `Completed on 2026-04-26. Rules-level coverage landed, preview limit was centralized into the rules helper, focus setting now reuses the active non-archived eligibility helper, and the follow-up form/task-capture rules were added without changing API or feature-layer scope. Future Projects feature-layer split is parked separately.`

### `slice-002`

- Name: `NotesPanel behavior coverage`
- Why separate: `NotesPanel is a core long-lived surface, but its first coverage pass should focus on durable note object behavior rather than rendered-note identity or broader style refresh questions.`
- Current maturity: `completed`
- Likely target: `sprint_candidates`
- Candidate coverage:
  - create-note and edit-note local behavior around valid and invalid content states
  - archive, restore, and delete action availability where it is already stable
  - edit-mode state transitions that should not regress after recent editor comfort and input-state work
  - behavior helper extraction only if needed to keep tests maintainable
- Out of scope:
  - rendered note identity refresh
  - broader Sayachan style refresh
  - CodeMirror implementation redesign
  - AI task reveal/list cleanup parked under future AI core ownership
  - browser-level writing comfort review
- Parking trigger: `If Notes behavior cannot be covered without first extracting helpers or reopening editor/runtime design questions.`
- Reopen signal: `If PMO can define a small set of durable Notes behaviors that should survive future styling and rendered-surface work.`
- Promotion outcome: `Promoted on 2026-04-26 as sprint candidate Notes Rules Behavior Coverage.`
- Closeout outcome: `Completed on 2026-04-26. Notes now has a helper-level rules baseline for local validation, AI task state derivation, and active/archived action eligibility. NotesPanel consumes the extracted helpers with no feature-layer migration, editor redesign, markdown identity change, draft-cache redesign, API change, or UI/E2E review. Future Notes feature-layer split remains parked.`

### `slice-003`

- Name: `Dashboard behavior guardrails`
- Why separate: `Dashboard still has product areas that may be redesigned, but saved-task behavior has recently stabilized enough to deserve narrow guardrail coverage.`
- Current maturity: `completed`
- Likely target: `sprint_candidates`
- Candidate coverage:
  - saved-task active versus archived view behavior
  - complete/reactivate behavior now owned by row primary click in active view
  - archive, restore, and delete action routing for saved tasks
  - preservation of source/provenance metadata only where already helper-testable
- Out of scope:
  - Dashboard AI workflow redesign
  - Weekly Review, Focus Recommendation, Action Plan, or Task Drafts reintroduction
  - broad Dashboard information architecture
  - full browser/UI review coverage for Dashboard
  - visual assertions for the shared display-list frame
- Parking trigger: `If the only available Dashboard tests would lock unstable AI workflow or product-layout behavior.`
- Reopen signal: `If the guardrail scope stays limited to saved-task behavior and avoids broader Dashboard redesign.`
- Code review outcome: `Reviewed against live Dashboard code on 2026-04-26. Current Dashboard is now a narrow saved-task surface plus cockpit-signal bridge; older Weekly Review, Focus Recommendation, Action Plan, dashboard task drafts, and recent notes/projects surfaces are not present. Candidate scope should protect saved-task rules and the active-work cockpit truth bridge only.`
- Promotion outcome: `Promoted on 2026-04-26 as sprint candidate Dashboard Saved-Task Behavior Guardrails.`
- Closeout outcome: `Completed on 2026-04-26. Dashboard saved-task rules now have helper-level coverage and Dashboard.vue wiring for preview/expanded state, active/archived row behavior, completion/archive payloads, current-tab removal, and provenance derivation. Dashboard AI workflow, feature-layer migration, backend changes, shared list primitive changes, and browser/UI review remained out of scope.`

## Open Questions

- Resolved on `2026-04-26`: execution proceeded as three separately selectable slices rather than one combined candidate.
- Resolved on `2026-04-26`: Projects, Notes, and Dashboard coverage stayed helper/rules-level and avoided component-level rendering tests.
- Resolved on `2026-04-26`: Dashboard coverage stayed around saved-task guardrails plus existing dashboard-context service tests, without reopening removed Dashboard AI workflow.
- Resolved on `2026-04-26`: validation floor for this discussion is targeted Vitest during slices, full frontend `npm test`, and `npm run build` when production panel code changes. Browser/UI review remains a separate validation line.

## Current PMO Judgment

- PMO should keep this as stabilized context for the frontend behavior testing baseline, not as an active frontend redesign discussion.
- The execution path completed slice-by-slice rather than as one combined candidate:
  - Projects rules coverage completed first.
  - Notes rules coverage completed second.
- Dashboard saved-task guardrails completed third.
- Follow-up micro-coverage for Projects form rules, Projects task-capture rules, and Notes edit snapshots also landed on `2026-04-26` without candidate flow.
- Human follow-up identified `ChatEntry` as a remaining frontend behavior surface before the batch should be marked stable; ChatEntry micro-coverage landed on `2026-04-26` without candidate flow.
- Dashboard AI workflow should remain parked in `idea_backlog.md` and must not be pulled into this testing batch.
- Repo-native browser/UI review baseline should remain parked as broader validation buildout and should not overtake this `vitest`-oriented panel behavior coverage line.
- Future `projects.api.js` / `notes.api.js`, `*.rules.js`, and `use*` feature-layer migrations remain separate architecture work, not hidden scope for this behavior-baseline batch.
- Stable closeout read: no additional Projects / Notes / Dashboard / ChatEntry rules-level behavior gap is currently blocking this discussion. `chatService`, `runtimeControls`, and `chat` store behavior coverage also landed on `2026-04-26` as the final prioritized support-layer protection. Browser/UI review, feature-layer migration, broader AI context architecture, cockpitSignals store tests, markdown utility tests, and page-wrapper tests remain separate future work or explicitly lower priority.

## Stable Closeout

- Stable on: `2026-04-26`
- Closeout basis: `Human confirmed discussion_batch_013 can close after Projects, Notes, Dashboard, ChatEntry, chatService, runtimeControls, and chat store behavior coverage landed and passed validation.`
- Validation floor reached:
  - `npm test`
  - `npm run build`
- Do not reopen Dashboard AI workflow, frontend feature-layer migration, browser/UI review, cockpitSignals store tests, markdown utility tests, or page-wrapper tests from this batch unless the human explicitly selects one as a separate discussion or sprint.

## Slice-004 Code Review - ChatEntry Behavior Boundary

- Date: `2026-04-26`
- Status: `completed`

### Code Surfaces Read

- `frontend/src/components/ChatEntry.vue`
- `frontend/src/components/chatEntry.behavior.js`
- `frontend/src/components/chatEntry.behavior.test.js`
- `frontend/src/services/chatService.js`
- `frontend/src/services/dashboardContextService.js`
- `frontend/src/stores/cockpitSignals.js`
- `frontend/src/stores/runtimeControls.js`

### Current Code Reading

- `ChatEntry.vue` is a global entry surface rather than one of the three main panels, but it is behavior-critical because it owns:
  - typed chat submission
  - preset chip submission
  - send blocking while chat is sending or context is hydrating
  - cold cockpit context hydration before the first send
  - runtime personality baseline forwarding to `sendChat`
  - local fallback reply selection when chat send fails
  - runtime controls mini-panel state
- `chatEntry.behavior.js` currently contains only `resolveChatContextSnapshot()`.
- `chatEntry.behavior.test.js` currently protects only:
  - hydrated cockpit signals reuse current context
  - cold cockpit signals call `refreshDashboardContext()` before send

### Already Protected

- Context hydration path is protected at helper level.
- `dashboardContextService.test.js` protects fallback dashboard snapshot semantics.
- `dashboard.behavior.test.js` and `taskService.test.js` protect some upstream active-work truth used by chat context.

### Behavior Boundaries Worth Protecting Next

- Send eligibility:
  - empty or whitespace-only typed input should not send
  - send should be blocked while `chatStore.isSending`
  - send should be blocked while `isHydrating`
  - preset chip text should be trimmed and sent like typed text
- Typed versus preset input handling:
  - typed send clears `inputValue`
  - preset send should not clear typed draft input
  - user message should be appended before the assistant request
- Request contract:
  - `sendChat()` should receive the current chat messages, resolved chat context, and `{ personalityBaseline }`
  - cold context hydration failure should not prevent sending; it should fall back to the current context after logging
- Failure behavior:
  - failed `sendChat()` appends a local fallback assistant message
  - fallback text derives from the current runtime baseline
  - unknown baseline falls back to warm
- UI state derivation:
  - chips/input/send button disabled state should derive from sending or hydrating
  - send button label should distinguish hydrating, sending, and idle

### Candidate Acceptance Checks

- Extend `chatEntry.behavior.js` with small pure helpers only where useful, likely for:
  - send text normalization
  - send eligibility
  - typed-vs-preset draft clearing decision
  - fallback reply derivation
  - disabled state / button label derivation
- Extend `chatEntry.behavior.test.js` with focused Vitest coverage for stable send-entry rules.
- Keep `ChatEntry.vue` wiring changes light and only where extracted helpers replace embedded rules.
- Run:
  - `npm test -- src/components/chatEntry.behavior.test.js src/services/dashboardContextService.test.js`
  - `npm test`
  - `npm run build` if production code changes

### Keep Out Of This Slice

- full component rendering tests for the chat popup
- runtime controls redesign
- chat API redesign
- formal AI core context architecture
- browser/UI review of the chat panel
- changing Dashboard cockpit-signal ownership

### Closeout Outcome

- Completed on `2026-04-26` without candidate flow.
- `chatEntry.behavior.js` now protects stable send-entry rules for:
  - send text normalization
  - send eligibility while empty, sending, or hydrating
  - typed versus preset draft-clearing behavior
  - disabled state and send button label derivation
  - fallback reply selection by runtime personality baseline
  - cold cockpit context hydration fallback to current context if hydration fails
- `ChatEntry.vue` now consumes these helpers without changing chat API, runtime controls, Dashboard cockpit ownership, or UI structure.
- Validation passed:
  - `npm test -- src/components/chatEntry.behavior.test.js src/services/dashboardContextService.test.js`
  - `npm test`
  - `npm run build`

## Slice-003 Code Review - Dashboard Behavior Boundary

- Date: `2026-04-26`
- Status: `reviewed / concrete boundary identified`

### Code Surfaces Read

- `frontend/src/components/Dashboard.vue`
- `frontend/src/components/dashboard.behavior.js`
- `frontend/src/components/dashboard.behavior.test.js`
- `frontend/src/services/taskService.js`
- `frontend/src/services/taskService.test.js`
- `frontend/src/services/dashboardContextService.js`
- `frontend/src/services/dashboardContextService.test.js`
- `frontend/src/stores/cockpitSignals.js`
- `frontend/src/components/ChatEntry.vue`
- `frontend/src/components/chatEntry.behavior.js`
- `frontend/src/views/DashboardPage.vue`

### Current Code Reading

- Dashboard has been reduced to a much smaller current surface:
  - quick-add task input
  - saved-task list
  - active / archived segmented view
  - active-row complete / reactivate through row primary click
  - archive / restore / delete through the row overflow menu
  - provenance dot and tooltip
  - lightweight cockpit-signal publishing for global chat context
- The older Dashboard-local AI workflow is no longer present:
  - Weekly Review
  - Focus Recommendation
  - Action Plan
  - dashboard task drafts
- `DashboardPage.vue` only fetches projects and passes them into `Dashboard.vue`.
- `Dashboard.vue` still owns a temporary bridge into `cockpitSignals`; this is explicitly not a formal context architecture.

### Already Protected

- `dashboard.behavior.test.js` already protects:
  - prepending quick-added tasks into the visible list
  - applying completed/reactivated row updates by task id
  - removing archived/restored tasks from the current visible list
- `taskService.test.js` already protects:
  - default normalization for saved tasks
  - quick-add save insertion into shared task state
  - archived task fetch using `?archived=true`
  - active-task snapshot separation for cockpit context
- `dashboardContextService.test.js` already protects:
  - active project count excludes archived projects
  - active task count excludes archived and completed tasks
  - pinned project name ignores archived pinned projects
  - current next action derives from task-based focus
  - missing focused task yields an empty next action
- `chatEntry.behavior.test.js` already protects:
  - hydrated cockpit signals are reused
  - cold cockpit signals trigger dashboard context hydration before chat send

### Behavior Boundaries Worth Protecting Next

- Saved-task preview and expansion:
  - collapsed view should show at most five saved tasks
  - expanded view should show the full current saved-task list
  - switching active / archived view should reset expansion and close any open task menu
  - toggle label should reflect collapsed overflow versus expanded state
- Active versus archived interaction boundary:
  - active saved-task rows are interactive and toggle complete/reactivate
  - archived saved-task rows are not primary-click interactive
  - active rows offer Archive and Delete
  - archived rows offer Restore and Delete
  - archive/restore removes the task from the current visible tab instead of mutating it in place
  - delete removes from both current visible list and active snapshot
- Completion update boundary:
  - active task primary click sends `{ completed: true, status: 'completed' }`
  - completed task primary click sends `{ completed: false, status: 'active' }`
  - completion/reactivation should sync the active-task snapshot and emit refresh for project focus transitions
- Cockpit signal truth:
  - live Dashboard signals and fallback `deriveDashboardSnapshot()` should stay semantically aligned
  - active-task counts should come from active-work truth, not the currently browsed archived tab
  - archived projects should not supply pinned project name or current next action
  - current next action should derive from `currentFocusTaskId` and task id matching only
- Provenance display:
  - source letter derives only from canonical `originModule`
  - provenance class derives only from `creationMode`
  - tooltip uses current canonical values and should not revive removed `project_focus` or `project_suggestion` provenance categories

### Candidate Acceptance Checks

- Extend `dashboard.behavior.js` only with small pure helpers if needed for:
  - saved-task preview/expanded derivation and toggle label
  - active versus archived row action eligibility
  - provenance letter/class/tooltip derivation
  - row completion payload derivation
- Extend `dashboard.behavior.test.js` to cover the stable saved-task rules above.
- Consider adding one or two tests to `dashboardContextService.test.js` only if a live Dashboard helper and fallback snapshot rule need alignment.
- Keep `Dashboard.vue` wiring changes light and only where extracted helpers replace embedded rules.
- Run:
  - `npm test -- src/components/dashboard.behavior.test.js src/services/dashboardContextService.test.js src/services/taskService.test.js`
  - `npm test`
  - `npm run build` if production code changes

### Keep Out Of This Slice

- Reintroducing Weekly Review, Focus Recommendation, Action Plan, dashboard task drafts, or any Dashboard AI Assistant block
- Dashboard AI workflow redesign
- broader Dashboard information architecture
- browser, screenshot, Playwright, E2E, or UI review
- creating `useDashboardTasks.js`, `dashboard.api.js`, or a full Dashboard feature-layer migration
- replacing the cockpit-signal bridge with a formal context architecture
- redesigning shared list primitives or row visuals

### Truth Baseline Drift Found

- `docs/pmo/baselines/roadmap.md` still listed removed Dashboard behavior as shipped:
  - recent notes and projects surfaces
  - AI weekly review
  - AI focus recommendation
  - AI action plan
  - AI task drafts
- PMO corrected `roadmap.md` on 2026-04-26 so Dashboard shipped milestones now reflect the current saved-task surface and mark the older Dashboard AI workflow as removed.
- `system-baseline.md` and `runtime-baseline.md` were already aligned with the current truth that the older fallback-only Dashboard AI Assistant surface has been removed.

### Current PMO Judgment

- Slice-003 has completed as `Dashboard Saved-Task Behavior Guardrails`.
- The sprint stayed narrower than Projects and similar in scale to Notes:
  - protected saved-task rules and current cockpit truth support
  - did not freeze a broader Dashboard product shape
  - did not reopen the removed Dashboard AI workflow
- This section should now be treated as historical boundary context for future Dashboard behavior or architecture work, not as an open promotion prompt.

## Slice-001 Code Review - ProjectsPanel Behavior Boundary

- Date: `2026-04-26`
- Status: `in review / concrete boundary identified`

### Code Surfaces Read

- `frontend/src/components/ProjectsPanel.vue`
- `frontend/src/components/projectsPanel.behavior.js`
- `frontend/src/components/projectsPanel.behavior.test.js`
- `frontend/src/services/taskService.js`
- `frontend/src/services/taskService.test.js`
- `backend/src/models/Project.js`
- `backend/src/models/Task.js`
- `backend/src/routes/index.js`
- `backend/src/routes/taskRuntimeHelpers.js`

### Already Protected

- `projectsPanel.behavior.test.js` already protects:
  - active / completed / archived task bucketing
  - active-project preview branch selection
  - archived-project preview using archived tasks only
  - archived tasks staying in a separate branch from the primary active/completed list
  - focus interaction eligibility limited to active non-archived tasks
  - focus title deriving from `currentFocusTaskId`
- `taskService.test.js` already protects the project-card fetch split:
  - active project cards fetch both non-archived and archived project tasks
  - archived project cards fetch only archived project tasks

### Behavior Boundaries Worth Protecting Next

- Primary versus archived preview structure:
  - active projects may show a primary task section for active/completed tasks
  - active projects may also show a separate archived section
  - archived projects should not show the primary task section
  - archived projects should still show archived tasks in the preview area
- Preview range and expansion:
  - collapsed preview returns at most three tasks
  - expanded preview returns the full selected branch
  - primary and archived expansion states are independent
  - active/completed filter affects only the primary section, not the archived section
- Focus safety:
  - only active, non-archived tasks should be focusable
  - completed tasks and archived tasks should remain non-focusable
  - current focus display should be task-id based, not free-text or AI-suggestion based
  - implementation note: the template gates focus with `canSetProjectFocus(task)`, but `setTaskAsFocus()` itself currently checks only `status === 'active'`; a future implementation slice should either tighten that guard or add a test that keeps the template/helper gate from regressing
- Archived-project quieting:
  - ordinary active-project archived sections should still expose lifecycle chips per archived row
  - archived-project task previews should hide the row-level lifecycle chip and rely on project-level archived context plus completed strikethrough
  - completed archived tasks should remain visually muted/struck through through `task.status === 'completed'`
- Project action boundary:
  - active projects expose pin, edit, archive, delete, Add Task, and AI suggestion actions
  - archived projects expose only restore and delete in the main action area
  - archived projects should not expose Add Task, edit, archive, pin, or AI suggestion entrypoints
- Task capture boundary:
  - opening capture defaults to single mode
  - switching between single and batch clears the opposite draft state and local errors
  - empty single and empty batch submission produce local invalid-state helper text instead of silent no-op
  - successful single or batch save closes capture and refreshes project-card tasks

### Candidate Acceptance Checks

- Add or extend helper-level tests for:
  - collapsed versus expanded limits for primary and archived branches
  - completed archived tasks staying in archived branch while preserving lifecycle status
  - archived-project primary preview remaining empty even when non-archived tasks appear in input data
  - archived section metadata visibility rules if a small helper is extracted for that template logic
  - focus eligibility guard including `archived === true`
- Consider a narrow component-level test only if helper extraction cannot reasonably cover:
  - archived project action surface
  - task-capture open / close / mode-switch behavior
- Keep out of this slice:
  - AI suggestion list convergence
  - screenshot/browser visual review
  - broader ProjectsPanel redesign
  - backend archive/restore route tests unless a frontend behavior test exposes a real runtime contract gap

### Truth Baseline Drift Found

- `system-baseline.md` had stale data-model truth:
  - Note listed `status`, but the current model uses `archived` instead.
  - Project omitted `archived`.
  - Task listed `originLabel`, `linkedProjectId`, `linkedProjectName`, and legacy compatibility fields that are not present in the current Mongoose model.
  - System archive semantics said project restore restores archived related tasks to active, while the current runtime preserves lifecycle semantics.
- PMO corrected the system baseline on `2026-04-26`.

### Architecture Boundary Implication

- Human correctly identified that the current `*.behavior.js` files are not merely test files:
  - panels call them at runtime
  - tests lock the same functions
  - they are pure business/display derivation helpers extracted from large SFCs
- `FRONTEND_ARCHITECTURE_AUDIT_2026-04-23.md` already records this as a positive sign, but also says the next missing layer is not just more helpers:
  - the frontend lacks a consistent feature-state architecture
  - large feature components still act as controllers, services, and views at the same time
  - the likely target is a composable / feature-controller layer such as `useProjectsFeature`, `useNotesFeature`, and `useDashboardTasks`
- PMO should therefore not treat `frontend/src/services/` as the automatic home for all behavior helpers.
- Current layer reading:
  - `services/`: transport-facing or cross-cutting data/service utilities such as task fetch/save, chat requests, dashboard context refresh
  - `*.behavior.js`: pure, stateless panel/domain derivation that is safe to test directly
  - missing feature layer: stateful orchestration for a feature panel, including async state, validation state, CRUD/event actions, and ownership of local resource state
- For this behavior-coverage sprint, PMO should avoid turning the slice into a frontend architecture migration.
- However, if new Projects behavior coverage requires extracting more stateful panel logic, that extraction should be shaped toward a future `features/projects` or `useProjectsFeature` pattern rather than adding more ad hoc component-adjacent helpers indefinitely.

### Agreed Sequencing

- Current discussion / near-term testing theme:
  - strengthen `rules`-level behavior coverage first
  - protect stable business/display rules rather than the current SFC wiring shape
  - likely future naming direction: `projects.rules.js` rather than treating `projectsPanel.behavior.js` as a permanent component-adjacent home
- Later architecture discussion or sprint:
  - split Projects feature ownership into clearer layers such as:
    - `projects.api.js`
    - `projects.rules.js`
    - `useProjects.js`
  - move stateful orchestration out of `ProjectsPanel.vue` only after core rules are protected
- Later post-split test work:
  - add narrow tests for `projects.api.js` request endpoints and `useProjects.js` orchestration once those layers exist
  - avoid trying to write those tests before the layers exist
- Separate validation line:
  - browser / E2E / repo-native UI review remains `discussion_batch_010 slice-003`
  - it should not be folded into this rules-first panel behavior coverage discussion

## Slice-002 Code Review - NotesPanel Behavior Boundary

- Date: `2026-04-26`
- Status: `in review / concrete boundary identified`

### Code Surfaces Read

- `frontend/src/components/NotesPanel.vue`
- `frontend/src/views/NotesPage.vue`
- `docs/pmo/history/reports/frontend-input-state-cleanup.md`
- `docs/pmo/history/reports/notes-editor-comfort-fixes.md`
- `docs/pmo/history/reports/frontend-action-grouping-baseline.md`

### Current Code Reading

- Unlike Projects, Notes currently has no standalone `notesPanel.behavior.js` or `notesPanel.behavior.test.js`.
- The stable rules that are easiest to protect are still embedded in `NotesPanel.vue`:
  - `createEmptyNoteErrors`
  - `validateNoteFields`
  - `hasNoteErrors`
  - `getNoteAIState`
  - active versus archived action availability implied by the template
- `NotesPanel.vue` still acts as view, controller, local state owner, API caller, CodeMirror host, draft-cache owner, and action orchestrator.
- `NotesPage.vue` also fetches notes but does not pass them into `NotesPanel`, so feature-state ownership remains blurred. This is real architecture debt, but it should not be solved inside this rules coverage slice.

### Already Protected Indirectly

- `Frontend Input State Cleanup` already landed visible invalid-state behavior for:
  - `New Note` title/content
  - `Edit Note` title/content
- `Notes Editor Comfort Fixes` already validated the CodeMirror comfort baseline through build and Notes UI review.
- `Frontend Action Grouping Baseline` already brought active note AI actions, edit actions, and archived restore/delete actions under shared action grouping.

### Behavior Boundaries Worth Protecting Next

- Note field validation:
  - empty or whitespace-only title should produce `Enter a note title.`
  - empty or whitespace-only content should produce `Enter note content.`
  - valid title/content should produce no local field errors
  - `hasNoteErrors` should return true only when title/content errors exist
- Note AI reveal state:
  - loading note id means `pending`
  - existing generated task drafts mean `active`
  - neither loading nor drafts means `idle`
  - empty draft arrays should not count as active
- Active versus archived action rules:
  - active notes may expose pin, edit, archive, delete, and AI task-generation entrypoints
  - archived notes should expose restore and delete only
  - archived notes should not expose pin, edit, archive, or AI task-generation entrypoints
- Edit-mode guard rules:
  - archived notes should not enter edit mode through the template
  - cancel edit restores the original title/content and clears the edit state
  - switching from one edit note to another restores the old unsaved note before opening the new one

### Candidate Acceptance Checks

- Add a small pure helper module only for stable Notes rules, likely:
  - `frontend/src/components/notesPanel.behavior.js`
  - `frontend/src/components/notesPanel.behavior.test.js`
- Keep helper scope narrow:
  - note validation helpers
  - note AI state derivation
  - active/archived action eligibility derivation if it avoids brittle component tests
  - a pure helper for restoring an editable note snapshot only if it stays simple
- Update `NotesPanel.vue` to consume the pure helper functions only where this removes duplication or exposes the tested rules directly.
- Run targeted frontend validation for the new Notes behavior tests plus existing nearby tests, and run build if production code changes.

### Keep Out Of This Slice

- CodeMirror implementation redesign
- rendered markdown identity / style refresh
- browser-level writing comfort review
- Playwright / E2E / screenshot review
- AI task reveal/list convergence, which remains parked under future AI core ownership
- Notes feature-layer migration such as `notes.api.js`, `notes.rules.js`, or `useNotes.js`
- full component rendering tests for the entire NotesPanel
- changing the note API or backend note archive/restore behavior

### Current PMO Judgment

- Slice-002 has completed as `Notes Rules Behavior Coverage`.
- The delivered sprint stayed shallower than Projects and locked only stable validation/action-state rules.
- The delivered execution shape was:
  - extracted `notesPanel.behavior.js`
  - added focused Vitest coverage
  - lightly wired NotesPanel to use the extracted helpers
  - avoided broader feature architecture work
- This section should now be treated as historical boundary context for future Notes feature-layer work, not as an open promotion prompt.
