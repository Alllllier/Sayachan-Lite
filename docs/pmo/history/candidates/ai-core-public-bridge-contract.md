# AI Core Public Bridge Contract

- Archived date: `2026-05-07`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_018.md#backend-hardening-001`
- Why it mattered: Backend TS Quality Gate Cleanup left the private_core import as the clearest remaining trust-based backend boundary. Tightening this bridge first removes one high-value type-safety gap before DTO and route-state hardening build on it.
- Expected outcome: Replace the public backend private-core bridge trust boundary with an explicit narrow contract for the imported AI core surface, without pulling private_core into backend build or changing AI route behavior.
- In scope:
  `backend/src/ai/privateCoreContract.d.ts; backend/src/ai/bridge.ts; small focused bridge contract or route test updates if needed to lock chat invocation shape.`
- Out of scope:
  `No private_core TypeScript or ESM migration; no provider orchestration redesign; no prompt/kernel changes; no AI route response changes; no broad semantic lint adoption.`
- Dependencies: Backend TS/ESM migration and Backend TS Quality Gate Cleanup are complete; private_core remains outside the backend build boundary by decision.
- Risk level: `medium`
- Readiness at selection: `ready`
- Start condition: Human selected discussion_batch_018 backend-hardening-001 on 2026-05-07.
- Validation expectation:
  `Run backend build, backend tests with AI route/bridge coverage where available, and root npm run check.`
- Escalation triggers:
  `Stop if the fix requires changing private_core package internals, expanding backend build/lint into backend/private_core, changing AI route response behavior, or redesigning provider orchestration.`
- Follow-up parking:
  `Keep public DTO tightening, route state accessor refinement, and type-aware ESLint readiness as separate backend-hardening follow-ups in discussion_batch_018.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Narrow backend-consumed private-core chat contract landed; future private-core exports should extend this contract deliberately.`
