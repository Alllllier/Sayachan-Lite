# Post-Cutover Scaffold Cleanup Readiness

Status: active reference after backend start dist cutover
Last updated: 2026-05-06

## Current Runtime Truth

- backend `start` builds and runs `node dist/server.js`
- backend `dev` still runs `node src/server.js`
- schema and Notes generated/facade scaffolding still exists
- root `npm run check` still includes schema and Notes island guardrails
- root `npm run check` does not include `check:backend-dist-runtime`

## Cleanup Readiness

### Schema Island

Current source runtime still needs:

- `backend/src/routes/schemas/mutations.js`
- `backend/src/routes/schemas/__generated__/mutations.js`
- `backend/src/routes/schemas/__generated__/mutations.d.ts`

Reason:

- Projects and Tasks source routes still require `./schemas/mutations`
- backend `dev` runs source runtime
- Node cannot require `mutations.ts` directly without introducing a runtime TS loader

Current dist runtime already uses:

- `backend/dist/routes/schemas/mutations.js` emitted from `backend/src/routes/schemas/mutations.ts`

Decision:

- schema scaffold deletion is not ready while `dev` remains source-based

### Notes Route Island

Current source runtime still needs:

- `backend/src/routes/notesRoutes.js`
- `backend/src/routes/__generated__/notesRoutes.js`
- `backend/src/routes/__generated__/notesRoutes.d.ts`
- `backend/src/routes/__route_sources__/notesRoutes.ts`

Reason:

- `backend/src/routes/index.js` requires `./notesRoutes`
- backend `dev` runs source runtime
- moving the TS route to the normal source path broke generated artifact relative imports during the previous probe

Decision:

- Notes scaffold deletion is not ready while `dev` remains source-based

## Safe Follow-Up Options

### Option A: Keep Dev Source-Based And Keep Scaffolding

Pros:

- lowest risk
- preserves current developer workflow
- no runtime loader needed

Cons:

- schema/Notes generated scaffolding stays longer
- source and dist runtime paths remain different

### Option B: Switch Dev To Build-Backed Dist Runtime

Pros:

- source runtime no longer needs generated/facade scaffolding
- cleanup becomes much simpler
- start and dev align around dist runtime

Cons:

- changes developer workflow
- may need watch/restart ergonomics later

### Option C: Add A Runtime TS Loader For Dev

Pros:

- could let source dev require TS directly

Cons:

- explicitly outside the current migration direction
- adds runtime complexity
- was previously human-gated

## Recommendation

Do not delete schema or Notes scaffolding yet.

Recommended next decision:

- decide whether backend `dev` should remain source-based for now or switch to a build-backed dist workflow

Recommended operational hardening:

- consider adding `npm --prefix backend run check:backend-dist-runtime` to root `npm run check` now that backend `start` uses dist

Both are human-visible decisions because they affect developer workflow or root check cost.
