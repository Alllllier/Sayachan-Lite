# Sprint Candidates

> Up to 3 bounded sprint options that are ready for human comparison before activation.

## Working Rules

- keep at most 3 total entries in this file, including recently completed candidates retained for near-term context
- a candidate may be drafted by Codex, but it does not become the active sprint without explicit human selection
- replace or merge weaker candidates instead of stacking endlessly
- when a new candidate needs space, archive older completed entries into `../history/candidates/` before pushing the file past 3 total items
- if a candidate is selected, keep it visible here while also activating `current_sprint.md` and writing the corresponding `execution_task.md`
- after sprint closeout, update the selected candidate entry to `completed` before later archival into `../history/candidates/` when space is needed
- keep source trace visible so the selected sprint can be tied back to its discussion, backlog, or decision context

## Candidate Template

### `<sprint name>`

- Status: `candidate | active | completed`
- Source reference:
- Why now:
- Expected outcome:
- In scope:
- Out of scope:
- Dependencies:
- Risk level: `low | medium | high`
- Readiness: `ready | almost-ready | blocked`
- Start condition:

## Current Candidates

### `Projects Rules Behavior Coverage`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_013.md slice-001`
- Why now: `ProjectsPanel is currently the most stable and important panel surface, and its task preview, archive/lifecycle display semantics, focus eligibility, and shared list/card baselines are now settled enough to protect at the rules layer. Human and PMO have also clarified that this slice should strengthen durable rules coverage first, without turning the work into a Projects feature-layer migration or UI review pass.`
- Expected outcome: `The frontend gains a tighter Projects rules behavior baseline around task bucketing, preview branch selection, preview range and expansion, archived-project preview behavior, and focus eligibility. The work should keep tests close to pure rules/derivation logic so future `projects.api.js`, `projects.rules.js`, and `useProjects.js` separation can reuse the same behavioral guardrails instead of locking the current ProjectsPanel wiring shape.`
- In scope:
  - extend Projects rules/helper coverage for:
    - active / completed / archived task bucketing, including archived priority over lifecycle status
    - primary versus archived preview branches
    - collapsed versus expanded preview limits
    - archived-project primary preview remaining empty
    - archived-project archived task preview remaining visible
    - active/completed filter applying only to the primary branch
    - focus eligibility limited to active non-archived tasks
    - focus title deriving only from `currentFocusTaskId`
  - extract a very small pure helper only if needed to cover stable metadata/display rules without component-level brittleness
  - preserve current runtime behavior unless a rules test exposes a narrow mismatch such as a missing archived guard
- Out of scope:
  - `projects.api.js`, `projects.rules.js`, or `useProjects.js` architecture migration
  - API endpoint tests or orchestration tests for future feature layers
  - broad ProjectsPanel redesign
  - task capture workflow coverage beyond rules-level eligibility if no pure seam exists
  - pin/edit/archive/delete component rendering tests
  - AI suggestion/list convergence
  - browser, screenshot, Playwright, or E2E validation
  - NotesPanel or Dashboard coverage
- Dependencies: `discussion_batch_013 slice-001 code review; existing projectsPanel.behavior.js and projectsPanel.behavior.test.js; current taskService project-card fetch behavior; agreement that this sprint protects rules rather than current SFC wiring`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-26 by human agreement to promote slice-001 after PMO clarified that rules coverage is enough for the first Projects behavior slice and feature-layer separation should remain a later discussion/sprint.`
- Closeout: `Completed on 2026-04-26. Expanded Projects rules-level behavior tests, moved the project preview limit into a shared rules constant consumed by ProjectsPanel, and aligned setTaskAsFocus with canSetProjectFocus so archived tasks cannot slip through the runtime guard. Targeted frontend tests passed and production build passed with the existing Vite large-chunk warning.`

### `Notes Rules Behavior Coverage`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_013.md slice-002`
- Why now: `NotesPanel is a core long-lived surface, and its stable note object rules are now clear enough to protect without reopening editor design, markdown identity, AI reveal/list convergence, or frontend feature-layer migration. Unlike Projects, Notes does not yet have a behavior helper module, so the right first pass is a small rules extraction rather than component-level testing.`
- Expected outcome: `The frontend gains a first Notes rules behavior baseline around local note validation, AI task reveal state derivation, active versus archived action eligibility, and simple edit snapshot restoration rules. NotesPanel should consume the extracted helpers only where doing so keeps the runtime aligned with the tested rules without changing product behavior.`
- In scope:
  - add a small pure helper module for stable Notes rules, likely `frontend/src/components/notesPanel.behavior.js`
  - add focused Vitest coverage, likely `frontend/src/components/notesPanel.behavior.test.js`
  - cover note field validation:
    - empty or whitespace-only title returns `Enter a note title.`
    - empty or whitespace-only content returns `Enter note content.`
    - valid title/content returns no local field errors
    - `hasNoteErrors` returns true only when title/content errors exist
  - cover note AI state derivation:
    - loading note id -> `pending`
    - generated task drafts -> `active`
    - neither loading nor drafts -> `idle`
    - empty draft arrays do not count as active
  - cover active versus archived action eligibility:
    - active notes may expose pin, edit, archive, delete, and AI task generation
    - archived notes expose restore and delete only
    - archived notes do not expose pin, edit, archive, or AI task generation
  - cover a tiny pure edit snapshot restore helper only if it stays simple and avoids component-level brittleness
  - lightly wire `NotesPanel.vue` to the extracted helpers where this directly removes embedded rules duplication
