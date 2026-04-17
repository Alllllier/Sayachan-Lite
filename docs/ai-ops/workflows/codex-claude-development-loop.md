# Codex Claude Development Loop

This is the default AI-assisted development loop for the repository.

Primary PMO references:

- `docs/pmo/PMO_OPERATING_MANUAL.md`
- `docs/pmo/workflows/discussion-workflow.md`
- `docs/pmo/workflows/promotion-workflow.md`
- `docs/pmo/workflows/sprint-lifecycle-workflow.md`
- `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md`

1. Human states goal or problem.
2. Codex checks architecture truth, PMO constraints, and the relevant PMO workflow doc for the current stage.
3. Codex decides whether the task is planning, execution, review, cleanup, or policy work.
4. If discussion is still open, Codex follows the discussion workflow and records or updates the current discussion batch.
5. Discussion themes may retain lightweight possible slices so execution-granularity is not lost while the broader theme is still being discussed.
6. If a discussion result stabilizes, Codex follows the promotion workflow to place it into backlog, candidates, or decision state.
7. If a theme or all of its execution-relevant slices have been promoted, Codex compresses the batch record into promotion-oriented references instead of leaving duplicate long-form discussion notes behind.
8. Codex performs the default PMO-level repository audit only before treating a sprint slice as ready.
9. If the focused topic is recognized as private-core-owned, Codex moves the detailed architecture write-up into the private repo and leaves only a public boundary-safe reference.
10. Codex prepares repo-native handoff only after one candidate sprint is explicitly selected to start.
11. Claude executes the approved slice and writes a structured report.
12. If an active sprint needs a follow-up outbox for validation, report repair, or closeout repair, Codex first archives the previous outbox snapshot and only then replaces the active outbox.
13. When no sprint is actively handed off, `docs/pmo/outbox/execution_task.md` remains present as an idle placeholder rather than being deleted.
14. Codex audits the result, updates docs when needed, and handles commit gating as a distinct step rather than silently merging it into sprint closure.
15. Human resolves architecture decisions or priority changes when escalation is required.

## Repository-Native Handoff

Default planning and handoff files:

- discussion batches: `docs/pmo/state/discussion_batches/index.md`
- idea backlog: `docs/pmo/state/idea_backlog.md`
- sprint candidates: `docs/pmo/state/sprint_candidates.md`
- state: `docs/pmo/state/current_sprint.md`
- decision log: `docs/pmo/state/decision_log.md`
- outbox: `docs/pmo/outbox/execution_task.md`
- outbox archive: `docs/pmo/outbox/archive/`
- inbox: `docs/pmo/inbox/execution_report.md`

## Maintenance Notes

- PMO and architecture docs are not execution-owned by default
- Codex PMO audit is the default planning audit layer
- Claude pre-execution audit is optional and should be used only when execution risk remains unclear
- discussion should be clustered into batch themes before entering formal PMO backlog
- batch themes may retain `Possible Slices` so later execution promotion does not require rediscovering the original grain size
- once a theme or all of its execution-relevant slices are promoted, the batch should collapse to promotion records and references instead of duplicating canonical PMO state
- step-by-step PMO procedures should live in `docs/pmo/workflows/*.md`, while `PMO_OPERATING_MANUAL.md` stays focused on stable cross-workflow rules
- private-core-owned topics may begin in public discussion, but their detailed architecture should migrate into the private repo once identified
- PMO state supports multi-round discussion before execution starts
- `sprint_candidates.md` should stay capped at 3 items
- replacing an active outbox requires archiving the prior outbox snapshot first
- `docs/pmo/outbox/execution_task.md` should always exist; when no active handoff exists, it should become an idle placeholder
- repo hook rules should stay neutral and repo-owned
- model-routing reminders should come from policy, not ad hoc preference
