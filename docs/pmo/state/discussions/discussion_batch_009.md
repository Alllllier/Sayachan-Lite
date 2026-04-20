# Discussion Batch `discussion_batch_009`

- Topic: `Backend test architecture buildout`
- Last updated: `2026-04-20`
- Status: `stable`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `architecture`
- Origin trigger: `discussion follow-on`
- Source channel: `human discussion`
- Why now: `The recent behavior-lock and simplification sprints proved that backend runtime semantics are now important and stable enough that the project needs a more deliberate backend testing architecture instead of continuing to grow only through ad hoc route-level test patches. Human direction is to split this theme out so it can be discussed on its own.` 
- Related sprint or closeout: `Task Project Note Behavior-Lock Testing and Task Project Note Simplification Refactor`

## Why This Discussion Exists

- The project now has meaningful backend runtime semantics around archive/restore, project-task relations, focus-clearing, and list/filter behavior.
- Recent refactors were protectable, but they also exposed that backend coverage is still relatively thin and too dependent on route-level seams.
- PMO needs a dedicated container to decide what the backend testing layer should look like before promoting any buildout sprint.

## Theme Summary

### `theme-001`

- Summary: `Define the minimum durable backend testing architecture that should protect runtime rules in this project without turning the repo into a heavy enterprise test stack.`
- Why grouped: `The open issue is no longer runtime model design itself, but how backend tests should be organized so future refactors stop depending on narrow ad hoc patches and temporary seams.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `Recent refactors were possible only because a bounded behavior-lock net was added, but the current backend test structure is still too thin and too route-centered to feel like a stable long-term architecture.`

## Possible Slices

### `slice-001`

- Name: `Backend behavior coverage expansion`
- Why separate: `One likely path is to keep the existing Node test runner and simply broaden the behavior-protection layer around high-value runtime rules.`
- Current maturity: `emerging`
- Likely target: `sprint_candidates`
- Parking trigger: `If PMO decides the current backend coverage is still good enough for near-term work and broader testing investment can wait.`
- Reopen signal: `If discussion converges on a clear list of backend behaviors that now deserve durable default coverage.`

### `slice-002`

- Name: `Backend test layering and seam cleanup`
- Why separate: `A second likely path is to improve the test architecture itself by separating route behavior tests, helper/module tests, and any remaining route-only seams such as `routes.__test__`.`
- Current maturity: `emerging`
- Likely target: `sprint_candidates`
- Parking trigger: `If PMO prefers to keep current seams until there is more pressure from future refactors.`
- Reopen signal: `If discussion converges on a stable backend test layering rule and wants a bounded cleanup/buildout slice.`

## Open Questions

- What should backend tests primarily protect in this project: runtime rules, route contract shape, helper logic, or some layered mix?
- How much backend behavior coverage is enough before it starts feeling heavy rather than useful?
- Should tests keep entering helper behavior through route-exported seams, or should helper/module tests become a first-class layer?
- Is the current Node built-in test runner already sufficient for the long-term backend direction, or is the larger problem still architecture rather than tooling?

## Current PMO Judgment

- Human discussion has already stabilized one important starting point:
  - the current backend testing problem is not primarily a tooling problem
  - `node --test` is currently acceptable for this repo
  - the more important missing piece is a clearer backend test architecture and default coverage baseline
- Human discussion also stabilized the first framing rule for the topic:
  - backend tests should primarily protect runtime rules in this project
  - especially archive/restore semantics, project-task relation rules, focus-clearing, and other backend-owned runtime semantics
- Human discussion then refined the likely backend layering shape:
  - backend tests in this repo may need at least three useful layers rather than a single undifferentiated route-test bucket:
    - `runtime behavior tests`
      - protect backend-owned semantics such as archive/restore, relation boundaries, focus-clearing, and list/filter behavior
    - `route contract tests`
      - protect the API shape and route-level return contract that frontend code actually depends on
      - this layer is especially valuable for frontend collaboration, because it guards against silent response-shape drift even when backend runtime logic is still internally coherent
    - `helper/module tests`
      - protect important extracted helper logic and reduce friction when backend internals are reorganized
- The current PMO leaning is that route contract tests should be treated as a real architectural layer rather than as optional garnish, because they offer direct cross-surface value to frontend integration and worker reliability.
- Human discussion then clarified the likely near-term buildout order inside that three-layer shape:
  - first priority: strengthen backend `list/filter` behavior coverage
    - this is currently the thinnest important area relative to the recently improved archive/restore, project-task relation, and focus-clearing coverage
    - the goal is to protect the backend result-set semantics that frontend code depends on most directly
  - second priority: add a small but durable `route contract` baseline
    - especially around which fields remain part of the canonical response shape and which legacy fields/contracts are now gone
    - this layer is expected to improve frontend collaboration and reduce worker guesswork when backend routes evolve
  - third priority: add only a high-value minimum set of `helper/module` tests
    - not a broad internal-unit-test sweep
    - only for helpers whose behavior is core to runtime semantics and likely to keep moving in future refactors
- The current PMO reading is therefore:
  - backend test architecture should not grow evenly in all directions at once
  - the first useful buildout pass should prioritize result-set semantics, then route contract stability, and only then helper-level direct tests
- Human discussion then narrowed the first-pass `list/filter behavior baseline` into a concrete likely must-test set covering the current high-frequency route reads:
  - `Task`
    - `GET /tasks` should default to non-archived tasks only
    - `GET /tasks?archived=true` should return archived tasks only
    - `GET /tasks?projectId=...` should default to the canonical project's non-archived tasks only
    - `GET /tasks?projectId=...&archived=true` should return that project's archived canonical tasks only
  - `Project`
    - `GET /projects` should default to non-archived projects only
    - `GET /projects?archived=true` should return archived projects only
  - `Note`
    - `GET /notes` should default to non-archived notes only
    - `GET /notes?archived=true` should return archived notes only
- Human judgment is that this set already captures most of the current route layer's high-frequency list/filter actions, and therefore forms a plausible first-pass backend list/filter baseline rather than an over-broad future wishlist.
- Human discussion then clarified the minimum viable shape for a first-pass `route contract baseline`:
  - the current backend contract is still relatively raw
  - routes mostly return the information frontend currently needs, but the project does not yet strongly protect success/failure status-code semantics or a stable minimal response contract
- PMO should therefore treat the first contract layer as protecting three things before any heavier API-schema work is considered:
  - `success status codes`
    - especially stable use of `201` for create, `200` for normal reads/updates, and `204` for delete where that behavior is intended
  - `minimum canonical response shape`
    - not a full snapshot of every field
    - but a durable guarantee that key canonical fields exist and explicitly retired legacy fields do not quietly reappear
  - `basic error contract`
    - especially key `404` cases for missing id-based resources and a bounded set of meaningful `400`-class failures where the route already exposes them
- Human judgment is that the first-pass route-contract buildout should stay intentionally light:
  - no immediate OpenAPI project
  - no full schema-everywhere requirement
  - no heavy snapshot-contract layer
  - just a durable baseline around high-frequency routes and the status/shape/error behavior that frontend and workers most directly depend on
- The currently likely high-value first contract targets are:
  - `Task`
    - `GET /tasks` -> `200` plus array result shape
    - `PUT /tasks/:id` -> `200` plus canonical task shape
    - `DELETE /tasks/:id` -> `204`
  - `Project`
    - `GET /projects` -> `200` plus array result shape
    - `PUT /projects/:id/archive` -> `200` plus canonical project shape
    - `PUT /projects/:id/restore` -> `200`
  - `Note`
    - `GET /notes` -> `200` plus array result shape
    - `POST /notes` -> `201`
    - `PUT /notes/:id/archive` -> `200`
    - `PUT /notes/:id/restore` -> `200`
  - `Missing-resource id routes`
    - the project should begin explicitly locking `404` behavior for important task/project/note id-based routes rather than leaving those edges implicit
- Human discussion then clarified the likely role of the third layer, `helper/module tests`:
  - this layer is worth keeping, but only in a deliberately narrow form
  - it should not become a broad unit-test sweep across every extracted helper
  - its main value is to protect a small number of helpers that genuinely carry runtime semantics or repeatedly create refactor-localization pain
- PMO should therefore treat helper/module tests as a `high-value guardrail layer`, not as a coverage-maximization exercise.
- The likely inclusion rule for this layer is:
  - include helpers that directly encode runtime rules whose meaning must not drift
  - include helpers that are repeatedly reorganized enough that direct testing improves refactor clarity and failure localization
  - do not include helpers whose current existence is mostly an organizational accident or whose tests would mainly freeze internal choreography
- The current likely first helper candidates are:
  - `buildArchiveFilter`
  - `projectTaskReadFilter`
  - `projectTaskCascadeFilter`
  - `normalizeTask`
  - `normalizeNote`
- The current PMO leaning is that these candidates matter because they encode:
  - archive semantics
  - project-task relation semantics
  - canonical normalization semantics
  rather than merely reflecting convenience-level decomposition.
- Human discussion then refined the helper picture further:
  - `buildArchiveFilter`, `normalizeTask`, and `normalizeNote` appear to be the highest-reuse canonicalization helpers in the current route layer
  - `projectTaskReadFilter` and `projectTaskCascadeFilter` are not especially high-call-count utilities, but they are high-value semantic boundary helpers because they explicitly name the current project-task read and cascade rules
- The current PMO leaning is therefore:
  - the strongest first helper-test candidates are:
    - `buildArchiveFilter`
    - `projectTaskReadFilter`
    - `projectTaskCascadeFilter`
  - `normalizeTask` and `normalizeNote` are still important, but they sit closer to route-contract and runtime-behavior protection, so PMO should be more cautious about direct helper tests there in order to avoid redundant coverage or over-freezing internal canonicalization mechanics
- Human discussion then made the second-step scope narrower:
  - `normalizeTask` and `normalizeNote` should stay out of the helper/module second pass for now
  - the reason is that their most important semantics are already indirectly protected by the just-completed runtime behavior and route contract layers
  - adding direct helper tests for them now is more likely to create overlap than to add distinct new protection
- PMO should therefore treat the likely second helper/module slice as focused on exactly:
  - `buildArchiveFilter`
  - `projectTaskReadFilter`
  - `projectTaskCascadeFilter`
- Human discussion then clarified the likely sequencing rule for this backend testing topic:
  - the first likely candidate should focus on the first two layers:
    - `runtime behavior baseline`
    - `route contract baseline`
  - helper/module tests should likely remain a later second step rather than being folded into the first buildout pass
- Human judgment is that this split is preferable because:
  - the first two layers are currently the most urgent and least ambiguous protection gaps
  - the third layer is easier to overgrow into implementation-coupled testing if introduced too early
  - deferring helper/module tests slightly reduces overlap risk, especially around `normalizeTask` and `normalizeNote`, whose semantics may already be sufficiently guarded by the stronger route/behavior layers
- The current PMO leaning is therefore:
  - first backend testing candidate = runtime behavior + route contract
  - later optional follow-up = high-value helper/module guardrail layer
- PMO should therefore treat this batch as a discussion about backend test architecture and coverage shape, not about switching frameworks for its own sake.

## Promotion Outcome

- the first-pass backend testing slice is now stable enough to promote into `state/sprint_candidates.md` as `Backend Runtime And Route Contract Test Baseline`
- the first-pass backend testing slice has now completed successfully and remains recorded in candidate/report history
- the later helper/module guardrail layer is now also stable enough to promote into `state/sprint_candidates.md` as `Backend Helper Guardrail Tests`
- both the first-pass runtime/route baseline slice and the second-pass helper guardrail slice have now completed successfully
- keep this batch as stabilized context for the current backend testing architecture judgments rather than as an active unresolved execution-planning thread
