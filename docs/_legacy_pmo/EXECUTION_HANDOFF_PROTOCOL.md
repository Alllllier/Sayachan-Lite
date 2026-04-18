# Execution Handoff Protocol

> Repository-native handoff protocol for Codex PMO and the current execution worker.

---

## Purpose

Use repo files as the default handoff surface between:

- Codex as PMO command center
- the current execution worker
- Human as architecture owner

This protocol reduces repeated copy-paste and keeps sprint state visible inside the repository.

For full PMO lifecycle sequencing, use:

- [PMO_OPERATING_MANUAL.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/PMO_OPERATING_MANUAL.md)
- [sprint-lifecycle-workflow.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/workflows/sprint-lifecycle-workflow.md)

---

## Role Lock

- Codex writes sprint framing, execution boundaries, and PMO closeout.
- The execution worker reads execution tasks from repo files, executes the approved slice, and writes structured reports back to repo files.
- Human approves architecture decisions and may instruct the current execution worker to execute the current outbox task.

Reading this protocol does not change the execution worker into PMO.

---

## Canonical Files

- Discussion batches: `docs/pmo/state/discussion_batches/index.md`
- Idea backlog: `docs/pmo/state/idea_backlog.md`
- Sprint candidates: `docs/pmo/state/sprint_candidates.md`
- Current sprint state: `docs/pmo/state/current_sprint.md`
- Decision log: `docs/pmo/state/decision_log.md`
- Execution task: `docs/pmo/outbox/execution_task.md`
- Execution task archive: `docs/pmo/outbox/archive/`
- Execution report: `docs/pmo/inbox/execution_report.md`

Default rule:

- Codex writes to `state/` and `outbox/`
- The execution worker writes to `inbox/`
- The execution worker should begin execution from `docs/pmo/outbox/execution_task.md` by default when a PMO handoff is active
- `docs/pmo/state/current_sprint.md` is the lightweight PMO state card for the active sprint
- `docs/pmo/outbox/execution_task.md` is the canonical execution contract for the worker
- `docs/pmo/outbox/archive/` stores prior outbox snapshots when an active sprint needs a replacement follow-up task before closeout
- when no sprint is actively handing work to the execution worker, `docs/pmo/outbox/execution_task.md` should remain present as a lightweight idle placeholder

---

## Handoff Sequence

1. Human selects one candidate sprint to start.
2. Codex updates `docs/pmo/state/current_sprint.md`.
3. Codex writes the current execution slice into `docs/pmo/outbox/execution_task.md`.
4. Human tells the current execution worker to execute from the outbox file.
5. The execution worker reads the outbox file as the default execution source, performs the approved work, and writes the result into `docs/pmo/inbox/execution_report.md`.
6. Codex reads the inbox report, determines whether commit is appropriate, and then generates PMO closeout, decision-log updates, and the next sprint proposal.

---

## File Policy

- Owner-facing PMO summaries default to Simplified Chinese
- Execution task files may remain English-first
- Execution completion reports may be English-first unless the human requests otherwise
- Prefer ASCII-safe formatting when possible
- Keep files concise and continuously reusable

---

## Editing Rules

### Codex

- keep `docs/pmo/state/discussion_batches/index.md` and active batch files current
- keep batch themes lightweight and clustered rather than over-normalized
- keep `idea_backlog.md` useful for ongoing discussion, not a dumping ground
- perform the default PMO-level code audit before promoting work into `sprint_candidates.md`
- keep `sprint_candidates.md` capped at 3 options
- keep `current_sprint.md` current
- remove a selected sprint from `sprint_candidates.md` when it becomes active
- update `decision_log.md` when planning decisions become durable
- keep `current_sprint.md` lightweight rather than duplicating the full handoff contract
- archive the previous outbox contract before replacing it with a follow-up task during the same sprint
- overwrite `execution_task.md` with the latest active execution slice instead of stacking old tasks
- do not delete `execution_task.md`; when no active handoff exists, replace it with an idle placeholder state
- read `execution_report.md` before drafting PMO closeout
- treat commit as a distinct step from execution and from PMO closeout; do not assume sprint closure automatically means a commit already exists

### Execution Worker

- treat `execution_task.md` as the default source of execution truth for the current sprint
- do not rewrite PMO framing inside the report
- write outcomes, validation, unresolved items, and escalation points into `execution_report.md`
- escalate rather than crossing architecture boundaries not approved in the task file
- only run browser validation when the sprint explicitly requires UI-surface or page-state verification

---

## Escalation Rule

If execution would require changing:

- public vs private core responsibility split
- bridge contracts
- focus/task domain rules
- archive cascade semantics
- chat runtime semantics
- database direction beyond bounded compatibility-safe changes

The execution worker must stop and record the issue under the architecture decision section of `execution_report.md`.

---

## Maintenance Rule

Keep this protocol small.

If the workflow changes, update:

- this protocol
- `PMO_OPERATING_MANUAL.md`
- relevant files under `docs/pmo/workflows/`
- any affected skill instructions

Do not turn this file into a large operating manual.
