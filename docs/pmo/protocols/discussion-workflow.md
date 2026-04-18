# Discussion Workflow

> Use this workflow when a topic is still in discovery, clustering, or deep discussion.

## Purpose

This workflow covers the pre-backlog phase:

- recording a new discussion wave
- clustering related themes
- selecting one active focus area
- preserving execution-relevant slice granularity inside a theme
- stabilizing the discussion result
- deciding whether to park it, retain it, or promote it

## Entry Condition

Use this workflow when:

- the human raises a new product, architecture, bug, or opportunity topic
- the topic is not yet execution-ready
- multiple related issues need clustering before planning

## Standard Sequence

1. Record the discussion in `state/discussion_index.md` and the active batch file under `state/discussions/`.
2. Cluster related themes lightly instead of over-normalizing them.
3. When a theme still contains multiple plausible execution directions, preserve them under `Possible Slices`.
4. Keep only one active focus theme at a time.
5. Deepen discussion only on the active focus theme.
6. When the result becomes stable, choose one exit path:
   - retain in `idea_backlog.md`
   - promote into `sprint_candidates.md`
   - write the durable outcome into `decision_log.md`
   - park it for later
7. If the topic is confirmed as `private-core-owned`, keep only the minimum boundary-safe coordination record in the public PMO and move detailed design work into the private repo documentation set.

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

Promotion may happen from the theme level or from the possible-slice level, depending on which level has become stable first.

## Working Rules

- keep discussion useful for recall, not exhaustive architecture prose
- do not let multiple themes drift into simultaneous deep discussion
- let themes cluster related issues without erasing execution-relevant slice boundaries
- once a result is stable, move the long-lived output into formal PMO state instead of leaving discussion as the only source of truth
- if a topic is `private-core-owned`, keep the public PMO record narrow and boundary-safe rather than letting private-core design detail accumulate in the public repo
