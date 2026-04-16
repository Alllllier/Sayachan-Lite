# Codex Claude Development Loop

This is the default AI-assisted development loop for the repository.

1. Human states goal or problem.
2. Codex checks architecture truth and PMO constraints.
3. Codex decides whether the task is planning, execution, review, cleanup, or policy work.
4. Codex prepares repo-native handoff when execution should be delegated.
5. Claude executes the approved slice and writes a structured report.
6. Codex audits the result, updates docs when needed, and handles commit gating.
7. Human resolves architecture decisions or priority changes when escalation is required.

## Repository-Native Handoff

Default handoff files:

- state: `docs/pmo/state/current_sprint.md`
- outbox: `docs/pmo/outbox/execution_task.md`
- inbox: `docs/pmo/inbox/execution_report.md`

## Maintenance Notes

- PMO and architecture docs are not execution-owned by default
- repo hook rules should stay neutral and repo-owned
- model-routing reminders should come from policy, not ad hoc preference
