# PMO OPERATING MANUAL

> Canonical operating entrypoint for `Sayachan PMO v2`.

## Purpose

This manual is the main operating entrypoint into `Sayachan PMO v2`.

It defines:

- the canonical file set
- the minimum reading order
- the responsibility split

This file is intentionally narrower than the old PMO manual.

## Layer Model

`Sayachan PMO v2` is organized into five layers:

- `state/`
- `protocols/`
- `policies/`
- `baselines/`
- `history/`

### Runtime State

Use this layer for active PMO state:

- `state/current_sprint.md`
- `state/sprint_candidates.md`
- `state/idea_backlog.md`
- `state/decision_log.md`
- `state/execution_task.md`
- `state/execution_report.md`

### Protocols

Use this layer for flow contracts:

- `protocols/discussion-workflow.md`
- `protocols/promotion-workflow.md`
- `protocols/sprint-workflow.md`
- `protocols/execution-handoff-protocol.md`

### Policies

Use this layer for cross-cutting rules:

- `policies/decision-capture-policy.md`
- `policies/validation-floor-policy.md`

### Baselines

Use this layer for system truth and PMO truth:

- `baselines/system-baseline.md`
- `baselines/runtime-baseline.md`
- `baselines/roadmap.md`

### History

Use this layer for historical explanation and legacy transition:

- `history/legacy-transition-notes.md`

## Canonical Runtime Set

When operating the active PMO loop, the minimum runtime set is:

- `state/current_sprint.md`
- `state/sprint_candidates.md`
- `state/idea_backlog.md`
- `state/decision_log.md`
- `state/execution_task.md`
- `state/execution_report.md`

These are the files that should reflect current PMO state, not the old PMO files.

## Minimum Reading Order

### When checking current PMO state

Read in this order:

1. `state/current_sprint.md`
2. `state/sprint_candidates.md`
3. `state/idea_backlog.md`
4. `state/decision_log.md`

### When operating an active sprint

Read in this order:

1. `state/current_sprint.md`
2. `state/execution_task.md`
3. `state/execution_report.md`
4. `protocols/sprint-workflow.md`
5. `protocols/execution-handoff-protocol.md`

### When checking system truth

Read in this order:

1. `baselines/system-baseline.md`
2. `baselines/runtime-baseline.md`
3. `baselines/roadmap.md`

## Legacy Check

At the start of normal PMO operation, do a light legacy check.

This does not mean re-reading all legacy material on every turn.

It means:

- stay aware that legacy PMO surfaces may still exist during the transition
- check whether any still-open legacy or deferred-governance note materially affects the current PMO action
- if such a note exists, surface it as a weak reminder rather than silently ignoring it

Current reference surface for that reminder:

- `history/legacy-transition-notes.md`

Default behavior:

- if no relevant legacy note affects the current action, continue normally
- if a relevant note exists, mention it briefly and continue unless it changes scope, safety, or canonical ownership

## Responsibility Split

### Human

The human owns:

- architecture-sensitive decisions
- sprint selection
- high-risk scope changes
- final judgment when PMO needs explicit approval

### Codex

Codex owns:

- PMO state maintenance
- candidate shaping
- handoff writing
- execution report reading
- PMO closeout
- next-step planning

Codex does not own automatic sprint selection unless the human explicitly delegates it.

### Execution Worker

The execution worker owns:

- reading the active execution contract
- implementing only the approved slice
- writing structured execution results back into `execution_report.md`

The execution worker does not become PMO by reading this manual.

## Core Operating Rules

- sprint selection remains human-gated
- candidate drafting does not equal candidate confirmation
- durable planning conclusions should not remain trapped only in discussion or sprint notes
- validation must be stated explicitly, not assumed silently
- `current_sprint.md` stays lightweight
- `execution_task.md` is the active execution contract
- `execution_report.md` is the active execution return surface

## Legacy Note

Old PMO files may still exist during the transition, but this manual treats PMO v2 as the canonical operating surface.
