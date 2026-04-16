# Skill Growth Policy

Use this policy to decide when the AI operating system should absorb new behavior into a skill or a policy.

## Growth Rule

Add or update a skill when the behavior needs repeatable runtime guidance.
Add or update a policy when the rule should stay human-reviewable and evolve over time.

## Prefer Skill Updates For

- repeated task routing behavior
- repeatable handoff behavior
- structured review behavior
- deterministic operational checklists

## Prefer Policy Updates For

- model tiering rules
- collaboration role changes
- documentation ownership rules
- recurring task classes not covered by the current taxonomy

## Escalation Rule

When a new task type appears:

1. solve the task with best-effort judgment
2. decide whether it is likely to recur
3. if yes, update the relevant `docs/ai-ops/policies/*.md`
4. update the skill only if the runtime behavior itself must change

## Anti-Bloat Rule

Do not grow a skill with every new example.
Keep skills short and policy-driven.
If examples are useful, add them to policy or references, not to the skill body unless the workflow truly depends on them.
