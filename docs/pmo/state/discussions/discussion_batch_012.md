# Discussion Batch `discussion_batch_012`

- Topic: `Frontend display-list baseline and list grammar`
- Last updated: `2026-04-23`
- Status: `active`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `architecture`
- Origin trigger: `split-out from active frontend legacy cleanup after PMO judged that repeated list/item residue across Notes, Projects, and Dashboard reveals a missing shared display-list baseline rather than isolated local cleanup only`
- Source channel: `human discussion`
- Why now: `Recent legacy audits on NotesPanel and ProjectsPanel showed that the project already has shared shell/action primitives, but still lacks a stable shared language for display lists, list items, grouped preview sections, and row-level states. Human judgment is that this has now grown beyond small residue cleanup and deserves its own PMO discussion container.`
- Related sprint or closeout: `Frontend style baseline refactor follow-up; NotesPanel legacy audit; ProjectsPanel legacy audit`

## Source Trace

- Parent batch: `state/discussions/discussion_batch_011.md`
- Why split out: `The open question is no longer just whether a few local list-like residues should be cleaned. PMO now judges that the repo likely lacks a whole shared display-list layer. Keeping that larger grammar question inside discussion_batch_011 would blur panel/shell cleanup, control cleanup, and a distinct missing reusable-component topic.`

## Why This Discussion Exists

- The repo already has meaningful shared primitives for:
  - `Card`
  - `SectionBlock`
  - `DirectiveBlock`
  - `ActionRow`
  - `ObjectActionArea`
  - `SegmentedControl`
  - `EmptyState`
  - `Toast`
- But repeated review of `NotesPanel`, `ProjectsPanel`, and `Dashboard` now suggests that a different layer is still missing:
  - display-list container language
  - display-row / list-item language
  - grouped list section language
  - row-level presentation states such as:
    - `completed`
    - `archived`
    - `focus/current`
    - `clickable`
    - `compact preview`
- Without that layer, multiple surfaces keep inventing local item/list grammar:
  - `ai-task-item`
  - `ai-suggestion-item`
  - `task-preview-item`
  - `mini-item`
  - `draft-item`
  - dashboard saved-task rows
- PMO therefore needs a dedicated discussion container to decide:
  - whether a real shared list baseline is missing
  - how narrow or broad the first pass should be
  - which local surfaces are true design assets versus symptoms of the missing list layer

## Theme Summary

### `theme-001`

