# Discussion Batch `discussion_batch_008`

- Topic: `Post-simplification residue cleanup and testing-baseline follow-up for task/project/note`
- Last updated: `2026-04-20`
- Status: `active`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `cleanup`
- Origin trigger: `sprint closeout`
- Source channel: `human discussion`
- Why now: `The simplification-refactor sprint closed successfully, but it intentionally left bounded legacy compatibility, some contract inertia, and a few tooling/testing seams in place. Human direction is to begin a narrower follow-up discussion focused on what should still be fully landed versus what can remain tolerated residue.`
- Related sprint or closeout: `Task Project Note Simplification Refactor closeout`

## Why This Discussion Exists

- The main runtime-model simplification now exists in real code, so the remaining questions are no longer broad architecture questions.
- What remains is a smaller class of residual items:
  - bounded legacy compatibility still tolerated in the runtime
  - contract inertia such as `Note.status`
  - backend test-entry seams such as `routes.__test__`
  - repo-native validation/tooling issues such as the broken UI review path
- PMO needs a dedicated follow-up container so these final-tail questions can be shaped without reopening the whole model discussion.

## Theme Summary

### `theme-001`

- Summary: `Decide which post-simplification residue should be fully landed now, which can remain tolerated compatibility, and which belongs to tooling-only follow-up rather than more model work.`
- Why grouped: `These items all come from the successful second-sprint implementation, but they are materially narrower than the already completed archive/lifecycle and simplification refactors.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `The main refactor landed, but a final set of legacy compatibility branches, contract leftovers, test seams, and validation-tooling gaps still remain and now need explicit PMO judgment.`

## Possible Slices

### `slice-001`

- Name: `Runtime residue cleanup`
- Why separate: `Some remaining legacy compatibility and contract inertia may be small enough to clean up in one last bounded runtime slice rather than carrying forward indefinitely.`
- Current maturity: `emerging`
- Likely target: `sprint_candidates`
- Parking trigger: `If PMO judges the remaining compatibility is harmless enough to defer until a later broader maintenance pass.`
- Reopen signal: `If discussion converges on one or two narrow residue items that should be fully removed rather than tolerated.`

### `slice-002`

- Name: `Validation and testing seam cleanup`
- Why separate: `The remaining frontend/browser validation gap and backend testing seam questions may deserve a tooling-focused slice rather than more runtime-model work.`
- Current maturity: `emerging`
- Likely target: `idea_backlog or sprint_candidates`
- Parking trigger: `If PMO prefers to tolerate current tooling issues until they re-block a concrete sprint.`
- Reopen signal: `If the broken repo-native UI review path or the route-level test seam starts causing repeated friction or confusing closeout judgments.`

### `slice-003`

- Name: `Backend test architecture buildout`
- Why separate: `The recent behavior-lock and simplification sprints proved that the project now has enough stable backend semantics to justify a broader and cleaner testing architecture, rather than continuing to grow coverage only through ad hoc route-level patches.`
- Current maturity: `emerging`
- Likely target: `sprint_candidates`
- Parking trigger: `If PMO decides to finish the remaining runtime residue cleanup first and defer larger testing-architecture investment until after the model is fully cleaned.`
- Reopen signal: `If discussion converges on a clear layered backend testing shape and wants a dedicated slice to build it out.`

### `slice-004`

- Name: `Cross-surface test and validation baseline buildout`
- Why separate: `Recent execution history showed that testing weakness is not only a backend issue. Frontend automated coverage remains thin, the repo-native UI review chain is currently broken, and execution workers still lack a stable validation baseline for deciding when a UI test should be temporary, canonical, repo-native, or one-off.`
- Current maturity: `emerging`
- Likely target: `sprint_candidates`
- Parking trigger: `If PMO decides to finish narrower runtime residue cleanup first and defer broader cross-surface testing investment until later.`
- Reopen signal: `If discussion converges on a fuller test/validation baseline that covers backend, frontend, and UI-review expectations together.`

## Open Questions

- Which bounded legacy compatibility paths are still worth removing soon rather than merely tolerating?
- Does `Note.status` now deserve a final cleanup, or is it acceptable contract inertia for now?
- Should backend tests continue to reach helper behavior through `routes.__test__`, or is it worth a future pass to let tests import helper modules directly?
- Is the broken repo-native UI review path now important enough to fix proactively, or should it remain an accepted known gap until it blocks another sprint?
- Which residue items are true runtime/model cleanup, and which are really validation/tooling maintenance instead?

## Current PMO Judgment

- The main runtime simplification is done; this batch is not about reopening the core archive/lifecycle or provenance decisions.
- The remaining questions are expected to fall into three buckets:
  - `worth fully landing`
  - `acceptable bounded residue`
  - `tooling-only follow-up`
- Human discussion already implies one important framing rule:
  - these remaining items should be shaped narrowly
  - they should not grow back into another broad model rewrite unless a new contradiction appears
- Human judgment is now explicit on one residue item:
  - `legacy archived compatibility` should no longer be treated as a durable compatibility requirement
  - the cleanup script has already been executed in both Render and local development environments
  - new canonical write paths no longer produce `status='archived'`
  - this is a personal early-stage project, so preserving support for older pre-cleanup task rows is not worth carrying forward
- PMO should therefore treat the remaining `status='archived'` compatibility chain as a removal target rather than as a long-lived tolerated seam. That chain currently includes:
  - archive/list query compatibility
  - runtime normalization compatibility
  - restore-time compatibility for legacy archived task rows
- Human judgment is also now explicit on `Note.status`:
  - `Note.status` should retire
  - note archive semantics should be expressed through `note.archived` only
  - this aligns note with the now-cleaner task/project archive model and removes contract inertia that no longer carries meaningful independent lifecycle information
- PMO should therefore treat `Note.status` as a cleanup target rather than as a field to preserve for long-term runtime meaning.
- Human judgment is now also explicit on `legacy linkedProjectId` tolerance:
  - it should be removed rather than preserved
  - the canonical project-task write path had already been writing `originModule + originId` before the recent refactor
  - the simplification sprint merely promoted that existing provenance shape into the primary runtime rule
  - continued route-level tolerance for old `linkedProjectId` rows is therefore no longer considered necessary in this early-stage personal codebase
- PMO should therefore treat route-level `linkedProjectId` compatibility as a removal target rather than as bounded long-term residue.
- Human judgment is now also explicit on `origin-only` project archive/restore compatibility:
  - it should be removed rather than preserved
  - canonical project-owned task writes had already been stably recording both `originModule='project'` and `originId=<projectId>` before the recent simplification pass
  - a task row that matches only `originId=<projectId>` without canonical project provenance is therefore no longer considered worth treating as an accepted project-related legacy shape in this early-stage personal codebase
- PMO should therefore treat project archive/restore tolerance for `origin-only` legacy rows as a removal target rather than as bounded long-term residue.
- The bounded runtime residue cleanup slice has now completed and removed the explicitly targeted runtime residue:
  - legacy archived-task compatibility chain
  - `Note.status`
  - route-level tolerance for legacy `linkedProjectId` rows
  - project archive/restore tolerance for `origin-only` legacy rows
- This means the batch should no longer treat those runtime items as active open residue for this seam.
- The remaining active value in this batch is now the larger follow-up work around testing and validation structure rather than more cleanup on the just-closed runtime residue slice.
- Human discussion also clarified that the remaining `routes.__test__` seam should not be viewed only as a small cleanliness annoyance.
- The recent simplification sprint exposed a broader backend testing issue:
  - backend behavior coverage is still relatively narrow
  - route-helper refactors currently force the worker to rewrite or patch tests more manually than desired
  - this is partly because a more deliberate backend test architecture was never introduced during the earliest rapid-iteration phase of the project
- Human judgment is that the project is now stable enough that investing in a broader and cleaner backend test architecture would be worthwhile.
- PMO should therefore treat this area as:
  - not only `remove routes.__test__ when convenient`
  - but also `consider whether a wider backend behavior/helper test structure should now be shaped as a real follow-on slice`
- This matters for future cleanup because stronger backend test structure would make later refactors safer and reduce the amount of ad hoc test rewriting each time route helpers move.
- Human discussion then extended that judgment beyond backend:
  - frontend test coverage is also still thin
  - the only stable repo-native UI review chain is currently broken
  - execution workers do not yet have a durable validation baseline for deciding when to rely on `npm run test`, repo-native UI review, temporary UI tests, or one-off commands
  - prior Claude execution behavior already showed this gap by creating temporary UI tests, running them, and then deleting them, which strongly suggests the project still lacks a stable rule for what UI validation belongs in the repo long term versus what is a throwaway debugging aid
- PMO should therefore treat the testing problem as broader than backend architecture alone:
  - backend test structure
  - frontend automated coverage
  - repo-native UI review repair
  - stable validation expectations for execution workers
  all now look like part of one larger unfinished testing-baseline topic.

## Promotion Outcome

- `slice-001` has now been promoted, executed, and closed successfully as `Task Project Note Runtime Residue Cleanup`.
- `slice-004` should remain paused at discussion level for now; human direction is to return to the larger cross-surface test/validation baseline topic only after the narrower runtime residue cleanup has been executed or otherwise resolved.
- Keep this batch open as the follow-up container for both:
  - the now-completed runtime residue cleanup as historical context
  - the larger paused testing/validation-baseline topic that should be revisited later
