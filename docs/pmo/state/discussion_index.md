# Discussion Index

> Canonical index for active and historical discussion batches.

## Working Rules

- keep only one primary `exploration` batch active at a time unless parallel exploration is truly necessary
- a narrow `follow-up` batch may be active alongside the primary exploration batch when it comes from closeout, execution return, or real usage and does not replace the main exploration thread
- use this file to track batch status, current focus, and promotion direction at the lifecycle level rather than as a step-by-step discussion log
- do not put full discussion content here; detailed discussion belongs in `state/discussions/`
- treat this file as a lifecycle index, not an incremental discussion journal
- update it when a batch is opened, promoted, parked, archived, or otherwise changes lifecycle state in a meaningful way
- do not update it for every new judgment, narrowed question, or intermediate refinement that already lives clearly in the batch file itself

## Entry Template

| Batch | Mode | Topic | Current focus | Status | Last updated | Promotion direction |
| --- | --- | --- | --- | --- | --- | --- |
| `discussion_batch_001` | `exploration | follow-up` |  |  | `active | stable | promoted | parked | archived` |  |  |

## Current Batches

| Batch | Mode | Topic | Current focus | Status | Last updated | Promotion direction |
| --- | --- | --- | --- | --- | --- | --- |
| `discussion_batch_001` | `exploration` | `Dashboard time cues and panel action noise` | `Define the day-phase model behind a text-led homepage rhythm cue so Sayachan can explain the user's present phase before any specific copy is written.` | `active` | `2026-04-18` | `undecided` |
| `discussion_batch_002` | `follow-up` | `Notes editor comfort and identity follow-up` | `Keep the discussion only as historical context for the promoted comfort-fix slice and the deferred rendered-surface identity decision.` | `stable` | `2026-04-19` | `promoted to sprint_candidates plus deferred planning records` |
| `discussion_batch_003` | `follow-up` | `Button noise and success-message consistency` | `Keep the batch for residual discussion after the promotion of the combined UI noise-reduction candidate.` | `stable` | `2026-04-19` | `promoted to sprint_candidates` |
| `discussion_batch_004` | `follow-up` | `PMO document load reduction` | `Keep the batch as context for the stabilized PMO减负 rules already normalized into runtime and workflow docs.` | `stable` | `2026-04-19` | `normalized into canonical PMO docs` |
| `discussion_batch_005` | `follow-up` | `Project task preview expansion and focus interaction redesign` | `Keep the batch as stabilized context for the promoted project-card preview candidate.` | `stable` | `2026-04-19` | `promoted to sprint_candidates` |
| `discussion_batch_006` | `follow-up` | `Archive semantics and lifecycle-model split for task/project/note` | `Keep the batch as stabilized context for the cross-model archive rule and the promoted alignment candidate.` | `stable` | `2026-04-20` | `promoted to decision_log plus sprint_candidates` |
| `discussion_batch_007` | `follow-up` | `Behavior-locked simplification pass for task/project/note` | `Keep the batch as stabilized context for the test-first cleanup plan, the future removal direction for `linkedProjectId`, and the split between must-preserve behavior and intentional simplification.` | `stable` | `2026-04-20` | `promoted to sprint_candidates for behavior-lock testing; later simplification slice still pending` |
| `discussion_batch_008` | `follow-up` | `Post-simplification residue cleanup and testing-baseline follow-up for task/project/note` | `Keep the now-completed runtime residue cleanup as context while the remaining live discussion narrows toward the paused testing/validation-baseline buildout topic.` | `active` | `2026-04-20` | `runtime cleanup completed; broader testing/validation discussion still open` |
| `discussion_batch_009` | `follow-up` | `Backend test architecture buildout` | `Keep the batch as stabilized context now that the runtime/route baseline and the narrow helper guardrail follow-up have both landed.` | `stable` | `2026-04-20` | `promoted to sprint_candidates in two bounded slices` |
| `discussion_batch_010` | `follow-up` | `Frontend display semantics and test coverage buildout` | `Use the now-stable shell/list/card baselines from discussion_batch_011 and discussion_batch_012 as context for narrowing the next live thread to first-pass frontend panel behavior coverage, likely ProjectsPanel before NotesPanel.` | `active` | `2026-04-25` | `slice-001 landed; slice-002 is now the clear next shaping target; repo-native UI review remains parked as broader validation buildout` |
| `discussion_batch_011` | `follow-up` | `Frontend style baseline refactor` | `Keep the now-closed shell/module baseline cleanup as stabilized context for Notes, Projects, and shallow Dashboard adoption; future creation flow, AI reveal/list cleanup, and Dashboard AI workflow redesign now live in backlog/decision records.` | `stable` | `2026-04-25` | `all promoted frontend baseline slices completed; final shell/module legacy cleanup closed; deferred follow-ons captured in idea_backlog and decision_log` |
| `discussion_batch_012` | `follow-up` | `Frontend display-list baseline and list grammar` | `Keep the completed Projects and Dashboard anchor slices as proven context; park `ai-task-item` and `ai-suggestion-item` until future AI core ownership is clearer.` | `stable` | `2026-04-24` | `slice-001 completed; pass-2 Dashboard saved tasks completed; AI reveal/list follow-on parked rather than promoted` |
| `discussion_batch_013` | `follow-up` | `Frontend panel behavior coverage baseline` | `Keep the completed frontend behavior baseline as stabilized context for Projects, Notes, Dashboard, ChatEntry, chatService, runtimeControls, and chat store coverage.` | `stable` | `2026-04-26` | `all selected frontend behavior slices and support-layer tests completed; browser/UI review and feature-layer migration remain separate future work` |
| `discussion_batch_014` | `follow-up` | `Frontend feature-layer split for Projects, Notes, Dashboard, and Chat` | `Closed as completed after migrating core frontend modules into feature API/rules/composable layers, retiring behavior helpers, simplifying page shells, and clarifying services boundaries.` | `stable` | `2026-05-03` | `completed; future follow-ons should open as new discussions rather than extending this batch` |
