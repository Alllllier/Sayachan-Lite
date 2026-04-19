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

## Post-Closeout Tweak Path

Use a post-closeout tweak when all of the following are true:

- the issue is discovered immediately after a just-closed sprint or micro-fix through real usage or spot-checking
- it is a same-scope tail correction rather than a new slice
- the desired correction is already clear and does not need renewed discussion shaping
- the correction does not reopen architecture, data-model, or workflow-semantics questions

Under this path:

1. PMO does not reopen `state/current_sprint.md` as a new active sprint.
2. PMO does not write a new active contract into `state/execution_task.md`.
3. PMO does not require a full structured execution return in `state/execution_report.md`.
4. Instead, PMO records the tweak as a light note under the most recent closed sprint in `state/current_sprint.md`.
5. The execution worker may implement the tweak directly from the clarified human instruction or PMO note, then return only a short completion note with validation status.
6. PMO updates the tweak note in `state/current_sprint.md` once the correction lands.

This path is for tiny same-scope tail corrections, not for new feature work.
If the fix starts changing scope, needs more than one or two iterations, or exposes a new planning question, upgrade it back to the micro-fix fast path or the normal discussion / candidate route.

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

## Validation Rule

Choose validation according to project risk and surface type.

Execution reports should always state:

- what validation was performed
- whether project-specific review was required for the sprint
- what project-specific review was performed or intentionally skipped
- what remains unverified
- what regression or follow-up risk still exists

This workflow does not assume browser validation or UI review as universal defaults.
But when a sprint changes UI behavior, rendering, interaction density, or presentation quality, the report should make clear whether browser validation or UI review was expected and whether it actually happened.

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

When a change qualifies as a post-closeout tweak, PMO may keep the runtime surfaces idle and append a lightweight tweak note under the most recent closed sprint instead of reopening the full execution loop.

Operational closeout pass:

1. Read the active `state/execution_report.md` and determine the closeout status.
2. Record the closeout judgment in `state/current_sprint.md` as a short runtime summary, not a second full report.
3. Record the documentation-sync outcome in `state/current_sprint.md`.
4. Update the selected entry in `state/sprint_candidates.md`:
   - `completed` if it is being retained for near-term context
   - or archive it later if candidate-surface space is needed
5. Route any durable decisions or deferred follow-up into `state/decision_log.md` or `state/idea_backlog.md`.
6. Archive the detailed execution return into `../history/reports/` before resetting `state/execution_report.md` to idle.
7. Reset `state/execution_task.md` to idle when no sprint remains active, using `../state/templates/execution-task.idle.template.md` as the reset shape.
8. Reset `state/execution_report.md` to idle after the detailed report has been archived, using `../state/templates/execution-report.idle.template.md` as the reset shape.
9. Set `state/current_sprint.md` back to `idle` when no sprint remains active, using `../state/templates/current-sprint.idle.template.md` as the reset shape.
10. Explicitly record commit state instead of assuming it.

Post-closeout tweak rule:

- keep the tweak attached to the most recent closed sprint rather than opening a fresh active sprint
- record only:
  - what the tweak corrects
  - why it still belongs to the just-closed sprint
  - whether it has landed
  - what validation, if any, was performed
- prefer no more than 1 to 2 tweaks per just-closed sprint
- if additional follow-up keeps appearing, stop treating it as a tweak and reopen it as a micro-fix or a normal PMO item

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
