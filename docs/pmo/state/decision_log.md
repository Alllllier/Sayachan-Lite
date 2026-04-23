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

### `Archive is orthogonal to lifecycle status across task, project, and note`

- Date: `2026-04-20`
- Type: `approved`
- Scope: `Task, project, and note model semantics plus future parent-child/reference planning`
- Decision: `Archive should be treated as a separate dimension rather than as one more lifecycle status value. Task lifecycle should move toward \`active | completed\`; project status should express progress only; note should follow the same archive-separation rule even if its lifecycle remains simple for now. Container archive behavior must not overwrite the object's own lifecycle semantics.`
- Reason: `Project archive/restore exposed that mixing lifecycle meaning and archive meaning inside one status field causes semantics loss, especially when restoring completed tasks. The same ambiguity would likely recur as soon as project-subproject, project-note, or note-note relationships become real.`
- Follow-up: `Use this rule as the design boundary for shaping the next execution slice. The immediate implementation candidate is a task/project/note archive-model alignment pass, while any legacy-data compatibility should stay minimal and development-stage appropriate.`

### `Display-list disclosure may mount on the primary ListSection`

- Date: `2026-04-23`
- Type: `transition-rule`
- Scope: `Frontend display-list baseline shaping after the first Projects task-preview implementation`
- Decision: `Display-list disclosure should not be treated as universally list-level by rule. When a surface is organized around one main readable section plus one or more secondary sections, the primary `ListSection` may own the effective `preview / expanded` control and corresponding disclosure state.`
- Reason: `Real implementation and human review on the Projects task preview showed that outer-list disclosure made the list shell feel artificially empty and blurred the difference between the main task reading surface and the secondary archived section. Section-mounted disclosure matched the product semantics more cleanly and required independent expand state to avoid unrelated sections opening together.`
- Follow-up: `Use this rule when shaping the later Dashboard pass and any future list-baseline follow-ons. Keep `discussion_batch_012.md` as the living discussion home for how far this rule should generalize beyond the current validated Projects surface.`
