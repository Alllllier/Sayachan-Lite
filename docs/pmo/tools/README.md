# PMO Tools

These tools are the mechanical apply layer for PMO runtime state.

PMO still decides sprint selection, validation status, documentation-sync outcome, commit state, residual risk, and follow-up routing. The tool only writes the resulting state transitions.

## Commands

Preview help:

```bash
node docs/pmo/tools/pmo.mjs --help
```

Activate a selected candidate:

```bash
node docs/pmo/tools/pmo.mjs activate --sprint "Sprint Name" --selected-by "Human" --dry-run
```

Activate a bounded micro-fix:

```bash
node docs/pmo/tools/pmo.mjs activate --micro-fix "Fix Name" --goal "One sentence goal." --dry-run
```

Close out a sprint:

```bash
node docs/pmo/tools/pmo.mjs closeout --sprint "Sprint Name" --delivery-status "completed and validated" --doc-sync "reviewed, no update needed" --commit-state "not committed in this closeout" --dry-run
```

Reset runtime state when archives already exist:

```bash
node docs/pmo/tools/pmo.mjs idle-reset --last-sprint "Sprint Name" --delivery-status "completed and validated" --report-surface "docs/pmo/history/reports/sprint-name.md" --dry-run
```

Remove `--dry-run` only after the PMO judgment is settled.
