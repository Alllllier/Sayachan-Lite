# Discussion Workflow

> Use this workflow when a topic is still in discovery, clustering, follow-up interpretation, or deep discussion.

## Purpose

This workflow covers the pre-backlog phase for two valid discussion shapes:

- `exploration` discussion:
  - recording a new discussion wave
  - clustering related themes
  - selecting one active focus area
  - preserving execution-relevant slice granularity inside a theme
- `follow-up` discussion:
  - recording a post-closeout or post-usage topic that is already narrow
  - interpreting a concrete residual problem, comfort issue, or execution follow-up
  - deciding whether it should return to backlog, candidate, or decision state
- for both shapes:
  - stabilizing the discussion result
  - deciding whether to park it, retain it, or promote it

## Entry Condition

Use this workflow when:

- the human raises a new product, architecture, bug, or opportunity topic
- the topic is not yet execution-ready
- multiple related issues need clustering before planning
- a sprint closeout, execution report, or real usage pass reveals a concrete follow-up topic that still needs PMO discussion before execution

Common intake types:

- new ideas or product opportunities
- bugfix discussions that still need repro clarity, scope shaping, or prioritization
- future architecture concepts that are directionally important but not yet implementation-ready
- post-closeout single-topic follow-up discussions
- real usage feedback after implementation

## Discussion Modes

Use one of these modes when opening a batch:

- `exploration`
  - best for multi-direction, pre-sprint, cluster-heavy discussion
  - preserve themes and possible slices when the shape is still broad
- `follow-up`
  - best for post-closeout, post-execution, or post-usage discussion
  - default to one narrow theme unless the follow-up clearly splits into multiple slices
  - focus on interpreting one concrete issue before promoting it into backlog, candidate, or decision state

## Standard Sequence

1. Record the discussion in `state/discussion_index.md` and the active batch file under `state/discussions/`.
2. Choose whether this batch is `exploration` or `follow-up`.
3. Cluster related themes lightly instead of over-normalizing them when the batch is broad enough to need clustering.
4. When a theme still contains multiple plausible execution directions, preserve them under `Possible Slices`.
5. Keep only one active focus theme at a time inside a batch.
6. Deepen discussion only on the active focus theme.
7. For `follow-up` mode, prefer one narrow theme and write the concrete residual issue directly instead of pretending the topic is broader than it is.
8. When stable judgments or narrowed questions appear, write them back into the active batch instead of relying only on conversation memory.
9. When the result becomes stable, choose one exit path:
   - retain in `idea_backlog.md`
   - promote into `sprint_candidates.md`
   - write the durable outcome into `decision_log.md`
   - park it for later with an explicit review trigger
10. If the topic is confirmed as `private-core-owned`, keep only the minimum boundary-safe coordination record in the public PMO and move detailed design work into the private repo documentation set.

## `discussion_index.md` Update Rule

Treat `state/discussion_index.md` as a lifecycle index rather than a step-by-step discussion log.

Update the index when:

- a new batch is opened
- a batch changes lifecycle status in a meaningful way, such as `active -> stable`, `active -> promoted`, `active -> parked`, or `stable -> archived`
- the promotion direction becomes meaningfully clearer
- the current focus changes at a real phase level rather than through ordinary sentence-level discussion refinement

Do not update the index when:

- the batch gains one more stable judgment
- an open question is sharpened
- a slice becomes clearer inside the batch
- normal discussion detail is progressing without a real lifecycle change

## Exit Routing Rule

Choose the exit path based on what became stable:

- Use `idea_backlog.md` when the topic should stay visible as future work, including parked ideas, bugs, or architecture concepts that are not ready to start.
- Use `sprint_candidates.md` only when the slice is bounded enough to compare for near-term execution.
- Use `decision_log.md` when the discussion produced a durable rule, explicit deferral, or rejected path that future PMO work should not rediscover.
- Keep the item in the discussion batch with `parked` status only when it is not yet normalized enough for formal PMO state.

## Stability Standard

A theme is stable enough to leave active discussion when it has:

- a clear problem or opportunity statement
- a directionally stable conclusion
- explicit open questions
- a plausible next PMO action

It does not need to be execution-ready yet.

Possible slices are recommended when:

- the human originally raised multiple concrete directions under one broader topic
- one theme contains more than one plausible future sprint cut
- preserving only the theme would lose execution-relevant grain

Possible slices are not required for every `follow-up` batch.
If the topic is already one concrete residual issue, one theme with one likely next action is enough.

Promotion may happen from the theme level or from the possible-slice level, depending on which level has become stable first.

## Working Rules

- keep discussion useful for recall, not exhaustive architecture prose
- do not let multiple themes drift into simultaneous deep discussion
- let themes cluster related issues without erasing execution-relevant slice boundaries
- let `follow-up` batches stay narrow when the discussion is really about one concrete post-closeout or post-usage issue
- default to record-first shaping rather than early promotion pressure
- do not treat the existence of a plausible slice as a reason to rush discussion into candidate state
- unless the human explicitly asks to converge now, discussion may stay in theme- and slice-shaping mode while the direction is still becoming clear
- when a stable judgment, sharper current focus, or clearer open question appears, write it back into the active batch during the discussion instead of waiting for a final summary pass
- let the batch file absorb normal discussion refinement; do not mirror every refinement into `discussion_index.md`
- once a result is stable, move the long-lived output into formal PMO state instead of leaving discussion as the only source of truth
- if a topic is parked, record why it is parked and what would cause it to be reopened
- if a new follow-up topic appears after closeout or real usage, it is valid to open a new discussion batch instead of forcing it into backlog or candidate immediately
- if a topic is `private-core-owned`, keep the public PMO record narrow and boundary-safe rather than letting private-core design detail accumulate in the public repo

## Policy Touchpoints

- when discussion may produce a durable planning conclusion, check `../policies/decision-capture-policy.md`
- when discussion touches architecture-sensitive or boundary-heavy work, check `../policies/architecture-sensitive-areas.md`
- when discussion shapes AI-dependent behavior, check `../policies/ai-fallback-policy.md`
