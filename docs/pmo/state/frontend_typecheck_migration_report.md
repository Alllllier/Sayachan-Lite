# Frontend Typecheck Migration Report

- Updated date: `2026-05-07`
- Worker: `Worker C`
- Scope: frontend TypeScript automation support layer and PMO reporting only.

## Command Boundary

- Canonical frontend command:
  - `npm --prefix frontend run typecheck`
  - frontend script target: `tsc -p tsconfig.typecheck.json`
- Root command:
  - `npm run typecheck:frontend`
  - delegates to the frontend canonical command.
- Compatibility alias:
  - root `npm run typecheck:tasks` delegates to `typecheck:frontend`
  - frontend `npm run typecheck:tasks` delegates to `typecheck`
  - `frontend/tsconfig.task-service.json` now extends `frontend/tsconfig.typecheck.json` so old direct config usage does not fork coverage.
- Root `npm run check` remains unchanged and does not include `typecheck:frontend`.

## Current Include Coverage

| Area | Files | Status |
| --- | --- | --- |
| Migration shims | `frontend/src/types/typecheck-shims.d.ts` | Included as temporary scaffolding. |
| Shared support | `frontend/src/services/apiClient.js` | Included. |
| Existing task service pilot | `frontend/src/services/tasks/index.js`, `task.rules.js`, `task.api.js`, `task.runtime.js` | Included. |
| Auth API island | `frontend/src/features/auth/auth.api.js` | Included. |
| Chat API/rules island | `frontend/src/features/chat/chat.api.js`, `chat.rules.js` | Included. |
| Dashboard rules island | `frontend/src/features/dashboard/dashboard.rules.js` | Included. |
| Notes API/rules island | `frontend/src/features/notes/notes.api.js`, `notes.rules.js` | Included. |
| Projects API/rules island | `frontend/src/features/projects/projects.api.js`, `projects.rules.js` | Included. |

## Scaffolding Notes

- `noResolve: true` remains a migration guard, not a final frontend TypeScript architecture decision.
- `frontend/src/types/typecheck-shims.d.ts` provides only the minimal ambient support needed by the current checked JS islands:
  - `vue` `ref` shape for the task runtime pilot.
  - `ImportMeta.env.VITE_API_BASE_URL` for `apiClient.js`.
- The older task-service-local shim path was removed so the temporary shim has one canonical home under `frontend/src/types/`.

## Candidate Matrix

| Candidate | Gate | PMO/Human Decision Needed |
| --- | --- | --- |
| Add more pure rules islands | Low risk when imports stay local and explicit. | PMO can batch by feature after confirming island list. |
| Add more API modules | Medium risk because response shapes are currently loose and shared transport assumptions may surface. | Human/PMO should decide whether API response DTOs become explicit before broad expansion. |
| Remove `noResolve` | High risk because it turns the command from explicit island checking into import-graph checking. | Human architecture decision required. |
| Replace `vue` shim with real Vue typing | Medium risk; may pull broader Vue/SFC support expectations into the command. | Human/PMO should decide when frontend-wide Vue typing belongs in scope. |
| Add `typecheck:frontend` to root `check` | Product/process risk because it changes the main quality gate. | Human approval required; explicitly not done in this slice. |

## Validation

- `npm --prefix frontend run typecheck`: passed.
- `npm run typecheck:frontend`: passed.

## Vue SFC Probe

- `vue-tsc` is not installed in the frontend dependency set.
- Temporary probe used `npm exec --package vue-tsc` with a temp tsconfig outside the repo.
- Minimal SFC-only check passed for `frontend/src/**/*.vue`.
- This is a feasibility signal only; no `vue-tsc` dependency, script, SFC fixes, or root gate change was introduced.
