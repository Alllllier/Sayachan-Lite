# Schema Island Unified Build Inclusion V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/private-core-package-import-boundary-v1.md`, `docs/pmo/history/reports/schema-island-unified-build-inclusion-prep-v1.md`
- Why it mattered: Private core is now consumed through the @allier/sayachan-ai-core package boundary, so normal TypeScript resolution no longer has to pull backend/private_core into the backend build. This unblocks retrying schema TS inclusion in the unified backend dry-run.
- Expected outcome: Update the unified backend tsc dry-run so dist/routes/schemas/mutations.js is emitted from mutations.ts while preserving the source-runtime mutations.js facade and checked-in schema generated artifacts.
- In scope:
  `Adjust backend/tsconfig.json include/exclude/resolution settings as narrowly as possible; update backend dist build guard expectations if needed; keep schema island guardrails active; update PMO report.`
- Out of scope:
  `No deletion of schema facade/generated artifacts; no source runtime import changes; no runtime cutover; no Notes route migration; no route/service/model migration; no ESM/runtime loader/root check expansion; no API/Zod behavior change.`
- Dependencies: Private Core Package Import Boundary V1 completed; current schema island guard remains active.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Codex may activate under delegated PMO automation authority.
- Validation expectation:
  `Run npm --prefix backend run check:schema-island, npm --prefix backend run check:backend-build, npm run lint:backend, and npm --prefix backend test. Run npm run check if all scoped checks pass.`
- Escalation triggers:
  `Return to human if this requires deleting facade/generated artifacts, changing source runtime imports, including private_core in backend dist, switching runtime/module systems, adding runtime loaders, or changing public API/Zod behavior.`
- Follow-up parking:
  `If complete, next likely slice is Notes route unified-build inclusion prep or schema island retirement planning behind a separate deletion gate.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
