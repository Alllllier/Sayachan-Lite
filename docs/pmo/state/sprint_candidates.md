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

### `Frontend Secondary Controls And Reveal Baseline`

- Status: `completed`
- Source reference: `state/discussions/discussion_batch_011.md slice-004`
- Why now: `The core controls grammar and action-grouping baseline have already landed, so the next frontend consistency gap is the narrower but still shared layer around icon buttons, overflow/menu triggers, and their attached reveal surfaces. Discussion has now converged on a bounded direction: `Notes / Projects` define the standard rounded-square panel-surface pattern, `Dashboard` should be absorbed into that final pattern, and AI circle controls remain intentionally out of scope for this pass.`
- Expected outcome: `The frontend gains a first real baseline for secondary panel-surface controls and attached reveal surfaces. Ordinary tool-style icon buttons and menu triggers should stop drifting as panel-local implementations, `Notes / Projects` should define the shared rounded-square pattern, and `Dashboard` should adopt that same final menu-trigger grammar without reopening AI circle or ChatEntry control design.`
- In scope:
  - formalize the panel-surface `rounded-square` icon-button baseline
  - keep `28x28` as the shared size for that baseline
  - preserve the agreed shape split:
    - `rounded-square` for ordinary tool/menu controls
    - `circle` remains outside this slice
  - absorb the agreed rounded-square state language into baseline tokens/rules:
    - transparent default
    - muted foreground
    - shared active surface for hover/open/pinned-like states
  - treat `pin` as the main rounded-square reference sample
  - formalize `menu trigger` to eat the same rounded-square baseline
  - treat `Notes / Projects` as the canonical shared panel-surface menu-trigger sample
  - bring `Dashboard` menu trigger directly under that final shared scheme
  - preserve current dropdown/menu-item behavior where it is already good enough
  - keep reveal-pattern formalization limited to the ordinary attached panel-surface pattern already present in `Notes / Projects`
- Out of scope:
  - `circle` AI / Intent button redesign or AI reveal unification
  - `ChatEntry` icon-button/menu-trigger changes
  - broader `ObjectActionArea` or action-grouping redesign
  - broader dashboard workflow redesign
  - input / textarea states
  - full legacy cleanup beyond this secondary-controls surface
- Dependencies: `discussion_batch_011 slice-004 judgments; landed controls core and action-grouping baselines; willingness to treat `Notes / Projects` as the canonical menu-trigger sample and `Dashboard` as the legacy surface to absorb`
- Risk level: `low`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-22 by explicit human direction to promote the now-mature secondary-controls/reveal discussion into candidate status rather than continue deeper speculative discussion.`
- Closeout: `Completed on 2026-04-22. Landed the first rounded-square panel-surface baseline for pin/menu triggers, unified the effective Notes/Projects menu-trigger family into shared baseline rules, and absorbed Dashboard into that same trigger/dropdown/menu-item scheme without reopening AI circle controls, ChatEntry, or broader workflow redesign. Validation passed through frontend npm test and npm run build.`

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

- Status: `active`
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
