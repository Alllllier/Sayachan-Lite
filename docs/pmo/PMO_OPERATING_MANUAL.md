# Sayachan PMO Operating Manual

> Long-term operating manual for Codex PMO + the current execution worker

---

## 1. Purpose

This manual defines the default operating system for Sayachan development.

It exists to keep future work smooth, lightweight, and boundary-aware across:

- Codex as PMO command center
- Claude VS Code as execution worker
- Human as architecture owner

This is not a full repository handbook. It is the coordination layer used to:

- frame work
- route work to the right skill
- protect architecture boundaries
- define when execution may proceed directly
- define when decisions must return to the human

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

## 3. Standard Codex <-> Execution Workflow

The default production workflow is:

1. Human states goal or problem.
2. Codex builds or refreshes the architecture baseline.
3. Codex identifies safe zones, non-goals, and escalation boundaries.
4. Codex uses the appropriate skill to convert planning into execution-ready output.
5. Claude VS Code executes from the current repo outbox task by default and stays inside the approved sprint scope.
6. Claude returns a structured completion report.
7. Codex reviews the report at PMO level and proposes the next sprint.
8. Human makes any required architecture decisions.

Operating rule:

- Codex frames and guards.
- Claude executes and reports.
- Human decides boundaries.

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

### Repository-native handoff preference

Prefer repo-file handoff over chat copy-paste when a sprint has an active execution loop.

Default handoff files:

- protocol: [EXECUTION_HANDOFF_PROTOCOL.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md)
- state: [current_sprint.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/state/current_sprint.md)
- outbox: [execution_task.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/outbox/execution_task.md)
- inbox: [execution_report.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/inbox/execution_report.md)

Rule:

- Codex writes state and outbox
- Claude writes inbox
- Claude should start from `docs/pmo/outbox/execution_task.md` by default when an active PMO handoff exists
- PMO closeout should read inbox before drafting owner-facing output

---

## 6. Escalation Boundaries

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

---

## 7. Document Ownership

### PMO-owned docs

Codex is the default maintainer of:

- PMO operating docs
- architecture baseline docs
- execution boundary docs
- sprint closeout and handoff docs

Claude execution work is not the default maintainer of architecture or governance docs.

### Execution-owned artifacts

Claude VS Code is the default producer of:

- implementation diffs
- validation output
- structured completion reports

Claude may update technical docs only when the assigned sprint explicitly includes that work.
Claude should not be treated as the owner of architecture baselines, PMO rules, or documentation-sync policy.

### Architecture-owned decisions

The human owns:

- boundary decisions
- model responsibility splits
- core runtime semantics
- private core policy direction

---

## 8. Baseline Audit References

Use these as the default reference set before planning or compiling execution prompts:

- [system-baseline.md](/C:/Users/allie/Desktop/personal_os_lite/docs/architecture/system-baseline.md)
- [runtime-workflow.md](/C:/Users/allie/Desktop/personal_os_lite/docs/architecture/runtime-workflow.md)
- [backend-api.md](/C:/Users/allie/Desktop/personal_os_lite/docs/architecture/backend-api.md)
- [roadmap.md](/C:/Users/allie/Desktop/personal_os_lite/docs/architecture/roadmap.md)
- [development-constraints.md](/C:/Users/allie/Desktop/personal_os_lite/docs/guides/development-constraints.md)
- [documentation-sync.md](/C:/Users/allie/Desktop/personal_os_lite/docs/guides/documentation-sync.md)
- [ai-core-migration-record.md](/C:/Users/allie/Desktop/personal_os_lite/docs/migration/ai-core-migration-record.md)

Minimum planning rule:

- do not open all docs every time
- start with `docs/architecture/system-baseline.md`
- load additional docs only when they are needed for the current sprint
- if the sprint is active, also read the current state and handoff files in `docs/pmo/`

---

## 9. First Production Workflow Example

### Example: Note Markdown Foundation Sprint

Goal:

- add markdown editing and markdown rendering to the existing note module

PMO handling:

1. Codex checks the current architecture baseline.
2. Codex confirms this is a public note-surface enhancement, not an AI-core task.
3. Codex identifies safe zones such as `frontend/src/components/NotesPanel.vue` and note-adjacent frontend surfaces.
4. Codex fixes the sprint boundary:
   - markdown edit state
   - markdown display rendering
   - code block highlighting
   - no image upload
   - no split preview
5. Codex compiles the sprint into a Claude-ready execution prompt.
6. Claude implements only the bounded v1 slice.
7. Claude reports:
   - delivered
   - validation performed
   - boundary compliance
   - unresolved
   - architecture decisions needed
   - recommended next sprint slice
8. Codex converts that report into:
   - PMO reply
   - sprint completion summary
   - next sprint proposal

Escalation examples in this sprint:

- changing note storage from raw markdown string to a new structured content model
- introducing upload or attachment infrastructure
- turning note editing into a broader editor-platform decision
- touching chat runtime, AI bridge, or private core to complete the note feature

---

## 10. Maintenance Rules

Keep this manual stable and short.

Update it only when one of these changes:

- role split
- standard Codex <-> execution workflow
- skill routing model
- escalation boundaries
- baseline reference set

Do not expand this manual into a full system encyclopedia. Add new boundary or workflow documents next to it instead of overloading this file.

