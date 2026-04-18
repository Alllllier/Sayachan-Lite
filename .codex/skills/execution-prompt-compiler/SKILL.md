---
name: execution-prompt-compiler
description: Compile Codex PMO planning discussions, architecture baselines, and boundary documents into execution-ready Claude VS Code sprint prompts for long-running Sayachan development. Use when Codex needs to convert PMO intent into a worker prompt that clearly states sprint goal, architecture context, safe touch zones, non-goals, completion report contract, and escalation points that must return to the architecture owner.
---

# Execution Prompt Compiler

## Overview

Act as the translation layer between PMO planning and execution. Convert planning artifacts into one bounded sprint prompt for Claude VS Code without expanding into architecture authorship or implementation micromanagement.

Treat `docs/pmo/PMO_OPERATING_MANUAL.md` as the canonical PMO entrypoint for current Sayachan work.

Treat `docs/_legacy_pmo/**` as legacy reference only unless the new PMO surface is missing information.

## Role Lock

Preserve the operating split:

- Codex: PMO compiler and boundary keeper
- Claude VS Code: execution worker
- Human: architecture owner and escalation authority

Do not collapse those roles inside the compiled prompt.

## What To Compile

Every compiled prompt must include:

1. Sprint goal
2. Architecture context
3. Safe touch zones
4. Explicit non-goals
5. Completion report contract
6. Escalation points for architecture-owner decisions

If one item is missing from source material, mark it as unresolved instead of inventing certainty.

## Workflow

### 1. Gather only the planning minimum

Read only enough source material to answer:

- What outcome is being requested now?
- Which current boundaries constrain execution?
- Which files or subsystems are safe to modify?
- Which decisions are explicitly reserved for the human?

Prefer architecture baseline, PMO notes, and boundary docs over raw code history.

Default reading order:

1. `docs/pmo/PMO_OPERATING_MANUAL.md`
2. `docs/pmo/state/current_sprint.md`
3. `docs/pmo/state/execution_task.md`
4. `docs/pmo/state/execution_report.md`
5. `docs/pmo/protocols/execution-handoff-protocol.md`
6. `docs/pmo/protocols/sprint-workflow.md`
7. `docs/pmo/baselines/system-baseline.md`
8. `docs/pmo/baselines/runtime-baseline.md`
9. `docs/pmo/baselines/roadmap.md`

Only fall back to `docs/_legacy_pmo/**` when the new PMO runtime surface does not yet answer the current question.

### 2. Normalize the instruction set

Convert source material into six compact sections:

- mission
- why now
- touch scope
- non-goals
- report-back contract
- escalation gates

Compress duplicates. Remove PMO narrative that does not help execution.

### 3. Keep the prompt execution-ready

The final prompt should tell Claude what to do, what not to do, when to stop, and what to report back. It should not:

- redesign the system
- reopen already-fixed boundaries
- prescribe low-level implementation unless source material already did

If `docs/pmo/state/execution_task.md` exists, prefer compiling the execution prompt into that file instead of leaving the handoff only in chat.

Use [references/execution-prompt-template.md](references/execution-prompt-template.md) as the primary template.

### 4. Protect architecture boundaries

If a task touches AI core, bridge contracts, domain rules, or other restricted zones, state that the worker must pause and escalate before changing them.

Use [references/boundary-checklist.md](references/boundary-checklist.md) when compiling prompts from partial or messy planning notes.

## Output Rules

- Keep the compiled prompt short enough to paste directly into Claude VS Code
- Prefer imperative language
- Distinguish confirmed scope from inferred context
- Name do-not-touch zones explicitly
- End with a concrete completion report contract
- When repo handoff files exist, align the prompt with `docs/pmo/state/execution_task.md` and the expected report structure in `docs/pmo/state/execution_report.md`

## Sayachan Bias

Optimize for long-running Sayachan work:

- preserve current architecture seams
- favor bounded sprint slices over broad programs
- keep public runtime work separate from private core decisions
