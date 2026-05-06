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

### `AI RuntimeControls Schema Normalization`

- Status: `active`
- Source reference: `AI Route Service Split closeout follow-up`
- Why now: AI route body validation is in place and chat message passthrough has been removed; `runtimeControls` remains the only intentionally shallow AI request field and should now get an explicit public contract.
- Expected outcome: `/ai/chat` validates `runtimeControls` through an explicit Zod schema that matches current frontend payloads, strips unknown fields where safe, and preserves current private-core behavior.
- In scope:
  - audit frontend `buildChatRuntimePayload` and runtime controls store to identify the actual current payload shape
  - update `backend/src/routes/schemas/ai.ts` so `runtimeControls` has explicit known fields instead of `z.unknown()`
  - preserve `lastUserMessage`, `personalityBaseline`, and currently used future slot fields if they are part of the current frontend payload
  - add or adjust backend tests proving unknown runtimeControls fields are stripped while valid current payloads still reach `aiService.chat`
  - update dist/build guard only if schema artifact expectations need sharpening
- Out of scope:
  - do not redesign runtimeControls product semantics
  - do not change frontend controls UI or store behavior
  - do not change private-core prompt filters, AI bridge, provider payloads, fallback copy, or chat response shape
  - do not split `aiService.ts` further
  - do not start ESM/import-style modernization
- Dependencies: AI route validation and AI service split completed; current frontend chat API payload is the source of truth for the first schema
- Risk level: `medium`
- Readiness: `ready`
- Start condition: Human selected this candidate for immediate activation.
- Validation expectation:
  - `npm --prefix backend run test`
  - `npm run check`
  - targeted test that valid current runtimeControls payload is preserved and unknown fields are stripped before service handoff
- Escalation triggers:
  - current frontend payload includes ambiguous nested fields that require a product decision
  - schema normalization would change private-core prompt behavior
  - runtimeControls needs a broader naming/semantics redesign instead of simple validation
- Follow-up parking:
  - future frontend/runtimeControls naming cleanup
  - private-core prompt filter contract documentation if needed after schema stabilization
