# Backend TS Migration Aftercare / Runtime Boundary Cleanup

- Archived date: `2026-05-07`
- PMO closeout result: `completed and validated`
- Source sprint: `retroactive closeout from direct implementation flow`
- Source report: `conversation and committed implementation history`

## Delivered

- Introduced `backend/src/domain/` as the post-TS support layer for ownership, product DTOs, auth DTOs, task query filters, and task cascade helpers.
- Removed migration-era service subfolders after their contents moved into domain boundaries.
- Cleaned mutation request DTO boundaries by removing Zod `passthrough()` and asserting that service DTOs strip unknown fields while raw request bodies remain unchanged.
- Centralized public HTTP errors under `backend/src/errors/httpErrors.ts`, then removed the temporary `BadRequestError` re-export from request validation.
- Removed unused Mongoose `xxDocument` aliases from model files.
- Added auth route Zod schemas under `backend/src/routes/schemas/auth.ts` and wired bootstrap-owner, register, and login routes through `validateBody`.
- Hardened backend dist boundary checks so compiled runtime artifacts preserve the new domain, error, route schema, and auth schema boundaries.

## Validation

- `npm --prefix backend run test`
- `npm run check`

## Project-Specific Review

- No browser/UI review was needed; this sprint only changed backend runtime, schema, error, DTO, model typing, tests, and PMO state surfaces.

## Unverified Areas

- No separate production deployment smoke was performed beyond the repository `check:backend-dist-runtime` smoke harness included in `npm run check`.

## Residual Risks

- Backend remains intentionally on CommonJS plus `tsc` dist runtime. Import-style modernization and any future ESM decision are separate architecture decisions.
- AI route request body validation still uses route-local request body casting and can be considered as a later validation-boundary cleanup.
- Mongoose model typing can be further refined later if external service/domain types need stronger model exports.

## Follow-Up Routing

- Keep PMO idle until the next explicit selection.
- Candidate-worthy follow-ups: AI route request validation, import-style/ESM decision prep, or deeper Mongoose model typing cleanup.

## Commit Range

- `18641ee chore(backend): introduce domain support layer`
- `fd1e2d6 chore(backend): extract auth response dtos`
- `2360fec chore(backend): strip unknown mutation dto fields`
- `54d386a chore(backend): remove unused model document aliases`
- `900e150 chore(backend): centralize public http errors`
- `dff76bd chore(backend): remove validation error re-export`
- `bbe8b2c chore(backend): validate auth route bodies with zod`
