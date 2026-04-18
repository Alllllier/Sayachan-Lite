# PMO Discussion Workflow

> Use this workflow when a topic is still in discovery, clustering, or deep discussion.

---

## Purpose

This workflow covers the pre-backlog phase:

- recording a new discussion wave
- clustering it into themes
- selecting one focus theme
- stabilizing a discussion result
- deciding whether to archive, park, or promote

---

## Entry Condition

Use this workflow when:

- the human raises a new product, architecture, bug, or opportunity topic
- the topic is not yet execution-ready
- multiple related issues need clustering before planning

---

## Canonical Files

- [discussion batch index](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/state/discussion_batches/index.md)
- batch files under `docs/pmo/state/discussion_batches/`

---

## Standard Sequence

1. Create or update the relevant batch entry in `discussion_batches/index.md`.
2. Record clustered themes in a canonical batch file under `discussion_batches/`.
3. Keep themes lightweight: source items, type, tags, risk, maturity, and status.
4. When a clustered theme already contains multiple plausible execution directions, record lightweight `possible slices` under that theme so later promotion does not require rediscovering the original implementation grain.
5. Allow only one `in_focus` theme per batch at a time.
6. Deepen discussion only on the active focus theme.
7. When the focused discussion becomes stable, do one of:
   - archive it in the batch
   - park it
   - promote it into a formal PMO state file
8. If the theme proves to be private-core-owned, move detailed design into the private repo and leave only a boundary-safe public-side summary.
9. If the theme is promoted into a formal PMO state file, compress the batch record to a short promotion summary and reference instead of preserving the full expanded discussion indefinitely.

---

## Theme Status Rule

- `clustered`: grouped and tagged, not yet deeply discussed
- `in_focus`: currently being explored in depth
- `archived`: discussion result is stable inside the batch record
- `parked`: intentionally not pursued right now
- `promoted`: migrated into formal PMO state

---

## Discussion Output Standard

A theme is stable enough to leave active discussion when it has:

- a clear problem or opportunity statement
- a directionally stable product or architecture conclusion
- known open questions called out explicitly
- a plausible next PMO action

It does not need to be execution-ready yet.

Possible slices are optional, but recommended when:

- the human originally raised multiple concrete directions under one shared topic
- different sub-slices may later enter backlog or candidate state independently
- collapsing everything into one theme would lose execution-relevant granularity

---

## Exit Paths

Promote into:

- `idea_backlog.md` when the result is worth retaining but still needs more shaping
- `sprint_candidates.md` when the result is bounded and execution-ready
- `decision_log.md` when the main output is a durable decision, deferral, or rejection

---

## Working Rules

- keep clustering lightweight rather than over-normalized
- do not let multiple themes drift into simultaneous deep discussion within the same batch
- keep discussion files useful for recall, not for exhaustive architecture prose
- only promote after the relevant theme or batch result is actually stable
- after promotion, prefer a compact promotion record in the batch file over duplicated detailed conclusions that now live in formal PMO state
- use `possible slices` to preserve execution-relevant granularity when a single theme still contains multiple likely future sprint cuts
