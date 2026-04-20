# Task / Project / Note Behavior Audit

Date: `2026-04-20`

Scope:

- `backend/src/routes/index.js`
- `backend/src/models/Task.js`
- `backend/src/models/Project.js`
- `backend/src/models/Note.js`
- `frontend/src/components/ProjectsPanel.vue`
- `frontend/src/components/NotesPanel.vue`
- `frontend/src/components/Dashboard.vue`
- `frontend/src/services/taskService.js`
- `frontend/src/services/dashboardContextService.js`
- related tests
- `docs/pmo/baselines/runtime-baseline.md`
- `docs/pmo/baselines/backend-api.md`

## Headline Findings

- `archive` is now a real orthogonal visibility dimension in current runtime behavior, not just an intended PMO direction. Active/completed task lifecycle is preserved across note/project archive and restore flows, with explicit compatibility handling for old `status='archived'` rows.
- `linkedProjectId` is not just dead weight today. It is still an active runtime dependency for project task reads, focus-clearing side effects, and project task previews. The current PMO instinct that `originModule + originId` may be enough is not true for the current code path without additional behavior-preserving refactor work.
- `project_focus` and `project_suggestion` look like compatibility-era values in the scoped runtime. I found read paths, but no current writer in the scoped product runtime.
- `originLabel` and `linkedProjectName` currently look much more like persisted convenience baggage than real runtime truth. They are written, but I could not find a meaningful read path in the scoped runtime.
- There is an important dashboard-context drift risk: `Dashboard.vue` derives cockpit signals from the shared `tasksRef`, but that ref is replaced when the user toggles Active vs Archived tasks. `refreshDashboardContext()` instead rebuilds context from `/projects` plus default `/tasks`. That means the live dashboard path and the chat hydration fallback are not guaranteed to mean the same thing.

## 1. Current Real Behaviors

### Task

- Tasks have two independent axes in current behavior: lifecycle (`active` or `completed`) and archive visibility (`archived` boolean, plus legacy compatibility for rows that still encode archive in `status`). Evidence: `backend/src/routes/index.js:47-53`, `71-85`, `495-529`.
- Default task listing excludes archived tasks; `GET /tasks?archived=true` returns archived tasks. Evidence: `backend/src/routes/index.js:9-24`, `463-471`.
- `GET /tasks?projectId=...` currently means “tasks whose `linkedProjectId` matches that project”, not “all tasks related to that project by any mechanism”. Evidence: `backend/src/routes/index.js:465-469`.
- Completing a focused project-owned task clears `Project.currentFocusTaskId` when the task is treated as a project task. Evidence: `backend/src/routes/index.js:535-547`.
- Archiving a focused linked task clears project focus. Deleting a focused linked task also clears project focus. Evidence: `backend/src/routes/index.js:550-559`, `573-579`.
- Dashboard quick add creates manual tasks with `originModule='dashboard'` and no project linkage. Evidence: `frontend/src/components/Dashboard.vue:102-123`.
- Note AI save creates note-origin tasks with no project link. Evidence: `frontend/src/components/NotesPanel.vue:377-391`.
- Project task capture and project AI suggestion save both create tasks with `originModule='project'`, `originId=projectId`, and `linkedProjectId=projectId`. Evidence: `frontend/src/components/ProjectsPanel.vue:339-352`, `477-484`, `518-525`.

### Project

- Projects keep progress status and archive visibility separately in current runtime. Archive does not overwrite progress status. Evidence: `backend/src/models/Project.js:13-24`, `backend/src/routes/index.js:55-61`, `399-443`.
- Archiving a project clears `currentFocusTaskId`. Evidence: `backend/src/routes/index.js:415-420`.
- Archiving a project cascades to tasks related by either `linkedProjectId` or `originId`. Evidence: `backend/src/routes/index.js:423-428`.
- Restoring a project restores archived tasks related by either `linkedProjectId` or `originId`, while preserving task completion semantics. Evidence: `backend/src/routes/index.js:138-161`, `435-455`.
- Project cards show a task-based current focus, not a free-text focus string. Evidence: `frontend/src/components/ProjectsPanel.vue:89-98`, `608-614`.
- Active project cards preview active or completed tasks through a local filter. Archived project cards preview archived tasks only. Evidence: `frontend/src/components/ProjectsPanel.vue:405-418`, `617-662`.
- Only active, non-archived preview tasks are clickable for setting focus. Evidence: `frontend/src/components/ProjectsPanel.vue:652-656`.

