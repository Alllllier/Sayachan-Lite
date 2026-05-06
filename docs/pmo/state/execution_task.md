# Execution Task

- Status: `active`
- Sprint: `AI Route Service Split`
- Last updated: `2026-05-07`

## Worker Boot Rule

- Before executing, read `AGENT.md` as the repository execution entrypoint.
- Then read this file as the canonical active execution contract.
- Do not plan from `sprint_candidates.md`, `idea_backlog.md`, or broader PMO docs unless this handoff explicitly asks for that context.

## Source Trace

- Candidate source: `follow-up from AI Route Request Validation Cleanup closeout`
- Related discussion batch: `AI route validation and backend TS aftercare`
- Related backlog or decision entries: `none`

## Objective

Make `backend/src/routes/ai.ts` a thin Koa route layer by extracting AI business logic into a backend AI service layer, without changing public AI behavior.

## Safe Touch Zones

- `backend/src/routes/ai.ts`
- `backend/src/services/aiService.ts` or `backend/src/services/ai/*.ts`
- `backend/src/routes/schemas/ai.ts` only if type wiring needs small adjustment
- `backend/test/*.test.js` for preserved route/service behavior coverage
- `backend/scripts/checkBackendDistBuild.js` for dist artifact guardrails
- `docs/pmo/state/execution_report.md` for the worker return

## Execution Slices

1. Audit `backend/src/routes/ai.ts` and identify logic that is business/service work rather than route work.
2. Create the AI service boundary and move note task draft generation, project next-action generation, chat orchestration, ownership reload helpers, provider fetch parsing, and fallback helpers where appropriate.
3. Keep `ai.ts` responsible for route registration, middleware, reading `validatedBody`/`userId`, mapping not-found outcomes to `404`, and assigning `ctx.body`.
4. Preserve route `__test__` exports only if tests still need route-local helpers; otherwise prefer service-level exports for service helpers.
5. Update backend dist boundary checks to require the new service artifact and preserve AI bridge package boundary.
6. Run validation and write the execution report.

## Boundary Notes

- Do not edit `backend/src/ai/bridge.ts` or `backend/private_core/sayachan-ai-core/**`.
- Keep `@allier/sayachan-ai-core` imported only through the existing public bridge.
- Preserve current note/project ownership reload behavior: persisted `_id` payloads must reload owned records by current user before prompt/fallback use.
- Preserve GLM/Kimi provider request behavior, prompt text, fallback copy, logs, and chat response shape unless the move requires mechanically relocating code.
- A small `backend/src/services/aiService.ts` is preferred for this sprint unless the extracted code naturally needs a tiny `services/ai/` folder.

## Non-Goals

- Do not change prompts, provider payload semantics, fallback copy, or chat response shape.
- Do not change private-core or AI bridge behavior.
- Do not redesign runtimeControls schema or semantics.
- Do not start ESM/import-style modernization.
- Do not introduce broad repository/service architecture changes outside the AI route split.

## Deferred Or Parked Follow-Up

- Deeper AI runtimeControls schema normalization.
- Future AI service submodule decomposition if the first service extraction remains too large.
- Future prompt/provider adapter split if service code still feels dense after this sprint.

## Acceptance Checks

- `backend/src/routes/ai.ts` is materially thinner and delegates service behavior.
- Existing note/project AI ownership tests still pass.
- Existing AI fallback behavior remains stable.
- Chat route response shape remains `{ reply }`.
- Dist runtime guard knows about the AI service artifact.
- Non-goals are explicitly confirmed in the report.

## Validation Expectations

- `npm --prefix backend run test`
- `npm run check`

## Out-Of-Scope Confirmation

The worker report should explicitly confirm:

- AI bridge/private-core boundary was not changed.
- Prompt text/provider payload semantics/fallback copy were not intentionally changed.
- Chat response shape was not changed.
- RuntimeControls semantics were not redesigned.
- ESM/import modernization was not started.

## Escalation Points

- Stop and return to PMO/human review if the split would require changing public AI request or response behavior.
- Stop and return to PMO/human review if service extraction requires touching private-core or changing the bridge contract.
- Stop and return to PMO/human review if fallback behavior or provider payload semantics need a product decision.
- Stop and return to PMO/human review if the only possible extraction is an opaque copy-paste blob with no meaningful route boundary.

## Completion Report Contract

Write the execution report to `docs/pmo/state/execution_report.md`.

Use `docs/pmo/state/templates/execution-report.template.md` as the report shape. The report must state:

- what was delivered
- what validation was performed
- what stayed out of scope
- what remains unverified
- what risks or escalations remain
- documentation-sync recommendation for closeout
