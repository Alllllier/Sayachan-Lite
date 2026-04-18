# Architecture-Sensitive Areas

> Use this guide when a change feels "small in code" but risky in system semantics.

## Purpose

This guide gives PMO and execution threads a single place to check which zones should be treated as escalation-heavy.

## Current Sensitive Areas

Treat these areas as architecture-sensitive:

- `backend/src/ai/bridge.js`
- `backend/private_core/sayachan-ai-core/**`
- focus/task workflow semantics
- dashboard-to-chat context contracts
- task archive cascade rules
- public/private core responsibility split

## Handling Rule

When a planned change touches one of these areas:

- re-read the relevant baseline before proceeding
- do not silently treat the work as routine implementation-only change
- escalate when the change may alter system truth, runtime contract, or public/private responsibility split

## Related Baselines

- `../baselines/system-baseline.md`
- `../baselines/runtime-baseline.md`
- `../baselines/backend-api.md`
- `../baselines/private-core-boundary.md`