### Note

- Notes are effectively single-status objects (`active`) plus archive visibility. Evidence: `backend/src/models/Note.js:13-24`.
- Default note listing excludes archived notes; `GET /notes?archived=true` returns archived notes. Evidence: `backend/src/routes/index.js:177-178`.
- Archiving a note cascades only to tasks whose provenance is `originModule='note'` and `originId=<noteId>`. Evidence: `backend/src/routes/index.js:259-278`.
- Restoring a note restores those archived note-origin tasks and preserves their lifecycle state. Evidence: `backend/src/routes/index.js:285-303`, plus task normalization at `47-53`, `71-85`, `138-161`.
- Notes render saved content as markdown on the card view. Evidence: `frontend/src/components/NotesPanel.vue:461`.
- Notes persist local drafts to `localStorage` only on failed create, not as a normal autosave path. Evidence: `frontend/src/components/NotesPanel.vue:60-68`, `190-192`.

### Dashboard Context

- Dashboard publishes four lightweight chat-facing cockpit signals: active project count, active task count, pinned project name, and current next action. Evidence: `frontend/src/components/Dashboard.vue:24-56`, `frontend/src/services/dashboardContextService.js:5-29`.
- Chat uses cockpit signals if already hydrated; otherwise it lazily rebuilds snapshot context via `refreshDashboardContext()`. Evidence: `frontend/src/components/ChatEntry.vue:54-68`.
- Dashboard saved-task list is backed by shared `tasksRef`. Toggling Active vs Archived refetches and replaces that shared list. Evidence: `frontend/src/components/Dashboard.vue:93-99`, `frontend/src/services/taskService.js:31-37`.
- Dashboard task operations are direct user-facing runtime behaviors: quick add, complete/reactivate, archive/restore, delete. Evidence: `frontend/src/components/Dashboard.vue:102-171`, `398-420`.
- Source-dot lettering is currently derived from `originModule`, while source-dot color class is derived only from `creationMode`. Evidence: `frontend/src/components/Dashboard.vue:234-258`, `408-412`.
- Current real behavior, but likely accidental: cockpit task signals in `Dashboard.vue` are derived from whichever task list is currently loaded into `tasksRef`, so viewing Archived tasks can change the chat-context task counts and next-action signal. Evidence: `frontend/src/components/Dashboard.vue:22-56`, `93-99`; compare with `frontend/src/services/dashboardContextService.js:33-47`.

## 2. Legacy / Suspicious / Redundant Shapes

### `linkedProjectId`

- Classification: `active dependency but structurally suspicious`
- Why suspicious:
- It currently means “project-owned/project-readable task” in some places, but not everywhere.
- Project task reads use only `linkedProjectId`, while project archive/restore cascade uses `linkedProjectId OR originId`.
- Focus-clearing on complete/archive/delete also depends heavily on `linkedProjectId`.
- Judgment:
- This field is still runtime-critical today.
- It also looks like the main relationship shortcut that later refactor will want to challenge.
- Evidence: `backend/src/routes/index.js:423-428`, `451-455`, `465-469`, `535-559`, `573-579`; `frontend/src/components/ProjectsPanel.vue:307-318`, `405-418`.

### `originModule + originId`

- Classification: `active dependency but structurally suspicious`
- Why suspicious:
- They are legitimate provenance fields today.
- But they overlap with `linkedProjectId` for project-created tasks, and current runtime mixes “source relation” and “governance/read relation”.
- Independent judgment:
- PMO’s current suspicion that this pair may eventually be enough looks directionally plausible.
- It is not enough to describe current runtime behavior yet, because current read and focus logic still depends on `linkedProjectId`.
- Evidence: `backend/src/routes/index.js:275-278`, `301-303`, `423-428`, `451-455`, `536-538`; `frontend/src/components/ProjectsPanel.vue:339-352`, `477-484`, `518-525`.

### `project_focus`

- Classification: `read-only compatibility`
- Why suspicious:
- It is only read in focus-clearing and tooltip logic.
- I found no scoped writer that still creates tasks with `originModule='project_focus'`.
- Evidence: `backend/src/routes/index.js:538`; `frontend/src/components/Dashboard.vue:269-270`.

