# Sayachan PMO Operating Manual

> Stable PMO constitution and workflow index for Sayachan development.

---

## 1. Purpose

This manual defines the long-lived operating model for Sayachan PMO.

It should stay short and stable. Use it for:

- role split
- architecture and escalation boundaries
- PMO state model
- workflow entry points
- skill routing and baseline references

Do not treat this file as the step-by-step guide for every PMO activity.
Operational sequences belong in dedicated workflow docs under `docs/pmo/workflows/`.

---

## 2. Role Split

### Codex

Codex owns PMO work:

- convert goals into bounded sprint slices
- maintain architecture boundary awareness
- produce baseline audits, PMO replies, and handoff prompts
- select and apply the correct project skills
- identify risks, debt, and documentation gaps
- stop execution when architecture-owner input is required

Codex does not act as the implementation worker by default in this operating model.

### Claude VS Code

Claude VS Code owns execution work:

- perform bounded implementation
- stay inside approved touch zones
- validate the implemented change
- return a structured completion report
- escalate instead of silently crossing architecture boundaries

Claude does not redefine architecture direction.

### Human

The human owns architecture:

- approve or reject boundary changes
- decide tradeoffs with long-term structural impact
- resolve ambiguity between product runtime and private core responsibilities
- approve expansion beyond current sprint scope

---

## 3. Workflow Map

Use the workflow docs that match the current PMO stage:

- [discussion-workflow.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/workflows/discussion-workflow.md)
- [promotion-workflow.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/workflows/promotion-workflow.md)
- [sprint-lifecycle-workflow.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/workflows/sprint-lifecycle-workflow.md)
- [EXECUTION_HANDOFF_PROTOCOL.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md)

Default lifecycle:

1. Human raises a topic.
2. Codex runs the discussion workflow.
3. Codex promotes stable results into `idea_backlog.md`, `sprint_candidates.md`, or `decision_log.md`.
4. Human selects one candidate sprint to start.
5. Codex runs sprint planning and handoff.
6. Claude executes and reports.
7. Codex closes the sprint and proposes the next step.

---

## 4. PMO Output Language Policy

Use the following default language policy across PMO work:

- owner-facing PMO outputs default to Simplified Chinese
- system governance docs may remain English-first
- Claude execution prompts stay English-first
- avoid terminal-sensitive Unicode symbols when ASCII alternatives exist
- preserve long-term cross-agent readability

Language rule by output type:

- PMO replies, sprint summaries, and owner-facing status updates: Simplified Chinese by default
- architecture governance, operating manuals, and cross-agent system docs: English-first is acceptable
- Claude VS Code sprint prompts and execution contracts: English-first

Formatting rule:

- prefer ASCII alternatives such as `<->` instead of terminal-fragile symbols when meaning is unchanged
- choose wording that remains readable across terminal, editor, and agent contexts

---

## 5. Skill Routing Rules

### Use `sprint-pmo`

Use [$sprint-pmo](/C:/Users/allie/Desktop/personal_os_lite/.codex/skills/sprint-pmo/SKILL.md) when the task is PMO-facing:

- close a sprint
- write a PMO reply
- prepare a worker handoff
- propose the next sprint
- summarize risk or debt at sprint level

Primary references:

- [sprint-summary-template.md](/C:/Users/allie/Desktop/personal_os_lite/.codex/skills/sprint-pmo/references/sprint-summary-template.md)
- [pmo-handoff-template.md](/C:/Users/allie/Desktop/personal_os_lite/.codex/skills/sprint-pmo/references/pmo-handoff-template.md)
- [risk-debt-checklist.md](/C:/Users/allie/Desktop/personal_os_lite/.codex/skills/sprint-pmo/references/risk-debt-checklist.md)

### Use `execution-prompt-compiler`

Use [$execution-prompt-compiler](/C:/Users/allie/Desktop/personal_os_lite/.codex/skills/execution-prompt-compiler/SKILL.md) when PMO planning, architecture notes, or baseline docs must be converted into an execution-ready Claude VS Code sprint prompt.

Primary references:

- [execution-prompt-template.md](/C:/Users/allie/Desktop/personal_os_lite/.codex/skills/execution-prompt-compiler/references/execution-prompt-template.md)
- [boundary-checklist.md](/C:/Users/allie/Desktop/personal_os_lite/.codex/skills/execution-prompt-compiler/references/boundary-checklist.md)

### Default routing rule

- If the output is for PMO consumption, use `sprint-pmo`.
- If the output is for Claude execution, use `execution-prompt-compiler`.
- If a task needs both, run `sprint-pmo` first, then `execution-prompt-compiler`.

---

## 6. PMO State Model

Canonical PMO files:

