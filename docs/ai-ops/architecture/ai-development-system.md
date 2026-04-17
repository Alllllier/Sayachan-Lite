# AI Development System

This repo uses a three-role AI development model:

- Codex: PMO, synthesis, review, commit gate, doc ownership
- Claude VS Code: execution worker unless the human changes the role split
- Human: architecture owner and final decision-maker

## Design Goals

- keep architecture truth under PMO ownership
- make execution handoff repository-native when possible
- separate policy from sprint state
- keep skills small and policy-driven
- keep model usage cost-aware instead of defaulting to the strongest model every time

## Asset Split

- `docs/pmo/**` stores live PMO operating files for active work
- `docs/architecture/**` stores canonical product architecture truth
- `docs/ai-ops/**` stores the AI development system itself
- `.codex/skills/**` stores runnable skill behavior

Within `docs/pmo/state/**`, the current model is:

- `discussion_batches/` for clustered planning conversations, focus tracking, and theme-level possible slices before promotion
- `idea_backlog.md` for open multi-round planning
- `sprint_candidates.md` for up to 3 execution-ready sprint options
- `current_sprint.md` for the one sprint explicitly selected to start
- `decision_log.md` for durable planning decisions

Within `docs/pmo/outbox/**`, the current model is:

- `execution_task.md` as the canonical current outbox file
- `archive/` for preserved outbox snapshots when an active sprint shifts from implementation into follow-up validation, report repair, or closeout repair
- `execution_task.md` remains present even when no sprint is active; in that case it should hold an idle placeholder rather than disappearing

## Public Private Rule

Use `public-private-development-model.md` when deciding what should remain in the public repo versus what must be documented only in the private core repo.

## Rule

If a behavior should change at runtime, prefer updating a skill.
If a rule should remain reviewable and evolve across future tasks, prefer updating a policy in `docs/ai-ops/policies/`.
