# Post-Cutover Scaffold Cleanup Readiness

Status: active reference after backend start dist cutover
Last updated: 2026-05-06

## Current Runtime Truth

- backend `start` builds and runs `node dist/server.js`
- backend `dev` builds and runs `node dist/server.js`
- schema generated/facade scaffolding has been retired
- Notes route generated/facade scaffolding has been retired
- root `npm run check` includes schema island guardrail and backend dist runtime readiness

## Cleanup Readiness

### Schema Island

Schema source-runtime scaffold has been retired:

- `backend/src/routes/schemas/mutations.ts` is now the single schema source
- unified backend build emits `backend/dist/routes/schemas/mutations.js`
- `backend/src/routes/schemas/mutations.js`, `backend/src/routes/schemas/mutations.d.ts`, and `backend/src/routes/schemas/__generated__/mutations.*` are no longer active

Reason:

- backend default runtime and backend tests run from dist
- Projects and Tasks compiled route artifacts require compiled `./schemas/mutations`
- Node cannot require `mutations.ts` directly without introducing a runtime TS loader

Current dist runtime already uses:

- `backend/dist/routes/schemas/mutations.js` emitted from `backend/src/routes/schemas/mutations.ts`

Decision:

- schema scaffold deletion is complete

### Notes Route Island

Notes route source-runtime scaffold has been retired:

- `backend/src/routes/notesRoutes.ts` now lives at the normal route path
- unified backend build emits `backend/dist/routes/notesRoutes.js`
- `backend/src/routes/notesRoutes.js`, `backend/src/routes/__generated__/notesRoutes.js`, `backend/src/routes/__generated__/notesRoutes.d.ts`, and `backend/src/routes/__route_sources__/notesRoutes.ts` are no longer active

Reason:

- backend default runtime and backend tests now run from dist
- `backend/dist/routes/index.js` requires compiled `./notesRoutes`

Decision:

- Notes scaffold deletion is complete

## Safe Follow-Up Options

### Option A: Continue Route TS Migration

Pros:

- expands the proven Notes route pattern to Projects or Tasks
- reduces the number of JS route modules that depend on the schema source facade

Cons:

- broader route migration can touch more behavior at once

## Recommendation

Notes and schema scaffold cleanup is complete. Recommended next step:

- migrate Projects or Tasks routes to TypeScript using the normal source path and unified backend build
