# Sayachan PMO v2

这是 `Sayachan` PMO 的稳定规则、基线、模板和工具层。

当前目标不是做通用 PMO 产品，而是为 `Sayachan` 建立一套更清晰、更稳定、更容易被 `Codex` 正确读取的 PMO 结构。

## Runtime Boundary

频繁变化的 PMO runtime state 和 execution history 已迁入项目内的独立 git repo：

```text
.pmo_runtime/
```

产品 repo 不追踪 `.pmo_runtime/`，因此 PMO 施工、handoff、report、candidate closeout、history archive 不再污染产品提交。

位置规则见：

- `docs/pmo/RUNTIME_LOCATION.md`

## 分层

- `protocols/`
- `policies/`
- `baselines/`
- `tools/`
- `state/templates/`
- `history/templates/`

另外补充一层面向 PMO 系统使用者的说明层：

- `operator-guides/`

## 当前原则

- 稳定 PMO 规则留在产品 repo。
- PMO 运行态和归档历史由 `.pmo_runtime/` 自己管理。
- `docs/pmo/state/` 只保留模板和 runtime 指针说明。
- `docs/pmo/history/templates/` 保留归档格式模板；真实归档记录仍写入 `.pmo_runtime/history/`。
