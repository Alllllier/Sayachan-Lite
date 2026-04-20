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

In addition, `operator-guides/` may hold human-facing system explanations and operator navigation aids.
It is a companion layer, not a canonical contract layer.

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

### Operator Guides

Use this layer for human-facing system explanations and operator navigation:

- `operator-guides/where-to-start.md`
- `operator-guides/pmo-system-map.md`
- `operator-guides/pmo-master-flow.md`
- `operator-guides/policy-trigger-map.md`
- `operator-guides/pmo-role-swimlane.md`

### Policies

Use this layer for cross-cutting rules:

- `policies/decision-capture-policy.md`
- `policies/validation-floor-policy.md`
- `policies/documentation-sync-policy.md`
- `policies/documentation-sync-guide.md`
- `policies/testing-and-ui-review-guide.md`
- `policies/ai-fallback-policy.md`
- `policies/feature-completion-checklist.md`
- `policies/architecture-sensitive-areas.md`

### Baselines

Use this layer for system truth and PMO truth:

- `baselines/system-baseline.md`
- `baselines/runtime-baseline.md`
- `baselines/roadmap.md`

### History

Use this layer for historical explanation and legacy transition:

- `history/legacy-transition-notes.md`
- `history/candidates/README.md`
- `history/reports/README.md`

## Canonical Runtime Set

When operating the active PMO loop, the minimum runtime set is:

- `state/current_sprint.md`
- `state/sprint_candidates.md`
- `state/idea_backlog.md`
- `state/decision_log.md`
- `state/execution_task.md`
- `state/execution_report.md`

These are the files that should reflect current PMO state, not the old PMO files.

## Intake And Routing Map

Use this routing map when a new idea, bugfix discussion, or future architecture concept enters PMO.

1. Capture the discussion entry in `state/discussion_index.md` and the active batch under `state/discussions/`.
2. Keep the topic in discussion while the shape, boundary, and likely slice are still unstable.
3. When the result stabilizes, promote it by intent:
   - `state/idea_backlog.md` for retained work that is worth keeping visible but is not ready to start
   - `state/sprint_candidates.md` for bounded slices that are ready for human comparison
   - `state/decision_log.md` for durable decisions, explicit deferrals, or rejected paths
4. After explicit human sprint selection, activate the selected sprint in `state/current_sprint.md` and write the active execution contract into `state/execution_task.md`.
5. The selected candidate may remain visible in `state/sprint_candidates.md` while the sprint is active, then be marked `completed` after closeout before later archival if space is needed.
6. Execution returns into `state/execution_report.md`, then PMO closes out the sprint and syncs any durable decision or deferred follow-up back into the formal state files.
7. After PMO reads a detailed execution report, archive that report into `history/reports/` before resetting `state/execution_report.md` to idle.
8. Parked future work must not live only inside the handoff or the report:
   - if it is stable enough to keep for later, record it in `state/idea_backlog.md` with status `parked`
   - if it is a durable deferral or rejected path, record it in `state/decision_log.md`
   - if it is still too raw for formal state, keep it in the discussion batch with explicit `parked` status and next review trigger
9. When work retained in `state/idea_backlog.md` is later completed through execution, remove the finished work item from backlog unless it still represents unfinished future work. Keep durable conclusions in `state/decision_log.md` and rely on `history/reports/` for the execution history.

The intended operating path is:

`discussion -> stabilized result -> sprint candidate -> execution handoff -> execution report -> closeout`

with side exits to:

- `idea_backlog.md` for retained or parked future work
- `decision_log.md` for durable decisions and explicit deferrals

There is also a narrow fast path for small execution-ready fixes:

`micro-fix -> direct execution handoff -> execution report -> closeout`

Use it only when the issue is already concrete, the scope is small, and no new discussion or candidate comparison is needed.

## Minimum Reading Order

### When checking current PMO state

Read in this order:

1. `state/current_sprint.md`
2. `state/sprint_candidates.md`
3. `state/idea_backlog.md`
4. `state/decision_log.md`

### When triaging new intake

Read in this order:

1. `state/discussion_index.md`
2. the active batch under `state/discussions/`
3. `state/idea_backlog.md`
4. `state/sprint_candidates.md`
5. `state/decision_log.md`

### When operating an active sprint

Read in this order:

1. `state/current_sprint.md`
2. `state/execution_task.md`
3. `state/execution_report.md`
4. `protocols/sprint-workflow.md`
5. `protocols/execution-handoff-protocol.md`

### When using the micro-fix fast path

Read in this order:

1. `state/current_sprint.md`
2. `state/execution_task.md`
3. `protocols/sprint-workflow.md`
4. only the additional docs needed for the bounded fix

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

## Evolution Rule

`PMO v2` may continue to grow new flows, but that growth should stay disciplined.

- every new process, document, or check should first be placed into the five-layer model:
  - `state`
  - `protocols`
  - `policies`
  - `baselines`
  - `history`
- PMO flow should also keep getting lighter where possible
- if a step no longer improves clarity, risk control, or delivery stability, it should be simplified or removed rather than preserved by habit

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
- parked future work should not remain trapped only in `execution_task.md` or `execution_report.md`
- validation must be stated explicitly, not assumed silently
- `current_sprint.md` stays lightweight
- `current_sprint.md` is a state card, not a narrative summary surface
- `execution_task.md` is the active execution contract
- `execution_report.md` is the active execution return surface
- human-review refinements stay inside the active execution loop unless they force a real PMO scope or decision change

## Policy Touchpoints

Use policies through protocol touchpoints rather than by trying to hold the entire policy set in memory.

- during discussion and promotion:
  - `policies/decision-capture-policy.md`
- during candidate shaping, handoff, report reading, and closeout:
  - `policies/validation-floor-policy.md`
  - `protocols/sprint-workflow.md`
- when AI-dependent behavior changes:
  - `policies/ai-fallback-policy.md`
- when completion feels implementation-complete but still uncertain:
  - `policies/feature-completion-checklist.md`
- when a change touches sensitive system zones:
  - `policies/architecture-sensitive-areas.md`
- during closeout when truth, PMO runtime, or execution behavior may have changed:
  - `policies/documentation-sync-policy.md`
  - `policies/documentation-sync-guide.md`

## Legacy Note

Old PMO files may still exist during the transition, but this manual treats PMO v2 as the canonical operating surface.
