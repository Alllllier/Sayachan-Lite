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

### `Archived Preview Metadata Noise Reduction`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_010.md; human screenshot feedback in current thread`
- Why now: `The last project-surface semantics cleanup clarified `status + archived`, but screenshot feedback now shows that archived preview rows still carry too much repeated metadata on mobile. The separate archived section is correct, but the combination of section label plus per-row lifecycle and archive markers is visually noisy enough to merit a bounded micro-fix.`
- Expected outcome: `Archived project-task preview rows become quieter and easier to scan without losing the semantics just established. The archived section remains, archived tasks stay non-interactive, and completed-vs-active remains legible, but redundant metadata shouting is reduced.`
- In scope:
  - reduce redundant metadata noise inside archived preview rows on the `ProjectsPanel`
  - preserve the separate archived section itself
  - preserve archived-task non-interactivity
  - preserve completed-task strikethrough treatment
  - preserve archived-project narrow actions
  - keep any supporting test update narrow and local to this UI noise fix
- Out of scope:
  - broader `ProjectsPanel` redesign
  - dashboard or notes-surface changes
  - broader frontend test coverage buildout
  - repo-native UI review repair
  - backend/runtime semantics changes
- Dependencies: `Completed Project Surface Display Semantics Cleanup plus the screenshot-confirmed UI-noise issue surfaced in the current thread.`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-21 by explicit human instruction to auto-generate candidates, auto-select the best micro-fix, execute it, review it, close it out, and commit without further human gating.`
- Closeout: `Completed on 2026-04-21. The micro-fix removed the redundant per-row Archived chip from archived preview rows on ProjectsPanel while preserving the separate archived section, completed-task strikethrough, archived-task non-interactivity, and archived-project narrow actions. Narrow frontend validation passed through projectsPanel.behavior.test.js.`

### `Project Preview Metadata Hierarchy Cleanup`

- Status: `candidate`
- Source reference: `state/discussions/discussion_batch_010.md; human screenshot feedback in current thread`
- Why now: `The project preview hierarchy still feels visually loud after the last semantics cleanup, and a slightly broader pass could rebalance section-label emphasis, row metadata density, and local spacing in one go.`
- Expected outcome: `The project preview area becomes more visually coherent overall, with cleaner hierarchy between the Tasks header, archived subsection label, row text, and any remaining metadata markers. This would likely improve readability more broadly than a narrow chip-noise reduction, but it also carries more UI churn risk.`
- In scope:
  - archived-section label prominence
  - preview-row metadata hierarchy
  - local spacing/typography adjustments inside the project task preview area
- Out of scope:
  - broader `ProjectsPanel` redesign
  - changing archived-task interaction semantics
  - dashboard or notes-surface work
  - frontend testing baseline work
- Dependencies: `Same project-surface semantics context as the narrower alternative.`
- Risk level: `medium`
- Readiness: `almost-ready`
- Start condition: `Use only if PMO judges that the narrower noise-reduction slice would be too small to solve the readability complaint.`

### `Project Surface Display Semantics Cleanup`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_010.md`
- Why now: `The archive/lifecycle model cleanup made task state semantics correct, but it also exposed that the current project surface still carries older display assumptions and now blurs `status` with `archived`, especially around archived-project task visibility. Human direction is to fix that surface semantics first before expanding frontend automated coverage.`
- Expected outcome: `The project and archived-project surfaces will display the now-correct `status + archived` model clearly without broad UI churn. Archived tasks will move into an explicit secondary section, lifecycle differences will remain visible per task, and currently liked interaction constraints such as archived-task non-interactivity and archived-project narrow actions will be preserved. The result should remove mixed/blurry project-surface behavior and give later frontend testing a more stable target.`
- In scope:
  - clarify project-surface display semantics for tasks after `archived` was separated from lifecycle `status`
  - ensure archived tasks on `Project` and `Archived Project` surfaces live in their own secondary archived section rather than disappearing or being merged back into the main active/completed groups
  - keep archived-section tasks visually expressing lifecycle per item instead of splitting the archived section into separate `active` and `completed` subgroups
  - preserve current liked UI affordances:
    - completed tasks continue using strikethrough treatment
    - archived tasks remain non-interactive by default, especially with respect to focus selection
    - archived projects keep the narrow action set centered on `restore`, `delete`, and task expansion
  - make archived-project task display explicitly show both dimensions at once:
    - `completed + archived` keeps completed styling while remaining non-interactive
    - `active + archived` remains non-interactive without inheriting completed styling
- Out of scope:
  - broader frontend test coverage buildout
  - dashboard surface redesign
  - notes-surface redesign
  - repo-native UI review repair
  - broad restyling or interaction redesign beyond the narrow project-surface semantics cleanup
- Dependencies: `Completed archive/lifecycle model cleanup and the display-semantics judgments now captured in discussion_batch_010.`
- Risk level: `medium`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-20 by explicit human selection; PMO activated current_sprint.md and execution_task.md for the narrow project-surface semantics slice while keeping the candidate visible during execution.`
- Follow-on note: `A later frontend-testing slice should follow this cleanup rather than precede it, because panel behavior coverage will be more valuable once the project-surface state semantics are no longer mixed or blurry.`
- Closeout: `Completed on 2026-04-20. The slice separated archived preview tasks into their own project-surface section, preserved lifecycle visibility per task item without splitting archived tasks into a second active/completed grouping, and kept the liked affordances intact: completed-task strikethrough, archived-task non-interactivity, and archived-project narrow actions. A narrow projectsPanel behavior test update was added, while broader frontend testing and repo-native UI review work remain deferred in discussion_batch_010.`
