# Post-Cutover Scaffold Cleanup Readiness

Status: active reference after backend start dist cutover
Last updated: 2026-05-06

## Current Runtime Truth

- backend `start` builds and runs `node dist/server.js`
- backend `dev` builds and runs `node dist/server.js`
- schema generated/facade scaffolding still exists
- Notes route generated/facade scaffolding has been retired
- root `npm run check` includes schema island guardrail and backend dist runtime readiness

## Cleanup Readiness

### Schema Island

Current source runtime still needs:

- `backend/src/routes/schemas/mutations.js`
- `backend/src/routes/schemas/__generated__/mutations.js`
- `backend/src/routes/schemas/__generated__/mutations.d.ts`

Reason:

- Projects and Tasks source routes still require `./schemas/mutations`
- backend `dev` runs dist runtime, but Projects and Tasks source files still keep the source schema facade in place until schema cleanup
- Node cannot require `mutations.ts` directly without introducing a runtime TS loader

Current dist runtime already uses:

- `backend/dist/routes/schemas/mutations.js` emitted from `backend/src/routes/schemas/mutations.ts`

Decision:

- schema scaffold deletion is now a cleanup candidate, but should happen in its own focused slice

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

### Option A: Retire Schema Scaffold

Pros:

- removes the remaining generated/facade source compatibility layer
- lets schema TS source become the direct build/runtime source of truth

Cons:

- requires updating Projects and Tasks source route imports or moving them toward TS/dist-only assumptions

### Option B: Continue Route TS Migration

Pros:

- expands the proven Notes route pattern to Projects or Tasks
- reduces the number of JS route modules that depend on the schema source facade

Cons:

- broader route migration can touch more behavior at once

## Recommendation

Notes scaffold cleanup is complete. Recommended next step:

- retire the remaining schema generated/facade scaffold in a focused slice, or first migrate Projects/Tasks routes to reduce dependency on the source schema facade
