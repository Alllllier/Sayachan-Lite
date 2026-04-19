# Discussion Batch `discussion_batch_003`

- Topic: `Button noise and success-message consistency`
- Last updated: `2026-04-19`
- Status: `stable`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `mixed`
- Origin trigger: `real usage feedback`
- Source channel: `human discussion`
- Why now: `Recent real usage highlighted a broader UI noise problem that is no longer just about one surface. The current product still exposes too many always-visible low-frequency actions, and frontend success feedback is implemented through multiple patterns even though a toast path already exists.`
- Related sprint or closeout: `post-closeout product review after recent Notes micro-fixes`

## Why This Discussion Exists

- Several product surfaces still feel busier than they need to because low-frequency actions remain visible as first-class buttons instead of being tucked behind a quieter overflow path.
- Success feedback is currently implemented through more than one frontend pattern, which weakens product consistency and adds extra UI noise.
- This topic is broad enough to need PMO shaping before execution, but focused enough to stay as a single practical follow-up discussion rather than a large exploration batch.

## Theme Summary

### `theme-001`

- Summary: `Reduce persistent action noise by deciding which low-frequency buttons should collapse into an overflow menu and which actions must remain directly visible.`
- Why grouped: `The immediate problem is not a single bad button but an action-density pattern across multiple surfaces. The product needs a clearer rule for which actions deserve permanent visual priority.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `real usage showed that actions such as edit, archive, and delete are often always visible even when they are not the normal primary path, making the interface feel busier and more tool-like than necessary.`

### `theme-002`

- Summary: `Unify success feedback so frontend surfaces prefer the shared toast mechanism over mixed one-off success message patterns.`
- Why grouped: `Success messaging consistency affects both noise level and implementation coherence. A shared toast path may allow success feedback to feel lighter and more predictable, but PMO should still decide where persistent inline feedback remains justified.`
- Current focus: `no`
- Status: `clustered`
- For follow-up mode, the concrete issue exposed was: `real usage and implementation review showed that success messages are currently implemented in multiple ways even though a toast component already exists, suggesting that the frontend may be carrying unnecessary message-pattern fragmentation.`

## Possible Slices

### `slice-001`

- Name: `Action hierarchy and overflow policy`
- Why separate: `This slice now has a concrete first implementation shape: keep primary and assistance actions visible while moving low-frequency management actions into a consistent overflow pattern on the first three affected surfaces.`
- Current maturity: `candidate-likely`
- Likely target: `sprint_candidates`
- Parking trigger: `If PMO decides that a cross-surface action policy should be shaped first but implementation should wait until more surface inventory is gathered.`
- Reopen signal: `If current surfaces continue to accumulate visible low-frequency buttons without a stable hierarchy rule.`

### `slice-002`

- Name: `Success feedback consolidation`
- Why separate: `This slice is now clearly broader than one panel. Notes, Projects, and Dashboard all carry mixed success-feedback patterns even though the repo already has a shared toast primitive.`
- Current maturity: `candidate-likely`
- Likely target: `sprint_candidates`
- Parking trigger: `If action-density cleanup is clearly more urgent and message consistency can wait.`
- Reopen signal: `If success handling keeps diverging and frontend surfaces continue to ship one-off success indicators.`

## Open Questions

- Which action types should remain permanently visible as primary or safety-critical controls, and which should usually move behind a quieter overflow affordance?
- Should edit, archive, and delete be treated as a shared class of low-frequency actions across Notes, Projects, and Tasks, or does each surface need a different hierarchy?
- What should the default "more actions" pattern look like so it reduces noise without making basic management tasks feel hidden?
- Should success feedback default to the shared toast path whenever no persistent confirmation state is needed?
- In what contexts is an inline success message still better than a toast, and how should PMO distinguish those cases?

## Current PMO Judgment

- This is a legitimate `follow-up` discussion because it came from real product use and implementation review rather than open-ended ideation.
- The topic is broader than a one-line micro-fix because it likely spans multiple surfaces and requires a stable product rule for action hierarchy and success-feedback behavior.
- A first stable reading has already emerged: the current UI likely overexposes low-frequency management actions and carries unnecessary success-message variation.
- However, PMO should not jump straight into execution before deciding whether the next step is a cross-surface policy pass, a bounded audit, or a narrow first implementation slice.
- A more specific action-hierarchy judgment has now emerged from surface review: card-level UI should usually keep only the primary action plus lightweight state actions directly visible, while lower-frequency management actions such as `edit`, `archive`, and `delete` should default into a quieter overflow path unless a specific surface has a strong reason to expose them.
- Current surface reading suggests that this noise problem is especially visible in `ProjectsPanel.vue`, where primary task-capture controls, secondary management buttons, per-task focus controls, and AI-related actions can stack inside the same card.
- `NotesPanel.vue` shows the same pattern in a smaller form: `edit`, `archive`, and `delete` are all always visible even though they are not the normal read-path for a note card.
- A further stable hierarchy judgment has now emerged: `pin` and AI-trigger actions should currently be treated as direct visible actions rather than overflow actions, because they function more like first-class state or assistance controls than low-frequency management cleanup.
- Under that judgment, the near-term overflow candidate set is narrower: PMO should primarily evaluate `edit`, `archive`, and `delete`, while leaving `pin` and AI affordances visible by default.
- A concrete cross-surface layout judgment has now emerged for `Notes` and `Projects`: `edit`, `archive`, and `delete` should move together into a shared overflow path instead of being split into separate always-visible buttons.
- The preferred near-term placement is to keep `pin` and the AI action visible, then place a vertical-ellipsis `...` trigger immediately after the AI action so the secondary management actions live in a consistent trailing menu position on both card types.
- Under that judgment, PMO should treat `NotesPanel.vue` and `ProjectsPanel.vue` as the first implementation surfaces for the overflow pattern rather than trying to solve every surface at once.
- The overflow menu order should also stay consistent across both surfaces: `Edit -> Archive -> Delete`, with `Delete` remaining the trailing and visually strongest destructive action inside the menu rather than on the card face.
- An adjacent consistency issue has now been identified in `Dashboard.vue`: the saved-task list already uses a secondary-actions menu, but its trigger still uses a horizontal ellipsis style rather than the new preferred vertical `...` trigger language.
- Under that judgment, the dashboard task-list menu should be treated as part of the same near-term consistency pass so the product does not ship mixed overflow trigger styles across major surfaces.
- The `action hierarchy and overflow policy` slice is now close to promotion readiness because its near-term scope is bounded: `NotesPanel.vue`, `ProjectsPanel.vue`, and the saved-task overflow trigger in `Dashboard.vue`.
- Within that slice, the stable implementation rule is now clear enough to execute later: keep `pin` and AI visible; move `edit`, `archive`, and `delete` into a trailing vertical-ellipsis overflow path; keep menu order consistent as `Edit -> Archive -> Delete`; bring the dashboard saved-task menu trigger into the same visual language.
- A parallel success-feedback judgment has now emerged: success feedback should default to the shared toast path across the frontend rather than remaining split across inline one-off message patterns.
- Surface review shows that this is not just a `Notes` or `Projects` cleanup. `Dashboard.vue` still uses multiple local inline success states such as `quickAddSuccess`, `taskActionSuccess`, `reviewSuccess`, `focusSuccess`, `actionSuccess`, `draftsSuccess`, and `saveSuccess`, while `NotesPanel.vue` and `ProjectsPanel.vue` also keep local inline success fragments around AI-save and task-capture flows.
- Under that judgment, this topic should now be treated as a broader frontend consistency cleanup rather than a single-panel polish tweak.
- The current default rule should be: use toast for success feedback unless the product explicitly needs a persistent in-context confirmation state that would become unclear if it disappeared into a transient toast.
- A more concrete implementation judgment has now emerged: all currently known `NotesPanel.vue` and `ProjectsPanel.vue` inline success confirmations can move to toast without needing to preserve local inline message state.
- For `Dashboard.vue`, PMO now has a two-layer reading: the dashboard AI workflow area may still deserve a broader future structural redesign, but that does not block the near-term cleanup rule that toast should become the default success-feedback implementation there as well.
- Under that judgment, PMO should treat "switch current inline success handling to toast" as the immediate normalization step, while explicitly not treating the current toast migration as authorization for a larger dashboard AI workflow redesign.

## Promotion Outcome

- The bounded combined cleanup has now been promoted into `state/sprint_candidates.md` as `UI Noise Reduction And Toast Consolidation`.
- That candidate merges the previously separated action-overflow and success-feedback slices into one near-term consistency pass because both are now understood as the same UI noise-reduction effort.
- Keep this batch stable unless residual discussion appears that is not already captured by the new candidate or by future broader dashboard AI workflow redesign planning.
