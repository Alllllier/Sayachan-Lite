# Discussion Batch `discussion_batch_010`

- Topic: `Frontend display semantics and test coverage buildout`
- Last updated: `2026-04-25`
- Status: `active`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `architecture`
- Origin trigger: `slice split-out from discussion_batch_008`
- Source channel: `human discussion`
- Why now: `The broader cross-surface testing/validation topic in discussion_batch_008 has now clearly produced a distinct frontend thread: frontend automated coverage is still thin, but immediate frontend testing should not proceed blindly because the project surface first needs a clearer display semantics rule after archive state was separated from lifecycle status. Human direction is to break this out into its own follow-up batch rather than keep nesting it under the larger mother container.`
- Related sprint or closeout: `Task Project Note Simplification Refactor closeout; Backend Runtime And Route Contract Test Baseline; Backend Helper Guardrail Tests`

## Source Trace From Parent Batch

- Parent batch: `state/discussions/discussion_batch_008.md`
- Parent slice: `slice-004: Cross-surface test and validation baseline buildout`
- Why split out: `The frontend subline is now durable and independent enough that continuing to discuss it inside the broader cross-surface container would mix together separate concerns: backend testing is already landed, while frontend testing, project-surface display semantics, repo-native UI review, and worker validation on frontend/UI work remain open.`

## Why This Discussion Exists

- Backend testing has already been shaped and executed through `discussion_batch_009`, so the remaining active work in the larger cross-surface baseline topic is now frontend-skewed.
- Frontend automated coverage is still relatively thin.
- The project surface now exposes a more expressive task state space because `archived` was split out from lifecycle `status`.
- That model improvement exposed a UI semantics issue: some current project-surface displays still reflect older assumptions where `completed + archived` was not a first-class visible combination.
- PMO needs a dedicated frontend container so the project can decide:
  - what frontend behavior should be protected first
  - what frontend display semantics must be clarified before testing is expanded
  - how frontend testing and repo-native UI review should relate later

## Theme Summary

### `theme-001`

