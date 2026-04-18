# Sayachan PMO Layer Mapping

这份文档用于把 `Sayachan` 当前 PMO / docs 中的关键文件，映射到新的 PMO 分层骨架。

## 分层骨架

- `Runtime State`
- `Protocol`
- `Policy`
- `Baseline / Truth`
- `History / Knowledge`

## 使用规则

- 先记录文件当前主归属层。
- 如果文件内部明显混层，单独备注。
- 暂时先做映射，不直接改文件位置。
- 如果某个文件属于“保留原位，但以后要拆层”，也先记录，不马上施工。

## 映射表

| 文件 | 当前主层 | 是否混层 | 备注 |
| --- | --- | --- | --- |
| `docs/pmo/state/current_sprint.md` | `Runtime State` | `否` | 新 PMO 应保留同等语义的当前 sprint 状态卡。 |
| `docs/pmo/state/sprint_candidates.md` | `Runtime State` | `否` | 新 PMO 应保留同等语义的 candidate pool。 |
| `docs/pmo/state/idea_backlog.md` | `Runtime State` | `否` | 新 PMO 应保留 discussion-stage 问题池，但可进一步压薄描述性段落。 |
| `docs/pmo/state/decision_log.md` | `Runtime State` | `否` | 旧 PMO 中存在但使用不足；新 PMO 里应继续保留，并制度化使用。 |
| `docs/pmo/outbox/execution_task.md` | `Runtime State` | `否` | 新 PMO 中仍需要 active execution task surface。 |
| `docs/pmo/inbox/execution_report.md` | `Runtime State` | `是` | 运行面上属于状态文件，但内容天然带实例历史；新 PMO 中应保留为 runtime state，不再混入额外说明。 |
| `docs/pmo/state/discussion_batches/index.md` | `Runtime State` | `否` | 属于 discussion-state 的顶层索引；新 PMO 里可以保留，但可视为成熟扩展。 |
| `docs/pmo/state/discussion_batches/discussion_batch_001.md` | `Runtime State` | `是` | 作为 discussion surface 属于 state，但内部混有历史记录和 promotion 过程；新 PMO 后续可考虑把实例批次与沉淀结论分离。 |
| `docs/pmo/workflows/discussion-workflow.md` | `Protocol` | `否` | 旧 PMO 中相对最纯的 workflow contract，新 PMO 可直接继承其核心语义。 |
| `docs/pmo/workflows/promotion-workflow.md` | `Protocol` | `否` | 旧 PMO 中相对最纯的 workflow contract，新 PMO 可直接继承其核心语义。 |
| `docs/pmo/workflows/sprint-lifecycle-workflow.md` | `Protocol` | `是` | 主体是 lifecycle contract，但混有 validation/commit 说明；新 PMO 中以 `sprint-workflow.md` 形式承接，并把真正横向规则回收到 policy。 |
| `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md` | `Protocol` | `是` | 仍是关键 handoff contract，但部分 file policy/说明性段落可从 protocol 中剥离。 |
| `docs/pmo/PMO_OPERATING_MANUAL.md` | `Protocol` | `是` | 当前是 PMO 宪法级文档，但内部混有 baseline、guide、routing 说明；新 PMO 中更适合拆成更窄的 protocol + policy + baseline。 |
| `docs/guides/documentation-sync.md` | `Policy` | `是` | 当前主标签是 guide，但其中已经长出真正的横向同步规则；新 PMO 中可提炼为正式 documentation sync policy。 |
| `docs/guides/development-constraints.md` | `Policy` | `是` | 当前主标签是 guide，但其中的 architecture-sensitive areas、feature constraints 可回收为横向 policy。 |
| `docs/guides/testing-and-ui-review.md` | `Policy` | `是` | 当前仍是 guide，但其中的验证预期可为新 PMO 提供 validation floor policy 的来源；注意不要保留前端特定表达为默认。 |
| `docs/architecture/private-core-boundary.md` | `Policy` | `是` | 当前主标签更接近 contract，但对新 PMO 来说更像必须被引用的 boundary policy source，而不是 PMO runtime state/protocol。 |
| `docs/architecture/system-baseline.md` | `Baseline / Truth` | `是` | 仍是系统真相基线的核心来源，但内部混有 boundary/safe zone 规则；新 PMO 中应保留 baseline 主身份，并把强规则外提。 |
| `docs/architecture/runtime-workflow.md` | `Baseline / Truth` | `是` | 仍是产品运行真相和 surface responsibilities 的核心盘点；其中混入的 debt/rule 提示在新 PMO 中应降回引用或拆层。 |
| `docs/architecture/backend-api.md` | `Baseline / Truth` | `是` | 仍是 backend truth 的主要来源；其中 contract note 后续可外提或缩窄。 |
| `docs/architecture/roadmap.md` | `Baseline / Truth` | `否` | 可继续作为 roadmap/debt baseline 使用，是新 PMO 理解现状与债项的重要 truth 文档。 |
| `docs/architecture/README.md` | `Baseline / Truth` | `是` | 当前是 architecture 入口说明，但同时承接 canonical set/audit notes；新 PMO 中更适合保留为轻入口，不再承载过多事实。 |
| `docs/README.md` | `Baseline / Truth` | `否` | 这是 docs 目录语义地图，对新 PMO 仍有参考价值，但不属于 PMO active runtime。 |
| `docs/pmo/outbox/archive/chat-markdown-render-v1.md` | `History / Knowledge` | `否` | 已归档 handoff，后续应整体进入 legacy/history 区。 |
| `docs/pmo/outbox/archive/chat-markdown-render-v1-validation-followup.md` | `History / Knowledge` | `否` | 已归档 handoff follow-up，后续应整体进入 legacy/history 区。 |
| `docs/migration/ai-core-migration-record.md` | `History / Knowledge` | `否` | 保持历史迁移记录身份，不参与新 PMO active contract。 |
| `docs/ai-ops/workflows/codex-claude-development-loop.md` | `History / Knowledge` | `是` | 对 Sayachan 新 PMO 来说更适合作为历史协作知识参考，而不是继续进入 active PMO canonical set。 |
