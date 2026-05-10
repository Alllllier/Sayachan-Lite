# Execution Task Template

- Status: `active`
- Sprint: `<selected sprint name>`
- Last updated: `<YYYY-MM-DD>`

## Worker Boot Rule

- Before executing, read `AGENT.md` as the repository execution entrypoint.
- Then read this file as the canonical active execution contract.
- Do not plan from `.pmo_runtime/state/sprint_candidates.md`, `.pmo_runtime/state/idea_backlog.md`, or broader PMO docs unless this handoff explicitly asks for that context.

## Source Trace

- Candidate source:
- Related discussion batch:
- Related backlog or decision entries:

## Objective

- what this execution slice is meant to deliver

## Safe Touch Zones

- files, modules, or surfaces that are safe to edit for this slice

## Execution Slices

- PMO sharpening slot: replace this line with ordered execution slices when sequence, ownership, or risk deserves explicit guidance.
- If this section is not expanded before handoff, execute the candidate as the smallest behavior-preserving change that satisfies the objective and safe touch zones.

## Boundary Notes

- PMO sharpening slot: name any important module, route, service, API, UI, or documentation ownership boundary that should guide implementation.
- Keep this sprint inside the safe touch zones and non-goals unless PMO explicitly updates this handoff.

## Non-Goals

- things this slice must not expand into

## Deferred Or Parked Follow-Up

- explicitly note future work that should stay out of this sprint
- state whether PMO should route it back to `.pmo_runtime/state/idea_backlog.md` or `.pmo_runtime/state/decision_log.md` after closeout

## Acceptance Checks

- concrete checks that should be satisfied before PMO closeout review
- report any skipped or incomplete in-scope item before PMO closeout

## Validation Expectations

- run validation appropriate to the selected candidate risk level
- candidate validation expectation:
  - no candidate-specific validation expectation was stated
- replace or extend this with concrete commands, target test files, browser review surfaces, or intentionally skipped validation
- report project-specific review expectations and whether they were performed
- if browser validation or UI review is relevant, state the reviewed surfaces or page states

## Out-Of-Scope Confirmation

- the worker report should explicitly confirm that the non-goals stayed out of scope
- name any high-risk adjacent areas that should be called out one by one in the report

## Escalation Points

- stop and return to PMO/human review if execution would cross an explicit non-goal
- stop and return to PMO/human review if dependencies are missing
- stop and return to PMO/human review if the candidate readiness no longer holds
- candidate-specific escalation triggers:
  - no candidate-specific escalation triggers were stated

## Completion Report Contract

Write the execution report to `.pmo_runtime/state/execution_report.md`.

Use `docs/pmo/state/templates/execution-report.template.md` as the report shape unless PMO explicitly narrows the contract for this sprint.

The execution report should state:

- what was delivered
- what validation was performed
- whether the PMO sharpening slots above were followed, revised, or intentionally left generic
- what remains unverified
- what risks or escalations remain