- Summary: `Define the frontend display semantics and frontend testing shape that should follow the archive/lifecycle model cleanup without prematurely freezing still-shifting UI behavior.`
- Why grouped: `The open issue is no longer backend runtime architecture, but how the frontend should represent the now-cleaner state model and which frontend behaviors deserve durable automated protection first.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `Separating archived from lifecycle status made the model clearer but also surfaced that some current project-surface display logic is mixed and semantically blurry, which should likely be clarified before broad frontend test buildout continues.`

## Possible Slices

### `slice-001`

- Name: `Project surface display semantics cleanup`
- Why separate: `The project and archived-project surfaces now need an explicit UI rule for how archived tasks appear after archive state was split from lifecycle status.`
- Current maturity: `landed`
- Likely target: `sprint_candidates`
- Parking trigger: `If PMO decides the existing mixed display is tolerable for now and broader frontend testing should proceed first anyway.`
- Reopen signal: `If discussion converges on a stable project-surface grouping and visibility rule that should be implemented before further frontend testing expansion.`

### `slice-002`

- Name: `Frontend panel behavior coverage buildout`
- Why separate: `Once display semantics are stable enough, the project should likely build frontend behavior tests around its main panels instead of relying only on backend protection and ad hoc UI checks.`
- Current maturity: `emerging`
- Likely target: `sprint_candidates`
- Parking trigger: `If PMO decides frontend behavior is still too fluid to lock with tests.`
- Reopen signal: `If discussion converges on a stable first-pass frontend panel testing scope.`

### `slice-003`

- Name: `Repo-native UI review baseline`
- Why separate: `Frontend/browser-visible regressions still need a stable repo-native review path, but that should stay distinct from both frontend logic tests and panel display semantics cleanup.`
- Current maturity: `emerging`
- Likely target: `sprint_candidates or idea_backlog`
- Parking trigger: `If PMO decides browser review repair should wait until it blocks concrete frontend work again.`
- Reopen signal: `If discussion converges on what repo-native UI review should protect and when workers should default to it.`

## Open Questions

- Should frontend automation first protect `ProjectsPanel`, `NotesPanel`, or `Dashboard`?
- How much project-surface display semantics should be clarified before frontend tests are expanded?
- Should archived tasks on the project surface disappear, merge into the main lists, or live in their own secondary section?
- Should archived tasks within that section be re-grouped by lifecycle status, or should lifecycle be shown per task instead?
- How much of frontend validation should remain in logic-level `vitest` coverage versus later repo-native browser review?

## Current PMO Judgment

- The current repo already has frontend automated coverage through:
  - `frontend/package.json -> npm test`
  - underlying tool: `vitest`
- The current repo also already has a separate repo-native browser/UI review toolchain through:
  - `frontend/package.json -> npm run test:ui-review`
  - `frontend/package.json -> npm run test:ui-review:headed`
  - underlying tool: `Playwright`
- PMO should therefore continue treating frontend behavior tests and repo-native UI review as distinct layers rather than collapsing them into one generic frontend testing bucket.
- Human discussion has already clarified the first frontend-priority rule:
  - frontend testing should likely prioritize `panel behavior` before service/derived-state coverage is expanded for its own sake
  - the reason is that the currently important frontend services, especially `taskService` and `dashboardContextService`, are primarily support layers for panel behavior and derived UI state rather than the primary product surface themselves
- Human discussion has also clarified the likely priority ordering among the current major frontend surfaces:
  - `ProjectsPanel`
  - `NotesPanel`
  - `Dashboard`
- Human judgment is that this order is more appropriate than prioritizing `Dashboard` early, because:
  - `ProjectsPanel` is currently the most important and stable working surface
  - `NotesPanel` remains a core long-lived product surface
  - `Dashboard` is currently less satisfactory as a product surface and may still undergo larger changes, making heavy test investment there more likely to freeze transient behavior
- PMO should therefore treat the frontend testing priority order as:
  - first `ProjectsPanel`
  - then `NotesPanel`
  - only later a heavier `Dashboard` coverage pass
- Human discussion also clarified the current display-semantics blocker:
  - after `archived` was separated from lifecycle `status`, the task state space now includes combinations such as:
    - `active + archived`
    - `completed + archived`
  - the older UI implicitly grew around a model where `completed + archived` was not treated as a stable visible combination, so current project-surface behavior now reads as mixed and semantically blurry
- Human judgment is already clear on the broad surface distinction:
  - on `Dashboard`, `archived=true` should continue to mean `leave the current work surface`
  - on `Project`, `archived=true` should not mean total disappearance, but rather a downgraded / secondary visibility state
  - on `Archived Project`, task context should still remain visible rather than collapsing the project into an empty shell
- Human discussion then stabilized the preferred project-surface grouping rule:
  - on `Project` and `Archived Project` surfaces, archived tasks should appear inside their own secondary archived section
  - inside that archived section, tasks should *not* be split again into separate `active` and `completed` subgroups
  - instead, each archived task should carry its own lifecycle marker/badge so the UI explicitly represents both `status` and `archived` without conflating them
- Human discussion then added an important `must-preserve current UI behavior` constraint for this slice:
  - the current UI already has several interaction/display choices that the human considers good and does not want this cleanup to accidentally regress
  - those must-preserve behaviors currently include:
    - completed tasks using a strikethrough presentation
    - archived tasks being non-interactive by default, especially so they cannot be selected as focus targets
    - archived projects keeping a narrow action set centered on:
      - `restore`
      - `delete`
      - the task-expansion entrypoint
- PMO should therefore treat this slice not as a broad restyling or interaction rewrite, but as a narrow display-semantics cleanup that must preserve those currently liked UI affordances while clarifying `status + archived`.
- Human discussion then further clarified how this should read specifically inside `Archived Project` task display:
  - project archive currently cascades task archive state, so tasks shown under an archived project are expected to be `archived=true`
  - archived tasks should therefore remain non-interactive by default regardless of lifecycle status
  - lifecycle status should still continue to show through at the per-task visual level:
    - `completed + archived` should keep the completed-task visual treatment such as strikethrough while also remaining non-interactive
    - `active + archived` should not inherit the completed-task visual treatment, but should still remain non-interactive because it is archived
- PMO should therefore treat the archived-project task area as a place where both dimensions remain visible at once:
  - lifecycle differences still show visually
  - archive state still governs interaction availability
- PMO should therefore treat the immediate frontend requirement as:
  - first make the UI explicitly support and display the distinction between lifecycle `status` and archive state
  - remove current mixed/blurry behavior that comes from older assumptions about the task state space
  - only then expand frontend test coverage around the newly clarified surface behavior
- The current PMO reading is therefore:
  - the next frontend move is more likely `display semantics cleanup` than broad `frontend test coverage buildout`
  - frontend testing should follow clarified surface semantics rather than racing ahead of them
- Since that judgment was recorded, the frontend display-semantics line has advanced further than this file originally captured:
  - `Project Surface Display Semantics Cleanup` landed as the primary slice
  - a first follow-up micro-fix then removed the redundant per-row `Archived` chip from archived preview rows while preserving the archived section, completed-task strikethrough, archived-task non-interactivity, and archived-project narrow actions
  - a second, even narrower follow-up micro-fix then quieted the `Archived Project` task preview further by hiding:
    - the archived subsection label
    - the row-level lifecycle chip
    only when the project itself is archived
  - ordinary active-project archived sections were intentionally left unchanged in that second micro-fix
- PMO should therefore now treat the `ProjectsPanel` display-semantics surface as materially more stable than it was when this batch was first opened:
  - `Project` surface:
    - archived tasks live in a separate archived section
    - ordinary active-project archived sections still expose lifecycle chips per row
  - `Archived Project` surface:
    - archived task previews are now quieter and rely more on project-level archived context
    - completed tasks still communicate lifecycle through strikethrough rather than through an additional row chip
  - in both cases:
    - archived tasks remain non-interactive
    - archived-project narrow actions remain preserved
- PMO should therefore update the frontend sequencing judgment:
  - `slice-001` no longer blocks the next shaping step
  - the most natural next move inside this batch is now `slice-002` frontend panel behavior coverage buildout
  - `slice-003` repo-native UI review baseline remains less mature and does not yet supersede the panel-behavior line as the next likely target

## Promotion Outcome

- `slice-001` was stable enough to promote into `state/sprint_candidates.md` as `Project Surface Display Semantics Cleanup`
- `slice-001` has now completed successfully
- two follow-up micro-fixes have also landed under the same frontend display-semantics line:
  - `Archived Preview Metadata Noise Reduction`
  - `Archived Project Preview Quieting`
- keep this batch active as the frontend-specific follow-up container split out from `discussion_batch_008`
- use `discussion_batch_008` only as the broader parent context for cross-surface testing/validation, not as the place for ongoing frontend-specific refinement
- the remaining live work in this batch is now:
  - `slice-002` frontend panel behavior coverage buildout
  - `slice-003` repo-native UI review baseline
- frontend behavior coverage should now be treated as the next likely shaping target because display semantics are materially more settled than before
- repo-native UI review baseline remains materially less mature than the just-completed project-surface semantics slice
- a new sibling frontend discussion has now been split out:
  - `discussion_batch_011` `Frontend style baseline refactor`
- PMO should use `discussion_batch_011` for broader reusable-component/style-baseline planning rather than continuing to expand this batch with design-system scope

## Follow-Up Recheck - After `discussion_batch_011` / `discussion_batch_012`

- Date: `2026-04-25`
- Status: `active / narrowed`

### What Changed

- `discussion_batch_011` is now stable:
  - Notes, Projects, and shallow Dashboard shell/module cleanup have landed around the shared `Panel`, `CardCollection`, `CardHeaderRow`, `CardMetaRow`, `OverflowMenu`, `Card state`, and shared list/card surface language.
  - creation flow, AI reveal/list cleanup, and Dashboard AI workflow redesign are no longer blocking this batch because they have been routed into backlog or decision records.
- `discussion_batch_012` is now stable:
  - Projects task preview and Dashboard saved tasks have validated the shared display-list frame in two real surfaces.
  - AI reveal/list convergence is parked until future AI core ownership is clearer.

### Updated PMO Reading

- `slice-001` remains completed and stable.
- `slice-002` is now the clearest live thread:
  - the next useful discussion should define a first-pass frontend panel behavior coverage scope using the now-stabilized shell/list/card primitives as context.
  - likely first coverage target remains `ProjectsPanel`, then `NotesPanel`.
  - Dashboard should stay lighter for now because saved tasks have been structurally cleaned up, while broader Dashboard AI workflow remains a parked product redesign topic.
- `slice-003` should not overtake `slice-002`:
  - repo-native UI review and broader cross-surface browser review remain important, but current PMO state already tracks that as `Cross-Surface Frontend Validation Buildout` in `idea_backlog.md`.
  - this batch should not reopen UI review tooling before the first panel behavior coverage scope is clearer.

### Current Next Question

- What exact behavior should the first `ProjectsPanel` frontend behavior coverage slice protect now that display semantics and shared shell/list/card structure are stable?

## Split-Out Follow-Up - Panel Behavior Coverage Baseline

- Date: `2026-04-26`
- Status: `split out`
- New discussion batch: `discussion_batch_013`

### Split-Out Reason

- Human direction is now to shape the first frontend behavior coverage baseline across all three major panels:
  - `ProjectsPanel`
  - `NotesPanel`
  - `Dashboard`
- Keeping that broader three-panel testing discussion inside this batch would blur:
  - the already-completed project display-semantics cleanup
  - the remaining repo-native UI review / validation buildout topic
  - the new multi-panel behavior-coverage baseline

### Updated Parent-Batch Reading

- `slice-001` remains completed.
- `slice-002` now continues in `discussion_batch_013` with three slices:
  - ProjectsPanel behavior coverage
  - NotesPanel behavior coverage
  - Dashboard behavior guardrails
- `slice-003` repo-native UI review baseline remains parked as broader validation buildout and should not overtake the new behavior-coverage discussion unless a concrete UI-review blocker appears.
