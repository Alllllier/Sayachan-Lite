# PMO Runtime Location

Sayachan PMO runtime state and execution history live in:

```text
.pmo_runtime/
```

`.pmo_runtime/` is an embedded independent git repository and is ignored by the product repository.

The product repository keeps stable PMO assets:

- `docs/pmo/PMO_OPERATING_MANUAL.md`
- `docs/pmo/protocols/**`
- `docs/pmo/policies/**`
- `docs/pmo/baselines/**`
- `docs/pmo/operator-guides/**`
- `docs/pmo/tools/**`
- `docs/pmo/state/templates/**`
- `docs/pmo/history/templates/**`

Runtime-owned PMO assets live in `.pmo_runtime/`:

- `.pmo_runtime/state/**`
- `.pmo_runtime/history/candidates/**`
- `.pmo_runtime/history/reports/**`
- `.pmo_runtime/history/reference/**`
