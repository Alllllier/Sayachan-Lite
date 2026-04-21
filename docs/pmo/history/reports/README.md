# Report History

这一层用于承载已经退出 `state/execution_report.md` active surface 的已读 execution report。

它回答的是：

- 某次 sprint 完成时 execution worker 实际回了什么
- PMO closeout 之前读到的详细验证证据是什么
- 某次 closeout 为什么被判断成 `completed`、`completed but not fully validated` 或其他状态

这里不承担当前 PMO 的 active report surface，也不替代：

- `state/execution_report.md` 的当前等待回包状态
- `state/current_sprint.md` 的 closeout 摘要

使用规则：

- 当 `state/execution_report.md` 已被 PMO 读完并准备复位为 idle 时，将最近一次详细回包归档到这里
- 归档时参照 `execution-report-archive.template.md`
- 不要把仍在等待 PMO closeout 的 active report 放到这里
- 不要把迁移说明、audit summary、流程评估等非 execution-report 文档继续放在这里；这类文件应进入 `../reference/`
