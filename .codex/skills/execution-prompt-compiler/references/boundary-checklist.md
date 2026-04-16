# Boundary Checklist

Use this before finalizing the execution prompt.

## Required Checks

- Is the sprint goal one concrete outcome rather than a broad theme?
- Does the prompt clearly separate context from instruction?
- Are safe touch zones named at the module or file-group level?
- Are restricted zones named explicitly?
- Are non-goals concrete enough to prevent scope drift?
- Does the completion report ask for execution status rather than PMO narrative?
- Are architecture-owner escalation points written as decision gates?

## Sayachan-Specific Boundary Checks

- Does the task stay in public product runtime, or does it touch private core?
- Does it affect bridge contracts between public repo and private AI core?
- Does it alter domain rules such as focus/task coupling or archive cascades?
- Does it modify runtime-control semantics or chat context behavior?
- Does it introduce a new system instead of extending an existing surface?

## Escalate Instead Of Compiling Blindly If

- safe touch zones cannot be identified
- the prompt would force Claude to make architecture decisions
- public and private core responsibilities are mixed together
- success criteria depend on an unstated boundary change
- the task implies broad refactoring instead of a bounded sprint slice
