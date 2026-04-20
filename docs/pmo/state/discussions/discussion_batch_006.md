# Discussion Batch `discussion_batch_006`

- Topic: `Archive semantics and lifecycle-model split for task/project/note`
- Last updated: `2026-04-20`
- Status: `stable`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `architecture`
- Origin trigger: `execution report`
- Source channel: `human discussion`
- Why now: `Closeout review of the archived-project-panel micro-fix surfaced a deeper modeling problem: task lifecycle state and archive state are currently mixed together, and the same ambiguity may later spread into project/note relationship modeling.`
- Related sprint or closeout: `Archived Project Panel Task Visibility Fix closeout`

## Why This Discussion Exists

- Project archive/restore currently revealed that `task.status` is carrying both lifecycle meaning and archive meaning at once.
- Human follow-up discussion stabilized a broader concern: future relationships such as project -> sub-project, project -> note, and note -> note reference should not inherit the same modeling ambiguity.
- PMO needs one boundary-safe place to shape the model rule before turning it into an execution slice.

## Theme Summary

### `theme-001`

- Summary: `Separate lifecycle status from archive visibility across task, project, and note so container archive behavior does not overwrite object progress semantics.`
- Why grouped: `The task bug exposed the immediate symptom, but the underlying modeling rule affects all three object types and future parent-child or reference relationships.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `Project restore currently flattens previously completed tasks back to active, showing that archive is being modeled as a status value instead of as an orthogonal dimension.`

## Possible Slices

### `slice-001`

- Name: `Task archive and lifecycle split`
- Why separate: `Task is the currently broken surface and likely the first place where the model split must become real in code.`
- Current maturity: `emerging`
- Likely target: `sprint_candidates`
- Parking trigger: `If PMO decides to first capture only the modeling rule without immediate execution shaping.`
- Reopen signal: `If active discussion converges on a stable task-model migration shape and wants a bounded implementation slice.`

### `slice-002`

- Name: `Project and note archive-model alignment`
- Why separate: `Project and note do not yet show the same bug severity, but the future relationship model should align with the same archive/lifecycle rule before more attachment features land.`
- Current maturity: `emerging`
- Likely target: `decision_log | idea_backlog | sprint_candidates`
- Parking trigger: `If PMO wants to stabilize the cross-model rule first and defer broader alignment work until after the task slice is solved.`
- Reopen signal: `If future planning starts project sub-project mounting, project-note mounting, or note-note reference execution without a stable archive model.`

## Open Questions

- Should `archive` become an explicit boolean field for `task`, `project`, and `note`, rather than remaining encoded as one `status` value?
- Is the stable long-term rule that lifecycle status must never be overwritten by container archive behavior?
- For `task`, should `status` narrow to `active | completed` while `archived` becomes a separate field?
- For `project`, should `status` narrow to progress semantics only, with `archived` handled separately?
- For `note`, should PMO proactively align the model now even though note does not yet have a richer lifecycle vocabulary?
- What is the minimum acceptable compatibility behavior for old task rows that still carry `status: archived` from the current development-stage model?
- Should this topic produce one cross-model decision first and then one or more execution slices, or should the task fix be allowed to lead and the wider model rule follow?

## Current PMO Judgment

- A stable design direction has already emerged: archive should be treated as an orthogonal dimension rather than as a lifecycle status value.
- Human discussion also stabilized a likely cross-model rule:
  - `task.status` should move toward `active | completed`
  - `project.status` should express progress only
  - archive should become a separate field rather than a status value
- The task surface is the urgent trigger because it already causes restore-time semantics loss.
- The broader project/note alignment work should stay visible because future mounting and reference relationships would otherwise likely recreate the same ambiguity.
- The discussion is now stable enough to support both decision capture and a bounded candidate draft.
- PMO should treat the cross-model rule as settled enough for `decision_log.md`, while the implementation slice is now candidate-ready at the shaping level even though the exact handoff contract still needs one bounded pass.

## Promotion Outcome

- The cross-model archive rule is now captured in `state/decision_log.md`.
- The execution-facing slice is now promoted into `state/sprint_candidates.md` as `Archive And Lifecycle Model Alignment`.
- Keep this batch as stabilized context for the promoted rule and candidate rather than as an active discussion thread unless a new unresolved modeling issue appears that is not already captured by those formal PMO records.
