# Current Sprint

- Sprint: `AI RuntimeControls Schema Normalization`
- Status: `active`
- Phase: `handed-off`
- PMO owner: `Codex`
- Architecture owner: `Human`
- Execution owner: `execution worker`
- Last updated: `2026-05-07`

## Current State

- Type: `candidate-selected`
- Goal: `/ai/chat` validates `runtimeControls` through an explicit Zod schema that matches current frontend payloads, strips unknown fields where safe, and preserves current private-core behavior.`
- Source: `sprint_candidates.md`
- Active handoff: `docs/pmo/state/execution_task.md`
- Execution report target: `docs/pmo/state/execution_report.md`

## Activation Snapshot

- Selected by: `Human`
- Selection date: `2026-05-07`
- Candidate source: `AI Route Service Split closeout follow-up`
- Related discussion, backlog, or decision entries: `AI Route Service Split closeout follow-up`

## PMO Boundary

- Detailed worker scope lives in `execution_task.md`
- Candidate comparison details remain in `sprint_candidates.md` when applicable
- This file should stay a lightweight runtime card, not a second execution brief

## Next PMO Action

- wait for execution return in `execution_report.md`
- close out, route follow-up, and reset runtime state when execution is accepted