### `project_suggestion`

- Classification: `read-only compatibility`
- Why suspicious:
- It is only read in focus-clearing and Dashboard tooltip logic.
- Current project AI save path now writes `originModule='project'` plus `creationMode='ai'` instead.
- Evidence: `backend/src/routes/index.js:538`; `frontend/src/components/Dashboard.vue:264-266`; current writer at `frontend/src/components/ProjectsPanel.vue:345-352`.

### `originLabel`

- Classification: `likely removable`
- Why suspicious:
- It is written on task creation and passed through task helpers.
- I did not find a meaningful read path in the scoped runtime that depends on persisted `originLabel`.
- Current UI behavior uses live note/project title when creating tasks, not persisted `originLabel` as a later read source.
- Evidence: write paths at `backend/src/routes/index.js:480-484`, `frontend/src/services/taskService.js:8-16`, `44-53`; no scoped runtime read found.

### `linkedProjectName`

- Classification: `likely removable`
- Why suspicious:
- Same pattern as `originLabel`: written and forwarded, but not meaningfully read in scoped runtime behavior.
- Evidence: write paths at `backend/src/routes/index.js:483-484`, `frontend/src/services/taskService.js:8-16`, `44-53`; no scoped runtime read found.

### Legacy Task fields: `source`, `sourceDetail`, `projectId`, `projectName`

- Classification: `read-only compatibility`
- Why suspicious:
- They remain in the schema but are absent from current canonical task create/update flows.
- I found no scoped runtime path reading persisted values from these fields.
- Evidence: `backend/src/models/Task.js:37-53`; current task create route at `backend/src/routes/index.js:474-492`.

### Legacy `status='archived'` compatibility branches

- Classification: `read-only compatibility`
- Why suspicious:
- Current models no longer allow `archived` as an active enum value for Task or Project status.
- Route logic still treats that old value as a compatibility input/output normalization concern.
- Evidence: `backend/src/models/Task.js:54-65`, `backend/src/models/Project.js:13-24`; compatibility at `backend/src/routes/index.js:9-24`, `44-69`, `510-515`.

### Note `status`

- Classification: `active dependency but structurally suspicious`
- Why suspicious:
- Current Note model only allows `active`.
- Archive behavior is really carried by `archived`, but routes still keep writing `status: 'active'` on archive/restore.
- This looks more like contract inertia than meaningful product state.
- Evidence: `backend/src/models/Note.js:13-24`; `backend/src/routes/index.js:263-266`, `289-292`.

### Dashboard snapshot duplication

- Classification: `active dependency but structurally suspicious`
- Why suspicious:
- `Dashboard.vue` and `dashboardContextService.js` both derive the same four cockpit signals, but from different runtime entry paths.
- This is not just duplicate code; it permits semantic drift.
- Evidence: `frontend/src/components/Dashboard.vue:24-56`; `frontend/src/services/dashboardContextService.js:5-29`.

### Shared `tasksRef` as both UI list state and cockpit-context source

- Classification: `active dependency but structurally suspicious`
- Why suspicious:
- Archived-tab fetches replace the same shared task state used to derive live cockpit signals.
- That makes chat context sensitive to a visibility toggle rather than to stable active-work truth.
- Evidence: `frontend/src/components/Dashboard.vue:22-56`, `93-99`; `frontend/src/services/taskService.js:6`, `31-37`.

### Focus-clearing asymmetry

- Classification: `active dependency but structurally suspicious`
- Why suspicious:
- On task completion, focus clearing is gated by `linkedProjectId + originId + originModule in ['project', 'project_focus', 'project_suggestion']`.
- On archive or delete, focus clearing only requires `linkedProjectId` and focused-task identity.
- That asymmetry may be intended, but it currently looks more like accumulated implementation history than a crisp domain rule.
- Evidence: `backend/src/routes/index.js:535-559`, `573-579`.

## Baseline / Code Drift

