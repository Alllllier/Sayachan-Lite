# Runtime State

这一层用于承载 `Sayachan` 新 PMO 的运行态文件。

这里的文件应该满足：

- 路径稳定
- 职责单一
- 尽量少写长篇解释
- 主要回答“当前状态是什么”

推荐按下面的路由理解这一层：

`discussion_index.md` + `discussions/` 承载新 intake 与讨论聚类，
`idea_backlog.md` 承载保留或 parked 的未来工作，
`sprint_candidates.md` 承载可比较的候选冲刺，
`current_sprint.md` + `execution_task.md` 承载已选中的执行切片，
`execution_report.md` 承载执行返回，
`decision_log.md` 承载 durable decision、explicit deferral 与 rejected path。

后续会在这里放入最小状态集合，例如：

- `current_sprint`
- `sprint_candidates`
- `idea_backlog`
- `decision_log`
- `execution_task`
- `execution_report`

同时，discussion 阶段的运行面也在这一层：

- `discussion_index.md`
- `discussions/`

同时，这一层现在也承载与运行态文件对应的模板：

- `templates/current-sprint.idle.template.md`
- `templates/execution-task.idle.template.md`
- `templates/execution-report.idle.template.md`
- `templates/execution-task.template.md`
- `templates/execution-report.template.md`
- `templates/discussion-batch.template.md`
