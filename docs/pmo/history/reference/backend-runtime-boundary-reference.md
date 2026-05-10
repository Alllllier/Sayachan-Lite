# Backend Runtime Boundary Reference

Archived from:

- `docs/pmo/state/backend_dist_runtime_cutover_plan.md`
- `docs/pmo/state/backend_ts_build_boundary_decision_prep.md`

Status: extracted reference. The original plan and decision prep were superseded by later backend runtime and private-core boundary work.

## Current Truth

The active runtime truth lives in:

- `docs/pmo/baselines/runtime-baseline.md`
- current backend package scripts
- completed history reports for backend dist/runtime slices

The old cutover plan is no longer an active execution map.

## Preserved Boundary Decisions

Private core remains outside backend dist as a separate boundary:

- `backend/private_core/sayachan-ai-core` stays outside normal backend dist ownership.
- Backend consumes it through the package name `@allier/sayachan-ai-core`.
- The backend-local file dependency points at the existing submodule package.
- Regressions back to relative private-core source imports from `backend/src/privateCore/bridge.ts` should be rejected.

This was resolved by `Private Core Package Import Boundary V1`.

## Superseded Planning Notes

The original dist cutover plan included phased work for build boundary hardening, smoke harnesses, schema/route island retirement, product route migration, and final runtime cutover.

Those steps should now be read only as historical sequencing context. New backend runtime work should start from the current baseline, not from this old phase list.

