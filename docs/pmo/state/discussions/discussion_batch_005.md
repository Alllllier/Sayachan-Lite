# Discussion Batch `discussion_batch_005`

- Topic: `Project task preview expansion and focus interaction redesign`
- Last updated: `2026-04-19`
- Status: `stable`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `mixed`
- Origin trigger: `real usage feedback`
- Source channel: `human discussion`
- Why now: `Current project cards still expose a very limited task preview and a separate Set as Focus control. Real usage suggests the preview should become more useful and interactive without turning the card into a heavy task-management surface.`
- Related sprint or closeout: `post-closeout follow-up after recent ProjectsPanel cleanup work`

## Why This Discussion Exists

- The current project-card task preview only shows the first three tasks, always truncates titles, and still relies on a dedicated `Set as Focus` button.
- The next desired iteration mixes layout, interaction, and runtime-focus behavior in one surface.
- This is not a micro-fix because it changes how project-card task previews behave and how focus is set from the preview itself.

## Theme Summary

### `theme-001`

- Summary: `Reshape the project-card task preview so it can expand beyond the current three-item preview while staying visually bounded in the collapsed state.`
- Why grouped: `The expand/collapse rule, title truncation rule, and task grouping rule all belong to the same preview-surface behavior.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `The current preview is too limited to be genuinely useful, but making it more useful risks turning the card into a dense mini task list unless the interaction rules are clear.`

### `theme-002`

- Summary: `Replace the explicit Set as Focus button with a more direct task-click interaction while preserving the task-based current-focus model.`
- Why grouped: `This is no longer just a visual cleanup. It changes how users set project focus from the preview and therefore needs an intentional product rule.`
- Current focus: `no`
- Status: `clustered`
- For follow-up mode, the concrete issue exposed was: `The dedicated Set as Focus control makes the preview busier, but replacing it with click-to-focus may conflict with expand/collapse and task readability unless PMO defines the interaction clearly.`

## Possible Slices

### `slice-001`

- Name: `Project task preview expansion and focus simplification`
- Why separate: `The layout, grouping, and focus-setting changes now form one bounded interaction slice on ProjectsPanel.vue rather than two separate planning problems.`
- Current maturity: `promoted`
- Likely target: `sprint_candidates`
- Parking trigger: `If future runtime review shows that preview grouping and focus-click interaction still need to split apart after implementation.`
- Reopen signal: `If project-card task previews still feel either too limited or too noisy after the promoted candidate is attempted.`

## Open Questions

- In collapsed state, should the project card always show exactly three tasks when available, or only up to three active tasks first?
- When expanded, should the card show all tasks inline, or only all active tasks by default with completed tasks behind a second toggle?
- What is the cleanest way to divide `active` and `completed` inside the expanded preview without making the card visually heavy?
- If task row click sets current focus, what interaction should expand/collapse the preview itself?
- What should the current-focus badge look like inside the preview so it reads as state, not as another button?

## Current PMO Judgment

- This topic is worth a bounded follow-up discussion before execution because it mixes preview-density rules with task-focus interaction rules.
- The desired direction is already narrow enough to stay on `ProjectsPanel.vue`, but not yet narrow enough to hand off cleanly.
- A first stable reading has already emerged:
  - collapsed state should stay compact and bounded
  - expanded state should become more informative
  - the explicit Set as Focus button is a likely noise source
- A more specific interaction reading has now emerged:
  - expand/collapse should belong to the `tasks-preview` container as a whole, not to an individual task row
  - task-row click can therefore be reserved for `set current focus`
- PMO now has a clearer preferred structure:
  - collapsed state shows a compact bounded preview
  - expanded state shows the fuller task surface
  - a single expand/collapse control should toggle between those two states, with the button label changing to reflect the current state rather than using separate open/close controls
- Another stable UI judgment has now emerged:
  - the `active/completed` switch inside the expanded preview should be one segmented-like control with one moving state, not two visually independent toggle buttons like the current active/archived surface switch used elsewhere in Notes/Projects
- Current likely direction:
  - collapsed state should show only active tasks
  - expanded state should default to the `active` group first and support a one-control switch between active and completed task groups
  - task rows should no longer carry a dedicated `Set as Focus` button
  - current focus should instead be indicated by a badge on the focused task row
  - the expand/collapse control should use one changing label rather than two separate controls, with the current preferred wording being `展开 / 收起`

## Promotion Outcome

- Promoted into `state/sprint_candidates.md` as `Project Task Preview Expansion And Focus Simplification`
- Keep this batch as stabilized context for the candidate rather than as an active discussion thread
