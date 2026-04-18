# PMO v2 Parity Source Review

> 这份台账用于记录：旧 PMO / 相关 docs 中，哪些证据源已经读过，哪些还没读。

## 使用规则

- 这里记录的是“证据源阅读状态”，不是最终审计结论。
- 每读完一份旧文档，就把状态从 `未审` 改成 `已审`。
- 如果一份文档只部分使用，也先记为 `已审`，并在备注里说明主要提取了什么能力。
- 最终能力判断写入：
  - `PMO_V2_CAPABILITY_PARITY_AUDIT.md`

## 阅读台账

| 文档 | 阅读状态 | 主要能力线索 | 备注 |
| --- | --- | --- | --- |
| `docs/_legacy_pmo/PMO_OPERATING_MANUAL.md` | `已审` | `PMO operating entrypoint`、`role split`、`workflow map`、`skill routing`、`baseline audit entry`、`escalation boundary`、`validation expectation` | 第一批核心入口证据源；混层明显，但有效能力密度很高。 |
| `docs/_legacy_pmo/EXECUTION_HANDOFF_PROTOCOL.md` | `已审` | `execution handoff contract`、`task/report ownership`、`overwrite vs archive rule`、`idle placeholder rule`、`report writing expectation` | 旧 PMO 中 handoff 语义的最主要来源。 |
| `docs/_legacy_pmo/workflows/discussion-workflow.md` | `已审` | `discussion runtime surface`、`theme clustering`、`single focus rule`、`possible slices preservation`、`promotion compression after stabilization` | 第二批 discussion 线核心证据源；明确说明 discussion 不是长期 canonical home，而是形成正式 PMO 状态之前的运行面。 |
| `docs/_legacy_pmo/workflows/promotion-workflow.md` | `已审` | `promotion targets`、`slice-level promotion`、`discussion-to-state transition`、`candidate readiness discipline` | 第二批 discussion/promotion 证据源；特别重要的是它把 theme/slice 的稳定结果导向 formal PMO state。 |
| `docs/_legacy_pmo/workflows/sprint-lifecycle-workflow.md` | `已审` | `candidate comparison`、`human-gated sprint start`、`closeout categories`、`commit vs closeout split`、`validation expectation`、`decision-log check after closeout` | 第一批核心流程证据源；部分规则已经被新 PMO policy/protocol 吸收。 |
| `docs/_legacy_pmo/state/current_sprint.md` | `已审` | `current sprint state card`、`sprint activation gate`、`next PMO action visibility` | 旧 current_sprint 既承担 active/closed sprint 卡片，也一度承载了 closeout 摘要；本轮审计只提取真正需要保留的运行能力。 |
| `docs/_legacy_pmo/state/sprint_candidates.md` | `已审` | `bounded candidate pool`、`candidate template`、`human selection before start`、`candidate readiness discipline` | 这份旧文件语义本来就较纯，是新 PMO state 层最容易承接的一类。 |
| `docs/_legacy_pmo/state/idea_backlog.md` | `已审` | `retained pre-candidate ideas`、`compact re-triage surface`、`next-action carrying` | 旧 backlog 主要价值在于让 discussion 结果正式留痕，但不提前假装 execution-ready。 |
| `docs/_legacy_pmo/state/decision_log.md` | `已审` | `durable planning memory`、`decision template`、`decision-oriented record surface` | 旧 decision_log 虽然实际上是空的，但语义设计是有效的；需要按“ intended capability ”而不是“是否被充分使用”来审。 |
| `docs/_legacy_pmo/state/discussion_batches/index.md` | `已审` | `discussion batch index`、`batch status tracking`、`active focus visibility` | 旧 discussion runtime surface 的顶层索引；证明旧 PMO 不只是有 workflow，还真有运行中的 batch state。 |
| `docs/_legacy_pmo/state/discussion_batches/discussion_batch_001.md` | `已审` | `theme clustering in practice`、`possible slices in practice`、`slice-level promotion in practice`、`batch compression after promotion` | 最有价值的 discussion 实例证据源；直接证明“theme 容器 + possible slices 保真层”不是理论想法，而是实际有效用法。 |
| `docs/_legacy_pmo/outbox/execution_task.md` | `已审` | `active execution surface`、`idle handoff placeholder`、`activation overwrite rule` | 旧 active task 文件本体其实很薄，真正的 contract 主要来自 handoff protocol；这次主要确认运行面职责而不是实例细节。 |
| `docs/_legacy_pmo/inbox/execution_report.md` | `已审` | `execution report surface`、`validation recording`、`unverified areas`、`residual risk / escalation capture` | 旧 report 文件混合了模板和具体实例，是执行面最强的真实样例之一；要按能力拆开看，而不是原样搬。 |
| `docs/architecture/system-baseline.md` | `已审` | `static system truth baseline`、`public/private split truth`、`domain semantics truth`、`architectural concentration points` | 旧 truth baseline 的核心静态来源；要按“代码真相”阅读，不能把其中夹带的规则句全部算成 baseline 能力。 |
| `docs/architecture/runtime-workflow.md` | `已审` | `runtime truth baseline`、`surface responsibility map`、`focus/runtime provenance truth`、`AI invocation matrix` | 旧 runtime 真相文档的主来源；和 system baseline 一起构成 truth 层。 |
| `docs/architecture/backend-api.md` | `已审` | `backend API truth baseline`、`route surface baseline`、`model contract baseline`、`architecture-sensitive contract notes` | 旧 PMO 体系里一份较纯的 truth baseline；要检查新 PMO 有没有单独的 API 真相承接位。 |
| `docs/architecture/private-core-boundary.md` | `已审` | `private-core boundary record`、`private-core-owned topic handling`、`public/private responsibility split rule` | 这份更像 boundary contract，不只是 baseline；重点看新 PMO 有没有把它正式安家。 |
| `docs/architecture/roadmap.md` | `已审` | `roadmap baseline`、`shipped scope summary`、`active debt surface`、`cleanup priorities` | 旧 roadmap 相对纯，主要检查新 baseline 是否已经稳定承接。 |
| `docs/guides/development-constraints.md` | `已审` | `architecture-sensitive areas`、`AI fallback expectation`、`feature completion checklist`、`change hygiene references` | 这份不是纯 PMO 文档，但里面有几条对 PMO 审计和 execution boundary 很重要的横向规则。 |
| `docs/guides/documentation-sync.md` | `已审` | `documentation sync trigger rules`、`canonical doc maintenance scope`、`update flow`、`testing-doc sync rule` | 这份是典型横向治理能力来源；要检查新 PMO 有没有正式收这条链。 |
| `docs/guides/testing-and-ui-review.md` | `已审` | `testing and UI review decision guide`、`validation layer menu`、`report contract`、`notes UI review v1 specifics` | 这份和 validation floor 高度相关，但不完全等于 validation floor；需要区分通用验证规则和项目特定 UI review 细节。 |
