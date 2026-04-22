# Frontend Action Grouping Baseline

- Date: `2026-04-22`
- Sprint: `Frontend Action Grouping Baseline`
- Status: `completed`

## Goal

Land the first-pass action-grouping baseline through:
- `ActionRow`
- `ObjectActionArea`

without reopening the already landed controls-core baseline or widening into broader reveal/menu/input cleanup.

## What Changed

- Added a reusable `ActionRow` shell as a thin grouped-action container.
- Added a reusable `ObjectActionArea` shell with shared:
  - `idle`
  - `active`
  - `pending`
  state handling.
- Applied the new grouping baseline to current high-frequency action surfaces in `Notes` and `Projects`.
- Restored the preferred `Add Task` behavior direction:
  - resting main button
  - in-place replacement with `Cancel`
  - directly attached revealed capture block below
- Brought current note/project AI object actions under the same general `ObjectActionArea` family.
- Settled the AI object-action entry into a stable three-state baseline:
  - `idle` remains icon-first
  - `active` uses an SVG `x` close/cancel form
  - `pending` stays visually continuous with `idle`

## Surfaces Brought Under The Baseline

- Note/project form submit rows
- Note/project edit rows
- Archived note/project restore-delete rows
- Project `Add Task` object-action area
- Note/project AI object-action entries

## Follow-On Polish Accepted In The Same Execution Window

- AI pending state now keeps the AI visual family instead of falling back to a generic disabled look.
- `mode` segmented-control active state now uses the functional primary green instead of the identity color.
- `mode` shell now uses a lighter, shadow-led treatment:
  - medium weight text
  - no hard outer border
  - whiter shell background to preserve shadow readability
- Dashboard now uses the shared `page` segmented-control variant for its archived toggle.
- Archived-note rows no longer show a redundant `Archived` badge.

## Validation

- `frontend/npm test`
  - passed
- `frontend/npm run build`
  - passed

## Scope Notes

- The sprint stayed inside the intended action-grouping scope.
- It did not reopen:
  - button-hierarchy redesign
  - segmented-control redesign
  - full icon/menu systemization
  - broader reveal-pattern formalization
  - input-state cleanup
  - dashboard AI workflow redesign

## Outcome

- `ActionRow` is now formalized as a thin, right-aligned grouped-action container.
- `ObjectActionArea` is now formalized as the object-level entry grammar for:
  - resting main action
  - in-place cancel replacement
  - optional pending state
  - directly attached revealed block
- The next natural frontend controls follow-on remains:
  - deeper legacy cleanup and secondary-controls/reveal work still tracked in `discussion_batch_011`
