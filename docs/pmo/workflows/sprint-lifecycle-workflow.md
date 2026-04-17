# PMO Sprint Lifecycle Workflow

> Use this workflow after work is ready to be compared, selected, handed off, executed, and closed.

---

## Purpose

This workflow covers the execution-facing PMO loop:

- candidate comparison
- sprint start
- repo-native handoff
- execution reporting
- commit decision
- PMO closeout
- next sprint proposal

---

## Canonical Files

- [sprint_candidates.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/state/sprint_candidates.md)
- [current_sprint.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/state/current_sprint.md)
- [execution_task.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/outbox/execution_task.md)
- [execution_report.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/inbox/execution_report.md)
- [decision_log.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/state/decision_log.md)

---

## Standard Sequence

1. Codex prepares at most 3 sprint candidates.
2. Human selects one candidate sprint to start.
3. Codex moves the selected sprint into `current_sprint.md`.
4. Codex writes the current execution slice into `execution_task.md`.
5. Claude executes only the approved slice and writes a structured report into `execution_report.md`.
6. Codex reads the report and decides whether the sprint is ready for commit, needs follow-up validation, or must remain open.
7. If the human wants the change recorded now, Codex or the approved execution worker performs commit preparation and creates the commit.
8. Codex produces PMO closeout, decision updates, and the next sprint proposal.
9. If a new sprint is chosen, repeat the loop.

---

## Planning Rule

Before a sprint candidate is treated as ready:

- Codex performs the default repository audit
- likely touch zones should be identified
- validation needs should be estimated
- obvious boundary risks should be surfaced early

Claude-side pre-execution audit is optional, not default.

---

## Handoff Rule

- prefer repo-file handoff over chat copy-paste when an active execution loop exists
- Codex writes state and outbox
- Claude writes inbox
- `current_sprint.md` should stay lightweight and function as PMO state, not as a second full execution brief
- when an active sprint's outbox task needs to be replaced by a follow-up task such as report rewrite, validation follow-up, or closeout repair, archive the previous outbox task first
- `execution_task.md` should be overwritten with the active slice rather than stacked with stale tasks
- detailed architecture context, touch zones, non-goals, validation requirements, and escalation conditions should live in `execution_task.md`, not be duplicated fully in `current_sprint.md`
- use `docs/pmo/outbox/archive/` for historical task snapshots when preserving the prior execution contract matters for PMO traceability
- when there is no active sprint execution task, keep `docs/pmo/outbox/execution_task.md` as a lightweight idle placeholder instead of deleting it

For detailed repo-native handoff rules, see [EXECUTION_HANDOFF_PROTOCOL.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md).

---

## Validation Rule

Choose validation by risk:

- logic or smoke validation for route, service, model, and workflow semantics
- browser validation for UI behavior and page-state changes that code review cannot judge safely
- UI review for visual hierarchy and presentation-quality changes

Execution reports should always state:

- tests run
- browser validation performed or not performed
- UI review performed or not performed
- unverified areas
- known regression risk

---

## Closeout Rule

PMO closeout should separate:

- completed and validated
- completed but not validated
- in progress
- deferred or removed
- unresolved risks or escalation points

Read `execution_report.md` before drafting PMO closeout or next-sprint planning.

## Commit Rule

Commit and closeout are related but not identical:

- a sprint may be implementation-complete and validation-complete before any commit is created
- PMO closeout records delivery status inside the repo-native state machine
- git commit is a separate repository action that should happen only when the human wants the current work recorded

Default interpretation:

- if the sprint is validated and the human is ready to keep the change, commit should normally happen before or alongside final closeout
- if the human is still reviewing, batching work, or comparing additional changes, the sprint may remain closeout-ready without creating a commit yet
- `current_sprint.md` should not imply that committed and closed always mean the same thing

When commit has not happened yet, PMO closeout should say so explicitly rather than hiding it behind a generic `closed` label.
