# Product Response Field Boundary Reference

Archived from `docs/pmo/state/product_response_field_usage_audit.md`.

Status: extracted reference. The original audit completed on 2026-05-07 and should not be treated as active PMO state.

## Preserved Conclusion

Ordinary product responses should use explicit public DTO whitelists instead of broad object spreading.

Approved ordinary product response whitelist candidates:

- Task: `_id`, `title`, `status`, `archived`, `completed`, `creationMode`, `originModule`, `originId`.
- Project: `_id`, `name`, `summary`, `status`, `archived`, `isPinned`, `updatedAt`, `currentFocusTaskId`.
- Note: `_id`, `title`, `content`, `archived`, `isPinned`, `updatedAt`.

Approved exclusions:

- `userId` is an ownership/isolation field and should not be exposed in public task/project/note responses.
- `__v` should stay excluded unless a future explicit internal/debug surface requires it.
- `createdAt` should not be exposed in ordinary product responses for now because no direct frontend usage was found.
- Task `updatedAt` should not be exposed for now because no direct task usage was found.

## Decision Notes

- Task `originModule` remains public because Dashboard provenance UI directly uses it.
- Task `originId` remains public for now alongside `originModule`; revisit if route/use-case-specific task mappers split provenance needs.
- Project `currentFocusTaskId` remains public because Projects, cockpit context, and AI-adjacent product flow currently depend on it.
- Project and Note `updatedAt` remain public because the frontend uses them for display/sort.

AI endpoint payload fields were explicitly separated from this ordinary product response decision.