- Summary: `Define whether the frontend needs a shared display-list baseline, and if so, what the first-pass scope should include without collapsing workflow-specific local grammar.`
- Why grouped: `Notes, Projects, and Dashboard are all exposing the same structural gap, but they do so through different local surfaces. The topic is broader than any one panel and narrower than a full new design-system rewrite.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `legacy cleanup repeatedly encounters list/item-style local CSS that cannot be confidently deleted or normalized because the repo still lacks a shared display-list primitive layer.`

## Possible Slices

### `slice-001`

- Name: `Display list container and row baseline`
- Why separate: `The smallest credible first pass may only need a shared list container plus a display-row/item primitive rather than a broader list-state system.`
- Current maturity: `completed`
- Likely target: `sprint_candidates`
- Parking trigger: `If PMO concludes that row-level convergence is still too mixed across surfaces and should wait until more panel language is stabilized.`
- Reopen signal: `If discussion converges on one narrow list-row grammar that can absorb Dashboard mini-items plus some Note/Project reveal items without disturbing workflow-specific interactions.`

### `slice-002`

- Name: `Grouped preview section language`
- Why separate: `Projects task preview and similar grouped preview surfaces may justify a shared list-section/grouping layer beyond the base row primitive.`
- Current maturity: `emerging`
- Likely target: `idea_backlog or sprint_candidates`
- Parking trigger: `If PMO judges that grouped preview grammar is still too tightly coupled to project workflow specifics for a first shared baseline pass.`
- Reopen signal: `If discussion stabilizes a narrow section/group pattern usable across task preview, archived subsections, and other grouped display surfaces.`

### `slice-003`

- Name: `Row-level display states`
- Why separate: `The repo may eventually need a coherent display-only state language for rows/items such as completed, archived, current-focus, clickable, and compact, but that may be broader than the first list pass.`
- Current maturity: `emerging`
- Likely target: `idea_backlog`
- Parking trigger: `If PMO decides the first list baseline should stay structural and defer state language.`
- Reopen signal: `If repeated cleanup work shows that missing row-state grammar is now blocking multiple surfaces, not just one local panel.`

## Open Questions

- Is the missing layer best described as:
  - `display list`
  - `list row`
  - `preview row`
  - or a more general `itemized display grammar`?
- What is the narrowest useful first pass:
  - container only
  - row/item only
  - container + row
  - or container + row + grouped section?
- Which current surfaces should act as primary reference samples:
  - Dashboard `mini-item`
  - Projects `task-preview-item`
  - Notes/Projects AI reveal items
  - some combination of the above?
- Which local surfaces should remain explicitly out of scope because they are workflow grammar rather than generic display-list grammar?
- Should the first pass define only structure and spacing, or also some display-only row states such as:
  - `completed`
  - `archived`
  - `focus/current`
  - `interactive/clickable`?
- How should this new list baseline relate to the already-landed shell primitives:
  - `Card`
  - `SectionBlock`
  - `DirectiveBlock`?

## Current PMO Judgment

- PMO currently judges that the repo does have a meaningful gap here:
  - shared shell primitives exist
  - shared action primitives exist
  - but shared display-list grammar does not yet clearly exist
- This means some current `legacy` in Notes, Projects, and Dashboard is probably not just stale local styling:
  - it is local code compensating for a missing reusable layer
- PMO should therefore avoid treating every list-like local style as simple deletion fodder.
- Human direction is now explicit on one important framing rule:
  - this topic is large enough to deserve a separate discussion batch
  - it should not remain hidden inside smaller residue-cleanup threads
- Current PMO preference for the first pass:
  - keep it narrow
  - do not open a full universal list system immediately
  - start by testing whether a shared display-row / list-item layer is enough to absorb the most repeated local residue
- Current likely exclusions for the first pass:
  - task-capture workflow surfaces
  - CodeMirror/editor surfaces
  - object-level action-entry grammar
  - full status-system redesign
  - broad dashboard workflow redesign
- Current PMO preference for first-pass reference samples that are suitable to absorb into a narrow shared display-list layer:
  - `Dashboard` `mini-item`
    - reason:
      - it is the cleanest current compact display-row sample
      - it already reads as a lightweight list item rather than as a workflow block or object shell
  - `NotesPanel` `ai-task-item`
    - reason:
      - it is a clear content-plus-action display item
      - it is local enough to expose repeated item grammar without forcing the first pass to solve project workflow semantics
  - `ProjectsPanel` `ai-suggestion-item`
    - reason:
      - it is the closest sibling sample to `ai-task-item`
      - together they can help define a first reusable display item grammar for reveal-content lists
  - `ProjectsPanel` `tasks-preview-list`
    - reason:
      - it is a strong candidate reference for a shared list container layer
      - it already groups multiple task-preview rows under one clear display surface
  - `ProjectsPanel` `preview-task-section`
    - reason:
      - it is the cleanest current sample for grouped list-section language
      - it may help define the narrow first-pass boundary for shared grouped preview sections without yet solving every row-state variant
- Current PMO abstract judgment on the shared pattern behind these samples:
  - they are not object shells like `Card`
  - they are lightweight display items living inside a larger container or reveal surface
  - they usually share a stable content skeleton:
    - main content
    - secondary / trailing content or action
  - they rely more on:
    - light surface
    - small padding
    - modest radius
    - content hierarchy
    than on heavy card-like framing
  - they often appear as repeated grouped items rather than isolated one-off blocks
  - the main variation axis across current samples is:
    - density
    - compactness
    - whether the row is lightly interactive
    rather than large structural divergence
  - mobile behavior strengthens the case for a shared list grammar:
    - main content should remain first-class
    - trailing/meta content should be allowed to weaken, wrap, or partially hide on narrower widths
    - compact rows should not assume desktop-only spacing
- PMO current shorthand for the first-pass missing layer:
  - `lightweight display-list grammar`
  - likely composed of:
    - list container
    - list item / display row
    - grouped list section
- PMO now also judges that the current top-level `expand` control seen in project task preview should not be framed merely as:
  - `show more items`
  but more precisely as:
  - a list-level mode switch
- Current preferred framing:
  - collapsed state:
    - preview list mode
    - fewer visible items
    - tighter information density inside each item
  - expanded state:
    - full list mode
    - more visible items
    - fuller information display inside each item
- Under this framing, PMO should treat the current expand button as controlling:
  - list range
  - list information density
  together, rather than as an item-level disclosure mechanic
- This clarification matters because it separates three questions that should not be silently collapsed into one:
  - whether the list is in preview or expanded mode
  - whether the item itself is clickable
  - what the item's main click action should do
- Human judgment is now directionally explicit on one sample implication:
  - if Dashboard saved tasks adopt the same list-level `preview / expanded` mode logic, then the row itself no longer needs to carry item-level disclosure responsibility
  - under that condition, the row's primary click can be reassigned to:
    - `completed / uncompleted` toggle
  - this significantly weakens the case for keeping a separate leading checkbox in that specific list
- Current PMO reading:
  - removing the checkbox is not just a visual cleanup
  - it is a consequence of redistributing responsibilities:
    - list-level control owns disclosure
    - row-level primary click owns status toggle
    - trailing menu owns secondary actions
- Human and PMO have now provisionally converged on a clearer first-pass structural frame for this missing list baseline:
  - `List`
    - owns top-level preview versus expanded mode
    - owns default visible item count, which may vary by usage context
    - owns the expand control
  - `ListSection`
    - owns optional grouped partitions such as `active` versus `archived`
    - should be included in the first-pass frame because grouped project task previews are already a real current pattern
  - `ListItem`
    - owns the row shell for a single item
  - `ItemContent`
    - owns the primary item content
    - should render a more compact summary in preview mode and fuller content in expanded mode
    - should therefore be treated as linked to the list-level mode state
  - `ItemMeta`
    - owns supporting badges, provenance/source dots, and similar secondary row metadata
  - `ItemTrailingMenu`
    - owns secondary row actions
  - `ItemPrimaryClick`
    - owns the list's main row action
    - should remain list-specific:
      - e.g. `focus/select` in project task preview
      - e.g. `completed / uncompleted toggle` in dashboard saved tasks
- Updated PMO preference on disclosure placement after real implementation/testing on `Projects` task preview:
  - first-pass list grammar should allow disclosure to mount on `ListSection`
  - for current product reality, PMO now leans toward:
    - primary-section-mounted disclosure
    - rather than treating `List`-level disclosure as the universal default
  - reason:
    - the expand behavior still changes:
      - visible range
      - information density
    - but in real usage it often belongs most naturally to the primary readable section rather than to the outer list shell
    - this is especially true when a surface has:
      - one main task section
      - plus one more secondary/supporting section such as `Archived`
  - current practical reading:
    - `List` remains the outer display container
    - primary `ListSection` may own its own `preview / expanded` control when that better matches the surface semantics
    - secondary sections do not need to inherit that control by default
  - this means first-pass `ListSection` should no longer be treated as grouping/title-only by rule
  - instead it should be understood as able to carry:
    - title
    - optional control
    - and, when product semantics justify it, section-scoped disclosure
- Current PMO judgment on coverage:
  - this structure appears broad enough to absorb both:
    - `Dashboard` saved task list
    - `Projects` task preview
  - because it separates:
    - list-level disclosure
    - item-level primary action
    - row-level meta
    - row-level secondary actions
  - without forcing both surfaces into the same main-click semantics
- PMO and human also now judge that the current `active / completed` switch seen in project task preview should not be modeled as core `List` structure and does not belong inside `ListItem` grammar.
- Current preferred placement:
  - treat it as a `ListSection`-mounted control
  - more specifically:
    - a section-level view/filter control that governs which items are shown inside that section
- Current boundary reading:
  - this control is attached to a section
  - but is not itself the definition of `ListSection`
  - first-pass list grammar should therefore allow section-level controls to exist without requiring every section to own one
- Current component optionality judgment:
  - `ItemTrailingMenu` should be treated as optional rather than universal
  - reason:
    - some strong first-pass samples, especially `Projects` task preview, do not naturally need trailing row actions
    - first-pass list grammar should therefore require:
      - `ListItem`
      - `ItemContent`
    - while allowing:
      - `ItemMeta`
      - `ItemTrailingMenu`
      - list-specific primary click semantics
- Current structural reading of `Projects` task preview:
  - it is cleaner to interpret the current task preview surface not as:
    - `List` plus a universal list header plus sections
  - but instead as:
    - `List`
    - one primary task `ListSection` with its own header/title and attached control
    - one optional archived `ListSection`
  - under this reading:
    - `Tasks` should be understood as a section title/header
    - the current preview filter control belongs with that section header
    - the expand action can still remain list-level, because it governs whole-list mode rather than only one section
- PMO and human now also have a provisional three-pass rollout order for turning this discussion into execution slices:
  - `pass-1`
    - start with `Projects` task preview
    - reason:
      - it is the cleanest near-match to the new structural frame
      - it should be the lowest-risk place to test whether the framework can be made real in code without overfitting
    - expected focus:
      - align the preview surface to the new `List / ListSection / ListItem / ItemContent / ItemMeta` reading
      - validate that list-level expand and section-level control placement are workable in implementation
  - `pass-2`
    - then move to `Dashboard`
    - reason:
      - it contains both:
        - a simpler `mini-item` sample
        - the hardest important sample: saved tasks
      - this makes it the right comparison surface once `Projects` has validated the base frame
    - expected focus:
      - use the first pass as a reference
      - solve the saved-task disclosure versus primary-action redistribution
      - determine whether checkbox removal and list-level expand can be landed cleanly
- `pass-3`
    - then close with `ai-task-item`, `ai-suggestion-item`, and any remaining compatible local residues
    - reason:
      - these look like good cleanup consumers of the framework once the two major anchor surfaces are proven
      - they should act as convergence surfaces, not as the places that define the framework
    - expected focus:
      - absorb compatible AI reveal/list residues
      - collect any remaining list-like local surfaces that clearly fit the proven frame
- `slice-001` is now promoted into `state/sprint_candidates.md` as:
  - `Frontend Display-List Baseline Pass 1: Projects Task Preview`
- `slice-001` has now completed successfully and remains recorded in:
  - `state/sprint_candidates.md`
  - `history/reports/frontend-display-list-baseline-pass-1-projects-task-preview.md`
- PMO current lifecycle reading after promotion:
  - keep this batch active because:
    - later `Dashboard` and AI/list convergence follow-ons remain open
  - but treat the first-pass Projects validation slice as no longer discussion-only
  - use the promoted candidate as the formal near-term execution entry for this thread's first implementation move

## Suggested Next PMO Action

- Use this batch as the durable context for:
  - the now-completed first-pass `Projects` task preview validation slice
  - later `Dashboard` comparison/migration work
  - later AI/item convergence cleanup after the anchor surfaces are proven
- Keep `NotesPanel` and `ProjectsPanel` audits as evidence inputs, not as replacement canonical homes for this larger topic.
- Treat `Dashboard` as a likely evidence surface for compact list/item residue, but do not let it dominate the first shared grammar decision unless it proves to be the cleanest reference.
