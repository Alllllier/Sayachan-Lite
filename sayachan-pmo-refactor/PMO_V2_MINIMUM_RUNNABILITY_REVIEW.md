# PMO v2 Minimum Runnability Review

> 审查时间：`2026-04-18`

这份文档只回答一个问题：

`Sayachan PMO v2` 现在距离“最小可运行”还差什么。

## 当前已经具备的部分

### Runtime State

已具备：

- `current_sprint.md`
- `sprint_candidates.md`
- `idea_backlog.md`
- `decision_log.md`
- `execution_task.md`
- `execution_report.md`

结论：

- 最小状态面已经成形
- 状态职责也比旧 PMO 清楚

### Protocols

已具备：

- `discussion-workflow.md`
- `promotion-workflow.md`
- `sprint-workflow.md`
- `execution-handoff-protocol.md`

结论：

- 主流程和交接 contract 都已经有了
- `human-gated sprint selection`、`candidate drafting ≠ confirmation`、`closeout 后检查 decision capture` 这些关键经验已经写入协议层

### Policies

已具备：

- `decision-capture-policy.md`
- `validation-floor-policy.md`

结论：

- 新 PMO 已经不再完全依赖 workflow 混入横向规则
- `decision_log` 和 `validation` 这两个过去最容易漂移的点，已经开始被制度化

## 当前最主要的缺口

### 1. `Baseline / Truth` 还太薄

当前只有：

- `baselines/roadmap.md`

这还不够支撑新 PMO 的长期运行，因为 PMO 还需要至少两类 truth：

- 系统真相基线
- runtime/workflow 真相基线

对应旧文档来源大致是：

- `docs/architecture/system-baseline.md`
- `docs/architecture/runtime-workflow.md`

问题不在于没有来源，而在于旧来源混层较重，不能直接搬。

当前判断：

- 这是新 PMO 最优先的剩余缺口

### 2. `History` 层还是空壳

当前 `history/` 只有目录说明，没有实际承接内容。

这不会阻碍新 PMO 现在继续长，但会影响后续：

- 旧 PMO 如何退役
- 旧 handoff / archive 如何迁入 legacy
- 哪些旧材料仍可作为参考

当前判断：

- 这不是立刻阻塞项
- 但在真正切换新 PMO 之前必须补一个最小历史承接位

### 3. 旧 architecture truth 还没重新审计进新 PMO

旧的：

- `docs/architecture/system-baseline.md`
- `docs/architecture/runtime-workflow.md`
- `docs/architecture/backend-api.md`

仍然是最接近 truth 的来源，但这些文档写于旧结构语境下，不能直接等同于新 PMO 的 truth baseline。

当前判断：

- 新 PMO 需要一轮按新分层重新进行的 architecture audit
- 重点不是“把旧文档复制过来”，而是重新确认：
  - 现在系统实际上是什么
  - 哪些还是 truth
  - 哪些其实是 rule / debt / warning

## 当前优先级建议

按顺序建议补：

1. 新版 `system-baseline`
2. 新版 `runtime-baseline` 或 `runtime-truth`
3. `history` 的最小承接位

## 结论

`Sayachan PMO v2` 现在已经不再是空骨架。

它已经具备：

- 最小状态面
- 主协议层
- 第一批正式 policy

离“最小可运行”最近的剩余工作，不在 `state` 或 `workflow`，而在：

- 把 `truth baseline` 补实
- 为后续旧 PMO 退役预留 `history` 承接位
