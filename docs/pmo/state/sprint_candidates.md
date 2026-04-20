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

### `Task Project Note Runtime Residue Cleanup`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_008.md`
- Why now: `The main simplification sprint already landed, and human discussion has now explicitly judged several remaining runtime residues as no longer worth carrying in an early-stage personal codebase. This creates a narrow opportunity to fully remove the most obvious compatibility tails before they fossilize into the cleaned runtime.`
- Expected outcome: `The runtime becomes materially cleaner by removing the now-unnecessary `status='archived'` compatibility chain, retiring `Note.status`, and deleting the remaining route-level project-task legacy tolerances that are no longer justified now that canonical provenance writes have long been stable.`
- In scope:
  - remove the legacy archived-task compatibility chain from query, normalization, and restore handling
  - retire `Note.status` so note archive semantics are expressed through `note.archived`
  - remove route-level tolerance for legacy `linkedProjectId` rows
  - remove project archive/restore tolerance for `origin-only` legacy rows
  - keep validation focused on preserving the cleaned runtime behavior after these removals
- Out of scope:
  - larger backend test architecture buildout
  - frontend/browser validation baseline work
  - repo-native UI review repair
  - new product behavior or relationship-model design
- Dependencies: `Stable post-refactor runtime from Task Project Note Simplification Refactor plus explicit residue judgments captured in discussion_batch_008.`
- Risk level: `medium`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-20 by explicit human selection; PMO activated current_sprint.md and execution_task.md for the bounded runtime residue cleanup slice while keeping the candidate visible during execution.`
- Closeout: `Completed on 2026-04-20. The slice removed the legacy archived-task compatibility chain, retired Note.status, removed route-level tolerance for legacy linkedProjectId and origin-only project residue, updated backend tests to reflect the canonical runtime shape, and synced backend/runtime baselines. Broader testing/validation baseline work remains intentionally outside this sprint and stays parked in discussion_batch_008.`

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
