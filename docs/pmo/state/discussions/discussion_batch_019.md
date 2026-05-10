# Discussion Batch `discussion_batch_019`

- Topic: `Notes and Projects creation entry redesign`
- Last updated: `2026-05-10`
- Status: `stable`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `feature`
- Origin trigger: `backlog reopen`
- Source channel: `human discussion`
- Why now: `The human wants to discuss Notes and Projects creation entry points before shaping or activating any sprint. The broader backlog item Creation And List-Surface Interaction Consistency is still parked, but this narrower creation-entry topic is concrete enough to reopen as its own product discussion.`
- Related sprint or closeout: `Frontend shell/module baseline work preserved Notes and Projects creation forms as local legacy wrappers; idea_backlog item Creation And List-Surface Interaction Consistency tracks the broader future pass.`

## Why This Discussion Exists

- Notes and Projects still expose creation through local legacy form wrappers rather than through the more recent panel, object collection, and object action grammar.
- Notes currently mounts the CodeMirror editor for the new-note form during page load, while a future click-to-create or click-to-edit lifecycle could mount the editor only when needed.
- Projects already has a stronger interaction reference inside project cards through `ObjectActionArea` task capture, but top-level project creation still lives in a separate legacy form.
- The human likes the hover-icon creation feel because it separates browsing from capture: a user can record a current thought without interrupting the current scroll position or being forced back to the top of the page.
- The discussion should decide the product interaction rule before PMO promotes a bounded implementation slice.

## Theme Summary

### `theme-001`

- Summary: `Define the first coherent creation-entry rule for Notes and Projects without pulling in the full cross-surface list consistency backlog.`
- Why grouped: `Notes and Projects both create first-class user-authored objects from high-frequency panel surfaces, but their current entry placement, visibility, and editor lifecycle are still shaped by older local forms.`
- Current focus: `no`
- Status: `stable`
- For follow-up mode, the concrete issue exposed was: `The human wants to talk specifically about Notes and Projects creation entry points before deciding whether this becomes a sprint candidate.`

### `theme-002`

- Summary: `Notes may want a collection-first page layout where the CardCollection header becomes the sticky command surface for title, archive switch, and creation entry.`
- Why grouped: `Changing the creation entry is likely to change the surrounding layout: the current page-level Panel header may become redundant if Notes is effectively one browsable collection whose own header owns the visible command row.`
- Current focus: `no`
- Status: `completed`
- For follow-up mode, the concrete issue exposed was: `The human proposed removing the visible Notes panel header, leaving the panel body as a single CardCollection, and making the CardCollection header sticky with title text, active/archived segmented control, and new-note entry.`
- Emerging component requirement: `CardCollection may need a baseline command slot that sits beside the title on the left side of the header, while the existing control slot remains right-aligned. For Notes, this command slot could hold a compact + icon for new-note capture.`
- Emerging creation-surface preference: `Opening the new-note editor as a popup/modal-style surface may better preserve the user's current browsing position than expanding a form inline inside the list.`

## Possible Slices

### `slice-001`

- Name: `Notes and Projects Creation Entry Consistency V1`
- Why separate: `This slice could unify only the top-level creation entry behavior for Notes and Projects, leaving broader list-density, Dashboard quick add, AI reveal lists, and Format note affordances out of the first implementation pass. If Notes adopts a collection-first layout, this slice may also include the minimum shell adjustment needed to move Notes commands into a sticky CardCollection header.`
- Current maturity: `split / partially promoted`
- Likely target: `sprint_candidates | idea_backlog`
- Parking trigger: `Park if the desired interaction model remains unclear or if a broader product surface takes priority before this creation-entry friction becomes blocking.`
- Reopen signal: `Human selects the preferred creation-entry direction, repeated usage makes the legacy forms feel heavy, or adjacent Notes/Projects UI work touches the same area.`
- Promotion note: `The Notes side of this slice was narrowed and promoted as CardCollection Command Slot And Notes Capture Modal. Later follow-up sprints completed Projects alignment, shared capture extraction, and embedded collection layout.`

### `slice-002`

- Name: `Notes Editor Lazy Mount Boundary`
- Why separate: `If Notes moves to click-to-create or click-to-edit, CodeMirror can become an on-demand editing surface rather than route-load weight. This may be implementation-coupled with Notes creation entry, but it has a distinct performance and lifecycle boundary.`
- Current maturity: `emerging`
- Likely target: `sprint_candidates | idea_backlog`
- Parking trigger: `Park if the creation-entry redesign keeps an always-visible editor or if bundle/performance work is deferred until a broader frontend bundle review.`
- Reopen signal: `Notes creation/editing interaction is selected, build output keeps surfacing editor-related weight, or the human wants a focused CodeMirror lifecycle pass.`

## Open Questions

