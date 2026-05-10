# Projects Collection Command And Capture Alignment

- Archived date: `2026-05-10`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_019.md`; `docs/pmo/state/idea_backlog.md#creation-and-list-surface-interaction-consistency`; prior sprint `docs/pmo/history/reports/cardcollection-command-slot-and-notes-capture-modal.md`
- Why it mattered: The Notes collection command and capture-modal sprint proved the CardCollection command-slot pattern and removed the most visible legacy creation wrapper from Notes. Projects still has a top-level legacy `.project-form` after the collection, so the two primary object surfaces now feel uneven: Notes creation is collection-owned and non-disruptive, while Projects creation remains a separate always-visible form.
- Expected outcome: Projects aligns with the new collection-first creation pattern: the Projects CardCollection header owns a visible `+ New` or equivalent project creation command beside the title, the active/archived segmented control stays in the right-side control slot, and new-project creation opens in a focused capture modal or responsive bottom-sheet-style surface instead of an always-visible legacy form.
- In scope:
  Move Projects top-level new-project creation out of the legacy `.project-form` into a collection-owned capture surface; use the existing CardCollection command slot rather than adding new shell APIs; preserve Projects active/archived control as the right-side collection control; preserve current project create validation and status selection; preserve existing project card editing, task preview, task capture, AI suggestion, archive/restore, and focus behavior; update focused Projects tests and UI review artifacts as needed.
- Out of scope:
  `Project-card task capture redesign; project task preview/list density changes; AI suggestion reveal/list cleanup; Dashboard quick add; Notes follow-up changes; global Chat or module hover rail; broader visual refresh; backend/API behavior changes unless an existing frontend test mock needs a narrow update.`
- Dependencies: Closed Notes command-slot sprint, existing CardCollection command slot, Projects feature/composable behavior, Projects UI review conventions.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run targeted Projects/frontend tests and a Projects UI review path. Browser/UI review should inspect desktop and mobile states: collection header title/command/control placement, create capture open/cancel/save/validation, active/archived control preservation, no collision with global Chat hover button, and no regressions to project-card edit, task capture, task preview, archive/restore, and AI suggestion affordances covered by existing review. Run frontend typecheck/lint/build when touched files or repo norms require it.`
- Escalation triggers:
  `Stop for PMO/human review if Projects creation cannot fit the Notes-proven capture pattern without redesigning project-card internals, if status selection becomes too heavy for a quick capture surface, if mobile layout conflicts with global Chat or bottom nav, or if implementation wants to generalize a new shared modal/capture framework beyond Projects/Notes.`
- Follow-up parking:
  `Keep broader Creation And List-Surface Interaction Consistency parked for task-list density, Dashboard quick add, AI reveal/list cleanup, Format note, and future cross-surface consistency work.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
