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

### `Frontend Input State Cleanup`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_011.md slice-005`
- Why now: `The structure, controls, action grouping, and secondary-control baselines have all landed, so the next most natural frontend consistency pass is to clean up high-frequency input-state semantics instead of leaving them as a mix of inherited baseline, silent submit guards, and object-level editing logic. Discussion has now converged on a bounded first pass covering only the highest-frequency input surfaces.` 
- Expected outcome: `The frontend gains a first real baseline for input and textarea states on the highest-frequency creation/edit surfaces. Existing `default / focus / disabled` behavior should be formalized as shared baseline, local silent submit guards should become a light visible invalid-state pattern, and current submitting behavior should be formalized through input/button disable rules without forcing a full validation framework or a new filled-state skin.`
- In scope:
  - formalize first-pass input-state baseline on:
    - `New Note`
    - `Edit Note`
    - `New Project`
    - `Edit Project`
    - `task capture`
  - explicitly retain and normalize:
    - `default`
    - `focus`
    - `disabled`
  - add a light input-invalid pattern for local input errors:
    - thin error border
    - light error focus
    - small helper text below the invalid field
  - convert existing silent local submit guards into visible local invalid-state behavior where it fits cleanly
  - formalize current `pending / submitting` behavior through input/button disabling rather than introducing a new heavy visual submitting state
- Out of scope:
  - `Dashboard` input/workflow redesign
  - `ChatEntry`
  - full validation framework or multi-field validation system
  - service/network failure mapping into field-level error states
  - forcing `filled / editing-active` into a field-level visual state
  - broader form-system redesign
- Dependencies: `discussion_batch_011 slice-005 judgments; landed structure/control/action-grouping/secondary-control baselines; willingness to treat `filled / editing-active` as region-level logic rather than a new input skin`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-22 by explicit human direction to promote the now-bounded high-frequency input-state pass after clarifying both covered surfaces and excluded areas.`
- Closeout: `Completed on 2026-04-22. Landed the first shared input-state cleanup across note/project creation and editing plus task capture, formalized default/focus/disabled behavior, upgraded current silent local invalid cases into restrained inline feedback, and kept submitting behavior intentionally light through disable rules rather than a heavier new form skin.`

### `Frontend Display-List Baseline Pass 1: Projects Task Preview`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_012.md slice-001 first-pass rollout pass-1`
- Why now: `The display-list discussion has now converged enough that the cleanest first implementation slice is no longer speculative. Projects task preview is the strongest near-match to the new list frame, already demonstrates list-level expand plus grouped preview sections, and is the safest place to test whether the emerging list grammar can become real shared structure without dragging in the harder Dashboard saved-task redesign too early.`
- Expected outcome: `The frontend gains the first real implementation pass of the shared display-list baseline on the Projects task preview surface. The preview should be realigned to the new `List / ListSection / ListItem / ItemContent / ItemMeta` reading, `Tasks` should behave like a section header rather than a generic list header, section-level filter control placement should be clarified, and the existing list-level expand behavior should remain intact as the governing preview-versus-expanded mode switch.`
- In scope:
  - implement the first-pass display-list frame on the Projects task preview surface only
  - align the preview surface to the agreed structural reading:
    - `List`
    - primary task `ListSection`
    - optional archived `ListSection`
    - `ListItem`
    - `ItemContent`
    - optional `ItemMeta`
  - preserve list-level expand as the owner of:
    - visible range
    - information density
  - treat `Tasks` as a section header/title rather than a universal list header
  - keep the current preview filter as a section-mounted control rather than core list structure
  - preserve row primary click as the current `focus/select` action
  - allow `ItemTrailingMenu` to remain absent on this sample rather than forcing row actions where they do not naturally belong
- Out of scope:
  - Dashboard saved-task redesign
  - checkbox removal or completed-toggle remapping on Dashboard
  - broad row-state systemization across all surfaces
  - AI task / AI suggestion convergence work
  - task-capture workflow redesign
  - broader panel/shell cleanup
  - global list-variant formalization beyond what this preview surface needs to prove the frame