- Should Notes and Projects use the same visible creation-entry pattern, or should Notes have an editor-specific flow while Projects stays closer to a compact object form?
- Should creation begin from the object collection header, a hover icon, a persistent compact button, or an inline reveal at the top of the collection?
- If Notes uses a hover icon, should that icon be page-scoped to the Notes panel/collection or join a future global right-side hover rail with chat and optional module entry?
- If optional modules later enter through a global hover icon, should chat, module launcher, and page-local creation actions stack together, or should global actions and contextual page actions remain visually separated?
- On mobile, where the global right-side hover area visually overlaps the active panel region, should contextual creation avoid floating on the same edge entirely and instead collapse into a collection-header action, bottom-sheet trigger, or inline reveal?
- Should Notes remove its visible page-level Panel header and let the CardCollection header become the only visible command header for the page?
- If CardCollection header becomes sticky, should that sticky behavior be a reusable shell option or a Notes-specific local behavior first?
- Should CardCollection add a reusable command slot between title and right-side controls so collection-owned actions can live next to the title?
- Should the new-note capture surface open as a modal/popup/bottom sheet rather than inline reveal, so browsing position stays intact?
- Should Projects follow the same collection-first header model immediately, or should Notes prove the pattern first because its creation/editor lifecycle has the stronger pressure?
- Should the creation surface appear above the object list, below it, or as a temporary inline panel owned by the collection header?
- Should Notes creation and Notes editing share the same CodeMirror lifecycle and visual treatment?
- Should Projects creation mirror the existing project-card task capture grammar, or should top-level object creation use a distinct panel-level pattern?
- Should creation entry visibility optimize for low visual noise, fast repeated capture, or discoverability for new users?
- How can the UI preserve the human-preferred hover-icon mental model on mobile without mixing page-local creation with the global chat/module hover area?
- What should happen when a creation draft exists and the user switches active/archived views or navigates away?
- Should Dashboard quick add remain only a reference sample for now, or should it become part of a later broader creation-entry consistency pass?
- Should `Format note` remain a separate Notes edit affordance follow-up rather than joining this first creation-entry discussion?
- What validation or UI review would prove the new creation-entry flow feels better rather than merely different?

## Current PMO Judgment

- This discussion has stabilized enough to promote a narrow Notes-first candidate.
- The broader `Creation And List-Surface Interaction Consistency` backlog item should remain parked because Projects creation, Dashboard quick add, list-density behavior, AI reveal/list cleanup, and Format note are not covered by the promoted slice.
- Dashboard quick add, AI reveal/list cleanup, Format note, and full list-density redesign should be treated as adjacent references rather than first-pass scope.
- The promoted candidate should be Notes-first rather than Notes/Projects combined: `CardCollection Command Slot And Notes Capture Modal`.
- Human design pressure on 2026-05-09: a Notes hover icon may collide with the existing global chat hover icon, and future optional module entry may also become a global hover icon. PMO should treat this as a hierarchy question: global companion/module actions and page-local creation actions may need separate visual ownership rather than simply stacking all three icons on the right edge.
- Mobile constraint added on 2026-05-09: even if global and contextual hover icons are visually separable on desktop, the global right-side hover area can appear inside the Notes panel on narrow screens. PMO should not assume a desktop right-edge hover solution transfers to mobile; mobile may need a different contextual creation pattern.
- Human product preference added on 2026-05-09: preserve the hover-icon capture feeling if possible, because it creates a clean mental split between browsing existing objects and capturing a new thought without scroll interruption. PMO should look for a responsive pattern that keeps this capture affordance while avoiding right-edge collision on mobile.
- Emerging layout direction on 2026-05-09: Notes creation-entry redesign may be better framed as a collection-first page redesign. The current page-level `Panel` title can become redundant if the `CardCollection` header owns the page title, active/archived segmented control, and new-note entry as a sticky command bar.
- Emerging component direction on 2026-05-09: extend `CardCollection` with a left-side command slot after the title and keep `control` as the right-side area. This keeps collection-owned actions visually attached to the collection title without overloading archive/view controls.
- Emerging interaction direction on 2026-05-09: prefer a popup/modal-style new-note capture surface over an inline form if it preserves scroll position, supports focused drafting, and does not visually fight the global chat/module hover area.

## Promotion Outcome

- Initially promoted to `docs/pmo/state/sprint_candidates.md` as `CardCollection Command Slot And Notes Capture Modal`.
- The original Notes-first promotion was followed by three bounded follow-up sprints:
  - `Projects Collection Command And Capture Alignment`
  - `Shared Collection Capture Surface`
  - `Collection Page Flush Layout Baseline`

## Completion Update

- Status on `2026-05-10`: `completed as scoped`
- Notes now use a collection-owned `+ New` command, shared capture surface, lazy CodeMirror loading for create/edit, and embedded collection layout.
- Projects now use the same collection-owned `+ New` command, shared capture surface, and embedded collection layout while keeping project-specific fields and validation local.
- `CardCollection` now supports the required command slot and explicit embedded mode.
- `CollectionCaptureSurface` now owns the shared overlay/modal/bottom-sheet shell while feature state and business logic remain local.
- The original right-edge hover-icon idea is resolved for this slice by choosing collection-header ownership instead of adding another global/right-side floating action.
- Residual broader work remains outside discussion 19: Dashboard quick add, AI reveal/list cleanup, Format note, task-list density/visibility, and any future global chat/module hover rail rules.
