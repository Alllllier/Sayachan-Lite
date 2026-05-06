# Backend Dist Runtime Cutover Plan V1

- Archived date: `2026-05-06`
- Archive reason: `completed-and-displaced`
- Exit status: `completed`
- Candidate status at selection: `active`
- Original source reference: `docs/pmo/history/reports/backend-unified-tsc-build-dry-run-v1.md`, `docs/pmo/state/decision_log.md#backend-typescript-migration-can-automate-repeated-execution-after-human-architecture-gates`
- Why it mattered: The backend can now emit a unified CommonJS dist dry-run, and the human has approved automated repeated migration after architecture gates. Before changing runtime startup, PMO needs a concrete cutover plan that separates human decision gates from script/sub-agent execution zones and prevents more per-island scaffolding from accumulating by default.
- Expected outcome: Produce a concrete backend dist runtime cutover playbook with phased execution batches, automation/delegation rules, validation gates, rollback/checkpoint strategy, and explicit human approval gates before switching from node src/server.js to node dist/server.js.
- In scope:
  `Map current islands/facades/scripts/tests to their cutover/retirement phase; define the exact sequence for moving typed sources into normal src paths, retiring generated artifacts/facades, adjusting backend build/start/test scripts, deciding when root check includes backend build/dist validation, and updating PMO baselines; identify which steps are script-automatable and which can be delegated to one or more sub-agents; define stop conditions and report contracts.`
- Out of scope:
  `No code migration; no runtime cutover; no package script changes that switch start/dev to dist; no ESM decision; no private_core build expansion; no tsx/ts-node/runtime loader; no API/Zod/frontend behavior change; no deletion of current islands/facades during this planning slice.`
- Dependencies: Completed schema island, Notes route island, generated-artifact guardrails, backend unified tsc dry-run, and the human-approved automation decision gate rule.
- Risk level: `low`
- Readiness at selection: `ready`
- Start condition: Human explicitly selects this candidate for activation.
- Validation expectation:
  `No runtime tests are required unless the plan includes executable validation probes. Review current PMO baselines, package scripts, tsconfigs, route/service layout, and latest build dry-run report. Final output should be a clear plan artifact and PMO state update, not code changes.`
- Escalation triggers:
  `Return to human if the plan recommends ESM, private_core build inclusion, runtime loaders, public API/Zod behavior changes, or switching runtime to dist without a separate explicit approval.`
- Follow-up parking:
  `After this plan is accepted, Codex may start automation-oriented implementation slices where routine migrations are delegated to sub-agents or scripts. The actual runtime cutover remains a named human approval gate.`
- Closeout summary: `completed and validated`
- Follow-up created from this candidate: `See execution report archive and PMO closeout routing.`
- Notes: `Archived by docs/pmo/tools/pmo.mjs during closeout.`
