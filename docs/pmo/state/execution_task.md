# Execution Task

- Status: `active`
- Sprint: `AI Route Request Validation Cleanup`
- Last updated: `2026-05-07`

## Worker Boot Rule

- Before executing, read `AGENT.md` as the repository execution entrypoint.
- Then read this file as the canonical active execution contract.
- Do not plan from `sprint_candidates.md`, `idea_backlog.md`, or broader PMO docs unless this handoff explicitly asks for that context.

## Source Trace

- Candidate source: `post Backend TS Migration Aftercare / Runtime Boundary Cleanup follow-up`
- Related discussion batch: `backend TS migration aftercare closeout`
- Related backlog or decision entries: `none`

## Objective

Validate AI route request bodies through explicit Zod schemas before AI route logic runs, while preserving AI core/private-core behavior, fallback semantics, and public response contracts.

## Safe Touch Zones

- `backend/src/routes/ai.ts`
- `backend/src/routes/schemas/*.ts`
- `backend/test/*.test.js` for AI route contract coverage
- `backend/scripts/checkBackendDistBuild.js` for dist artifact guardrails
- `docs/pmo/state/execution_report.md` for the worker return

## Execution Slices

1. Audit current AI route body usage in `backend/src/routes/ai.ts`, especially `/ai/notes/tasks`, `/ai/projects/next-action`, and `/ai/chat`.
2. Add an AI route schema module under `backend/src/routes/schemas/` with Zod schemas and inferred DTO types for those request bodies.
3. Wire the relevant AI routes through existing `validateBody` and consume `ctx.state.validatedBody` instead of route-local request body casts where practical.
4. Add or update backend tests so invalid AI request bodies return stable 400 responses before downstream model/AI work.
5. Update backend dist boundary checks so the compiled AI schema artifact and AI route schema import are guarded.
6. Run required validation and write the execution report.

## Boundary Notes

- Keep route behavior stable for valid requests.
- Preserve the existing AI bridge and `@allier/sayachan-ai-core` package boundary.
- Preserve fallback behavior when AI provider keys are missing.
- Use the same request validation pattern as product/auth routes: Zod schema plus `validateBody`, raw request body not mutated, service/route logic reads validated DTOs.
- If `runtimeControls` shape is loose today, validate only the currently relied-upon surface and park deeper normalization unless it is required for correctness.

## Non-Goals

- Do not change AI bridge or private-core package boundaries.
- Do not redesign prompt construction, runtimeControls semantics, or AI fallback behavior.
- Do not change chat response shape.
- Do not start ESM/import-style modernization.
- Do not refactor AI route internals beyond what is needed for request validation.

## Deferred Or Parked Follow-Up

- Deeper AI runtimeControls schema normalization.
- Future AI route/service split if route logic remains too dense.
- Broader schema file organization beyond the AI route schema needed here.

## Acceptance Checks

- AI mutation/chat request bodies use explicit Zod schemas.
- Invalid AI body shapes return stable `400` responses before downstream AI/model work.
- Valid request behavior and public response shape remain unchanged.
- Dist runtime guard knows about the new AI schema artifact.
- Non-goals are explicitly confirmed in the report.

## Validation Expectations

- `npm --prefix backend run test`
- `npm run check`

## Out-Of-Scope Confirmation

The worker report should explicitly confirm:

- AI bridge/private-core boundary was not changed.
- Chat response shape was not changed.
- RuntimeControls semantics were not redesigned.
- ESM/import modernization was not started.

## Escalation Points

- Stop and return to PMO/human review if validation would require changing public AI request semantics.
- Stop and return to PMO/human review if runtimeControls needs a larger product decision.
- Stop and return to PMO/human review if private-core or AI bridge changes become necessary.
- Stop and return to PMO/human review if valid AI route behavior changes in tests or smoke output.

## Completion Report Contract

Write the execution report to `docs/pmo/state/execution_report.md`.

Use `docs/pmo/state/templates/execution-report.template.md` as the report shape. The report must state:

- what was delivered
- what validation was performed
- what stayed out of scope
- what remains unverified
- what risks or escalations remain
- documentation-sync recommendation for closeout
