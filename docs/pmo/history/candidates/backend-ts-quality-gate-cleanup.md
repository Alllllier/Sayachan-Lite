# Backend TS Quality Gate Cleanup

- Archived date: `2026-05-07`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `Backend TypeScript migration audit follow-up, 2026-05-07; discussion_batch_018 backend migration lessons`
- Why it mattered: The backend TypeScript runtime migration is complete enough that remaining high-signal cleanup is now in quality gates rather than runtime source conversion. The audit found backend/src TS source is not covered by ESLint and one dist guard still scans src/**/*.js, which has become a no-op after the TS cutover.
- Expected outcome: Backend TS source participates in repo-native linting, and the backend dist guard verifies current src/**/*.ts files emit corresponding dist/**/*.js artifacts instead of relying on a stale src/**/*.js scan.
- In scope:
  `Update ESLint/root lint scripts/config so backend/src/**/*.ts is linted with a low-noise TypeScript-aware setup; add only the dev dependencies needed for TS ESLint if required; update backend/scripts/checkBackendDistBuild.cjs so source-to-dist artifact coverage scans active TypeScript source files; keep existing dist runtime checks green; update narrow docs only if command usage changes.`
- Out of scope:
  `No private_core typing, no AI bridge contract redesign, no public DTO tightening, no route middleware state refactor, no broad lint strictness escalation, no frontend TypeScript work, no behavior changes, no runtime route/service/model changes.`
- Dependencies: Backend TS/ESM migration and Route Middleware Typing Cleanup completed; root npm run check currently passes; backend dist runtime guard is already the canonical backend runtime verification path.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Human explicitly approved creating and activating this candidate after reviewing the backend TS migration audit.
- Validation expectation:
  `Run npm run lint:backend, npm --prefix backend run check:backend-dist-runtime, and npm run check. Report any newly surfaced lint issues separately from behavior/runtime failures.`
- Escalation triggers:
  `Return to PMO/human review before enabling noisy lint rules, changing backend runtime behavior, changing public API/DTO shapes, pulling private_core into backend lint/build, or refactoring route middleware state beyond what the guard/lint cleanup requires.`
- Follow-up parking:
  `After closeout, route private_core bridge typing, public DTO tightening, and route middleware state assertion refinement as separate candidates or backlog items if the human wants to continue backend TS hardening.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
