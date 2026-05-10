# CardCollection Command Slot And Notes Capture Modal

- Archived date: `2026-05-10`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_019.md`
- Why it mattered: The Notes creation-entry discussion has stabilized around a collection-first layout: keep browsing and capture mentally separate, avoid forcing users back to the top of the page, avoid stacking page-local creation into the global chat/module hover area, and let the Notes collection header own the new-note command. The current legacy new-note form also mounts CodeMirror during page load, so this is a natural chance to move note editing into an on-demand capture surface.
- Expected outcome: Notes becomes a collection-first surface with a sticky CardCollection command header. CardCollection gains a left-side command slot after the title while right-side controls remain dedicated to view/filter controls. New note creation opens in a focused popup/modal-style capture surface that preserves the user's current browsing position and mounts the editor only when needed.
- In scope:
  `Extend CardCollection.vue with a command slot beside the title; update Notes so the visible page-level title can be removed or de-emphasized in favor of the collection header; make the Notes CardCollection header sticky if the implementation can do so cleanly; move new-note creation out of the legacy inline form into a popup/modal or responsive bottom-sheet-style capture surface; preserve active/archived segmented control as the right-side collection control; lazy-mount the new-note CodeMirror editor inside the capture surface; add or update focused frontend tests and UI review coverage for the new interaction.`
- Out of scope:
  `Global right-side hover rail redesign; future optional module launcher; Chat hover behavior; Projects top-level creation redesign unless a tiny compatibility adjustment is needed for shared CardCollection API; Dashboard quick add; AI reveal/list cleanup; Format note; broader list-density or full visual refresh work.`
- Dependencies: Existing CardCollection shell baseline, Notes feature/composable behavior, CodeMirror editor integration, current UI review conventions for Notes.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run the repo-native frontend validation relevant to this slice, including Notes behavior tests and a Notes UI review path. Browser/UI review should inspect desktop and mobile states: sticky header layout, command slot placement, capture open/close, successful create, cancel without losing scroll position, active/archived control preservation, and absence of collision with the global Chat hover button.`
- Escalation triggers:
  `Stop for human/PMO review if sticky CardCollection behavior requires broad shell/layout changes, if the modal/bottom-sheet pattern conflicts with current design baselines, if CodeMirror lazy mounting requires bundle-level restructuring beyond the Notes surface, or if mobile layout cannot preserve both capture access and global Chat affordance clearly.`
- Follow-up parking:
  `Keep Projects creation-entry redesign parked until Notes proves the collection command pattern. Keep broader Creation And List-Surface Interaction Consistency parked for later list-density, Projects, Dashboard, AI reveal/list, and Format note follow-ups.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
