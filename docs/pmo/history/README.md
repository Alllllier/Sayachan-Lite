# History

这一层用于承载历史记录、迁移说明和逐步退役的旧材料。

这里的文件应该主要回答：

- 过去发生了什么
- 为什么会走到当前结构
- 哪些旧文件只是历史参考

这一层不应该再承担当前 PMO 的 active contract。

当前第一批 history 承接文件包括：

- `legacy-transition-notes.md`
- `pmo-v2-rebuild-lessons.md`
- `ai-core-migration-record.md`
- `pmo-v2-transition-audit-summary.md`

另外，历史层也可以包含结构化归档子层，例如：

- `candidates/`
  - 承接已经退出 `state/sprint_candidates.md` 的 completed candidate 记录
- `reports/`
  - 承接已经退出 `state/execution_report.md` active surface 的已读 execution report

这些结构化子层仍然属于 `history/`，但它们的用途是保存已退出 active surface 的运行记录，而不是迁移说明本身。
