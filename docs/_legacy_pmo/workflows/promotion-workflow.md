# PMO Promotion Workflow

> Use this workflow when discussion output is stable enough to enter the formal PMO state system.

---

## Purpose

This workflow decides where a stabilized discussion result belongs:

- `idea_backlog.md`
- `sprint_candidates.md`
- `decision_log.md`

It exists to prevent discussion files from becoming the only source of truth and to prevent premature sprint promotion.

---

## Entry Condition

Use this workflow when a theme or batch result is stable enough that it should no longer live only inside discussion notes.

---

## Promotion Targets

### `idea_backlog.md`

Use for:

- post-batch ideas worth retaining in the formal PMO pipeline
- early ideas already clustered and lightly normalized
- bugs or features that still need dependency, design, or boundary clarification

Entry standard:

- clear title
- clear problem or opportunity
- reason it matters now
- current status
- suggested next PMO action

Do not require full implementation shape yet.

### `sprint_candidates.md`

Use for:

- execution-ready sprint slices that could start soon
- bounded options that can be compared before sprint selection
- items that have already passed the default Codex PMO audit

Entry standard:

- why now
- expected outcome
- in scope
- out of scope
- dependencies
- risk level
- readiness
- start condition

Hard rule:

- keep at most 3 candidates in this file

### `decision_log.md`

Use for:

- durable architecture decisions
- explicit deferrals
- rejected paths
- transition rules future planning should not rediscover

---

## Standard Sequence

1. Confirm the discussion result is stable enough to leave batch-only state.
2. Decide whether the output is primarily:
   - retained but not ready
   - execution-ready
   - a durable decision
3. Write the normalized result into the correct PMO state file.
4. Update the batch file to reflect the promotion outcome.
5. Compress any expanded discussion notes in the batch file into a short promotion record, summary, and target reference so the formal PMO state file becomes the canonical long-lived home.
6. Update `discussion_batches/index.md` if the current focus changes.

---

## Promotion Heuristics

Choose `idea_backlog.md` when:

- implementation design is still incomplete
- dependencies or architecture boundaries still need shaping
- the item is important enough to retain formally but not ready to start

Choose `sprint_candidates.md` when:

- the work is bounded enough to compile into execution
- the likely touch zones are known
- scope is clear enough that implementation could start after human selection

Choose `decision_log.md` when:

- the main output is not "build this soon" but "remember this rule"

---

## Working Rules

- keep `idea_backlog.md` useful, not a dumping ground
- do not promote into `sprint_candidates.md` before the default PMO-level code audit
- replace or merge sprint candidates instead of endlessly stacking them
- after promotion, avoid leaving full duplicated conclusion blocks in the batch file unless the batch record itself is the canonical archive by design
- if a theme's execution-relevant slices have all been promoted into formal PMO state, compress the theme in the batch file to lightweight slice references and promotion records rather than keeping the full deep-discussion narrative
