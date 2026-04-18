# Promotion Workflow

> Use this workflow when a stable discussion result should enter the formal PMO state system.

## Purpose

This workflow decides whether a stabilized result belongs in:

- `idea_backlog.md`
- `sprint_candidates.md`
- `decision_log.md`

Its job is to prevent discussion notes from becoming the only source of truth and to prevent premature sprint promotion.

## Entry Condition

Use this workflow when a theme or discussion result is stable enough that it should no longer live only inside discussion notes.

## Promotion Targets

### `idea_backlog.md`

Use for:

- retained ideas worth keeping in formal PMO state
- issues that still need shaping, dependency clarification, or boundary clarification

### `sprint_candidates.md`

Use for:

- bounded sprint slices that could start soon
- execution-ready options that can be compared before human selection

Hard rules:

- keep at most 3 candidates
- candidate drafting does not equal candidate confirmation
- sprint activation still requires explicit human selection

### `decision_log.md`

Use for:

- durable planning decisions
- explicit deferrals
- rejected paths
- transition rules future PMO work should not rediscover

## Standard Sequence

1. Confirm the result is stable enough to leave discussion-only state.
2. Decide whether the result is primarily:
   - retained but not ready
   - candidate-ready
   - a durable decision
3. Write the normalized result into the correct PMO state file.
4. If a durable decision was produced, ensure it is written into `decision_log.md` rather than left only in discussion records.

## Working Rules

- keep `idea_backlog.md` useful, not a dumping ground
- do not promote into `sprint_candidates.md` before the slice is genuinely bounded
- do not treat generic momentum or implied urgency as human authorization to activate a sprint
