# Risk and Debt Tracking Checklist

Use this list to decide what must appear in sprint closeout, PMO reply, or next sprint planning.

## Materiality Rule

Track an item only if it can affect one of these:

- architecture safety
- sprint sequencing
- delivery confidence
- cross-lane coupling
- future migration cost

## Risk Checklist

Check each lane briefly.

### AI core

- model or prompt behavior is unstable
- agent routing or tool boundaries are unclear
- evaluation coverage is weak
- fallback behavior is undefined
- hidden token, latency, or cost growth exists

### Product runtime

- runtime contract is ambiguous
- backend and frontend assumptions diverge
- observability is missing for a critical path
- partial delivery creates a broken user state
- rollout or migration path is not defined

### Future labs

- experiment depends on unproven architecture
- lab work is leaking into committed runtime scope
- prototype code may become accidental production code
- ownership or exit criteria are unclear

## Debt Checklist

- temporary workaround lacks a removal condition
- duplicated logic exists across lanes
- naming or boundary decisions are inconsistent
- documentation lags behind architecture reality
- validation is manual where repetition is expected
- open questions are sitting in code instead of tracked decisions

## Tracking Format

Record each item in one line:

`[Risk|Debt] <id> - <area> - <impact> - owner:<name> - next:<action>`

## PMO Decision Rule

- If the item blocks current sprint completion, escalate now
- If the item threatens the next sprint, include it in the proposal
- If the item is real but non-blocking, keep it in the snapshot only
