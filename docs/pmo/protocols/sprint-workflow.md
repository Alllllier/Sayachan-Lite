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

## Standard Sequence

1. Codex prepares at most 3 bounded sprint candidates.
2. Human explicitly selects one candidate to start.
3. Codex updates `current_sprint.md` with the selected sprint.
4. Codex writes the active execution contract into `execution_task.md`.
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
- detailed touch zones, non-goals, validation expectations, and escalation points belong in `execution_task.md`
- `execution_task.md` should identify where the sprint came from so discussion, backlog, and handoff stay traceable
- `execution_task.md` should contain only the current active execution contract, not stacked stale tasks
- if no sprint is active, keep both `current_sprint.md` and `execution_task.md` in explicit `idle` state rather than silently leaving stale content

## Validation Rule

Choose validation according to project risk and surface type.

Execution reports should always state:

- what validation was performed
- what project-specific review was or was not performed
- what remains unverified
- what regression or follow-up risk still exists

This workflow does not assume browser validation or UI review as universal defaults.

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
