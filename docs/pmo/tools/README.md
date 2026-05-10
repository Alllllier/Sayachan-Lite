# PMO Tools

These tools are the mechanical apply layer for PMO runtime state.

PMO still decides sprint selection, validation status, documentation-sync outcome, commit state, residual risk, and follow-up routing. The tool only writes the resulting state transitions.

Runtime state and history live in the embedded independent git repository at `.pmo_runtime/` by default. Stable PMO templates and process docs stay in the product repository under `docs/pmo/**`.

Activation also writes a handoff skeleton into `.pmo_runtime/state/execution_task.md`.

The skeleton intentionally includes PMO sharpening slots such as execution slices, boundary notes, acceptance checks, validation expectations, and out-of-scope confirmation. The tool does not fill those with judgment-heavy content. PMO should review and replace or extend the slots before treating the handoff as ready for execution.

## Commands

Preview help:

```bash
node docs/pmo/tools/pmo.mjs --help
```

All state-writing commands require an explicit `--date YYYY-MM-DD`. PMO owns the date from the working context; the tool should not infer it from the local machine clock.

Use `--runtime-root "<path>"` only for tests or alternate runtime fixtures. `--pmo-root` remains as a backward-compatible alias for `--runtime-root`.

Activate a selected candidate:

```bash
node docs/pmo/tools/pmo.mjs activate --sprint "Sprint Name" --selected-by "Human" --date "2026-05-07" --dry-run
```

Activate a bounded micro-fix:

```bash
node docs/pmo/tools/pmo.mjs activate --micro-fix "Fix Name" --goal "One sentence goal." --date "2026-05-07" --dry-run
```

Close out a sprint:

```bash
node docs/pmo/tools/pmo.mjs closeout --sprint "Sprint Name" --delivery-status "completed and validated" --doc-sync "reviewed, no update needed" --commit-state "pending repository commit" --date "2026-05-07" --dry-run
```

Use `pending repository commit` for the normal PMO flow where closeout is accepted before the repository commit is created. If the work was already committed before closeout, record `committed before closeout: <hash>`. Do not update PMO state only to replace a pending value after the closeout commit; git history is the source of truth for the eventual repository action.

Reset runtime state when archives already exist:

```bash
node docs/pmo/tools/pmo.mjs idle-reset --last-sprint "Sprint Name" --delivery-status "completed and validated" --report-surface ".pmo_runtime/history/reports/sprint-name.md" --date "2026-05-07" --dry-run
```

Remove `--dry-run` only after the PMO judgment is settled.
