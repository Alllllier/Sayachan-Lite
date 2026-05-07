# Product Response Mapper Ownership Split

- Archived date: `2026-05-07`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_018.md#backend-hardening-002c`
- Why it mattered: Product DTO characterization proved the current broad spread-compatible behavior. The next safe step is to move mapper ownership out of domain/dtos into a service-owned response layer before any field whitelist or use-case-specific response DTO design.
- Expected outcome: Move task/project/note response mapper ownership to a service response mapper location while preserving current public DTO behavior and keeping characterization tests green.
- In scope:
  `Create backend/src/services/responses/productResponses.ts or equivalent minimal service-owned response mapper location; move or re-export toTaskDto, toProjectDto, toNoteDto and related helper types as needed; update service imports and focused tests.`
- Out of scope:
  `No field whitelist adoption; no field removal; no public API response behavior change; no frontend API/client changes; no route/service behavior changes beyond import ownership; no task/project/note use-case mapper split yet; no broad service folder refactor.`
- Dependencies: Product DTO Contract Characterization completed and validated; product DTO behavior is now protected by focused tests.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Human selected Product Response Mapper Ownership Split on 2026-05-07.
- Validation expectation:
  `Run focused product DTO/response mapper contract test, backend tests, and root npm run check.`
- Escalation triggers:
  `Stop if moving mapper ownership requires changing response fields, splitting use-case mappers, redesigning service folder structure, or changing frontend/API contracts.`
- Follow-up parking:
  `After this split, decide separately whether to preserve spread-compatible types, design field whitelists, or introduce route/use-case-specific task/project/note response mappers.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Product response mappers moved to service-owned response layer while shared lifecycle helpers remain in domain/tasks/lifecycle; public response behavior unchanged.`
