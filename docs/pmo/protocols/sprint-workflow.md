# Sprint Workflow

> Use this workflow when work is ready to be compared, selected, handed off, executed, and closed.

## Purpose

This workflow covers the sprint lifecycle:

- candidate comparison
- sprint start
- execution handoff
- execution reporting
- commit decision
- PMO closeout
- next-sprint planning

## Canonical Files

- `state/sprint_candidates.md`
- `state/current_sprint.md`
- `state/execution_task.md`
- `state/execution_report.md`
- `state/decision_log.md`
- `history/reports/`

## Standard Sequence

1. Codex prepares at most 3 bounded sprint candidates.
2. Human explicitly selects one candidate to start.
3. Codex updates `current_sprint.md` with the selected sprint.
4. Codex keeps the selected candidate visible in `state/sprint_candidates.md` while the sprint is active, then writes the active execution contract into `execution_task.md`.
5. The execution worker implements only the approved slice and returns a structured report in `execution_report.md`.
6. Codex reads the report and determines whether the sprint is:
   - ready for closeout
   - still active
   - blocked
   - in need of follow-up validation or follow-up execution
7. If the human wants the change recorded now, commit preparation and commit can happen as a separate repository action.
8. During closeout, Codex checks whether the sprint produced a durable decision that belongs in `decision_log.md`.
9. During closeout, Codex checks whether the sprint triggered documentation sync review under `policies/documentation-sync-policy.md`.
10. PMO routes any deferred or parked follow-up into `idea_backlog.md` or `decision_log.md` instead of leaving it only in sprint artifacts.
11. PMO updates the next planning surface after closeout.

## Micro-Fix Fast Path

Use a micro-fix fast path when all of the following are true:

- the issue is already concrete and does not need new discussion shaping
- the scope is small enough that candidate comparison would add little value
- the change does not introduce architecture-sensitive ambiguity
- the human is clearly asking to execute the bounded fix now

Under this fast path:

1. Codex may activate `state/current_sprint.md` directly without first creating a new discussion batch or candidate entry.
2. Codex writes a bounded execution contract into `state/execution_task.md`.
3. The execution worker still returns a structured result in `state/execution_report.md`.
4. PMO still performs normal closeout, documentation-sync review, and follow-up routing after execution.

This fast path is for small, execution-ready corrections, not for scope-discovery work.
If boundary questions or competing implementation directions appear, return to the normal discussion / candidate route instead of stretching the fast path.

## Planning Rule

Before a candidate is treated as genuinely ready:

- likely touch zones should be known
- major boundary risks should be visible
- the scope should be bounded enough to hand off cleanly
- validation needs should be estimated at an appropriate project level

Candidate drafting does not equal candidate confirmation.

Policy touchpoints during shaping:

- validation expectations: `../policies/validation-floor-policy.md`
- AI fallback expectation: `../policies/ai-fallback-policy.md`
- architecture-sensitive zones: `../policies/architecture-sensitive-areas.md`

## Human Gate Rule

- a sprint starts only after explicit human selection
- generic momentum wording such as `continue`, `keep going`, or `push forward` does not count as sprint-selection authority
- if project-specific delegation is ever desired, it should be written explicitly rather than inferred

## Handoff Rule

- `current_sprint.md` should stay lightweight and act as runtime state, not a second execution brief
- `current_sprint.md` should mainly answer:
  - which sprint is active right now
  - what the sprint is broadly trying to do
  - what the most recent closed sprint was
  - what the next PMO action is
- a selected candidate may remain visible in `state/sprint_candidates.md` during execution so the near-term comparison surface keeps its immediate context
- a micro-fix fast path handoff may come from direct PMO activation instead of `state/sprint_candidates.md`, but it still needs an explicit bounded contract in `execution_task.md`
- detailed touch zones, non-goals, validation expectations, and escalation points belong in `execution_task.md`
- `execution_task.md` should identify where the sprint came from so discussion, backlog, and handoff stay traceable
- `execution_task.md` should contain only the current active execution contract, not stacked stale tasks
- if no sprint is active, keep both `current_sprint.md` and `execution_task.md` in explicit `idle` state rather than silently leaving stale content
- if human review during execution produces same-scope correction requests, keep them inside the active execution loop by default rather than reopening PMO immediately
- only rewrite `execution_task.md` during active execution when the human-review correction materially changes scope, non-goals, or validation expectations

