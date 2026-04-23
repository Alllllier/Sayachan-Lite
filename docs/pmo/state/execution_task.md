# Execution Task

- Status: `active`
- Sprint: `Frontend Display-List Baseline Pass 1: Projects Task Preview`
- Last updated: `2026-04-23`

## Source Trace

- Candidate source: `docs/pmo/state/sprint_candidates.md -> Frontend Display-List Baseline Pass 1: Projects Task Preview`
- Related discussion batch: `docs/pmo/state/discussions/discussion_batch_012.md`
- Related backlog or decision entries: `none`

## Objective

- Realign the `ProjectsPanel` task preview surface to the newly shaped display-list baseline so this sprint validates that the framework can land in real code.
- Treat this as a structural adoption pass, not a broad redesign.
- Use the current PMO reading:
  - `List`
  - primary task `ListSection`
  - optional archived `ListSection`
  - `ListItem`
  - `ItemContent`
  - optional `ItemMeta`
- Keep expand behavior as list-level `preview / expanded` mode.
- Keep the current task row primary click semantics as `focus/select`.

## Safe Touch Zones

- `frontend/src/components/ProjectsPanel.vue`
- any small supporting frontend style surface needed to express the new structure cleanly, if it remains tightly bounded to this preview slice
- PMO state files only if execution uncovers same-scope wording clarification that must be reflected during the active sprint

## Non-Goals

- do not widen into `Dashboard` saved tasks
- do not redesign `mini-item`
- do not absorb `ai-task-item` or `ai-suggestion-item` in this sprint
- do not redesign task capture or broader project workflow surfaces
- do not force a universal list-variant system
- do not reopen panel/shell cleanup or unrelated legacy cleanup
- do not introduce a trailing menu into project task preview rows just to satisfy framework symmetry

## Deferred Or Parked Follow-Up

- `Dashboard` list migration remains the expected second pass after this sprint if the frame lands cleanly
- AI list/reveal convergence remains the expected third pass
- broader row-state systemization stays out of scope unless execution reveals a truly blocking gap
- PMO should keep these follow-ons in `discussion_batch_012.md` unless closeout reveals a stronger routing need

## Acceptance Checks

- `ProjectsPanel` task preview can be cleanly described in implementation as:
  - list-level mode switch
  - primary section with section header/title and attached filter control
  - optional archived section
  - rows with `ItemContent`
  - optional row `ItemMeta`
- the current expand control still governs both:
  - visible range
  - information density
- `Tasks` no longer reads as a generic list header if a cleaner section-header reading is implemented
- row primary click still performs the current focus/select behavior
- the sprint does not materially widen into Dashboard or other list surfaces

## Validation Expectations

- run project-appropriate frontend validation after the implementation
- at minimum include the relevant targeted automated validation and a build check if the touched surface participates in the frontend build
- project-specific review is required for this sprint: `yes`
- project-specific review should focus on:
  - `ProjectsPanel` task preview collapsed state
  - expanded state
  - active/completed filter behavior
  - archived section behavior
  - any mobile-sensitive behavior already present on this surface

## Escalation Points

- stop and return to PMO/human review if the implementation reveals that:
  - list-level expand cannot stay separate from row-level interaction without awkward regressions
  - section-level filter placement creates a real structural contradiction with the new frame
  - the preview surface actually needs a new mandatory variant or subcomponent that discussion has not yet stabilized
  - the sprint starts pulling Dashboard semantics into scope to stay coherent

## Completion Report Contract

The execution report should state:

- what was delivered on the `ProjectsPanel` task preview surface
- what validation was performed
- what remains unverified
- what risks or escalations remain
- whether the new list frame now appears strong enough to use as the reference for the later Dashboard pass
