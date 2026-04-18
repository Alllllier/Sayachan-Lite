# PMO v2 Replacement Audit

> 审计时间：`2026-04-18`

这份文档回答的问题是：
`Sayachan PMO v2` 现在是否已经足够替代旧 PMO，成为新的 active PMO runtime surface。

## 当前结论

当前阶段结论：

- `PMO v2` 已经可以作为新的 **active PMO runtime surface**
- 两个主治理型 skills 也已经切到新 `docs/pmo/**`
- 旧 `docs/_legacy_pmo/**` 现在更适合作为 `legacy reference`
- 但 `PMO v2` 还没有做到“完整替代旧 PMO 的全部辅助能力”

更准确地说：

- **主运行面替代：已成立**
- **核心能力替代：大部分已成立**
- **边缘 guide / truth / sync 能力替代：仍有少量缺口，但已明显收敛**

## 已经成立的部分

### 1. 主 PMO 运行面已经成立

新 PMO 已经具备一套完整的最小运行结构：

- `state`
- `protocols`
- `policies`
- `baselines`
- `history`

其中核心运行文件已经就位：

- `docs/pmo/PMO_OPERATING_MANUAL.md`
- `docs/pmo/state/current_sprint.md`
- `docs/pmo/state/sprint_candidates.md`
- `docs/pmo/state/idea_backlog.md`
- `docs/pmo/state/decision_log.md`
- `docs/pmo/state/execution_task.md`
- `docs/pmo/state/execution_report.md`

### 2. 主流程与执行面已经成立

这些旧 PMO 的核心能力，在新 PMO 中都已经有明确承接位：

- discussion -> promotion -> sprint -> handoff -> closeout 主链路
- human-gated sprint activation
- bounded candidate pool
- decision capture after closeout
- execution task/report 双面结构
- validation expectation
- truth baseline（system/runtime/roadmap）

### 3. skills 已经切到新 PMO

目前已完成切换：

- `.codex/skills/sprint-pmo/SKILL.md`
- `.codex/skills/execution-prompt-compiler/SKILL.md`

它们现在默认读取：

- `docs/pmo/PMO_OPERATING_MANUAL.md`
- 新 `docs/pmo/state/*`
- 新 `docs/pmo/protocols/*`
- 新 `docs/pmo/baselines/*`

旧 `docs/_legacy_pmo/**` 已经被降级为 `legacy reference`。

## 仍然存在的缺口

这些缺口目前 **不会阻止 PMO v2 运行**，但会影响“是否算完整替代旧 PMO”。

### 1. discussion runtime 已完成首轮真实实例验证

新 PMO 已经有：

- `docs/pmo/state/discussion_index.md`
- `docs/pmo/state/discussions/`
- `docs/pmo/state/templates/discussion-batch.template.md`
- `docs/pmo/protocols/discussion-workflow.md`

而且 `theme + possible slices` 这条最关键的旧经验也已经制度化。

所以这里目前应视为：

- 结构已成立
- 首轮运行验证已完成
- 后续仍然值得继续观察 discussion 节奏和 writeback habit，但这已经不再是“缺少真实实例”的缺口

### 2. truth / boundary 辅助层仍有部分缺口

当前 truth / boundary 主体已经基本承接完成：

- `system-baseline`
- `runtime-baseline`
- `backend-api`
- `private-core-boundary`
- `roadmap`

这意味着：

- 主 truth baseline 已经完整成立
- 当前剩余缺口已不再主要集中在 truth 层，而更偏向 guide / execution-side 辅助能力

### 3. guide / sync / validation 辅助能力没有完全迁入

目前仍未完全承接的能力包括：

- AI fallback expectation
- feature completion checklist
- architecture-sensitive areas 的集中入口

这类能力的共同特点是：

- 它们不决定 PMO 主状态机能不能跑
- 但它们影响 PMO 的治理完整度和长期维护质量

其中 `documentation sync` 现在已经不再是缺口：

- 旧 sync 机制没有被原样迁入
- 但已经按新 PMO 的分层重建为：
  - `docs/pmo/policies/documentation-sync-policy.md`
  - `docs/pmo/policies/documentation-sync-guide.md`
  - `docs/pmo/protocols/sprint-workflow.md` 里的 closeout 检查点

所以 documentation sync 目前应视为：

- 已重建
- 已接入 PMO closeout
- 暂时仍然有意弱化 `ai-ops` 作为强同步面

### 4. 部分旧 manual 约定仍未重新安家

目前仍然只有“部分成立”的旧 manual 能力包括：

- skill routing entry
- baseline audit entry
- escalation boundary awareness

也就是说：

- 新 manual 已经足够作为运行入口
- 但旧 manual 里那种更细、更像治理提示的内容，并没有全部重新落位

## 当前建议

如果问题是：

**“现在能不能把 PMO v2 当成 Sayachan 的新 PMO 主运行面？”**

答案是：

**可以。**

如果问题是：

**“现在是不是已经完整替代旧 PMO 的所有有效能力？”**

答案是：

**还差最后一小段。**

## 最值得的后续动作

从价值和成本比来看，下一步最值得的不是继续大改结构，而是：

1. 决定剩余边缘治理能力是否继续进入重建：
   - `AI fallback expectation`
   - `feature completion checklist`
   - `architecture-sensitive areas` 的集中入口

## 结论

`PMO v2` 现在已经足够让 Sayachan 的 PMO **更清楚、更稳定，并进入真实运行**。

它已经超过“施工骨架”阶段，成为一个可用的新 PMO 运行面。

但如果目标是：

- 完整替代旧 PMO 的所有有效辅助能力
- 让旧 PMO 只剩纯历史参考价值

那还需要补完上面那批边缘 guide / execution-side 辅助能力。
其中 `documentation sync` 已经完成重建，不再属于当前主要缺口。
