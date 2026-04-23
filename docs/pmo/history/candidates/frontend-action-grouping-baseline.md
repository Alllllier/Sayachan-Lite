# Archived Candidate

## Candidate

### `Frontend Action Grouping Baseline`

- Archived date: `2026-04-23`
- Archive reason: `completed-and-displaced`
- Original status at exit: `completed`
- Original source reference: `state/discussions/discussion_batch_011.md slice-003 action-grouping follow-on`
- Why it mattered: `This sprint formalized the first shared distinction between ordinary grouped actions and object-level action-entry areas, which unblocked later frontend baseline work by giving Notes and Projects a stable action grammar instead of panel-local button clusters and reveal handling.`
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
- Closeout summary: `Completed on 2026-04-22. Landed a thin `ActionRow` and a first-pass `ObjectActionArea` grammar across current Notes/Projects action surfaces, including `Add Task` in-place cancel flow and AI object-action `idle / active / pending` states. Post-review polish also aligned Dashboard onto the shared page segmented control, removed the archived-note badge residue, and tightened AI/mode control visuals without widening back into broader controls or reveal work.`
- Follow-up created from this candidate: `No direct execution follow-up. The entry was archived only to make room on the active candidate surface after later frontend baseline work produced a newer near-term option.`
- Notes: `Archived out of the current candidate surface on 2026-04-23 to restore the 3-entry limit after the new display-list baseline candidate was promoted.`
