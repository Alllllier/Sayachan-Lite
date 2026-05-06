# Execution Task

- Status: `active`
- Sprint: `AI RuntimeControls Schema Normalization`
- Last updated: `2026-05-07`

## Worker Boot Rule

- Before executing, read `AGENT.md` as the repository execution entrypoint.
- Then read this file as the canonical active execution contract.
- Do not plan from `sprint_candidates.md`, `idea_backlog.md`, or broader PMO docs unless this handoff explicitly asks for that context.

## Source Trace

- Candidate source: `AI Route Service Split closeout follow-up`
- Related discussion batch: `AI route validation/service split aftercare`
- Related backlog or decision entries: `none`

## Objective

Give `/ai/chat` `runtimeControls` an explicit Zod schema that matches current frontend payloads, strips unknown fields where safe, and preserves current private-core behavior.

## Safe Touch Zones

- `frontend/src/features/chat/chat.api.js`
- `frontend/src/stores/runtimeControls.js`
- `backend/src/routes/schemas/ai.ts`
- `backend/test/*.test.js`
- `backend/scripts/checkBackendDistBuild.js` only if schema artifact checks need sharpening
- `docs/pmo/state/execution_report.md`

## Execution Slices

1. Audit the current frontend runtimeControls payload built by `buildChatRuntimePayload` and the runtime controls store.
2. Define the smallest explicit backend Zod schema for the current payload shape in `backend/src/routes/schemas/ai.ts`.
3. Keep existing valid current payloads flowing to `aiService.chat` without behavior changes.
4. Strip unknown runtimeControls fields before service handoff, following the no-passthrough boundary principle.
5. Add or update backend tests covering preserved known fields and stripped unknown fields.
6. Run validation and write the execution report.

## Boundary Notes

- Treat the current frontend payload as the source of truth for this first schema.
- Be conservative with nested fields: if a nested field has current frontend meaning, model it explicitly; if not, strip it.
- Preserve private-core input behavior for known fields such as baseline/last user message/future slot values currently sent by frontend.
- This sprint is validation/contract normalization, not product semantics redesign.

## Non-Goals

- Do not redesign runtimeControls product semantics.
- Do not change frontend controls UI or store behavior.
- Do not change private-core prompt filters, AI bridge, provider payloads, fallback copy, or chat response shape.
- Do not split `aiService.ts` further.
- Do not start ESM/import-style modernization.

## Deferred Or Parked Follow-Up

- Future frontend/runtimeControls naming cleanup.
- Private-core prompt filter contract documentation if schema stabilization reveals useful durable terminology.

## Acceptance Checks

- `runtimeControls` is no longer `z.unknown()` in `backend/src/routes/schemas/ai.ts`.
- Current frontend chat payload remains valid.
- Unknown runtimeControls fields are stripped before `aiService.chat`.
- Existing AI route/service tests still pass.
- Non-goals are explicitly confirmed in the report.

## Validation Expectations

- `npm --prefix backend run test`
- `npm run check`

## Out-Of-Scope Confirmation

The report should explicitly confirm:

- RuntimeControls product semantics were not redesigned.
- Frontend UI/store behavior was not changed.
- Private-core/AI bridge/provider payload/fallback/chat response shape were not changed.
- `aiService.ts` was not split further.

## Escalation Points

- Stop and return to PMO/human review if current frontend payload includes ambiguous nested fields requiring a product decision.
- Stop and return to PMO/human review if schema normalization would change private-core prompt behavior for known fields.
- Stop and return to PMO/human review if the work becomes a naming/semantics redesign instead of simple validation.

## Completion Report Contract

Write the execution report to `docs/pmo/state/execution_report.md`.

Use `docs/pmo/state/templates/execution-report.template.md` as the report shape. The report must state:

- what was delivered
- what validation was performed
- what stayed out of scope
- what remains unverified
- what risks or escalations remain
- documentation-sync recommendation for closeout
