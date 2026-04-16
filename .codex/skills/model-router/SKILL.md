---
name: model-router
description: Detect when the current task mode is mismatched with the current model tier and suggest a cheaper or stronger model, or a sub-agent alternative when the user has authorized delegation. Use when Codex is doing PMO, review, execution handoff, cleanup, policy work, or other recurring development tasks where cost-aware model routing matters.
---

# Model Router

Use this skill as a lightweight routing check, not as a hard gate.

## Core Rule

Read `docs/ai-ops/policies/model-routing-policy.md` before making a routing judgment.

If the current task clearly fits a policy category and the current model tier looks mismatched:

- say so briefly
- recommend the target model tier
- offer a sub-agent alternative only when delegation is allowed

Do not interrupt for close calls.
Do not repeat the same routing reminder multiple times in the same task phase.

## Reminder Shape

Keep the reminder to one short block:

- current task mode
- why the current model looks overpowered or underpowered
- suggested target model or sub-agent path

## Future Growth

If the task does not fit the current routing taxonomy, use best-effort judgment and recommend updating:

- `docs/ai-ops/policies/model-routing-policy.md`
- `docs/ai-ops/policies/skill-growth-policy.md` when the runtime behavior itself should evolve
