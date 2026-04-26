# Frontend Display-List Baseline Pass 2: Dashboard Saved Tasks

- Archived from: `docs/pmo/state/sprint_candidates.md`
- Archive date: `2026-04-26`
- Final status: `completed`
- Source reference: `state/discussions/discussion_batch_012.md pass-2`

## Candidate Record

- Why now: `The Projects task preview pass has validated the first shared display-list primitive layer in real code. Dashboard saved tasks are now the right second anchor surface because they expose the harder responsibility split that the list grammar was designed to clarify: row primary click, preview/expanded disclosure, provenance metadata, and trailing secondary actions are currently mixed across local Dashboard markup and checkbox behavior.`
- Expected outcome: `Dashboard saved tasks migrate onto the shared List / ListSection / ListItem / ItemContent / ItemMeta frame, removing the local saved-task list/item shell as the governing structure. Row primary click becomes the active-view complete/reactivate action, item-level expand is removed in favor of list or section preview/expanded mode, provenance stays in row metadata, and archive/delete/restore remain trailing secondary actions without forcing a full ItemTrailingMenu component yet.`
- Risk level: `medium`
- Readiness: `ready`
- Start condition: `Satisfied on 2026-04-24 by human agreement that the Dashboard saved-task plan is complete enough to promote to candidate status.`

## Closeout

Completed on 2026-04-24. Dashboard saved tasks now use the shared display-list frame, active row primary click owns complete/reactivate, the checkbox and item-level expansion path were removed, provenance and trailing archive/delete/restore actions remain intact, and follow-up polish aligned the section with shared card/title and action-accent list treatment. Validation passed through frontend npm test and npm run build, with only the existing Vite large-chunk warning.

## Archive Reason

Archived to make room for `Dashboard Saved-Task Behavior Guardrails`, which builds on this completed display-list pass by protecting the now-current saved-task behavior rules.

