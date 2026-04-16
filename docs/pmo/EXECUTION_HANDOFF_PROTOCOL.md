# Execution Handoff Protocol

> Repository-native handoff protocol for Codex PMO and the current execution worker

---

## Purpose

Use repo files as the default handoff surface between:

- Codex as PMO command center
- the current execution worker
- Human as architecture owner

This protocol reduces repeated copy-paste and keeps sprint state visible inside the repository.

---

## Role Lock

- Codex writes sprint framing, execution boundaries, and PMO closeout.
- The execution worker reads execution tasks from repo files, executes the approved slice, and writes structured reports back to repo files.
- Human approves architecture decisions and may instruct the current execution worker to execute the current outbox task.

Reading this protocol does not change the execution worker into PMO.

---

## Canonical Files

- Current sprint state: `docs/pmo/state/current_sprint.md`
- Execution task: `docs/pmo/outbox/execution_task.md`
- Execution report: `docs/pmo/inbox/execution_report.md`

Default rule:

- Codex writes to `state/` and `outbox/`
- The execution worker writes to `inbox/`
- The execution worker should begin execution from `docs/pmo/outbox/execution_task.md` by default when a PMO handoff is active

---

## Standard Workflow

1. Codex updates `docs/pmo/state/current_sprint.md`
2. Codex writes the current execution slice into `docs/pmo/outbox/execution_task.md`
3. Human tells the current execution worker to execute from the outbox file
4. The execution worker reads the outbox file as the default execution source, performs the approved work, and writes the result into `docs/pmo/inbox/execution_report.md`
5. Codex reads the inbox report and generates PMO closeout, next sprint proposal, and commit message

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

- keep `current_sprint.md` current
- overwrite `execution_task.md` with the latest active execution slice instead of stacking old tasks
- read `execution_report.md` before drafting PMO closeout

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
- any affected skill instructions

Do not turn this file into a large operating manual.
