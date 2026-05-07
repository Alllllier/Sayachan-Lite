# Product Response Field Usage Audit

- Archived date: `2026-05-07`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_018.md#backend-hardening-002d`
- Why it mattered: Product response mapper ownership is now in the service response layer and current broad spread behavior is characterized. Before removing spread compatibility or introducing field whitelists, PMO needs a grounded inventory of frontend/backend field usage.
- Expected outcome: Produce a concise audit artifact that maps task/project/note response fields to actual frontend/backend usage and proposes safe public field whitelist candidates for future mapper tightening.
- In scope:
  `Frontend field reads under frontend/src/**; backend response mapper and route/service tests; product response characterization tests; new PMO audit artifact under docs/pmo/state if useful.`
- Out of scope:
  `No response mapper implementation changes; no field removal; no API behavior change; no frontend behavior change; no route/service/model changes.`
- Dependencies: Product DTO Contract Characterization and Product Response Mapper Ownership Split completed and validated.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Human selected Product Response Field Usage Audit on 2026-05-07.
- Validation expectation:
  `Read-only/code-search audit. If only docs are written, no code validation is required; if code or tests change unexpectedly, run root npm run check.`
- Escalation triggers:
  `Stop if deciding whether userId, originId/originModule, currentFocusTaskId, createdAt/updatedAt, or AI/dashboard context fields should stay public requires human product judgment.`
- Follow-up parking:
  `Use the audit to shape the next implementation sprint: field whitelist design, type-only tightening while preserving spread, or separate task/project/note response mapper slices.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Audit proposes conservative product response whitelist candidates and leaves userId, task provenance, project focus, timestamps, and AI whole-object payloads as human/PMO decision gates.`
