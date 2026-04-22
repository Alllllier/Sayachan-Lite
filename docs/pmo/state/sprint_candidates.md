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

### `Frontend Controls Core Baseline`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_011.md slice-003 first pass`
- Why now: `The structure/baseline first pass has already landed, so the next highest-value frontend consistency work is to formalize the core control grammar instead of leaving buttons and segmented controls as a mix of legacy styling and panel-local decisions. The current discussion has converged enough to support a bounded first pass focused only on button hierarchy and segmented controls, while intentionally deferring action-grouping follow-ons.`
- Expected outcome: `The frontend gains a first real controls-core baseline covering button hierarchy and segmented controls. High-frequency controls across Notes, Projects, task preview, and task capture should stop drifting as local one-off implementations and begin using a shared hierarchy (`Primary`, `Secondary`, `Ghost / Tertiary`, `Danger`, `AI / Intent`) plus a shared segmented-control shell (`page`, `mode`, `inline`) backed by a thin controls-specific token layer where needed.`
- In scope:
  - formalize first-pass button hierarchy for:
    - `Primary`
    - `Secondary`
    - `Ghost / Tertiary`
    - `Danger`
    - `AI / Intent`
  - formalize first-pass segmented-control shell for:
    - `page`
    - `mode`
    - `inline`
  - add only the thin controls-specific token layer needed to support segmented controls cleanly
  - first-pass adoption on current high-frequency surfaces where the new control grammar fits cleanly now
  - preserve the current good `inline` task-preview filter feel while moving it into the shared segmented-control baseline
- Out of scope:
  - `ActionRow / ObjectActionArea` follow-on work
  - full icon-button / menu-trigger systemization
  - reveal-pattern systemization
  - input / textarea state cleanup
  - dashboard AI workflow redesign
  - exhaustive frontend legacy cleanup
- Dependencies: `discussion_batch_011 slice-003 controls-core judgments; landed structure/baseline first pass from slice-001; willingness to defer action-grouping refinement into the next follow-on instead of forcing it into this sprint`
- Risk level: `medium`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-22 by explicit human direction to split controls core into a narrower first pass and to promote that first pass once the expected outcome and scope boundary were clear.`
- Closeout: `Completed on 2026-04-22. Landed the first-pass controls baseline for button hierarchy and segmented controls on Notes and Projects, then accepted several narrow review/polish corrections without widening scope: primary stayed functional-green rather than identity-colored, AI/Intent stayed icon-first, the page segmented-control active state was made clearer as a view switch, and the AI intent button baseline was settled into a round shadow-led pattern. Validation passed through frontend npm test and npm run build.`

### `Frontend Action Grouping Baseline`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_011.md slice-003 action-grouping follow-on`
- Why now: `The first-pass controls core baseline has already landed, so the next highest-value follow-on inside the same controls family is to formalize action grouping instead of leaving object-level action areas and ordinary action rows as panel-local interaction grammar. The discussion has now converged on a simple two-part model: a thin `ActionRow` and an object-focused `ObjectActionArea`.`
- Expected outcome: `The frontend gains a first action-grouping baseline that distinguishes ordinary grouped actions from object-level action entry areas. `ActionRow` should become a thin, right-aligned grouped-action container, while `ObjectActionArea` should formalize the object-entry pattern around a main button, in-place `Cancel` replacement, optional pending state, and a directly attached revealed block.`
- In scope:
  - formalize first-pass `ActionRow` as a thin grouped-action container
  - formalize first-pass `ObjectActionArea` with `idle / active / pending` state semantics
  - preserve the preferred `Add Task` direction:
    - main button in resting state
    - in-place replacement with `Cancel`
    - attached revealed mode/content block below
  - bring current object-level AI action areas under the same general `ObjectActionArea` family where they fit
  - make the AI object-action entry fully three-state:
    - preserve the current good `idle` form
    - add an explicit `active` close/cancel state using an SVG `x` icon
    - keep `pending` visually continuous with `idle` rather than letting it drift into a very different button treatment
  - allow the revealed lower block to continue relying on local implementation plus the existing baseline rather than forcing a heavy new inner component
- Out of scope:
  - redoing button hierarchy or segmented-control baseline
  - full icon-button / menu-trigger systemization
  - reveal-pattern formalization beyond the object-action-area cases already discussed here
  - input / textarea state cleanup
  - dashboard AI workflow redesign
  - exhaustive panel-level action cleanup
- Dependencies: `discussion_batch_011 action-grouping judgments; landed controls-core first pass; willingness to treat `ActionRow` as a thin container and `ObjectActionArea` as the richer object-level interaction grammar`
- Risk level: `medium`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-22 by explicit human direction to stop splitting this follow-on into extra slices and instead promote the full action-grouping pass as one bounded candidate.`
- Closeout: `Completed on 2026-04-22. Landed a thin `ActionRow` and a first-pass `ObjectActionArea` grammar across current Notes/Projects action surfaces, including `Add Task` in-place cancel flow and AI object-action `idle / active / pending` states. Post-review polish also aligned Dashboard onto the shared page segmented control, removed the archived-note badge residue, and tightened AI/mode control visuals without widening back into broader controls or reveal work.`
