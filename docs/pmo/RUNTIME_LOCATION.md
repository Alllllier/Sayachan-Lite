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

## Private AI-Core Runtime

AI-core replacement work owns a separate PMO runtime:

```text
backend/private_core/sayachan-ai-core/.pmo_runtime/
```

Use it for:

- AI-core replacement candidates
- private-core active sprint state
- private-core execution handoffs and reports
- persona-core architecture implementation planning
- provider/runtime migration planning

The product-level `.pmo_runtime/` should keep only product-level coordination, summary, or boundary-routing records for AI-core topics.

Stable PMO templates and tools still live in the product repo under `docs/pmo/**`.
To apply the same PMO automation to the private AI-core runtime, pass:

```bash
node docs/pmo/tools/pmo.mjs <command> --runtime-root "backend/private_core/sayachan-ai-core/.pmo_runtime" ...
```
