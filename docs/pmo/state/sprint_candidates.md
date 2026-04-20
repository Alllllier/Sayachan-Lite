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

### `Backend Runtime And Route Contract Test Baseline`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_009.md`
- Why now: `Recent backend refactors proved that runtime semantics in this project are now important enough to deserve a broader default protection net, but the next useful step is still bounded: strengthen backend behavior coverage around high-frequency list/filter semantics and establish a light route-contract baseline before expanding into helper-level testing.`
- Expected outcome: `Backend testing becomes materially more durable by filling the thinnest high-value gap in runtime behavior coverage and by introducing a small but stable route-contract baseline around status codes, canonical response shape, and key missing-resource behavior. The result should make future backend refactors safer for both runtime semantics and frontend/backend coordination without turning the repo into a heavy test stack.`
- In scope:
  - expand backend list/filter behavior coverage for high-frequency `task`, `project`, and `note` reads
  - add a first-pass route contract baseline for high-frequency routes, including key success status codes, minimal canonical response shape, and bounded `404` behavior for important id-based routes
  - keep using the current Node built-in test runner (`node --test`)
  - preserve the distinction between runtime behavior protection and route contract protection rather than merging them into one vague test bucket
- Out of scope:
  - broad helper/module test expansion
  - changing backend test framework
  - frontend test coverage buildout
  - repo-native UI review repair
  - broader cross-surface validation baseline work
- Dependencies: `Stable runtime semantics after Task Project Note Simplification Refactor and Runtime Residue Cleanup, plus the backend-testing judgments now captured in discussion_batch_009.`
- Risk level: `medium`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-20 by explicit human selection; PMO activated current_sprint.md and execution_task.md for the first-pass backend testing slice while keeping the candidate visible during execution.`
- Follow-on note: `A later follow-up may add a narrow helper/module guardrail layer, most likely centered on `buildArchiveFilter`, `projectTaskReadFilter`, and `projectTaskCascadeFilter`. `normalizeTask` and `normalizeNote` remain intentionally deferred from that first pass because they sit closer to the route-contract and runtime-behavior layers and could create unnecessary overlap if tested too early.`
- Closeout: `Completed on 2026-04-20. The slice added backend list/filter coverage for the high-frequency task/project/note reads, introduced a light route-contract baseline around status codes, canonical response shape, and key 404 behavior, and then tightened a few query-shape-coupled assertions into clause-level contract checks. No runtime semantics changed, and the later helper/module guardrail layer remains the intended follow-on direction in discussion_batch_009.`

### `Backend Helper Guardrail Tests`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_009.md`
- Why now: `The first backend testing slice has already landed runtime behavior and route contract protection. The next narrow, still-bounded step is to add a small helper/module guardrail layer for the most semantically important backend helpers without widening into a broad internal unit-test sweep.`
- Expected outcome: `A very small set of backend helper tests directly protects the highest-value rule-bearing helpers so future refactors can localize failures faster without over-freezing internal implementation details. The result should strengthen backend refactor safety while preserving the existing boundary that keeps helper testing much narrower than route behavior and route contract coverage.`
- In scope:
  - add direct tests for `buildArchiveFilter`
  - add direct tests for `projectTaskReadFilter`
  - add direct tests for `projectTaskCascadeFilter`
  - keep the helper layer intentionally small and semantics-oriented
- Out of scope:
  - direct tests for `normalizeTask`
  - direct tests for `normalizeNote`
  - broad helper/module coverage expansion
  - frontend testing work
  - repo-native UI review work
  - runtime behavior redesign
- Dependencies: `Completed first-pass backend runtime/contract testing baseline plus the helper-layer judgments now captured in discussion_batch_009.`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-20 by explicit human selection; PMO activated current_sprint.md and execution_task.md for this narrow helper/module guardrail slice while keeping the candidate visible during execution.`
- Closeout: `Completed on 2026-04-20. The slice added a narrow direct guardrail layer for buildArchiveFilter, projectTaskReadFilter, and projectTaskCascadeFilter without touching production runtime code, left normalizeTask and normalizeNote intentionally deferred, and passed the backend suite with 18 tests green. No runtime semantics changed, so documentation sync remained reviewed with no updates required.`

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