- `docs/pmo/baselines/backend-api.md` correctly states that project archive cascades by `linkedProjectId` or `originId`, and that `GET /tasks?projectId=...` filters by `linkedProjectId`. What it does not currently call out is that these are different relation boundaries, which is important for future simplification risk.
- `docs/pmo/baselines/runtime-baseline.md` accurately describes the dashboard-context bridge at a high level, but it does not capture the current drift risk where live Dashboard signals depend on the currently loaded task tab while `refreshDashboardContext()` always rebuilds from default active tasks.
- I did not find a contradiction to the PMO rule that archive and lifecycle status should be orthogonal. Current code supports that rule, with compatibility handling rather than a full migration.

## 3. Recommended First Behavior-Lock Test Set

Goal:

- maximize behavior coverage
- minimize implementation coupling
- lock user-visible and runtime-relevant outcomes
- avoid freezing today’s helper layering or exact field choreography unless those fields are the public contract

### Backend behavior tests

- `note archive/restore preserves task lifecycle`
- Seed one active note-origin task, one completed note-origin task, and one unrelated task.
- Archive the note: only note-origin tasks become archived; completed stays completed.
- Restore the note: only previously archived note-origin tasks return; completed stays completed.

- `project archive/restore uses the current union boundary`
- Seed:
- one task with `linkedProjectId=projectId`
- one task with `originId=projectId` but no `linkedProjectId`
- one unrelated task
- Archive the project: both related tasks archive.
- Restore the project: both related tasks restore with lifecycle preserved.

- `project task listing uses the narrower read boundary`
- With the same seed, assert that `GET /tasks?projectId=...` returns the `linkedProjectId` task but not the origin-only task.
- This is high value because it locks the current behavior without endorsing it as the future design.

- `focused task transitions clear focus in the currently real cases`
- Completing a focused project task created with today’s canonical project shape clears focus.
- Archiving a focused linked task clears focus.
- Deleting a focused linked task clears focus.

- `legacy archive compatibility stays bounded`
- Rows with `status='archived'` are treated as archived in list filtering and normalization.
- Restoring those rows yields bounded fallback lifecycle behavior rather than leaving status stuck at `archived`.

- `restore query scope remains combined with archive filter`
- Keep the existing restore-scoping test.
- Add one request-level integration test if practical, because the current unit test only checks query shape.

### Frontend behavior tests

- `ProjectsPanel active vs archived preview behavior`
- Active project card shows Active/Completed filter and does not show archived tasks in those slices.
- Archived project card shows archived tasks only and no active/completed segmented switch.

- `ProjectsPanel focus interaction behavior`
- Clicking an active preview task sets focus.
- Clicking a completed or archived preview task does not set focus.

- `Dashboard task-row behavior`
- Quick add prepends a dashboard-origin task.
- Completing a task updates row state and emits refresh.
- Archiving removes it from the active view.
- Restoring from archived view removes it from archived list.

- `Dashboard canonical snapshot semantics`
- Keep `dashboardContextService` tests as the canonical data-contract test for counts, pinned project, and current next action.
- Add one test ensuring the service snapshot is based on active task truth, not archived-tab UI state.

- `Chat hydration path`
- If cockpit signals are not hydrated, `ChatEntry` calls `refreshDashboardContext()` before sending.
- This matters because dashboard-derived context is part of the behavior under audit.

- `NotesPanel AI draft save provenance`
- Saving a note AI draft creates a task with note provenance and no project link.

### Browser review checklist

- `Dashboard archived-toggle context check`
- Open Dashboard on Active tasks, then Archived tasks, then open Chat and inspect whether the context-driven reply feels like “current active work” or “currently visible archived list”.
- This is the highest-value manual review because current code suggests drift.

- `Project mixed-state archive/restore`
- Create one project with one active task, one completed task, and one focused task.
- Archive the project and restore it.
- Confirm:
- project focus clears on archive
- completed task stays completed after restore
- active task returns as active
- archived preview and active preview surfaces behave as expected

- `Origin-only vs linked-project task visibility`
- Use one project-related task that is origin-only and one that is linked.
- Check project card preview behavior and backend results through the UI or request tooling.
- This determines whether the current asymmetry is acceptable product behavior or a refactor target.

- `Note archive/restore`
- Archive a note with mixed note-origin task states, restore it, and confirm lifecycle preservation.

- `Cross-surface archived toggles`
- Walk Notes, Projects, and Dashboard active/archived toggles in the browser.
- Confirm empty states, restore actions, and visual cues still make sense.

