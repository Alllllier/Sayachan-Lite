# 当前 PMO 系统分层映射

> 这份文档把当前系统的关键文件，对照到
> [IDEAL_PMO_LAYERED_DESIGN.md](/C:/Users/allie/Desktop/personal_os_lite/baselines/IDEAL_PMO_LAYERED_DESIGN.md)
> 里的五层模型中。
> 目的不是立刻重构，而是看清“现在主要偏差在哪里”。

## 1. 五层回顾

理想模型里的五层是：

- `Runtime State`
- `Protocol`
- `Policy`
- `Baseline / Truth`
- `Knowledge / History`

当前系统的问题，不是完全没有这些层，而是：

- 有些层已经存在
- 但它们没有被清晰分开

## 2. 当前文件映射

### Runtime State

当前最接近这一层的文件有：

- `docs/pmo/state/current_sprint.md`
- `docs/pmo/state/sprint_candidates.md`
- `docs/pmo/state/idea_backlog.md`
- `docs/pmo/state/decision_log.md`
- `docs/pmo/state/discussion_batches/index.md`
- `docs/pmo/state/discussion_batches/discussion_batch_001.md`
- `docs/pmo/outbox/execution_task.md`
- `docs/pmo/inbox/execution_report.md`

判断：

- 这一层其实已经长出来了
- 而且是当前系统里最真实、最稳定的一层

当前偏差：

- `discussion_batch_001.md` 和 `execution_report.md` 这种文件，既是运行态 surface，又天然混有历史记录内容
- 也就是说，这一层已经存在，但还没有完全做到“只承载活状态”

### Protocol

当前最接近这一层的文件有：

- `docs/pmo/workflows/discussion-workflow.md`
- `docs/pmo/workflows/promotion-workflow.md`
- `docs/pmo/workflows/sprint-lifecycle-workflow.md`
- `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md`

判断：

- 这一层也已经长出来了
- 而且纯度比预想中更高

当前偏差：

- `sprint-lifecycle-workflow.md`、`EXECUTION_HANDOFF_PROTOCOL.md` 里仍混有解释性和建议性段落
- 说明 protocol 层已经成型，但还没有完全去掉 guide 成分

### Policy

当前最接近这一层的文件有：

- `docs/ai-ops/policies/model-routing-policy.md`
- `docs/ai-ops/policies/skill-growth-policy.md`
- `docs/guides/documentation-sync.md`
- `docs/guides/development-constraints.md`
- `docs/guides/testing-and-ui-review.md`

判断：

- 这一层是存在的，但边界比较散
- 一部分放在 `ai-ops/policies/`
- 一部分放在 `guides/`

当前偏差：

- policy 层没有作为一个明确层被设计出来
- 所以你会感觉 `guides/` 很模糊
- 本质上是因为很多 policy 被塞进了 guide 容器

### Baseline / Truth

当前最接近这一层的文件有：

- `docs/architecture/system-baseline.md`
- `docs/architecture/runtime-workflow.md`
- `docs/architecture/backend-api.md`
- `docs/architecture/roadmap.md`

判断：

- 这一层非常明确，几乎已经是当前系统里最完整的“命名正确层”

当前偏差：

- `system-baseline.md`、`runtime-workflow.md`、`backend-api.md` 都混入了一些 contract 性段落
- 也就是说，baseline 层虽然存在，但没有完全守住“只描述现状”

### Knowledge / History

当前最接近这一层的文件有：

- `docs/ai-ops/README.md`
- `docs/ai-ops/architecture/ai-development-system.md`
- `docs/ai-ops/architecture/public-private-development-model.md`
- `docs/ai-ops/workflows/codex-claude-development-loop.md`
- `docs/migration/ai-core-migration-record.md`
- `docs/ai-ops/history/claude-to-codex-pmo-migration.md`
- `docs/pmo/outbox/archive/*.md`

判断：

- 这一层也已经存在
- 但 `ai-ops` 里面的知识资产和 repo-native 约束有时会混住

当前偏差：

- 某些知识资产文件会直接写入当前 repo 的路径和运行规则
- 这样它们就不再只是 knowledge，而会开始侵入 protocol 或 policy

## 3. 当前系统最大的偏差在哪里

对照之后，最明显的偏差不是“缺层”，而是“跨层”。

### 偏差一：Policy 没有被独立意识到

当前系统里，policy 这层其实已经存在，但没有被作为独立层清晰命名。

结果就是：

- 一部分规则长在 `ai-ops/policies/`
- 一部分规则长在 `guides/`
- 一部分规则又混进 `manual` 和 `baseline`

这会直接制造你之前感受到的“guides 很模糊”。

### 偏差二：Baseline 和 Contract 经常混住

这在 `docs/architecture/` 里最明显。

现状是：

- baseline 文件负责描述真相
- 但它们又承担了一些“不能这样改”的约束

所以读的人会不断在“这是地图”还是“这是规则”之间切换。

### 偏差三：Knowledge 和 Protocol 没完全分开

这在 `docs/ai-ops/` 里最明显。

现状是：

- 一部分文件确实是在沉淀协作知识
- 但一部分文件又直接承载 repo-native handoff 和 workflow 规则

这会让 `ai-ops` 看起来既像知识库，又像运行规程。

### 偏差四：Runtime State 里夹带了实例历史

这在 `execution_report`、`discussion_batch_001` 里最明显。

本质上它们仍然是运行面文件，但因为系统目前就是靠文件承载状态，所以这些文件很难完全避免历史沉积。

这不一定是坏事，但说明：

- 当前 runtime state 还没有完全和历史层剥离

## 4. 当前系统最健康的部分

如果按这个理想模型反看现状，当前最健康的部分其实有两块。

### 最健康之一：Runtime State 主骨架

也就是：

- current sprint
- candidates
- backlog
- decision log
- execution task
- execution report

这套骨架其实已经很像一个轻量状态机了。

### 最健康之二：PMO Workflow 主骨架

也就是：

- discussion workflow
- promotion workflow
- sprint lifecycle

它们已经很接近 protocol 层，只是还没完全去掉解释性段落。

## 5. 当前最不健康的部分

当前最不健康的不是 `pmo/state`，而是下面两块。

### `docs/guides/`

问题不是内容无用，而是它在替一个没有被明确命名的 `policy` 层兜底。

所以它看起来会像：

- 通用操作说明
- 半 contract
- 横向规则集

都混在一起。

### `docs/ai-ops/`

问题不是方向错，而是：

- knowledge 资产
- workflow 资产
- repo-native 运行约束

有时候混在同一个主题目录下。

所以这个目录的“主题”是成立的，但它内部的“层级”不够干净。

## 6. 一句话结论

当前这套 PMO 系统其实已经长出了理想模型里的五层雏形。

真正的问题不是“没有层”，而是：

- `Policy` 层没有独立出来
- `Baseline` 经常混入 `Contract`
- `Knowledge` 经常混入 `Protocol`
- `Runtime State` 还带着一些实例历史沉积

换句话说：

这套系统更像是“分层已经长出来，但目录和文件还没把这些层分干净”。