- Out of scope:
  - CodeMirror implementation redesign
  - rendered markdown identity or broader style refresh
  - browser-level writing comfort review
  - Playwright, E2E, screenshot, or UI review
  - AI task reveal/list convergence
  - `notes.api.js`, `notes.rules.js`, `useNotes.js`, or `features/notes` migration
  - full component rendering tests for `NotesPanel`
  - note API or backend archive/restore behavior changes
  - local draft-cache redesign
- Dependencies: `discussion_batch_013 slice-002 code review; existing NotesPanel validation/action-state implementation; completed input-state, editor-comfort, and action-grouping baselines`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-26 by human direction to promote slice-002 after PMO clarified a narrow rules-first Notes scope and excluded editor/UI review/feature-layer migration work.`
- Closeout: `Completed on 2026-04-26. Added a narrow Notes rules helper and Vitest baseline for local validation, AI task state derivation, and active/archived action eligibility. NotesPanel now consumes those helpers without changing note API, editor, markdown, draft cache, AI reveal/list, or feature-layer structure. Targeted Notes behavior tests, full frontend npm test, and production build passed, with only the existing Vite large-chunk warning.`

### `Dashboard Saved-Task Behavior Guardrails`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_013.md slice-003`
- Why now: `Dashboard has been reduced to a narrow current surface: quick-add, saved tasks, active/archived saved-task view, row-level completion/archive/delete behavior, provenance dots, and a lightweight cockpit-signal bridge for chat context. The older Dashboard AI workflow is gone, so the right testing move is a small guardrail pass that protects the behavior that still exists without freezing a broader Dashboard product shape.`
- Expected outcome: `The frontend gains a tighter Dashboard saved-task behavior baseline around preview/expanded derivation, active versus archived row interaction rules, completion/reactivation payloads, archive/restore/delete current-tab removal, provenance display derivation, and cockpit active-work truth alignment. Dashboard.vue should consume extracted pure helpers only where this replaces embedded rules without changing product behavior.`
- In scope:
  - extend `frontend/src/components/dashboard.behavior.js` with small pure helpers where useful for:
    - saved-task preview versus expanded visible range
    - saved-task overflow and toggle label derivation
    - active versus archived row interaction and action eligibility
    - completion/reactivation payload derivation
    - canonical provenance letter, class, and tooltip derivation
  - extend `frontend/src/components/dashboard.behavior.test.js` to cover:
    - collapsed saved-task view shows at most five tasks
    - expanded saved-task view shows the full current list
    - toggle label distinguishes overflow, expanded, and non-overflow states
    - active rows are primary-click interactive while archived rows are not
    - active rows expose Archive/Delete while archived rows expose Restore/Delete
    - completion payload flips active to completed and completed to active
    - archive/restore removes tasks from the current visible tab
    - provenance derives only from `originModule` and `creationMode`
  - add or extend `dashboardContextService.test.js` only if needed to keep live Dashboard cockpit rules aligned with fallback snapshot truth
  - lightly wire `Dashboard.vue` to extracted helpers where this directly exposes the tested rules
  - preserve current product behavior
- Out of scope:
  - reintroducing Weekly Review, Focus Recommendation, Action Plan, dashboard task drafts, or any Dashboard AI Assistant block
  - Dashboard AI workflow redesign
  - broad Dashboard information architecture
  - browser, screenshot, Playwright, E2E, or UI review
  - creating `useDashboardTasks.js`, `dashboard.api.js`, or a full Dashboard feature-layer migration
  - replacing the cockpit-signal bridge with a formal context architecture
  - redesigning shared list primitives or row visuals
  - backend task route changes
- Dependencies: `discussion_batch_013 slice-003 code review; current Dashboard.vue saved-task implementation; existing dashboard.behavior.js/test; existing taskService active-task snapshot tests; existing dashboardContextService cockpit snapshot tests; completed Dashboard display-list migration`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-26 by human direction to promote slice-003 after PMO confirmed the current Dashboard surface is much smaller than the old AI workflow and corrected roadmap baseline drift.`
- Closeout: `Completed on 2026-04-26. Added helper-level Dashboard saved-task rules coverage for preview/expanded state, active versus archived row behavior, completion/reactivation payloads, archive/restore payloads, current-tab removal, and canonical provenance derivation. Dashboard.vue now consumes those helpers without reintroducing Dashboard AI workflow, feature-layer migration, backend route changes, shared list primitive changes, or UI/E2E review. Targeted Dashboard/task/context tests, full frontend npm test, and production build passed, with only the existing Vite large-chunk warning.`
