# Docs Inventory Review

> 人工复核台账。先把 `docs/` 下所有 Markdown 文档登记进来，再逐步补人工判断。

## 使用说明

- 这份文件是人工复核层，不替代自动初稿。
- 自动初稿见：`baselines/DOCS_INVENTORY_DRAFT.md`
- 这里先把所有文件都登记，并统一标注为 `未人工确认`。
- 后续复核时，再逐条补：
  - 人工确认标签
  - 是否混合
  - 混合说明
  - 备注 / 后续动作

## 复核表

| 文件路径 | 人工复核状态 | 人工确认主标签 | 是否混合 | 混合说明 | 备注 / 后续动作 |
| --- | --- | --- | --- | --- | --- |
| `docs/README.md` | `已人工确认` | `guide` | `否` |  | 这是整个 `docs/` 目录的入口地图，职责很单纯，主标签应稳定视为 guide。 |
| `docs/ai-ops/README.md` | `已人工确认` | `guide` | `否` |  | 它本质上是 `ai-ops/` 目录的入口地图和维护说明，主标签应是 guide。 |
| `docs/ai-ops/architecture/ai-development-system.md` | `已人工确认` | `guide` | `是` | 主体是在解释 AI 开发系统如何分层和运作，但其中 `Asset Split` 已经在描述当前 repo 的半 contract 结构。 | 当前更适合作为知识资产层 guide；后续如果某些结构被稳定依赖，可再把 contract 抽出去。 |
| `docs/ai-ops/architecture/public-private-development-model.md` | `已人工确认` | `guide` | `否` |  | 它主要在给 public/private repo 协作提供原则和边界说明，更像知识资产层 guide，而不是当前唯一 canonical boundary contract。 |
| `docs/ai-ops/history/claude-to-codex-pmo-migration.md` | `已人工确认` | `history` | `否` |  | 这份文件明确是在记录一次 PMO ownership 迁移，主标签应稳定视为 history。 |
| `docs/ai-ops/policies/model-routing-policy.md` | `已人工确认` | `contract` | `否` |  | 这份 policy 已经在直接约束模型路由行为，属于可执行规则，主标签应视为 contract。 |
| `docs/ai-ops/policies/skill-growth-policy.md` | `已人工确认` | `contract` | `否` |  | 这份 policy 已经在约束什么时候长 skill、什么时候长 policy，本质上是 AI-ops 层的运行规则。 |
| `docs/ai-ops/workflows/codex-claude-development-loop.md` | `已人工确认` | `guide` | `是` | 主体是协作流程说明，但里面直接写了 repo-native handoff 路径和 outbox 语义，带有 contract 成分。 | 后续可考虑把 repo-native 路径依赖下沉到更明确的 contract 文件，保留这里作为知识资产层工作流。 |
| `docs/architecture/backend-api.md` | `已人工确认` | `baseline` | `是` | 主体是在盘点当前 backend API 真相，但 `Important Contract Notes` 已带有 contract 语义。 | 当前仍以 baseline 为主；后续若收 contract，可把真正的强约束单独提炼。 |
| `docs/architecture/private-core-boundary.md` | `已人工确认` | `contract` | `是` | 主体是 public/private core 边界 contract，但 `Discussion And Documentation Rule` 同时承担了 guide 性质。 | 后续可考虑把纯边界约束和讨论迁移规则拆层，但当前主标签应仍视为 contract。 |
| `docs/architecture/README.md` | `已人工确认` | `guide` | `是` | 它主体是 architecture 目录入口说明，但 `Canonical Set` 和 `Audit Notes` 同时在承接 baseline/history 信息。 | 主标签更适合作为 guide；后续可保持入口地图属性，不必让它承担过多事实盘点。 |
| `docs/architecture/roadmap.md` | `已人工确认` | `baseline` | `否` |  | 这份文件主要是在盘点已交付里程碑、当前债项和近期待清理项，更接近现状基线而不是 contract。 |
| `docs/architecture/runtime-workflow.md` | `已人工确认` | `baseline` | `是` | 主体在盘点当前产品循环与 surface responsibilities，但其中也混有 provenance contract、archive rule 和 active debt 提示。 | 这是典型混合文档，后续可能要拆“现状盘点”和“规则/债项”层。 |
| `docs/architecture/system-baseline.md` | `已人工确认` | `baseline` | `是` | 主体是当前系统现状盘点，但其中也包含 `Boundary rule`、`Safe Zones`、`Do not change without explicit boundary review` 这类 contract 性段落。 | 这是 architecture 层里很关键的混合文档，后续值得考虑把强约束和现状盘点分层。 |
| `docs/guides/development-constraints.md` | `已人工确认` | `guide` | `是` | 主体是开发约束和操作说明，但其中某些 AI feature rule、architecture-sensitive areas 已接近半 contract。 | 当前仍应以 guide 为主，因为它更像操作说明集合，不是系统唯一强约束来源。 |
| `docs/guides/documentation-sync.md` | `已人工确认` | `guide` | `是` | 主体是文档同步操作说明，但 `Canonical Docs To Keep In Sync`、`Responsibility Rule`、`Repo Hook Scope` 已经在承担半 contract 角色。 | 后续很值得单独收“真正的 sync contract”，让这份文件回到更纯的 guide。 |
| `docs/guides/testing-and-ui-review.md` | `已人工确认` | `guide` | `是` | 主体是验证层和 UI review 的操作说明，但 `Report Contract` 和部分默认规则已经带有轻度 contract 性。 | 当前仍以 guide 为主，因为它主要回答“怎么做验证更合适”。 |
| `docs/migration/ai-core-migration-record.md` | `已人工确认` | `history` | `否` |  | 这份文件纯粹是在记录一次历史迁移，且已经明确把 `private-core-boundary.md` 指定为长期 canonical reference。 |
| `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md` | `已人工确认` | `contract` | `是` | 主体是 repo-native handoff contract，但 `File Policy` 之类段落也带有 guide 色彩。 | 这份文件的主标签必须保持 contract，因为系统真实 handoff 语义已经依赖它。 |
| `docs/pmo/PMO_OPERATING_MANUAL.md` | `已人工确认` | `contract` | `是` | 它是 PMO 宪法级文件，主标签必须是 contract，但其中也混有 baseline reference、language policy、skill routing 这类 guide 成分。 | 当前应保留 contract 主标签；后续可以考虑减轻其中的说明性段落，让 manual 更纯。 |
| `docs/pmo/inbox/execution_report.md` | `已人工确认` | `contract` | `是` | 文件路径和系统角色上它是当前 inbox return surface，但文件内容本身是一份具体执行记录，天然带有实例历史性。 | 主标签仍应按运行面视为 contract。 |
| `docs/pmo/outbox/execution_task.md` | `已人工确认` | `contract` | `否` |  | 这是当前 active execution contract 或 idle placeholder，本身就是运行面 contract。 |
| `docs/pmo/outbox/archive/chat-markdown-render-v1-validation-followup.md` | `已人工确认` | `history` | `否` |  | 这是已归档的 handoff 快照文件，已经脱离 active runtime surface，更适合按 history 看。 |
| `docs/pmo/outbox/archive/chat-markdown-render-v1.md` | `已人工确认` | `history` | `否` |  | 这是已归档的 handoff 快照文件，主标签更适合视为 history。 |
| `docs/pmo/state/current_sprint.md` | `已人工确认` | `contract` | `否` |  | 这是当前 PMO 状态卡，属于核心运行面 contract。 |
| `docs/pmo/state/decision_log.md` | `已人工确认` | `contract` | `否` |  | 它是正式 PMO 状态机的一部分，不是普通记录性文档。 |
| `docs/pmo/state/idea_backlog.md` | `已人工确认` | `contract` | `否` |  | 它承担正式的 discussion-stage PMO 状态，不应仅看作说明或笔记。 |
| `docs/pmo/state/sprint_candidates.md` | `已人工确认` | `contract` | `否` |  | 它是正式 candidate pool，属于运行中的 PMO 状态面。 |
| `docs/pmo/state/discussion_batches/discussion_batch_001.md` | `已人工确认` | `contract` | `是` | 它是当前 discussion-state 的一部分，但内部天然混有主题历史、promotion record 和批次笔记。 | 主标签仍应按运行中 discussion surface 视为 contract。 |
| `docs/pmo/state/discussion_batches/index.md` | `已人工确认` | `contract` | `否` |  | 它是 discussion 阶段的顶层索引，属于 PMO 状态机核心文件。 |
| `docs/pmo/workflows/discussion-workflow.md` | `已人工确认` | `contract` | `否` |  | 这份文件基本就是阶段 contract，当前纯度比较高。 |
| `docs/pmo/workflows/promotion-workflow.md` | `已人工确认` | `contract` | `否` |  | 这份文件基本就是阶段 contract，当前纯度比较高。 |
| `docs/pmo/workflows/sprint-lifecycle-workflow.md` | `已人工确认` | `contract` | `是` | 主体是 execution-facing lifecycle contract，但 `Validation Rule` 和 `Commit Rule` 已经承担较多说明与判断框架。 | 主标签仍应保持 contract；后续如果要拆，可以把说明性补充从 lifecycle 核心约束里分出去。 |
