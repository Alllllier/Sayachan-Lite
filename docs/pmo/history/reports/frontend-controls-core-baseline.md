# Execution Report

- Status: `completed and archived`
- Sprint: `Frontend Controls Core Baseline`
- Last updated: `2026-04-22`

## What Changed

- Added a thin controls-core token layer in `frontend/src/style.css` for first-pass button hierarchy and segmented controls.
- Reworked the shared button baseline so `Primary`, `Secondary`, `Ghost / Tertiary`, `Danger`, `Archive`, and `AI / Intent` read from one control grammar instead of panel-local color decisions.
- Added `frontend/src/components/ui/SegmentedControl.vue` as the shared segmented shell for `page`, `mode`, and `inline` variants.
- Moved the in-scope Notes and Projects surfaces onto the shared segmented-control baseline and updated their direct / overflow button usage to the new hierarchy.

## Review Correction

- Narrow follow-up correction restored `.btn-primary` to functional primary semantics using `--action-primary / --action-primary-hover` so `Primary` does not collapse back into the identity / AI color lane.
- Narrow follow-up correction removed the added `AI Tasks` / `AI Suggest` button text in Notes and Projects so the AI / Intent entry remains icon-first for this first pass.
- Narrow execution-loop polish correction changed only the `page` segmented-control active state to functional green so the top-level `Active / Archived` switch reads more clearly as a view switch; `inline` and `mode` variants were intentionally left unchanged.
- Final controls polish settled the AI / Intent button baseline into a round, icon-first, shadow-led pattern rather than a pill with border emphasis.
- These corrections were review/polish realignments rather than scope expansion because they only brought the landed controls-core baseline back into the already approved sprint judgments.

## Controls / Surfaces Brought Under The New Baseline

- `page` segmented control:
  - Notes `Active / Archived`
  - Projects `Active / Archived`
- `inline` segmented control:
  - Project task preview `Active / Completed`
- `mode` segmented control:
  - Project task capture `Single / Batch`
- Button hierarchy adoption:
  - `Primary`: create/save/add-task/save-task actions that were already the strongest direct action
  - `Secondary`: `Cancel`, `Restore`, `Edit`, `Save as Task`, and other reversible/supporting actions
  - `Ghost / Tertiary`: project preview `展开 / 收起`
  - `Danger`: direct delete actions and overflow delete items
  - `AI / Intent`: note/project AI entry buttons now use a shared icon-first intent style
- Overflow secondary rule:
  - note/project overflow triggers now use the shared overflow button treatment
  - note/project overflow menu items now use the shared menu-item hierarchy instead of local one-off styling

## Validation

- Ran `npm test` in `frontend/`
- Ran `npm run build` in `frontend/`

## Failures

- No test failures.
- No build failures.
- `vite build` emitted the existing chunk-size warning only; this does not indicate a regression from this controls-core slice.

## Intentionally Deferred To `action grouping` Follow-On

- No `ActionRow / ObjectActionArea` regrouping work was done.
- No broader icon-button or menu-trigger systemization beyond the thin overflow rule needed for this baseline.
- No reveal-pattern redesign beyond bringing the existing `展开 / 收起` behavior under the shared ghost/tertiary button treatment.
- No dashboard AI workflow redesign, input/textarea cleanup, or broad legacy control cleanup.

## Closeout Judgment

- Accepted on `2026-04-22`.
- The first-pass controls-core baseline is now genuinely landed in code rather than remaining discussion-only.
- The next natural follow-on inside `discussion_batch_011` remains:
  - `action grouping`
  - then later `Secondary Controls And Reveal`
  - then later `Input State Cleanup`
