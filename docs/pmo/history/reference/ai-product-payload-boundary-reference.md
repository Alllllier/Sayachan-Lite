# AI Product Payload Boundary Reference

Archived from `docs/pmo/state/ai_product_payload_field_audit.md`.

Status: extracted reference. The original audit completed on 2026-05-07 and should not be treated as active PMO state.

## Preserved Conclusion

AI request payloads should narrow toward id-only frontend requests plus backend-owned entity reload.

Approved direction:

- Frontend AI actions should send the current note/project id already available in UI context.
- Backend AI services should reload trusted note/project content by owner-scoped lookup.
- Ordinary product response whitelist implementation should not preserve extra fields solely for AI compatibility.

## Endpoint Direction

For `POST /ai/notes/tasks`, the durable target is a note-task request DTO centered on `_id`.

For `POST /ai/projects/next-action`, the durable target is a project-next-action request DTO centered on `_id`, with focus context derived from persisted project/task state.

Compatibility decisions that remained open after the audit:

- whether to accept `id` as a temporary alias for `_id`;
- whether to split the shared AI schema into endpoint-specific schemas;
- whether missing-id requests should be rejected instead of using frontend-supplied text fields;
- whether frontend-supplied `currentFocusTaskId` should ever be honored during transition.

## Implementation Shape

Future implementation should:

- add endpoint-specific AI request DTO/schema definitions;
- update frontend AI callers to send id-shaped requests;
- keep owned reload semantics explicit in service tests;
- remove or reject no-id direct-content support once the transition decision is made.

