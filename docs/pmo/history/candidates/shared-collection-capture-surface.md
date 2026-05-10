# Shared Collection Capture Surface

- Archived date: `2026-05-10`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/cardcollection-command-slot-and-notes-capture-modal.md`; `docs/pmo/history/reports/projects-collection-command-and-capture-alignment.md`
- Why it mattered: Notes and Projects now both use the same product interaction shape: a collection-owned `+ New` command that opens a desktop modal or mobile bottom-sheet-style capture surface. The pattern has been validated twice, so the duplicated overlay/header/sheet styling can be extracted without guessing at the interaction model.
- Expected outcome: Notes and Projects share a thin capture surface shell for overlay, desktop modal, mobile bottom sheet, header/title/close affordance, and body/actions slots while keeping each surface's form state, validation, submit behavior, editor loading, and business logic local.
- In scope:
  Create a small shared frontend UI shell/component for the capture surface; migrate Notes and Projects capture markup/styles onto it; preserve each feature's existing form fields, validation, submit/cancel semantics, CodeMirror lazy-loading, status selection, and toasts; keep the existing CardCollection command slot unchanged; update focused Notes and Projects UI review/tests/screenshots as needed.
- Out of scope:
  `Extracting form state, validation, submit handlers, CodeMirror loader, project status logic, note editor logic, or task/project/note business behavior; adding a broad modal framework; changing global Chat/module hover behavior; changing Dashboard quick add; redesigning visual language beyond removing duplication.`
- Dependencies: Closed Notes and Projects capture alignment sprints; current CardCollection command slot; current Notes and Projects UI review paths.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run focused Notes and Projects UI review paths plus frontend typecheck/lint/build. Also run targeted Notes/Projects tests when the migrated component touches interaction wiring. Review desktop and mobile capture open/cancel/save/validation states for both surfaces and confirm Notes CodeMirror lazy-loading remains intact.`
- Escalation triggers:
  `Stop for PMO/human review if the extraction starts pulling in feature state or validation logic, if a generic modal framework becomes tempting, if Notes CodeMirror lazy-loading regresses, or if the shared shell cannot support both surfaces without surface-specific hacks.`
- Follow-up parking:
  `If the shared shell proves useful, future surfaces can adopt it later. Broader creation/list consistency, Dashboard quick add, AI reveal/list cleanup, and Format note remain parked.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