- discussion batches: [index.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/state/discussion_batches/index.md)
- idea backlog: [idea_backlog.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/state/idea_backlog.md)
- sprint candidates: [sprint_candidates.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/state/sprint_candidates.md)
- current sprint: [current_sprint.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/state/current_sprint.md)
- decision log: [decision_log.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/state/decision_log.md)
- outbox task: [execution_task.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/outbox/execution_task.md)
- inbox report: [execution_report.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/inbox/execution_report.md)

Ownership rule:

- Codex writes state and outbox
- Claude writes inbox

File intent:

- discussion batches store clustered pre-backlog discussion
- `idea_backlog.md` stores discussion-stage work that is worth retaining but is not execution-ready
- `sprint_candidates.md` stores at most 3 execution-ready sprint options
- `current_sprint.md` stores exactly one selected active sprint
- `decision_log.md` stores durable decisions, deferrals, and rejected paths

Detailed operating rules live in the workflow docs.

---

## 7. Private-Core Promotion Rule

Use this when a discussion starts in the public PMO flow but later proves to belong to the private core.

Rule:

- discussion may begin in the public PMO batch system without a hard public/private split
- once a focused theme is identified as `private-core-owned`, move the detailed architecture result into the private repo documentation set
- keep only a boundary-safe summary and reference in public PMO or architecture docs
- do not let detailed private-core architecture become canonical in the public repo just because the discussion started there

---

## 8. Escalation Boundaries

Execution must return to the human when work would change any of the following:

- public vs private core responsibility split
- `backend/src/ai/bridge.js` contract
- `backend/private_core/sayachan-ai-core`
- focus/task domain rules
- archive cascade semantics
- chat runtime control semantics
- dashboard context behavior used as chat input
- database model direction beyond bounded compatibility-safe changes
- any task that stops being a surface enhancement and becomes a new system decision

Codex should escalate early when a task:

- crosses from safe execution into boundary redesign
- mixes architecture authorship with implementation
- cannot identify touch zones with confidence
- implies broad refactoring instead of a bounded sprint slice

Claude should escalate instead of improvising when a prompt would require crossing one of these boundaries.

Reference:

- use [private-core-boundary.md](/C:/Users/allie/Desktop/personal_os_lite/docs/architecture/private-core-boundary.md) for the canonical description of this split

---

## 9. Validation Policy

Validation should be selected by sprint risk, not run blindly for every sprint.

Default rule:

- do not require browser validation for every sprint
- require the lightest validation that can catch the most likely regression class
- if a validation layer is skipped, say so explicitly in the execution report

Validation matrix:

- use logic or smoke tests for domain rules, service behavior, route behavior, storage contracts, and workflow semantics
- use browser validation for UI surface behavior, page-state transitions, rendering behavior, or interaction changes that code review alone cannot judge safely
- use UI review for visual hierarchy, readability, density, and presentation quality

Current tooling direction:

- logic and smoke validation: `Vitest`
- browser validation and UI review v1: `Playwright`

Reporting rule:

- execution reports should state tests run, browser validation performed or not performed, UI review performed or not performed, unverified areas, and known regression risk

---

## 10. Baseline Audit References

Use these as the default reference set before planning or compiling execution prompts:

- [system-baseline.md](/C:/Users/allie/Desktop/personal_os_lite/docs/architecture/system-baseline.md)
- [runtime-workflow.md](/C:/Users/allie/Desktop/personal_os_lite/docs/architecture/runtime-workflow.md)
- [backend-api.md](/C:/Users/allie/Desktop/personal_os_lite/docs/architecture/backend-api.md)
- [roadmap.md](/C:/Users/allie/Desktop/personal_os_lite/docs/architecture/roadmap.md)
- [development-constraints.md](/C:/Users/allie/Desktop/personal_os_lite/docs/guides/development-constraints.md)
- [documentation-sync.md](/C:/Users/allie/Desktop/personal_os_lite/docs/guides/documentation-sync.md)
- [ai-core-migration-record.md](/C:/Users/allie/Desktop/personal_os_lite/docs/migration/ai-core-migration-record.md)

Audit rule:

- Codex performs the first repository audit before a sprint candidate is treated as ready
- do not compile a sprint prompt purely from discussion if repository state has not been checked
- Claude pre-execution audit is optional and should be used only when PMO audit is not enough to bound implementation risk confidently

Minimum planning rule:

- do not open all docs every time
- start with `docs/architecture/system-baseline.md`
- load additional docs only when needed for the current sprint or workflow stage

---

## 11. Maintenance Rules

Keep this manual stable and short.

Update it only when one of these changes:

- role split
- PMO state model
- workflow map
- skill routing model
- escalation boundaries
- baseline reference set

Do not expand this manual into a full system encyclopedia. Add new workflow or boundary docs next to it instead of overloading this file.
