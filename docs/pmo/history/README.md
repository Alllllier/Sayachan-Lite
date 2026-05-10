# PMO History Templates

This product-repo directory keeps stable PMO archive templates.

Runtime history lives in the embedded independent git repository:

```text
.pmo_runtime/history/
```

Ownership split:

- `docs/pmo/history/templates/**` defines archive shapes and belongs to the product repository.
- `.pmo_runtime/history/candidates/**` contains real candidate archives.
- `.pmo_runtime/history/reports/**` contains real execution report archives.
- `.pmo_runtime/history/reference/**` contains runtime-owned historical reference material unless promoted into stable product docs.

Use `docs/pmo/RUNTIME_LOCATION.md` for the full runtime ownership rule.
