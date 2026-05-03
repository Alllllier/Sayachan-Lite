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

### `Removed Dashboard AI workflow is not active scope`

- Date: `2026-05-04`
- Type: `rejected`
- Scope: `Dashboard product runtime and PMO planning`
- Decision: `The old fallback-only Dashboard AI workflow, including Weekly Review, Focus Recommendation, Action Plan, Task Drafts, and the Dashboard AI Assistant block, is deprecated and should not be treated as active Dashboard scope or as a parked near-term sprint. Current Dashboard planning should use the saved-task surface and cockpit-signal bridge as the formal runtime surface.`
- Reason: `The old workflow has already been removed from the real frontend and baseline docs. Keeping it as an active backlog item made Dashboard review planning sound as if a parallel AI workflow still needed to be protected or redesigned soon.`
- Follow-up: `Only reopen Dashboard AI from a fresh product/AI discussion if the human explicitly asks for a new Dashboard AI concept. Do not revive the removed fallback workflow by default.`

### `UI review screenshots are review artifacts`

- Date: `2026-05-04`
- Type: `transition-rule`
- Scope: `PMO validation and UI review reporting`
- Decision: `Repo-native UI review screenshots should be treated as low-noise review artifacts, not golden snapshots or automated visual assertions. Stable committed screenshots may live under surface-local `frontend/tests/ui-review/<surface>/screenshots/` directories, while temporary debug screenshots should stay out of git. Closeout reports must distinguish browser validation, artifact capture, and actual inspected UI review.`
- Reason: `Notes and Projects now both have Playwright UI review paths that can generate screenshots. Without a durable rule, PMO closeouts could confuse a passing command or captured screenshot with actual visual inspection, and future surfaces could create inconsistent binary artifact churn.`
- Follow-up: `Use `docs/pmo/policies/testing-and-ui-review-guide.md` as the canonical reporting and artifact-retention rule. Reopen only if screenshot churn becomes noisy or future UI review surfaces need stronger artifact conventions.`

### `Shared task service uses API rules runtime split`

- Date: `2026-05-03`
- Type: `approved`
- Scope: `frontend shared services`
- Decision: Shared task behavior should live under `frontend/src/services/tasks/` as `task.api.js`, `task.rules.js`, and `task.runtime.js`. Feature code should import shared task behavior through the task package entrypoint, not through the removed legacy `taskService.js` path.
- Reason: Tasks are cross-feature shared state rather than a Notes, Projects, or Dashboard-owned feature. Splitting the service by responsibility keeps future project-note mounting work from coupling module UI code to task HTTP and cockpit snapshot internals.
- Follow-up: Do not restore implementation or compatibility exports into `taskService.js`; add future shared task capabilities under `frontend/src/services/tasks/`.

### `Frontend feature code lives under feature modules`

- Date: `2026-05-03`
- Type: `approved`
- Scope: `frontend architecture`
- Decision: `Module-level API boundaries, pure rules, and stateful orchestration composables should live under `frontend/src/features/{module}/`. Page components should stay route shells, while visual components should keep rendering, DOM refs, and local UI affordances. Shared services should be reserved for cross-feature or app-level runtime concerns.`
- Reason: `discussion_batch_014 migrated Projects, Notes, Dashboard, and Chat into feature-layer homes, removed component-adjacent behavior helpers, and clarified that task runtime and cockpit context hydration are shared services rather than module UI logic.`
- Follow-up: `Use this as the default placement rule for future BJD/optional modules, taskService splitting, cockpit context runtime work, and any new feature extraction.`

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

### `AI reveal list cleanup is deferred until AI core ownership is clearer`

- Date: `2026-04-24`
- Type: `deferred`
- Scope: `discussion_batch_012 display-list follow-on for NotesPanel ai-task-item and ProjectsPanel ai-suggestion-item`
- Decision: `Do not promote the previously expected display-list pass-3 for `ai-task-item` and `ai-suggestion-item` as near-term UI cleanup. Park those surfaces until future AI core and product-runtime ownership is clearer.`
- Reason: `Projects task preview and Dashboard saved tasks already validated the shared display-list anchors. The AI reveal/list surfaces are likely to be substantially reshaped by future AI core integration, so normalizing them now risks polishing interim UI that may be replaced rather than reused.`
- Follow-up: `Use the landed list primitives as reference only when AI/list convergence reopens from a concrete AI core integration need or a blocking UI cleanup surface.`
