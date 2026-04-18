# Docs 整理优先级清单

> 基于 `baselines/DOCS_INVENTORY_REVIEW.md` 的轻整理判断。
> 这份清单不是重构方案，只回答“现在最值得关注什么”。

## 1. 先别动，保持现状

这批文件虽然不一定完美，但当前语义已经相对稳定，贸然整理的收益不高，风险反而更大。

### PMO 运行面 contract

- `docs/pmo/state/current_sprint.md`
- `docs/pmo/state/sprint_candidates.md`
- `docs/pmo/state/idea_backlog.md`
- `docs/pmo/state/decision_log.md`
- `docs/pmo/state/discussion_batches/index.md`
- `docs/pmo/outbox/execution_task.md`
- `docs/pmo/workflows/discussion-workflow.md`
- `docs/pmo/workflows/promotion-workflow.md`

判断：

- 这些文件已经在承担真实 PMO 状态机和流程 contract
- 当前主要问题不是“放错地方”，而是“理解成本高”
- 现阶段更适合保持路径稳定，不做结构调整

### 相对纯的知识资产 / 历史记录

- `docs/ai-ops/README.md`
- `docs/ai-ops/architecture/public-private-development-model.md`
- `docs/ai-ops/policies/model-routing-policy.md`
- `docs/ai-ops/policies/skill-growth-policy.md`
- `docs/migration/ai-core-migration-record.md`
- `docs/ai-ops/history/claude-to-codex-pmo-migration.md`
- `docs/pmo/outbox/archive/chat-markdown-render-v1.md`
- `docs/pmo/outbox/archive/chat-markdown-render-v1-validation-followup.md`

判断：

- 这些文件的主标签已经比较清楚
- 短期内不值得投入整理精力

## 2. 明显混合，值得以后拆层

这批文件的问题不是“内容没价值”，而是同一文件里混了两层甚至三层语义。
后面如果要整理，优先应该处理这些。

### 第一优先级：核心混合文档

- `docs/pmo/PMO_OPERATING_MANUAL.md`
- `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md`
- `docs/architecture/system-baseline.md`
- `docs/architecture/runtime-workflow.md`
- `docs/architecture/private-core-boundary.md`

为什么优先：

- 它们都靠近系统控制面或边界面
- 混合了 `contract + baseline`，或者 `contract + guide`
- 继续增长的话，最容易让语义越来越脏

建议方向：

- 先识别哪些 section 是真正的硬约束
- 不急着拆文件，但要先把 section 级别的语义分层看清

### 第二优先级：半 contract 化的 guide

- `docs/guides/documentation-sync.md`
- `docs/guides/development-constraints.md`
- `docs/guides/testing-and-ui-review.md`
- `docs/ai-ops/workflows/codex-claude-development-loop.md`
- `docs/ai-ops/architecture/ai-development-system.md`

为什么优先：

- 主标签还是 `guide`
- 但内部已经长出不少半 contract 段落
- 这些文件最容易让人误以为“都是建议”，实际上有些段落已经在约束行为

建议方向：

- 以后优先做“语义减负”
- 能抽成独立 contract 的段落，再单独抽
- guide 本体尽量回到“操作说明”和“知识资产”

### 第三优先级：运行面里的历史混入

- `docs/pmo/inbox/execution_report.md`
- `docs/pmo/state/discussion_batches/discussion_batch_001.md`
- `docs/architecture/backend-api.md`
- `docs/architecture/README.md`

为什么优先：

- 主标签虽然可判定，但内部混有实例记录、历史信息或目录说明
- 不一定要拆，但很值得后面控制继续膨胀

## 3. 目录语义最值得优先收口的地方

### `docs/guides/`

这是当前最模糊的目录。

现状：

- 有些文件是纯 guide
- 有些文件已经长出半 contract
- 有些内容其实和 `architecture` 或 `pmo` 有强耦合

结论：

- 现在最值得先做的是“明确 guides 的边界”
- 不是立刻搬文件
- 而是先形成一句清晰规则：`guides` 主要收通用操作说明，不收 repo 的唯一硬约束

### `docs/architecture/`

现状：

- 整体仍然成立为“代码真相层”
- 但几个核心文件里混入了强约束和债项记录

结论：

- 这个目录不需要重做
- 但后面值得逐步把 `baseline` 和 `contract` 的界线拉开

### `docs/ai-ops/`

现状：

- 大方向已经比较清楚，是协作知识资产层
- `policies/` 比较纯
- `workflows/` 和部分 `architecture/` 更容易混入 repo-native 约束

结论：

- 这个目录短期不用重整
- 重点是防止知识资产继续长成 repo contract

## 4. 当前最推荐的整理顺序

如果后面真的开始整理，建议顺序如下：

1. 先只补“目录边界说明”和“文档语义说明”
2. 再做 section 级别的混合识别
3. 再决定哪些混合文档要拆层
4. 最后才考虑移动文件或重组目录

## 5. 当前不建议做的事

- 不建议大规模移动 `docs/` 下文件
- 不建议马上拆 PMO state 文件
- 不建议把所有混合文档立刻重写
- 不建议在还没稳定前把大量 guide 升级成 contract

## 6. 一句话判断

现在最适合做的是：

- 继续整理“语义层”和“边界层”

现在还不适合做的是：

- 对 `docs/` 目录做一次彻底的物理重构
