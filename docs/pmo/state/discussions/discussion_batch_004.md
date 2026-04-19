# Discussion Batch `discussion_batch_004`

- Topic: `PMO document load reduction`
- Last updated: `2026-04-19`
- Status: `stable`
- Discussion mode: `follow-up`

## Intake Record

- Intake type: `mixed`
- Origin trigger: `real usage feedback`
- Source channel: `human discussion`
- Why now: `Real PMO usage now shows that the flow is working, but the number of files touched during discussion, activation, and closeout is starting to feel heavy. The next step is to reduce document load without losing the main routing discipline we just established.`
- Related sprint or closeout: `multiple PMO runs on 2026-04-19, including discussion, candidate promotion, handoff, micro-fix activation, and closeout loops`

## Why This Discussion Exists

- The current PMO structure is now mature enough that the main risk is no longer "missing process" but "too many surfaces to read and write for the same process step."
- The goal is not to remove routing discipline, but to reduce routine maintenance overhead so PMO remains usable during everyday work.
- This topic should stay practical and operational rather than turning into a full PMO redesign effort.

## Theme Summary

### `theme-001`

- Summary: `Reduce routine PMO write amplification by lowering how many files need to change for one stable planning or closeout action.`
- Why grouped: `The main pain is not any single file but the repeated pattern where one discussion or one closeout causes many state, archive, and helper-layer updates.`
- Current focus: `yes`
- Status: `in_focus`
- For follow-up mode, the concrete issue exposed was: `real PMO usage showed that the system now works, but the same decision can require writes across discussion batches, discussion index, candidates, current sprint, execution handoff/report files, archives, and sometimes helper-facing guidance surfaces.`

## Possible Slices

### `slice-001`

- Name: `Discussion and index maintenance reduction`
- Why separate: `This slice would reduce how often PMO must touch both a batch file and the index file for the same discussion change.`
- Current maturity: `emerging`
- Likely target: `decision_log | sprint_candidates | undecided`
- Parking trigger: `If PMO decides the current index burden is tolerable for now and other write-amplification problems are more urgent.`
- Reopen signal: `If discussion work keeps feeling heavier than the planning value it produces.`

### `slice-002`

- Name: `Closeout write-surface reduction`
- Why separate: `This slice would decide how much detail belongs in current runtime files versus archive files so closeout stops duplicating the same result in too many places.`
- Current maturity: `emerging`
- Likely target: `decision_log | sprint_candidates | undecided`
- Parking trigger: `If current closeout overhead is accepted temporarily while the active UI cleanup sprint stays the main focus.`
- Reopen signal: `If each sprint closeout continues to feel mechanically correct but disproportionately heavy.`

## Open Questions

- Which PMO files are truly canonical runtime surfaces, and which ones can be updated less often without harming daily operation?
- Should `discussion_index.md` become a lighter registry that changes only on batch open/close/promotion events rather than on every intermediate discussion refinement?
- Should `current_sprint.md` stay extremely short and stop carrying detail that already exists in `execution_task.md`, `execution_report.md`, or archives?
- How much historical detail should stay in archive files versus being referenced from the active closeout summary?
- Which helper-facing files, especially `CLAUDE.md`, should be treated as high-signal defaults only rather than a growing second PMO manual?

## Current PMO Judgment

- The current PMO architecture is directionally correct and should not be redesigned from scratch.
- The real problem is now document load, not routing ambiguity.
- A first stable diagnosis has emerged: the system needs fewer routine synchronized writes, especially around discussion indexing and closeout/archival repetition.
- A more specific index-maintenance judgment has now emerged: `discussion_index.md` should behave as a lifecycle index, not a step-by-step discussion log.
- Under that judgment, the index should change when a batch is opened, promoted, parked, archived, or otherwise changes lifecycle state in a meaningful way, but not when the batch simply gains another judgment or sharper internal question.
- A parallel runtime-state judgment has now emerged: `current_sprint.md` should be reduced to a true state card that stays shorter than `execution_task.md` and `execution_report.md`, rather than continuing to accumulate semi-narrative sprint summaries.
- A helper-layer judgment has now emerged as well: `CLAUDE.md` should stay a narrow execution entrypoint and only gain new rules when they materially change default worker behavior, prevent recurring repo-specific mistakes, or encode a high-value repo-native default that execution workers are likely to miss otherwise.
- A closeout-history judgment has now emerged too: execution-report archives should behave more like mechanical report snapshots than second narrative summaries, so closeout preserves the return in history without requiring a fresh round of prose-heavy rewriting.
- A further friction judgment has now emerged from real post-closeout usage: some tiny same-scope corrections discovered immediately after testing should not reopen the whole micro-fix runtime loop, and instead should use a lighter post-closeout tweak path attached to the most recent closed sprint.
- The most promising near-term reduction targets are:
  - lowering `discussion_index.md` maintenance frequency
  - keeping `current_sprint.md` lighter than `execution_task.md` and `execution_report.md`
  - making archive records thinner and more mechanical so closeout does not require as much repeated prose
  - keeping `CLAUDE.md` restricted to a small set of high-value default execution rules
- PMO should prefer reducing write frequency and duplicated summaries rather than deleting whole layers that still serve a clear routing purpose.

## Promotion Outcome

- The stabilized document-load reduction rules are now normalized directly into canonical PMO docs rather than being left only inside this batch.
- `discussion_index.md` was narrowed into a lifecycle index through:
  - `state/discussion_index.md`
  - `protocols/discussion-workflow.md`
- `current_sprint.md` was reduced toward a true state card through:
  - `state/current_sprint.md`
  - `protocols/sprint-workflow.md`
  - `PMO_OPERATING_MANUAL.md`
- `CLAUDE.md` now carries an explicit growth boundary so it stays a narrow execution entrypoint rather than a second PMO manual.
- `history/reports/` now uses a thinner, more mechanical archive snapshot pattern through:
  - `history/reports/execution-report-archive.template.md`
- very small same-scope tail corrections can now use a `post-closeout tweak` path through:
  - `protocols/sprint-workflow.md`
  - `PMO_OPERATING_MANUAL.md`
  - `state/templates/current-sprint.idle.template.md`
- Keep this batch only as historical context unless future PMO usage reveals another concrete document-load problem that is not already covered by the stabilized rules above.