- Dependencies: `discussion_batch_012 stabilized list grammar judgments; current Projects task preview implementation; willingness to treat this pass as a structural validation slice rather than a broader visual redesign`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-23 by explicit human direction to promote the first-pass Projects task preview slice after converging on the new list framework, rollout order, and the judgment that this is the cleanest surface to validate real implementation.`
- Closeout: `Completed on 2026-04-23. Landed the first shared display-list primitive layer under `frontend/src/components/ui/list/` and rewired `ProjectsPanel` task preview onto it. Same-scope human review corrections then tightened the section hierarchy, restored correct row font sizing, fixed mobile preview truncation, hid project-local mobile meta, moved disclosure from list shell to section-level controls, and split primary versus archived expansion state so the final implementation matched the updated PMO rule. Frontend targeted tests passed and repeated production builds stayed green aside from the existing large-chunk warning.`

### `Frontend Display-List Baseline Pass 2: Dashboard Saved Tasks`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_012.md pass-2`
- Why now: `The Projects task preview pass has validated the first shared display-list primitive layer in real code. Dashboard saved tasks are now the right second anchor surface because they expose the harder responsibility split that the list grammar was designed to clarify: row primary click, preview/expanded disclosure, provenance metadata, and trailing secondary actions are currently mixed across local Dashboard markup and checkbox behavior.`
- Expected outcome: `Dashboard saved tasks migrate onto the shared `List / ListSection / ListItem / ItemContent / ItemMeta` frame, removing the local saved-task list/item shell as the governing structure. Row primary click becomes the active-view complete/reactivate action, item-level expand is removed in favor of list or section preview/expanded mode, provenance stays in row metadata, and archive/delete/restore remain trailing secondary actions without forcing a full `ItemTrailingMenu` component yet.`
- In scope:
  - migrate Dashboard saved tasks from local `saved-tasks-list` / `saved-task-item` structure to shared display-list primitives:
    - `List`
    - `ListSection`
    - `ListItem`
    - `ItemContent`
    - `ItemMeta`
  - remove the active-view checkbox from saved-task rows
  - assign row primary click in active view to `completed / uncompleted` toggle
  - remove item-level title expansion state from saved tasks
  - introduce or use list/section-level preview versus expanded mode if the visible range or full-title display needs disclosure
  - keep source/provenance dots as row metadata
  - keep archive/delete/restore actions as trailing menu behavior inside the row metadata/trailing area
  - preserve active versus archived view behavior through the existing Dashboard archive segmented control
  - express completed rows primarily through muted/strikethrough row treatment rather than a new color system
  - express archived rows as demoted/non-primary rows rather than a separate vivid state treatment
- Out of scope:
  - introducing a formal `ItemTrailingMenu` component in this pass
  - redesigning the broader Dashboard AI workflow
  - migrating `taskDrafts`, `actionPlan`, or other AI workflow list-like residues
  - broad row-state systemization beyond what Dashboard saved tasks need
  - changing backend task lifecycle semantics
  - replacing the existing archive view segmented control
  - full Dashboard visual redesign or shell/module cleanup
- Dependencies: `completed Projects task preview list pass; existing shared list primitives under frontend/src/components/ui/list/; discussion_batch_012 responsibility split for Dashboard saved tasks; human agreement that checkbox removal follows from assigning row primary click to completed/uncompleted toggle`
- Risk level: `medium`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-24 by human agreement that the Dashboard saved-task plan is complete enough to promote to candidate status.`
- Closeout: `Completed on 2026-04-24. Dashboard saved tasks now use the shared display-list frame, active row primary click owns complete/reactivate, the checkbox and item-level expansion path were removed, provenance and trailing archive/delete/restore actions remain intact, and follow-up polish aligned the section with shared card/title and action-accent list treatment. Validation passed through frontend npm test and npm run build, with only the existing Vite large-chunk warning.`
