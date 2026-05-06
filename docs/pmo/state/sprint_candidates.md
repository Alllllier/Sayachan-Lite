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

### `AI Route Service Split`

- Status: `active`
- Source reference: `follow-up from AI Route Request Validation Cleanup closeout`
- Why now: AI route request validation is now in place, making `backend/src/routes/ai.ts` ready for a behavior-preserving route/service split similar to notes/projects/tasks route boundaries.
- Expected outcome: AI routes become thin Koa handlers that delegate note task draft generation, project next-action generation, chat orchestration, ownership reload, provider calls, response parsing, and fallback behavior to a backend AI service layer without changing public behavior.
- In scope:
  - create an AI service module under `backend/src/services/` or a small `backend/src/services/ai/` folder if the split needs multiple files
  - move route-internal AI business logic out of `backend/src/routes/ai.ts` where it clearly belongs in service code
  - keep `backend/src/routes/ai.ts` responsible for middleware, validated body reads, user id reads, status mapping, and response assignment
  - preserve the existing `backend/src/ai/bridge.ts` boundary and `@allier/sayachan-ai-core` import path
  - preserve note/project ownership reload semantics, provider fallback behavior, chat response shape, and existing logs unless a small log relocation is required by the split
  - update or add backend tests to protect behavior and service boundary coverage
  - update backend dist boundary checks for the new service artifact
- Out of scope:
  - do not change prompts, GLM/Kimi provider payload semantics, fallback copy, or chat response shape
  - do not change private-core or AI bridge behavior
  - do not redesign runtimeControls schema or semantics
  - do not start ESM/import-style modernization
  - do not introduce broad repository/service architecture changes outside the AI route split
- Dependencies: `AI Route Request Validation Cleanup` completed; existing backend dist runtime guard; existing AI route contract tests
- Risk level: `medium`
- Readiness: `ready`
- Start condition: Human selected this candidate for immediate activation.
- Validation expectation:
  - `npm --prefix backend run test`
  - `npm run check`
  - targeted assertions or preserved tests covering note fallback, project next-action ownership reload, and chat/fallback behavior
- Escalation triggers:
  - route/service split would require changing public AI request or response behavior
  - service extraction would require touching private-core or changing the bridge contract
  - fallback behavior or provider payload semantics would need a product decision
  - AI route becomes thinner only by moving an opaque blob without meaningful service boundaries
- Follow-up parking:
  - deeper AI runtimeControls schema normalization
  - future AI service submodule decomposition if the first service extraction remains too large
