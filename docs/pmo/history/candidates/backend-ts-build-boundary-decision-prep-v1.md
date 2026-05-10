# Backend TS Build Boundary Decision Prep V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/schema-island-unified-build-inclusion-prep-v1.md`, `docs/pmo/history/reference/backend-runtime-boundary-reference.md`
- Why it mattered: Schema unified-build inclusion exposed the real architecture gate: adding TS sources to the unified backend build either collides with JS facade outputs or requires changing the noResolve/private_core build boundary. Before more route or island migration work, PMO should prepare the decision surface without making the decision.
- Expected outcome: Create a concise PMO state decision-prep note that explains the current noResolve/private_core blocker, lists viable options, states tradeoffs, and recommends the next human decision question without changing backend runtime or build behavior.
- In scope:
  `Review existing blocker report, backend tsconfig, ai bridge/private_core import shape, schema/Notes island paths, and dist build plan; write a decision-prep artifact under docs/pmo/state; optionally update execution report only.`
- Out of scope:
  `No tsconfig architecture change; no private_core inclusion; no ESM/runtime loader/root check expansion; no runtime cutover; no route/schema migration; no island/facade deletion; no API/Zod behavior change.`
- Dependencies: Schema Island Unified Build Inclusion Prep V1 completed and recorded the build-boundary blocker.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Codex may activate under delegated PMO automation authority as a decision-prep slice.
- Validation expectation:
  `Docs-only review. No runtime tests required unless the note makes a claim that needs command verification.`
- Escalation triggers:
  `Do not choose private_core inclusion, remove noResolve, switch module systems, or alter runtime scripts. Stop at preparing the human decision surface.`
- Follow-up parking:
  `After closeout, ask the human to decide whether to keep private_core outside with explicit stubs/boundaries, include private_core in a broader build, or defer unified TS-source inclusion until runtime cutover cleanup.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
