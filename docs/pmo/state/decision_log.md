# Decision Log

> Durable planning decisions that future PMO work should remember instead of rediscovering.

## Working Rules

- record approvals, deferrals, rejections, and transition rules here
- keep entries short and decision-oriented
- update this file when a discussion result or sprint closeout changes future planning
- do not leave durable decisions trapped only inside discussion batches or sprint notes
- do not use this file for ordinary candidate retention or candidate re-validation
- if a conclusion only says that a candidate still exists, keep that in `sprint_candidates.md` unless it changes future planning rules

## Entry Template

### `<decision title>`

- Date:
- Type: `approved | deferred | rejected | transition-rule`
- Scope:
- Decision:
- Reason:
- Follow-up:

## Recorded Decisions

### `Sprint selection remains human-gated`

- Date: `2026-04-18`
- Type: `transition-rule`
- Scope: `PMO sprint activation`
- Decision: `Candidate drafting and PMO momentum do not authorize automatic sprint activation. A sprint starts only after explicit human selection.`
- Reason: `Recent PMO testing showed that generic "continue" language can be over-read by the host and cause premature sprint activation if the selection gate is not written down clearly.`
- Follow-up: `Keep this rule explicit in current_sprint.md, sprint workflow, and any future host behavior layer.`

### `Rendered note identity work is deferred into a broader Sayachan style refresh`

- Date: `2026-04-19`
- Type: `deferred`
- Scope: `Notes follow-up discussion_batch_002 and future Sayachan presentation planning`
- Decision: `The current Notes follow-up should stop at editing-surface comfort fixes. Rendered-surface identity changes should not be folded into this follow-up and are instead deferred into a later broader Sayachan style refresh.`
- Reason: `The current discussion stabilized the editing-side comfort corrections enough to bound a near-term slice, but the stronger visual identity direction belongs to a wider product-level styling pass rather than a narrow editor follow-up.`
- Follow-up: `Keep the future style-refresh work visible in idea_backlog.md and avoid re-expanding the Notes comfort slice into rendered-surface identity work unless the broader refresh is intentionally reopened.`
