# Backend TS Build Boundary Decision Prep

Status: decision resolved by `Private Core Package Import Boundary V1`
Last updated: 2026-05-08

## Why This Exists

The schema island unified-build prep found that adding TS sources to the unified backend build is not just a schema problem.

Two constraints collide:

- TS source files previously included `backend/src/routes/schemas/mutations.ts`, which needed normal module resolution for dependencies such as `zod`. Product request schemas now live in `packages/contracts/src/product.ts`.
- Normal module resolution previously followed the public private-core bridge into `backend/private_core/sayachan-ai-core`, which is outside the approved backend build boundary.

Historical blocker: the earlier `backend/tsconfig.json` kept `noResolve: true` as a temporary dry-run guard. That prevented accidental private-core inclusion, but it also prevented the unified backend build from cleanly owning TS sources that need dependency resolution. Current state: backend normal NodeNext resolution is enabled, backend imports private core through the `@allier/sayachan-ai-core` package boundary, and `backend/private_core/**` remains outside `backend/dist`.

## Current Facts

- Backend runtime is compiled ESM dist runtime: `node dist/server.js`.
- Backend package is ESM (`"type": "module"`).
- Unified backend dist build is the production/start runtime path.
- the backend private-core bridge imports private core through the package boundary:
  - `@allier/sayachan-ai-core`
- `backend/private_core/**` is human-gated and must not be silently absorbed into backend dist.
- Schema and Notes generated/facade scaffolding has been retired.

## Observed Blockers

Directly adding `mutations.ts` beside `mutations.js` is blocked because both emit to:

- `dist/routes/schemas/mutations.js` in the older route-local schema-island plan

Excluding the JS facade and letting the TS source own that dist output requires normal dependency resolution. When normal resolution is enabled, TypeScript follows the backend AI bridge into `backend/private_core/**`, which attempts to emit private-core files and crosses the current architecture boundary.

Keeping `noResolve: true` avoids that private-core expansion, but then the TS source cannot resolve package imports such as `zod`.

## Viable Options

### Option A: Keep Current Island Scaffolding Until Runtime Cutover

Keep `noResolve: true`, keep schema/Notes islands, and continue using per-island build outputs until a later cutover sprint.

Pros:

- lowest immediate risk
- no private-core decision required now
- current checks remain green
- preserves source runtime behavior

Cons:

- TS source cannot become first-class in unified backend build yet
- facade/generated scaffolding remains longer
- route migration can continue only through island-style patterns or JS/JSDoc bridges

### Option B: Externalize Private Core Behind A Package Boundary

Treat `private_core/sayachan-ai-core` as a separate package or workspace-style dependency, then have backend import it through a package boundary instead of a relative path.

Pros:

- clean long-term architecture boundary
- backend build can use normal module resolution without swallowing private core
- aligns with eventual monorepo/package thinking
- lets TypeScript distinguish backend runtime code from AI core package code

Cons:

- this is an architecture decision, not a small migration step
- likely needs package metadata, import path changes, and baseline updates
- may force a broader discussion about package ownership and release/test boundaries

### Option C: Include Private Core In Backend Build

Approve `backend/private_core/**` as part of the backend build boundary.

Pros:

- simplest TypeScript resolution story mechanically
- unified backend build can follow the current relative import graph

Cons:

- collapses the current public/private AI split
- makes backend dist larger and more entangled
- turns an accidental relative import into architecture truth
- conflicts with the existing human-gated private-core boundary

### Option D: Add Narrow Build Stubs Or Ambient Boundaries

Keep private core outside the build and add explicit TypeScript declarations or build-time shims for the AI bridge.

Pros:

- can unblock some TS-source inclusion without monorepo work
- avoids private-core emit
- smaller than full package extraction

Cons:

- creates another temporary truth surface
- can become stale if private-core API changes
- may hide real integration problems until cutover

## PMO Recommendation

Do not include `backend/private_core/**` in backend dist by default.

Recommended near-term path:

- keep Option A as the active implementation rule
- use islands or JS/JSDoc bridges for narrow TS migration where needed
- avoid adding more generated scaffolding unless a route truly needs it
- pause first-class TS-source inclusion in the unified backend build until the private-core boundary is decided

Recommended architecture direction:

- prefer Option B if the project is ready to introduce package/monorepo boundaries
- use Option D only as a deliberately temporary bridge, with an explicit cleanup trigger
- avoid Option C unless the human explicitly decides that private core is no longer a separate architecture boundary

## Human Decision Question

Before unified backend build can own normal TS source files broadly, PMO needs a human answer:

Should `backend/private_core/sayachan-ai-core` remain outside backend dist as a separate package/boundary, or should it become part of the backend build?

Suggested default answer:

- keep private core outside backend dist
- prepare a future package-boundary/monorepo slice
- continue backend TS migration only where it does not require changing that boundary

## Decision Outcome

Resolved on 2026-05-06:

- keep `backend/private_core/sayachan-ai-core` outside backend dist
- consume it from backend through the package name `@allier/sayachan-ai-core`
- represent it as a backend-local file dependency pointing at the existing submodule package
- reject future regressions back to relative private-core source imports from `backend/src/privateCore/bridge.ts`

Implemented by `Private Core Package Import Boundary V1`.

## Follow-Up Candidates

- `Private Core Package Boundary Plan V1`
  - plan how to externalize `sayachan-ai-core` without implementing package migration yet
- `Notes Route Island Retirement Prep V1`
  - inspect whether Notes has a separate blocker or the same build-boundary issue
- `Backend Route JSDoc/DTO Bridge Continuation V1`
  - continue low-risk typing work that does not require unified TS-source inclusion
