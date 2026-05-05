# TypeScript Target Architecture Mapping

- Archived date: `2026-05-05`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/state/discussions/discussion_batch_018.md#slice-008`
- Why it mattered: Sayachan has outgrown several MVP-era anti-complexity guardrails, but jumping directly into TypeScript conversion would risk preserving current JavaScript-era scaffolding or deleting real runtime boundaries by accident. A low-risk planning audit can define the TypeScript-era target architecture first, then map the current JS repo into that target by responsibility.
- Expected outcome: A target architecture mapping artifact that identifies which responsibilities should exist in a TypeScript-aware Sayachan, where the current JS modules map into that target, and which migration actions are likely: keep, merge, replace, split, defer, or delete-candidate.
- In scope:
  `Define target TS-era responsibility layers for typed contracts, runtime schema, frontend feature API/rules/composable layers, shared services, backend DTO/service boundaries, model/API response separation, tests, and PMO/runtime documentation; map current frontend/backend/public AI boundary modules into those responsibilities; flag no-type scaffolding candidates without deleting code.`
- Out of scope:
  `No TypeScript migration, no file renames, no package-manager workspace changes, no runtime schema library adoption, no business logic edits, no UI or route behavior changes, and no private-core implementation redesign.`
- Dependencies: Current PMO baselines, AGENT.md/README engineering-boundary cleanup, and discussion_batch_018 modernization judgments.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `Documentation-only planning audit; validate by reviewing the produced mapping for traceability against current PMO baselines and repo structure. No runtime test execution is expected unless the worker edits executable code by mistake.`
- Escalation triggers:
  `Return to PMO/human review if the mapping requires committing to a concrete TypeScript migration package, deleting current runtime modules, or changing product behavior instead of only classifying future migration actions.`
- Follow-up parking:
  `Route concrete migration slices, deletion candidates, or architecture decisions into idea_backlog.md, decision_log.md, or new sprint candidates during closeout rather than embedding them only in the mapping artifact.`
- Closeout summary: `completed and documentation-validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `TypeScript target architecture mapping completed as a documentation-only audit. The audit confirms TypeScript migration should be treated as a staged architecture program rather than a per-file conversion. English and Chinese mapping artifacts remain in docs/pmo/state and are routed back into discussion_batch_018 as source input for future concrete Type-Aware JavaScript or typed-boundary implementation slices.`
