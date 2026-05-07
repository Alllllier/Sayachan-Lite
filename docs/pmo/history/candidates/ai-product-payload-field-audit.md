# AI Product Payload Field Audit

- Archived date: `2026-05-07`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_018.md#backend-hardening-002e`
- Why it mattered: Ordinary product response whitelist decisions are recorded, but AI note/project endpoints still receive broad note/project objects. Before narrowing AI payload DTOs, PMO needs to audit what frontend sends, what backend services read, and what prompt construction actually uses.
- Expected outcome: Produce a concise audit artifact that maps AI note/project payload fields to actual frontend sending, backend validation/service usage, prompt usage, fallback behavior, and proposed AI-specific DTO whitelist candidates.
- In scope:
  `Frontend note/project AI API calls; backend AI route schemas; backend aiService note task and project next-action payload handling; relevant AI route tests; new PMO audit artifact under docs/pmo/state if useful.`
- Out of scope:
  `No AI route implementation changes; no frontend payload changes; no prompt text changes; no private_core/provider changes; no ordinary product response whitelist implementation.`
- Dependencies: Product Response Field Usage Audit completed; ordinary non-AI product response whitelist decisions recorded in decision_log.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Human selected AI Product Payload Field Audit on 2026-05-07.
- Validation expectation:
  `Read-only/code-search audit. If only docs are written, no code validation is required; if code or tests change unexpectedly, run root npm run check.`
- Escalation triggers:
  `Stop if narrowing AI payload fields requires deciding prompt behavior, fallback behavior, private-core contracts, or whether AI should reload entities only by id instead of consuming frontend-supplied content.`
- Follow-up parking:
  `Use the audit to shape an AI-specific payload DTO implementation slice, separate from ordinary product response whitelist implementation.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Audit shows AI endpoints prefer owned-entity reload by _id/id; id-only DTOs are viable if PMO decides to remove or preserve no-id direct-content compatibility.`
