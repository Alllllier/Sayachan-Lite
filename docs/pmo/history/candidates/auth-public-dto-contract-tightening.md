# Auth Public DTO Contract Tightening

- Archived date: `2026-05-07`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_018.md#backend-hardening-002`
- Why it mattered: backend-hardening-002 is too broad if it includes product DTO response compatibility. Auth public DTOs already have a narrow field list, so they are the safest first cut for tightening public DTO contracts without changing API behavior.
- Expected outcome: Tighten the public auth DTO type contracts for users and invites where returned fields are already explicit, while preserving existing auth route response behavior and leaving product DTO compatibility untouched.
- In scope:
  `backend/src/domain/dtos/authDtos.ts; focused auth service/route contract tests if needed to lock public user and invite fields.`
- Out of scope:
  `No product DTO changes; no frontend API client changes; no auth route response shape changes; no model schema redesign; no password/session/invite lifecycle behavior changes.`
- Dependencies: AI Core Public Bridge Contract completed; auth public DTO adapters already centralize returned user/invite fields.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human selected the auth-only cut of backend-hardening-002 on 2026-05-07.
- Validation expectation:
  `Run backend build, backend tests with auth coverage, and root npm run check.`
- Escalation triggers:
  `Stop if tightening types implies changing public auth response fields, frontend auth API contracts, persisted model schemas, or product DTO response compatibility.`
- Follow-up parking:
  `Keep product DTO contract tightening as a separate future slice; keep route state accessor refinement and type-aware ESLint readiness in discussion_batch_018.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Auth public DTO contracts tightened; product DTO contract tightening remains parked as the remaining backend-hardening-002 surface.`
