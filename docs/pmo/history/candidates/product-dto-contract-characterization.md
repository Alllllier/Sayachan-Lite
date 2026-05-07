# Product DTO Contract Characterization

- Archived date: `2026-05-07`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_018.md#backend-hardening-002b`
- Why it mattered: Auth public DTO tightening completed, but product DTOs still intentionally preserve Mongoose toObject spread compatibility. Before narrowing types or changing public fields, PMO needs tests that state the current task/project/note DTO output facts.
- Expected outcome: Add focused product DTO characterization tests for task, project, and note DTO output behavior without changing production DTO behavior.
- In scope:
  `Read backend/src/domain/dtos/productDtos.ts; add focused backend tests for toTaskDto, toProjectDto, toNoteDto, archived normalization, task status/completed normalization, project status fallback, note archived normalization, and current spread-field compatibility.`
- Out of scope:
  `No product DTO implementation change unless required only to make existing behavior testable; no field whitelist adoption; no field removal; no frontend API/client changes; no route/service behavior changes; no model schema redesign.`
- Dependencies: Auth Public DTO Contract Tightening completed; product DTO compatibility behavior is still broad and needs characterization before tightening.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Human accepted Product DTO Contract Characterization as the next product DTO step on 2026-05-07.
- Validation expectation:
  `Run focused product DTO contract test, backend tests, and root npm run check.`
- Escalation triggers:
  `Stop if tests force a decision about whether currently spread fields should remain public API fields, or if characterization appears to require production behavior changes.`
- Follow-up parking:
  `After characterization, decide whether to continue with type-only tightening while preserving spread compatibility, field whitelist design, or separate task/project/note DTO tightening slices.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Current product DTO spread compatibility is characterized; future product DTO tightening needs an explicit choice between preserving spread-compatible types and designing field whitelists.`
