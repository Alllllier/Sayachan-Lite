# Sayachan PMO v2

这是 `Sayachan` 新 PMO 的并行重建骨架。

当前目标不是做通用 PMO 产品，而是为 `Sayachan` 建立一套更清晰、更稳定、更容易被 `Codex` 正确读取的 PMO 结构。

## 分层

- `state/`
- `protocols/`
- `policies/`
- `baselines/`
- `history/`

另外补充一层面向 PMO 系统使用者的说明层：

- `operator-guides/`

## 当前原则

- 先建新 PMO，不在旧 PMO 上继续修补。
- 旧 PMO 暂时继续保留，后续再整体迁到 legacy 区。
- 新 PMO 的 canonical 路径和旧 PMO 完全分开。
- 先追求最小可运行骨架，再逐步补内容。
