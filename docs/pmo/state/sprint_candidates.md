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

### `Archive And Lifecycle Model Alignment`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_006.md; state/decision_log.md`
- Why now: `Recent project archive/restore behavior exposed a real semantics failure: completed tasks can be flattened back to active because archive is currently modeled as a lifecycle status value. Human discussion has now stabilized a broader rule that archive should be orthogonal to lifecycle status across task, project, and note before more parent-child and reference relationships land.`
- Expected outcome: `Task, project, and note gain a cleaner archive model where lifecycle status and archive visibility are no longer mixed together. Project archive/restore stops destroying task completion history, and future sub-project, project-note, and note-note relationships can build on one consistent archive rule instead of inheriting today's ambiguity.`
- In scope:
  - reshape `task` so lifecycle status no longer uses `archived` as one status value
  - reshape `project` so progress status is separate from archive state
  - align `note` to the same archive-separation principle
  - update route/query/archive/restore behavior to preserve lifecycle semantics while still supporting archive filtering
  - apply the minimum compatibility handling needed for development-stage legacy rows that still encode archive as status
  - validate the updated model through backend and frontend paths that cover archive, restore, and archive-aware listing behavior
- Out of scope:
  - broader project hierarchy execution such as full sub-project support
  - project-note mounting or note-note reference features themselves
  - unrelated task-focus redesign or project-card UI redesign outside what model alignment requires
  - production-grade migration tooling for historical test data beyond the agreed minimal compatibility behavior
- Dependencies: `A bounded implementation plan that keeps the archive/lifecycle split coherent across model, route, and UI layers without widening into unrelated relationship features.`
- Risk level: `high`
- Readiness: `almost-ready`
- Start condition: `Satisfied on 2026-04-20 by explicit human selection; PMO activated current_sprint.md and execution_task.md for the bounded cross-model archive/lifecycle alignment slice while keeping the candidate visible during execution.`
- Closeout: `Completed on 2026-04-20. Archive is now modeled separately from lifecycle status across task, project, and note, project and note restore behavior preserves task lifecycle semantics, and a follow-up blocker fix corrected restore-task query scoping. Residual validation gaps remain around browser-level archive UI review and live backend integration coverage, but the bounded implementation slice was accepted and a future archive-surface audit was parked in idea_backlog.`

### `Task Project Note Behavior-Lock Testing`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_007.md; task-project-note-behavior-audit.md; state/idea_backlog.md`
- Why now: `Recent archive/lifecycle work plus the follow-up audit both showed that task, project, note, and dashboard-context behavior now spans enough real runtime semantics that simplification should not start from intuition alone. A dedicated behavior-lock sprint is now the safest way to preserve current product outcomes while creating room for a later cleanup pass.`
- Expected outcome: `The current intended behavior across task, project, note, and dashboard-context surfaces becomes explicit and test-backed. The sprint should maximize behavior coverage while minimizing implementation coupling, so a later simplification refactor can remove legacy seams such as `linkedProjectId` and stale compatibility values without guessing which behaviors matter.`
- In scope:
  - add backend behavior tests for archive/restore semantics across note and project flows
  - add backend tests for current project-task relation boundaries, including the difference between project reads and project archive/restore cascades
  - add backend tests for focus-clearing behavior in the currently real completion/archive/delete paths
  - add frontend behavior tests for Projects preview branching, Dashboard saved-task behavior, and dashboard-context snapshot semantics
  - keep browser/UI review bounded to high-value archive/project/dashboard checks rather than trying to build full visual-e2e coverage
  - explicitly document which currently real behaviors are locked as must-preserve and which suspicious or legacy shapes remain only compatibility-era reads
- Out of scope:
  - the later simplification refactor itself
  - field removal or relation-model changes such as removing `linkedProjectId`
  - converting `focus-clearing` to the simpler symmetric rule yet
  - broad dashboard-context architecture redesign
  - production-grade migration work for legacy development-stage data
- Dependencies: `Stable discussion context from discussion_batch_007 plus the audit findings in task-project-note-behavior-audit.md.`
- Risk level: `medium`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-20 by explicit human selection; PMO activated current_sprint.md and execution_task.md for the test-first half of the two-sprint cleanup plan while keeping the candidate visible during execution.`
- Follow-on note: `If this candidate is selected and completed successfully, the expected next PMO move is a second simplification-refactor candidate rather than a fresh blank-slate discussion. That later slice should stay flexible until sprint-one testing confirms the real behavior boundaries, but its currently visible direction includes removing `linkedProjectId`, retiring stale `originModule` compatibility values, deleting clearly dead legacy task fields, simplifying focus-clearing, and reducing dashboard snapshot drift.`
- Closeout: `Completed on 2026-04-20. Backend and frontend behavior-lock coverage now exists for the key task/project/note/archive paths plus chat hydration and dashboard saved-task behavior. The sprint also clarified that dashboard-context truth remains only partially locked, and browser-level repo-native UI review is currently unavailable because the script points at a missing spec file. The later simplification-refactor candidate remains the intended next move.`

### `Task Project Note Simplification Refactor`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_007.md; task-project-note-behavior-audit.md; state/idea_backlog.md`
- Why now: `The behavior-lock sprint is complete, so the next cleanup slice no longer has to infer which current outcomes matter. The remaining high-value work is now structural: simplify the implementation, unify the runtime meaning of project-related task, and remove legacy seams under the protection of the locked behavior suite.`
- Expected outcome: `Task, project, and note keep the now-locked external behavior while the implementation becomes materially simpler and more coherent. The slice should unify project-task relation semantics, move `linkedProjectId` out of the primary runtime path, retire stale compatibility-era origin values, remove dead legacy task fields, simplify focus-clearing, and reduce dashboard snapshot drift without turning cockpit signals into a permanent context subsystem.`
- In scope:
  - replace `linkedProjectId` implementation duties with `originModule + originId` where behavior parity can be preserved
  - unify the runtime rule for project-related task boundaries rather than keeping read/cascade semantics split across different relation definitions
  - simplify focus-clearing around whether a focused task remains valid focus
  - remove dead or denormalized task fields once behavior-lock coverage proves they are not active dependencies
  - retire `project_focus` and `project_suggestion` from canonical runtime handling if they remain compatibility-only
  - reduce dashboard snapshot drift through bounded simplification rather than broader architecture work
- Out of scope:
  - no new first-class relationship system yet
  - no note-note, note-project, or project-project feature execution
  - no context-layer architecture project
  - no production-grade migration system for development-stage data
  - no broad AI runtime redesign
- Dependencies: `Completed behavior-lock coverage from Task Project Note Behavior-Lock Testing, stabilized discussion context in discussion_batch_007, and the audit findings in task-project-note-behavior-audit.md.`
- Risk level: `high`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-20 by explicit human selection; PMO activated current_sprint.md and execution_task.md for the simplification-refactor half of the two-sprint cleanup plan while keeping the candidate visible during execution.`
- Closeout: `Completed on 2026-04-20. The runtime now uses canonical project provenance as the primary task relation path, removes the main dead and denormalized Task fields from the active schema and write path, simplifies focus-clearing, reduces dashboard snapshot drift, and moves route helper clusters into a dedicated backend helper module. Bounded legacy compatibility remains for old linked-project and archived-status rows, and the repo-native browser review path is still broken, but the simplification slice and its post-refactor organization cleanup were accepted.`