## Validation Rule

Choose validation according to project risk and surface type.

Execution reports should always state:

- what validation was performed
- whether project-specific review was required for the sprint
- what project-specific review was performed or intentionally skipped
- what remains unverified
- what regression or follow-up risk still exists
- any same-scope human-review corrections that changed the delivered result after the first implementation pass
- any human-review-directed changes that slightly exceeded the original handoff wording

This workflow does not assume browser validation or UI review as universal defaults.
But when a sprint changes UI behavior, rendering, interaction density, or presentation quality, the report should make clear whether browser validation or UI review was expected and whether it actually happened.

`execution_report.md` should be treated as the final execution record up until PMO closeout, not as a frozen first-pass snapshot.
If human review triggers further same-scope refinement before closeout, the worker should update the same report instead of starting a new PMO cycle.

## Closeout Rule

PMO closeout should separate:

- completed and validated
- completed but not fully validated
- still in progress
- blocked
- deferred follow-up or residual risks

Closeout should be based on explicit execution report content, not assumption.

Closeout should also make the routing outcome explicit for anything intentionally left out of the sprint:

- `parked in idea_backlog`
- `recorded in decision_log`
- `kept active for follow-up execution`

Closeout should also record one documentation-sync outcome:

- `no sync needed`
- `reviewed, no update needed`
- `update required`

After closeout, the selected candidate entry in `state/sprint_candidates.md` should be updated to `completed` if it is being retained there for near-term context, rather than being removed immediately by default.

After PMO reads a detailed execution report, archive that report into `../history/reports/` before resetting `state/execution_report.md` to idle.

Operational closeout pass:

1. Read the active `state/execution_report.md` and determine the closeout status.
2. Record the closeout judgment in `state/current_sprint.md` as a short runtime summary, not a second full report.
3. Record the documentation-sync outcome in `state/current_sprint.md`.
4. Update the selected entry in `state/sprint_candidates.md`:
   - `completed` if it is being retained for near-term context
   - or archive it later if candidate-surface space is needed
5. Route any durable decisions or deferred follow-up into `state/decision_log.md` or `state/idea_backlog.md`.
6. If the sprint completed a work item that had been retained in `state/idea_backlog.md`, remove that item from backlog unless it still represents unfinished future work; keep durable conclusions in `state/decision_log.md` and keep execution history in `history/reports/`.
7. Archive the detailed execution return into `../history/reports/` before resetting `state/execution_report.md` to idle.
8. Reset `state/execution_task.md` to idle when no sprint remains active, using `../state/templates/execution-task.idle.template.md` as the reset shape.
9. Reset `state/execution_report.md` to idle after the detailed report has been archived, using `../state/templates/execution-report.idle.template.md` as the reset shape.
10. Set `state/current_sprint.md` back to `idle` when no sprint remains active, using `../state/templates/current-sprint.idle.template.md` as the reset shape.
11. Explicitly record commit state instead of assuming it.

If a new issue is discovered only after PMO closeout has already completed, route it back into PMO as a new micro-fix or a normal discussion item instead of trying to patch the closed sprint retrospectively.

Policy touchpoints during closeout:

- durable decision capture: `../policies/decision-capture-policy.md`
- validation floor: `../policies/validation-floor-policy.md`
- completion sanity pass: `../policies/feature-completion-checklist.md`
- documentation sync: `../policies/documentation-sync-policy.md`
- documentation sync mapping: `../policies/documentation-sync-guide.md`

## Commit Rule

Commit and closeout are related but not identical:

- a sprint may be implementation-complete before commit happens
- PMO closeout records delivery status in the PMO state machine
- git commit is a separate repository action

When commit has not happened yet, the PMO state should say so explicitly instead of hiding it behind a generic `closed` label.
