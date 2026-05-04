# Documentation Sync Guide

> Use this guide after a trigger is detected by `documentation-sync-policy.md`.

## Purpose

This guide answers a practical question:

Which documents should be checked first for the current change?

It is intentionally small. It is not a full document map.

## Quick Paths

## Trigger Table

Use this table during closeout before widening the review.

| Change type | First review targets | Typical outcome |
| --- | --- | --- |
| PMO workflow, runtime state shape, or handoff behavior changed | `docs/pmo/PMO_OPERATING_MANUAL.md`, affected `docs/pmo/protocols/**`, affected `docs/pmo/state/templates/**` | `update required` when canonical instructions changed |
| PMO mechanical tooling changed | `docs/pmo/tools/README.md`, `docs/pmo/protocols/sprint-workflow.md`, `docs/pmo/protocols/execution-handoff-protocol.md` | `reviewed, no update needed` unless command behavior changes operator steps |
| Product runtime or feature behavior changed | `docs/pmo/baselines/system-baseline.md`, `docs/pmo/baselines/runtime-baseline.md` | `update required` only when documented truth changed |
| Backend route, model, or data-shape behavior changed | `docs/pmo/baselines/backend-api.md`, relevant runtime baseline | `update required` when public or PMO-relevant contract changed |
| Validation expectation or UI review rule changed | `docs/pmo/policies/validation-floor-policy.md`, `docs/pmo/policies/testing-and-ui-review-guide.md`, `docs/pmo/protocols/sprint-workflow.md` | `update required` when future closeout criteria changed |
| Implementation-local cleanup with no truth, workflow, or validation change | none beyond closeout note | `no sync needed` |

### If code truth changed

Check first:

- `docs/pmo/baselines/system-baseline.md`
- `docs/pmo/baselines/runtime-baseline.md`
- `docs/pmo/baselines/backend-api.md` when routes, models, or API behavior changed
- `docs/pmo/baselines/private-core-boundary.md` when boundary truth changed

### If PMO runtime changed

Check first:

- `docs/pmo/PMO_OPERATING_MANUAL.md`
- the affected file under `docs/pmo/state/**`
- the affected file under `docs/pmo/protocols/**`
- the affected file under `docs/pmo/policies/**` when a cross-cutting rule changed

Then do a weak companion check:

- `docs/pmo/operator-guides/**` when human-facing system explanation, navigation, or diagrams may now be stale

### If execution behavior changed

Check first:

- `AGENT.md`
- `docs/pmo/protocols/execution-handoff-protocol.md`
- `docs/pmo/state/execution_task.md` or `docs/pmo/state/execution_report.md` only when canonical runtime semantics changed

Then do a weak companion check:

- `docs/pmo/operator-guides/**` when execution-facing diagrams or operator reading guidance may now be misleading

### If validation expectations changed

Check first:

- `docs/pmo/policies/validation-floor-policy.md`
- `docs/pmo/policies/testing-and-ui-review-guide.md`
- `docs/pmo/protocols/sprint-workflow.md` when closeout expectations changed

## Review Discipline

When documentation sync is triggered:

1. identify the trigger type
2. check the smallest relevant canonical set
3. decide one outcome:
   - `no sync needed`
   - `reviewed, no update needed`
   - `update required`

Record that outcome in the active PMO closeout surface:

- normally in `docs/pmo/state/current_sprint.md`
- and in `docs/pmo/state/execution_report.md` when the execution return should carry the review result or pending follow-up for PMO closeout

If `docs/pmo/operator-guides/**` was part of the review, it should usually be treated as a weak companion outcome inside the same documentation-sync pass, not as a separate blocking sync regime.

Do not widen the review scope just because older docs mention similar material.

## Legacy Reminder

If the current change touches legacy path handling, deferred governance issues, or old PMO residue, do a weak reminder check here:

- `docs/pmo/history/reference/legacy-transition-notes.md`

That check should remain lightweight unless the legacy note changes current safety, scope, or canonical ownership.
