# Sprint Candidates

> Up to 3 bounded sprint options that are ready for human comparison before activation.

## Working Rules

- use this file as the comparison surface for future sprint options, not as the active execution brief
- keep at most 3 total entries in this file
- a candidate may be drafted by Codex, but it does not become the active sprint without explicit human selection
- replace or merge weaker candidates instead of stacking endlessly
- if a candidate is selected, keep it visible here only as the selected option while also activating `current_sprint.md` and writing the corresponding `execution_task.md`
- during execution, do not expand the candidate entry into a worker brief; detailed touch zones, validation expectations, report contract, and escalation points belong in `execution_task.md`
- after sprint closeout, archive the selected candidate into `../history/candidates/` and remove it from this file by default
- keep source trace visible so the selected sprint can be tied back to its discussion, backlog, or decision context

## File Role

`sprint_candidates.md` answers: what could be selected next?

It should contain bounded options that are ready or almost ready for human comparison. It may retain a selected active entry for traceability while execution is running, but it is not the current-state card, the execution contract, or the closeout history.

Do not use this file to store:

- the active sprint phase
- full worker instructions
- detailed validation reporting
- completed-sprint history

## Candidate Template

### `<sprint name>`

- Status: `candidate | active`
- Source reference:
- Why now:
- Expected outcome:
- In scope:
- Out of scope:
- Dependencies:
- Risk level: `low | medium | high`
- Readiness: `ready | almost-ready | blocked`
- Start condition:
- Validation expectation:
- Escalation triggers:
- Follow-up parking:

## Current Candidates

### `AI Route Request Validation Cleanup`

- Status: `active`
- Source reference: `post Backend TS Migration Aftercare / Runtime Boundary Cleanup follow-up`
- Why now: Product mutation routes and auth mutation routes now use Zod-backed `validateBody`; `backend/src/routes/ai.ts` is the remaining backend route surface still using route-local request body casts for externally supplied payloads.
- Expected outcome: AI route request bodies are validated through explicit route schemas before route logic runs, while AI core/private-core behavior and public response contracts stay stable.
- In scope:
  - add AI route request schemas under `backend/src/routes/schemas/`
  - wire `/ai/notes/tasks`, `/ai/projects/next-action`, and `/ai/chat` through the existing `validateBody` middleware
  - replace route-local request body casts with validated DTO reads where practical
  - add or adjust backend route tests for invalid AI bodies stopping before AI/service work
  - update backend dist boundary checks for the new AI schema artifact
- Out of scope:
  - do not change AI bridge or private-core package boundaries
  - do not redesign prompt/runtimeControls behavior
  - do not change chat response shape or AI fallback semantics
  - do not begin ESM/import-style modernization
- Dependencies: `validateBody`, public HTTP error boundary, backend dist runtime check
- Risk level: `medium`
- Readiness: `ready`
- Start condition: Human selected this candidate for immediate activation.
- Validation expectation:
  - `npm --prefix backend run test`
  - `npm run check`
  - targeted contract assertions that invalid AI request bodies return stable 400s before downstream AI/model work
- Escalation triggers:
  - schema design would require changing public AI request semantics
  - runtimeControls payload needs a larger product decision
  - validation would force private-core or AI bridge changes
- Follow-up parking:
  - deeper AI runtimeControls schema normalization
  - future AI route/service boundary split if route logic remains too dense