## 4. Refactor Risk Map

### Highest-risk seams

- `Task <-> Project relationship semantics`
- Risk:
- Current runtime splits “where this task came from” and “which project can read/govern it” across overlapping fields and inconsistent boundaries.
- Why easy to break:
- Reads, archive cascade, focus clearing, and project previews do not all use the same relation rule.

- `Dashboard context truth`
- Risk:
- Context currently has two derivation paths with different coupling:
- live Dashboard watch path
- fallback service rebuild path
- Why easy to break:
- A harmless-looking task-list refactor can silently change chat context.

- `Focus clearing`
- Risk:
- Focus-clearing is spread across project archive, task completion, task archive, and task delete.
- Why easy to break:
- Rules are similar but not identical.

- `Legacy archive compatibility`
- Risk:
- Compatibility for old `status='archived'` rows is embedded in route normalization and filters.
- Why easy to break:
- A cleanup that only follows model enums will miss historical rows.

### Best candidates for second-pass simplification

- First priority: normalize project-task relation semantics
- Decide whether the future canonical rule is `linkedProjectId`, `originModule + originId`, or a new first-class relation model.
- Do not remove `linkedProjectId` before behavior tests explicitly cover current list/cascade/focus behavior.

- Second priority: collapse stale provenance compatibility values
- `project_focus`
- `project_suggestion`
- These look removable after tests confirm no real runtime writer still depends on them.

- Third priority: remove write-only denormalized strings
- `originLabel`
- `linkedProjectName`
- These look like the easiest cleanup after behavior lock because they do not appear to drive scoped runtime behavior.

- Fourth priority: unify dashboard snapshot derivation
- Make one canonical source for cockpit signals and one stable semantic rule for whether archived-tab browsing should affect chat context.

- Fifth priority: reconsider Note status surface
- `Note.status` currently looks like schema-contract inertia rather than meaningful product state.

## 5. PMO Recommendation

- Recommendation: use `two sequential sprints`, not one bundled sprint.
- Why:
- The current runtime is behaviorally rich enough to require locking before cleanup.
- There are still a few places where the current code exposes real behavior but not obviously intended behavior.
- Bundling “test first + simplification refactor” into one sprint would create pressure to silently resolve ambiguities while implementing.

### What is “enough” for sprint one

- Backend:
- request-level behavior tests for note/project archive and restore
- task focus-clearing transitions
- project task read-boundary behavior
- legacy archive compatibility

- Frontend:
- component-level behavior coverage for Projects preview branching and Dashboard saved-task operations
- keep dashboard snapshot contract tests narrow and semantic
- do not lock helper internals or exact state-container structure

- Browser review:
- at least one bounded browser pass across Dashboard, Projects, and Notes archive surfaces
- plus one explicit manual decision on dashboard-context behavior under archived-task browsing

### Questions that should be decided before or during the testing sprint

- Is “project-related task” supposed to mean:
- `linkedProjectId` only
- or `linkedProjectId OR originId`
- This is the single most important unresolved semantics question.

- Should cockpit signals always represent active current work, regardless of whether the user is browsing archived tasks?
- Current code suggests “not always”.
- Product intuition and the baseline framing suggest “probably yes”.

- Should focus-clearing on completion remain limited to project-style origin modules, or should it simply follow focused-task identity plus project linkage?
- Current code is asymmetric.

### Questions that can stay open until the simplification sprint

- Whether `originLabel` and `linkedProjectName` are removed entirely or retained temporarily for compatibility.
- Whether legacy `project_focus` and `project_suggestion` values are deleted, migrated, or just tolerated.
- Whether cleanup lands as field removal, migration, or relation-model redesign.

## Bottom Line

- PMO’s archive/lifecycle judgment is supported by current code.
- PMO’s suspicion that `project_focus` and likely `project_suggestion` are stale compatibility values is also supported by current scoped runtime.
- PMO’s suspicion that `linkedProjectId` may be a long-term simplification target is directionally right, but it is still an active behavioral key today.
- The first behavior-lock sprint should therefore prioritize:
- project task relation boundaries
- archive/restore cascade behavior
- focus-clearing behavior
- dashboard-context truth
- Those are the seams most likely to make a later simplification pass either safe or dangerous.
