# Collection Page Flush Layout Baseline

- Archived date: `2026-05-10`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `discussion: Notes/Projects creation and list-surface consistency follow-up`; `docs/pmo/history/reports/shared-collection-capture-surface.md`
- Why it mattered: Notes and Projects now both use `CardCollection` as the page's primary interaction surface. The remaining outer section/panel padding compresses the main viewport and forces sticky collection headers to compensate with negative margins, which makes the layout baseline harder to reuse for future module/list pages.
- Expected outcome: Notes and Projects use an explicit flush collection-page layout where the outer page shell no longer adds redundant inner padding, and `CardCollection` owns the visible collection spacing/header behavior without negative-margin compensation.
- In scope:
  Add or use a small explicit flush/no-padding mode on the existing page shell component; migrate Notes and Projects pages/panels to that mode; remove Notes/Projects collection-header negative margin hacks if no longer needed; preserve the existing `CardCollection` command/control layout, shared capture surface, create flows, and list/card behavior; refresh focused Notes/Projects UI review screenshots if spacing changes.
- Out of scope:
  Global removal of `Panel` padding for every page; redesigning card/list visuals; changing global hover icon behavior; changing capture modal/bottom-sheet behavior; extracting a broader layout framework; backend/API changes.
- Dependencies: Closed `Shared Collection Capture Surface`; current `Panel`, `CardCollection`, Notes, and Projects page/panel structure.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  Run frontend typecheck/lint/build and focused Notes/Projects UI review. Verify desktop and mobile Notes/Projects layouts keep the collection header readable, preserve create commands and segmented controls, avoid compressed viewport/padding duplication, and do not introduce overlapping with global hover surfaces.
- Escalation triggers:
  Stop for PMO/human review if the change requires a global `Panel` behavior change across unrelated pages, if sticky header behavior becomes inconsistent between Notes and Projects, or if removing padding exposes a broader app-shell spacing problem.
- Follow-up parking:
  Future module list pages can adopt the same flush collection-page baseline after this is proven. Broader app-shell/layout cleanup remains separate.
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
