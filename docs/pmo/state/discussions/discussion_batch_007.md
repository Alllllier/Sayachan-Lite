# Discussion Batch `discussion_batch_007`

- Topic: `Behavior-locked simplification pass for task/project/note`
- Last updated: `2026-04-20`
- Status: `stable`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `cleanup`
- Origin trigger: `execution report`
- Source channel: `human discussion`
- Why now: `The archive/lifecycle alignment sprint closed successfully, but the affected task/project/note surfaces have now accumulated several rounds of semantic and UI-facing changes. Human follow-up discussion clarified that the next concern is not just archive-specific auditing, but locking current intended behavior in tests and then simplifying the implementation toward the smallest code that still preserves that behavior.`
- Related sprint or closeout: `Archive And Lifecycle Model Alignment closeout`

## Why This Discussion Exists

- Task, project, and note behavior has now been shaped through several feature and semantics passes, especially around archive, restore, filtering, and cross-surface state interpretation.
- Human judgment is that the risk is no longer only one archive-specific bug, but that the implementation could drift toward code that is harder to reason about than the current product behavior actually requires.
- PMO needs a dedicated place to shape a behavior-locked, test-driven simplification pass before deciding whether it should become a cleanup candidate.

## Theme Summary

### `theme-001`

- Summary: `Capture the currently intended task/project/note behavior in tests first, then simplify the implementation toward the smallest code that still preserves those behaviors.`
- Why grouped: `The central question is not one single archive bug or one single component file, but whether the current multi-surface behavior can be locked down and then refactored safely without silently changing product semantics.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `Recent task/project/note changes solved real product problems, but they also increased the chance that future edits will happen on top of duplicated or overgrown implementation paths unless behavior is locked and simplification is made explicit.`

## Possible Slices

### `slice-001`

- Name: `Behavior coverage expansion for task/project/note`
- Why separate: `A simplification pass only becomes safe if the current intended behavior is first captured clearly enough in tests.`
- Current maturity: `emerging`
- Likely target: `sprint_candidates`
- Parking trigger: `If PMO decides the needed behavior contract is still too fuzzy to lock down yet.`
- Reopen signal: `If discussion converges on a stable list of must-preserve behaviors and wants a bounded test-first coverage slice.`

### `slice-002`

- Name: `Implementation simplification after behavior lock`
- Why separate: `The actual refactor should be framed as a second step that simplifies route helpers, model interpretation, and frontend surface logic only after the preserved behaviors are stable.`
- Current maturity: `emerging`
- Likely target: `sprint_candidates`
- Parking trigger: `If PMO decides to separate test-locking from refactor execution rather than bundling them into one sprint.`
- Reopen signal: `If strong behavior coverage lands first and PMO wants a bounded cleanup/refactor sprint immediately after.`

## Open Questions

- Which task/project/note behaviors are important enough to lock before any simplification work starts?
- Should the future sprint be one bundled `test first, then refactor, then rerun tests` slice, or should behavior-locking and simplification be split into two sequential candidates?
- Should PMO treat the current implementation as something to preserve in-place, or as behavior reference code that can be archived and then replaced by a simpler implementation once behavior coverage exists?
- Should task provenance fields remain in their current shape, or should the simplification pass reopen which provenance and linkage fields are actually necessary?
- Which areas matter most for the first preserved behavior set:
  - archive and restore semantics
  - task completion semantics
  - project task preview and focus behavior
  - note/project/task archived vs active listing behavior
  - dashboard-derived counts and current-next-action behavior
- What current compatibility helpers are acceptable temporary seams versus signs that the code should be simplified soon?
- How much browser/UI validation should be expected if the simplification changes no intended behavior but does touch visible surfaces?

## Current PMO Judgment

- Human direction is already stable on one important point: the next cleanup should be behavior-locked and test-driven rather than a free-form code cleanup.
- Human discussion also introduced a likely execution-safety preference:
  - preserve the current implementation as reference rather than repeatedly mutating it in place
  - use current behavior as the contract to test against
  - allow a simpler replacement implementation after that behavior is locked
  - only switch active wiring after the rewritten path proves it preserves behavior
- The desired execution pattern is also directionally clear:
  - expand or tighten tests around intended current behavior
  - simplify implementation toward the smallest code that still preserves that behavior
  - rerun the same behavior suite as the acceptance gate
- What is not yet stable is the exact execution cut:
  - one combined cleanup sprint
  - or one test-locking slice followed by one simplification slice
- A first-pass must-preserve behavior set is now emerging from active discussion plus `runtime-baseline.md`:
  - archive and restore semantics across task, project, and note
  - task completion semantics
  - project task preview and current-focus behavior
  - note/project/task archived vs active list behavior
  - dashboard-derived cockpit signals and on-demand dashboard-context hydration
  - note markdown editing/storage behavior
  - note-based task generation and project-based next-action surfaces
- Task provenance field shape is intentionally not yet treated as settled in this batch; human direction is to discuss the necessity of those fields separately rather than silently preserving them as unquestioned refactor constraints.
- A first-pass necessity judgment is now emerging for the current task provenance fields:
  - likely currently necessary: `creationMode`, `originModule`, `originId`
  - currently active but more structurally questionable: `linkedProjectId`
  - likely challengeable or removable: `originLabel`, `linkedProjectName`
- A clearer working partition is now emerging from the combined discussion plus `task-project-note-behavior-audit.md`:
  - `must preserve in behavior-lock sprint`
  - `real current behavior but not a long-term design promise`
  - `historical residue / compatibility reads`
  - `allowed to intentionally redo in simplification sprint`
- PMO now has enough stable direction to stop treating this as open shaping discussion.

## Promotion Outcome

- The first slice is now ready for `state/sprint_candidates.md` as a bounded behavior-lock testing candidate.
- A later simplification refactor slice should remain visible as a follow-on candidate once the first behavior-lock sprint is selected or completed, but PMO should not freeze that second slice into a formal candidate yet because sprint-one testing may still reveal boundary corrections or new runtime wrinkles.
- The current expected second-slice direction, to be revisited after sprint one, includes:
  - replacing `linkedProjectId` duties with `originModule + originId` if behavior parity holds
  - retiring stale `project_focus` and `project_suggestion` compatibility-era logic
  - removing dead legacy task fields and likely denormalized baggage such as `originLabel` and `linkedProjectName`
  - simplifying `focus-clearing` into the newer symmetric rule
  - reducing dashboard snapshot drift while keeping that bridge lightweight and experimental
- Keep this batch as stabilized context for the two-sprint structure, provenance cleanup direction, and refactor-safe testing boundary rather than as an active discussion thread.

## Follow-On Slice Draft After Sprint One

- Likely sprint name: `Task Project Note Simplification Refactor`
- Why now after sprint one: `Behavior-lock testing now exists for the key runtime paths, so simplification no longer has to guess which current outcomes matter. The next step should focus on reducing structural complexity, not on rediscovering behavior.`
- Refined expected outcome:
  - current task/project/note behavior continues to hold under the locked test suite
  - project-task relation semantics become more coherent and easier to reason about
  - `linkedProjectId` exits as a primary runtime dependency
  - stale `originModule` compatibility values leave the canonical runtime path
  - dead legacy task fields and denormalized baggage are removed
  - `focus-clearing` becomes a simpler symmetric rule
  - dashboard snapshot drift is reduced without turning cockpit signals into a permanent context subsystem
- Refined in-scope direction:
  - use `originModule + originId` to replace current `linkedProjectId` implementation duties where behavior parity can be preserved
  - unify the runtime rule for project-related task boundaries rather than keeping read/cascade semantics split across different relation definitions
  - simplify focus-clearing around whether a focused task remains valid focus
  - remove legacy or dead task fields once sprint-one behavior-lock coverage proves they are not active dependencies
  - retire `project_focus` and `project_suggestion` from canonical runtime handling if they remain compatibility-only
  - reduce dashboard snapshot drift through bounded simplification rather than broader architecture work
- Refined out-of-scope direction:
  - no new first-class relationship system yet
  - no note-note, note-project, or project-project feature execution
  - no context-layer architecture project
  - no production-grade migration system for development-stage data
- The key refinement after sprint one is that this later slice should be framed less as generic code cleanup and more as:
  - `unify the runtime meaning of project-related task while simplifying the implementation under a locked behavior suite`

## New Judgments From Active Discussion

- A new safety preference has emerged for the eventual simplification pass:
  - current code may be treated as reference implementation or fallback material rather than as the only mutable live path
  - behavior should be captured first
  - rewrite toward a simpler implementation can then happen with lower fear of losing edge-case behavior
  - active routing should switch only after the rewritten path demonstrates behavior parity
- This does not yet commit PMO to a literal duplicate-code archive inside the main runtime path, but it does mean the future execution slice should explicitly consider whether preserving a reference copy, fallback path, or temporary parallel implementation is safer than doing an in-place refactor.
- Additional must-preserve runtime behaviors were identified by checking `docs/pmo/baselines/runtime-baseline.md`:
  - project focus remains task-based rather than free-text
  - setting focus continues to happen through project-task relations
  - completing, archiving, or deleting the current focus task still clears `currentFocusTaskId`
  - Dashboard continues to derive and publish `activeProjectsCount`, `activeTasksCount`, `pinnedProjectName`, and `currentNextAction`
  - chat-side dashboard-context hydration continues to rebuild from backend `/projects` and `/tasks` when cockpit signals are missing
  - notes continue to preserve raw markdown text
  - note remains a task provenance source and project continues to expose project-linked task capture
  - note task-generation and project next-action AI surfaces should not be accidentally broken by simplification work
- Task provenance field shape itself is now explicitly carved out as a separate discussion point. The current batch should preserve the existence of note/project/task runtime relationships and behaviors, but not yet assume that every current provenance field is required in its present form.
- Human historical context clarified that `originId`, `originLabel`, and `linkedProjectName` came from an earlier, more conceptual planning phase before GPT had direct repository grounding. At that time, those fields were partly acting as a placeholder strategy for keeping task visibility coherent across note/project attachment patterns.
- That background now matters because future backlog directions already point toward richer first-class relationships such as `note-note`, `note-project`, and `project-project`. Human judgment is that the older task-provenance field shape may no longer be the right long-term model once those richer relationships exist.
- One surprising current finding is that `originId` is no longer just conceptual residue. It is actively used in today's runtime for note/project archive-restore scoping and some project-task semantics, so PMO should treat it as a real current dependency even while reopening its long-term necessity.
- Active discussion then corrected an earlier assumption: `originId` appears to be the more legitimate surviving source-reference field, while `linkedProjectId` now looks more like the field that grew as a pragmatic shortcut for project-owned task access and focus handling.
- The emerging interpretation is:
  - `originModule + originId` expresses where a task comes from
  - `linkedProjectId` expresses which project currently reads or governs that task
  - in today's project-created task flow those two ideas often collapse onto the same project id, which is why `linkedProjectId` now feels more like the field that may have grown sideways from an earlier placeholder need
- The likely emerging interpretation is:
  - some current provenance fields are serving as temporary relationship surrogates
  - future simplification should not assume those surrogates remain the correct long-term design once first-class cross-object relationship modeling exists
  - but the cleanup pass also cannot delete a currently active surrogate field until the runtime behaviors it supports are intentionally replaced or reshaped
- Active discussion further clarified that the stronger long-term concern may no longer be `originId`, but `linkedProjectId`. Current human judgment is that `linkedProjectId` looks more like a concept-phase shortcut added so project surfaces could easily query and govern tasks before richer relationship modeling existed.
- PMO should therefore treat `linkedProjectId` as:
  - a real current runtime dependency
  - but also a likely candidate for redesign or removal in a later simplification pass, especially if `originModule + originId` or a future first-class relationship model can cover the same behavior more cleanly
- Active discussion also surfaced likely historical residue in `originModule` values:
  - `project_focus`
  - `project_suggestion`
- Current repository scan found read-time handling for those values, but no obvious live write path that still creates them under today's canonical flow. Human judgment is that these values likely come from an older text-based project-focus workflow that has already been removed.
- PMO should therefore treat `project_focus` and possibly `project_suggestion` as compatibility-era remnants unless a later code-path review proves they are still intentionally produced somewhere in the current runtime.
- Active discussion further clarified the likely reason `project_suggestion` now looks obsolete: the current canonical flow appears to express the same semantics through a field combination such as `originModule='project'` plus `creationMode='ai'` rather than through one special combined `originModule` value.
- This reinforces a broader simplification direction for the later refactor pass:
  - prefer fewer orthogonal fields with stable meanings
  - avoid combined magic-string values when the same semantics can be represented more cleanly through existing field composition
- A further stabilization point is emerging around the likely minimal surviving shape:
  - `creationMode` should likely stay bounded to `manual | ai`
  - `originModule` should likely stay bounded to current surface-level values such as `note | project | dashboard`
- The key semantic guardrail is that `originModule` should describe source surface only, not become a carrier for extra combined meanings such as focus-type, suggestion-type, or future relationship semantics.
- Active discussion also strengthened the judgment around `linkedProjectId`:
  - replacing it immediately would be more work in the short term because current project reads, archive/restore cascades, and focus-clearing paths still depend on it
  - but keeping it permanently would continue to imply that every task naturally has a built-in project-link slot, which human judgment considers misleading for both the current product and the future richer relationship model
- The emerging PMO direction is therefore:
  - `linkedProjectId` should likely be removed in a later behavior-locked simplification pass
  - but only after the relevant project-task behaviors are locked in tests and the replacement relationship expression is proven to preserve those behaviors
- Active discussion now also leans toward the replacement expression being sufficient for the current and near-future product stage:
  - `originModule + originId` appears sufficient to represent current task source relationships
  - if future source surfaces appear, extending `originModule` is viewed as an acceptable path
  - a more formal relationship model should only be introduced later if source semantics and attachment semantics truly diverge in real product behavior
- PMO should read this as a meaningful early signal from discussion itself: even before a formal audit sprint starts, the current conversation is already surfacing code-shape warnings and legacy seams that look like early `spaghetti-code` pressure rather than purely hypothetical cleanup concern.
- A testing-strategy judgment is also now stable enough to record:
  - maximize behavior coverage
  - minimize implementation coupling
- In practice this means the future simplification pass should try to lock as many user-visible or runtime-relevant outcomes as possible, while avoiding tests that accidentally freeze today's helpers, field choreography, or other internal implementation details.
- Human discussion also stabilized a likely sprint split:
  - first sprint: behavior-lock testing
  - second sprint: simplification refactor plus rerunning the locked behavior suite
- A first-pass testing sufficiency target is now emerging:
  - cover all core behavior chains across task, note, project, and dashboard-derived context
  - cover the already-known regression-prone paths such as archive/restore semantics, cross-scope restore safety, archived project task visibility, and focus-clearing behavior
  - use backend and frontend behavior tests as the main contract surface
  - keep browser/UI review as a bounded validation layer rather than trying to make the first sprint a full visual-e2e coverage effort
- The practical bar for the first behavior-lock sprint is becoming: test enough that a later refactor can safely remove `linkedProjectId`, retire stale `originModule` compatibility values, and simplify archive/focus/query logic without guessing which current behaviors matter.
- The external audit added three especially high-value concerns that PMO should now treat as first-tier discussion inputs:
  - `dashboard context drift risk`
  - `project-related task boundary inconsistency`
  - `focus-clearing asymmetry`
- The audit also reinforced a likely testing priority order for the future behavior-lock sprint:
  - project-task relation boundaries
  - archive and restore cascade behavior
  - focus-clearing behavior
  - dashboard-context truth
- Human discussion then added an important scope guardrail around dashboard-context concerns:
  - `cockpit signals` / `dashboard snapshot` are currently a temporary bridge for product experimentation while `sayachan-ai-core` does not yet have a real context layer
  - they should therefore be treated as lightweight experimental runtime glue, not as a long-term architecture layer that deserves heavy abstraction or overbuilt protection
  - the goal for a future behavior-lock sprint should be to keep their semantics simple and non-drifting, not to expand them into a larger permanent subsystem during cleanup work
- A minimal product semantic for `cockpit signals` is now also emerging:
  - they should represent current active work truth rather than whichever task tab happens to be visible in the Dashboard UI
  - browsing archived tasks should not redefine the meaning of the lightweight chat-facing snapshot
- Active discussion also clarified how PMO should treat the current `linkedProjectId` dependency during the two-sprint plan:
  - sprint one should lock the currently real external behavior, even if that behavior is presently implemented through `linkedProjectId`
  - sprint two can then refactor the implementation to use `originModule + originId` instead
  - success should be judged by behavior parity under the locked test suite, not by preserving the old field-level implementation shape
- Active discussion then sharpened the `focus-clearing asymmetry` judgment:
  - the narrower completion-side clearing rule looks older and tied to the earlier phase where users could still create or convert text-based project-focus flows
  - the broader archive/delete clearing paths look like later additions layered on top
  - PMO should therefore treat this asymmetry as likely implementation history rather than as a deliberately stable product rule
- Human discussion then endorsed a simpler likely replacement rule for the later simplification pass:
  - if a task is the current focus task for a project
  - and it enters a state where it can no longer serve as valid focus
  - then `currentFocusTaskId` should be cleared
- PMO should treat this as one of the places where the later simplification sprint is allowed to intentionally replace historical behavior rather than preserving every implementation-era asymmetry. In other words, this belongs to the `refactor but intentionally redo` category, not to the `must preserve exactly as-is` category.

## Working Partition From Discussion Plus Audit

### `must preserve in behavior-lock sprint`

- task lifecycle and archive visibility remain orthogonal
- note archive and restore affect only note-origin tasks and preserve task lifecycle semantics
- project archive and restore preserve task lifecycle semantics
- active and archived list filtering remains stable across task, note, and project surfaces
- project cards continue to expose task-based preview behavior across active, completed, and archived states
- Dashboard continues to publish the lightweight cockpit signals used by Chat fallback and product experimentation
- current canonical provenance expression remains stable for now:
  - `creationMode = manual | ai`
  - `originModule = note | project | dashboard`

### `real current behavior but not a long-term design promise`

- project task reads currently depend on `linkedProjectId`
- project archive and restore currently use a wider relation boundary than project task reads by cascading through `linkedProjectId OR originId`
- cockpit signals currently have drift risk because live Dashboard derivation and Chat fallback rebuild do not necessarily derive from exactly the same task truth
- `linkedProjectId` is still a real runtime dependency even though PMO does not treat it as a desirable long-term model commitment

### `historical residue / compatibility reads`

- `project_focus`
- `project_suggestion`
- legacy `status='archived'` compatibility branches
- legacy task fields:
  - `source`
  - `sourceDetail`
  - `projectId`
  - `projectName`

### `allowed to intentionally redo in simplification sprint`

- replace `linkedProjectId` implementation duties with `originModule + originId` if behavior parity is preserved under the locked test suite
- retire `project_focus` and `project_suggestion` from canonical runtime logic once tests confirm they are only compatibility-era reads
- remove `originLabel` and `linkedProjectName` if no behavior-locked tests require them
- remove legacy task fields `source`, `sourceDetail`, `projectId`, and `projectName` from the schema once behavior-lock testing confirms no active runtime dependency remains
- simplify `focus-clearing` into a more symmetric rule based on whether the current focus task remains valid focus
- reduce dashboard snapshot drift so the bridge stays simple and non-contradictory, without turning cockpit signals into a permanent architecture subsystem

## Development-Stage Cleanup Rule

- Human discussion established an aggressive cleanup posture for clearly dead legacy task fields:
  - after the behavior-lock sprint confirms no active runtime dependency remains, it is acceptable to remove `source`, `sourceDetail`, `projectId`, and `projectName` from the task schema directly
  - no migration pass is required
  - no database cleanup pass is required
- Reason: the product is still in development stage, and current stored data should be treated as disposable test data rather than as durable historical records worth preserving for their own sake.
