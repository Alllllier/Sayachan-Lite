# Execution Handoff Protocol

> Use this protocol when an explicitly selected sprint needs to be handed from PMO into execution and then returned for PMO closeout.

## Purpose

This protocol defines:

- how PMO creates the active execution contract
- how the execution worker reads that contract
- how execution writes back into a stable report surface

This file is intentionally narrower than the full sprint workflow.

## Canonical Files

- `.pmo_runtime/state/current_sprint.md`
- `.pmo_runtime/state/execution_task.md`
- `.pmo_runtime/state/execution_report.md`
- `.pmo_runtime/state/decision_log.md`

Runtime files live in the embedded independent git repository at `.pmo_runtime/`. Stable handoff rules and templates remain in the product repository under `docs/pmo/**`.

## File Roles

- `.pmo_runtime/state/sprint_candidates.md` is the selection and comparison surface before activation. It can remain visible as source trace, but it is not the active execution brief.
- `.pmo_runtime/state/current_sprint.md` is the lightweight PMO runtime card. It records the active sprint, phase, handoff path, report target, and next PMO action.
- `.pmo_runtime/state/execution_task.md` is the canonical worker execution contract. It owns detailed scope, safe touch zones, non-goals, validation expectations, escalation points, and report expectations.
- `.pmo_runtime/state/execution_report.md` is the execution return surface. It owns delivered outcome, validation evidence, unresolved areas, residual risk, and escalation return.

## Role Lock

- Codex writes PMO framing, active execution contract, and PMO closeout updates.
- The execution worker reads the active execution contract, executes the approved slice, and writes the structured report.
- Human approves architecture-sensitive decisions and explicitly selects the sprint before handoff begins.

Reading this protocol does not give the execution worker PMO selection authority.

## Handoff Sequence

1. Human explicitly selects a sprint.
2. Codex updates `.pmo_runtime/state/current_sprint.md` using the stable templates in `docs/pmo/state/templates/`.
3. Codex writes the bounded active task into `.pmo_runtime/state/execution_task.md` using the stable templates in `docs/pmo/state/templates/`.
4. If the sprint came from `.pmo_runtime/state/sprint_candidates.md`, Codex may mark the selected entry `active` but must not expand it into a worker brief.
5. The execution worker reads root `AGENT.md` as the repository execution entrypoint, then treats `.pmo_runtime/state/execution_task.md` as the active execution source.
6. The execution worker writes outcomes, validation, unresolved items, and escalations into `.pmo_runtime/state/execution_report.md`.
7. Codex reads `.pmo_runtime/state/execution_report.md` and decides whether the sprint is ready for closeout, needs follow-up, or must remain active.
8. Any deferred or parked follow-up that should survive the sprint must be routed back into `.pmo_runtime/state/idea_backlog.md` or `.pmo_runtime/state/decision_log.md` during closeout rather than left only in the report.

After the human/PMO selection is clear, `../tools/pmo.mjs` may perform the mechanical file writes for steps 2-4. The execution contract remains a PMO-authored contract, not a tool-selected plan.

## Minimum Handoff Content

An active `execution_task.md` should contain at least:

- sprint or task identifier
- worker boot rule that points to root `AGENT.md`
- source trace
- objective
- safe touch zones
- explicit non-goals
- deferred or parked follow-up routing
- acceptance checks
- validation expectations
- escalation points
- completion report expectations

## Core Rules

- `current_sprint.md` remains the lightweight PMO state card, not the full execution brief
- active `current_sprint.md` should be instantiated from `../state/templates/current-sprint.active.template.md`
- `execution_task.md` is the canonical active execution contract
- active `execution_task.md` should be instantiated from `../state/templates/execution-task.template.md`
- `../tools/pmo.mjs` may instantiate active and idle runtime files after PMO chooses the values
- any execution worker, including delegated or sub-agent workers, should consume `execution_task.md` as the default execution source rather than relying on ad hoc direct prompting as the primary brief
- active handoff should overwrite the active task surface rather than stack stale tasks
- no active work should be represented by an explicit `idle` state rather than by deleting files
- `execution_report.md` must remain stable enough for PMO closeout review
- execution should escalate rather than crossing architecture or boundary assumptions not approved in the task contract
- later direct instructions to an already-running worker should be limited to narrow follow-up clarifications, review corrections, or scope-safe execution updates rather than silently replacing the canonical handoff
- before final completion reporting, execution should check whether sprint-started local dev servers are still occupying expected dev ports and clean them up when ownership is clear
- future work that is intentionally out of scope for the sprint should be named explicitly so PMO can park or promote it after report review

Policy touchpoints during handoff and report review:

- validation expectations and report reading: `../policies/validation-floor-policy.md`
- AI fallback expectation when the slice changes AI behavior: `../policies/ai-fallback-policy.md`
- architecture-sensitive zones and escalation-heavy areas: `../policies/architecture-sensitive-areas.md`

## Report Rule

An active `execution_report.md` should always make clear:

- what was delivered
- what validation was performed
- what remains unresolved
- what risks or escalations still matter

If temporary dev servers were started during execution, the report should also make clear whether they were shut down before handoff return, or whether any port ownership ambiguity remains.

## Exit Condition

This protocol has completed its role when:

- execution has a clear active task surface and stable report target, and
- PMO has enough explicit report content to decide closeout or follow-up
