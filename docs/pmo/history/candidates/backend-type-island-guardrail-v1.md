# Backend Type-Island Guardrail V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/backend-schema-typed-island-pilot.md`, `docs/pmo/state/decision_log.md#backend-typed-islands-may-use-transitional-generated-commonjs-artifacts`
- Why it mattered: The backend now has its first TypeScript schema island, with mutations.ts as source of truth and checked-in generated CommonJS artifacts under schemas/__generated__. Before expanding TypeScript further, the migration bridge needs a small guardrail so generated artifacts cannot silently drift from the TS source.
- Expected outcome: Add a clear validation path and worker-facing convention that detects or prevents stale schema-island generated artifacts, while keeping the backend runtime plain CommonJS and avoiding new TypeScript migration scope.
- In scope:
  `Review the current schema-island scripts; decide whether root npm run check should include backend DTO/schema-island validation or whether a named engineering check is better; add the smallest useful script or check that catches mutations.ts/generated artifact drift; document the regenerate rule in the appropriate PMO/baseline or worker-facing surface if needed; keep existing route imports and public API behavior unchanged.`
- Out of scope:
  `No new TypeScript island; no route/service/model .ts conversion; no full-backend dist runtime; no tsx/ts-node runtime loader; no package workspace migration; no Zod behavior changes; no request/response contract changes; no frontend work.`
- Dependencies: Completed Backend Schema Typed Island Pilot; current backend-local TypeScript scripts; generated CommonJS facade convention.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run the schema-island build/check path chosen by the slice, backend DTO typecheck if retained, focused route contract tests if touched, npm --prefix backend test if backend scripts change, and npm run check if the default quality gate is changed. Confirm stale generated artifacts are caught or the regenerate rule is mechanically enforced.`
- Escalation triggers:
  `Return to PMO if the guardrail requires changing backend runtime startup, deleting the transitional generated artifact pattern, broadening TypeScript into routes/services, or making npm run check meaningfully slower or noisy enough to need a human tradeoff.`
- Follow-up parking:
  `After closeout, decide whether to proceed with another tiny schema island, retire the older DTO pilot shape, or pause TypeScript expansion until a broader backend build/runtime plan is discussed.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
