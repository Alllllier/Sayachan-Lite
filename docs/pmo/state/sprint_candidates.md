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
