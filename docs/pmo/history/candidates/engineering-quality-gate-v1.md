# Engineering Quality Gate V1

- Archived date: `2026-05-05`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_018.md#slice-001`
- Why it mattered: The repo now has frontend, backend, private-core boundary coordination, PMO runtime state, browser/UI review baselines, and growing worker handoff complexity. Before TypeScript, runtime schema, or workspace tooling work begins, the project needs one low-noise root-level validation path so workers can verify ordinary changes without guessing which frontend/backend commands apply.
- Expected outcome: The repo gains a root-level engineering quality gate that can run the existing frontend/backend health checks from one entrypoint, plus a low-noise lint baseline and CI path that reflects repo-native validation expectations without changing product behavior.
- In scope:
  `Add or update root-level project scripts for check/test/build/lint aggregation; add frontend/backend lint scripts and a low-noise ESLint flat config suitable for current Vue/JS and Node/CommonJS code; add a minimal CI workflow that installs frontend/backend dependencies and runs the root check path; update worker-facing docs only as needed to point to the new default validation command.`
- Out of scope:
  `No TypeScript migration, no allowJs/checkJs baseline, no runtime schema library adoption, no npm/pnpm workspace migration, no Turborepo/Nx, no Prettier or broad formatting pass, no executable product behavior changes, no UI review expansion, no deployment-platform redesign, and no private-core implementation changes.`
- Dependencies: Current frontend/backend package scripts; AGENT.md execution rules; discussion_batch_018 modernization discussion; completed TypeScript target architecture mapping as context only, not as implementation scope.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Run the new root quality gate after implementation. The gate should include existing frontend unit tests, backend tests, frontend build, and lint. UI review should remain a separate explicit command unless PMO/human expands scope.`
- Escalation triggers:
  `Return to PMO/human review if implementation requires package-manager workspace migration, broad formatting churn, TypeScript configuration, replacing test frameworks, changing deployment behavior, or editing product runtime code to satisfy lint instead of tuning the lint baseline.`
- Follow-up parking:
  `Route TypeScript typecheck baseline, runtime schema guardrails, workspace tooling, stricter lint rules, formatter adoption, or UI-review CI inclusion as separate future candidates/backlog items.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Root npm run check now aggregates low-noise lint, frontend tests, backend tests, and frontend build. Minimal GitHub Actions CI runs the same root gate, frontend/backend package-local lint scripts delegate to the root config, worker-facing validation docs now point ordinary validation to npm run check, and README Node.js prerequisites are aligned with the CI Node 22 baseline. UI review remains an explicit separate path. Remote GitHub Actions execution and stricter future gates remain outside this closeout.`
