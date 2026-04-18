# PMO v2 Capability Parity Audit

> 这份文档用于审计：旧 PMO 中真正有效的运行能力，是否已经被 `Sayachan PMO v2` 正确承接。

## 审计目标

这次审计不做“旧文件对新文件”的机械映射。
这次审计真正要回答的是：

- 旧 PMO 里哪些能力是有效沉淀
- 这些能力在新 PMO 里是否已经成立
- 哪些能力已经完整承接
- 哪些能力只承接了一部分
- 哪些能力还没有被新 PMO 接住

## 审计范围

本次审计主要覆盖：

- 旧 `docs/_legacy_pmo/**`
- 与 PMO 直接相关的 `docs/architecture/**`
- 与 PMO 直接相关的 `docs/guides/**`
- 已切换后的治理型 skills 入口行为

## 不做什么

- 不按文件名一一对应
- 不因为旧 PMO 有混层就把所有旧内容都算成“必须保留”
- 不把历史解释性内容误判成运行能力

## 能力分级

每项能力按下面 3 档判断：

- `已成立`
  - 新 PMO 已经有明确承接位，而且运行语义基本完整

- `部分成立`
  - 新 PMO 已经接住一部分，但仍有缺口、约束不清或运行链条未闭环

- `尚未承接`
  - 旧 PMO 有这项有效能力，但新 PMO 还没有明确承接位

## 审计记录格式

| 能力项 | 旧 PMO 来源 | 新 PMO 承接位 | 状态 | 备注 |
| --- | --- | --- | --- | --- |

## 当前审计记录

| 能力项 | 旧 PMO 来源 | 新 PMO 承接位 | 状态 | 备注 |
| --- | --- | --- | --- | --- |
| PMO operating entrypoint | `docs/_legacy_pmo/PMO_OPERATING_MANUAL.md` | `docs/pmo/PMO_OPERATING_MANUAL.md` | `已成立` | 新 manual 已接住“总入口”角色，而且比旧 manual 更轻、更干净。 |
| Role split | `docs/_legacy_pmo/PMO_OPERATING_MANUAL.md` | `docs/pmo/PMO_OPERATING_MANUAL.md` | `已成立` | Human / Codex / execution worker 的责任边界已经重新写清。 |
| Workflow map | `docs/_legacy_pmo/PMO_OPERATING_MANUAL.md` | `docs/pmo/PMO_OPERATING_MANUAL.md` + `docs/pmo/protocols/*` | `已成立` | 新 PMO 已经把 discussion / promotion / sprint / handoff 这组流程入口接住。 |
| PMO state model | `docs/_legacy_pmo/PMO_OPERATING_MANUAL.md` | `docs/pmo/state/*` | `已成立` | 新 PMO 的最小 state set 已经明确，而且职责更单一。 |
| Execution handoff contract | `docs/_legacy_pmo/EXECUTION_HANDOFF_PROTOCOL.md` | `docs/pmo/protocols/execution-handoff-protocol.md` + `docs/pmo/state/execution_task.md` + `docs/pmo/state/execution_report.md` | `已成立` | 旧 handoff contract 的主语义已经被新 protocol + state surface 接住。 |
| Task/report ownership split | `docs/_legacy_pmo/EXECUTION_HANDOFF_PROTOCOL.md` | `docs/pmo/protocols/execution-handoff-protocol.md` + `docs/pmo/PMO_OPERATING_MANUAL.md` | `已成立` | Codex 写 task、execution worker 写 report 的分工已经保留。 |
| Active task overwrite rule | `docs/_legacy_pmo/EXECUTION_HANDOFF_PROTOCOL.md` + `docs/_legacy_pmo/workflows/sprint-lifecycle-workflow.md` | `docs/pmo/protocols/execution-handoff-protocol.md` | `已成立` | 新 PMO 已明确 active handoff 应覆盖当前 task surface，而不是堆叠旧任务。 |
| Idle placeholder rule | `docs/_legacy_pmo/EXECUTION_HANDOFF_PROTOCOL.md` + `docs/_legacy_pmo/workflows/sprint-lifecycle-workflow.md` | `docs/pmo/state/current_sprint.md` + `docs/pmo/state/execution_task.md` + `docs/pmo/protocols/execution-handoff-protocol.md` | `已成立` | 新 PMO 已明确 idle 状态应显式存在，而不是删除文件。 |
| Human-gated sprint start | `docs/_legacy_pmo/workflows/sprint-lifecycle-workflow.md` | `docs/pmo/protocols/sprint-workflow.md` + `docs/pmo/state/current_sprint.md` + `docs/pmo/state/decision_log.md` | `已成立` | 新 PMO 把这条规则写得比旧 PMO 更明确。 |
| Candidate comparison before activation | `docs/_legacy_pmo/workflows/sprint-lifecycle-workflow.md` | `docs/pmo/state/sprint_candidates.md` + `docs/pmo/protocols/sprint-workflow.md` | `已成立` | 新 PMO 保留了 bounded candidate pool 与 human selection activation 机制。 |
| Commit vs closeout split | `docs/_legacy_pmo/workflows/sprint-lifecycle-workflow.md` | `docs/pmo/protocols/sprint-workflow.md` | `已成立` | 新 PMO 明确保留了 commit 与 PMO closeout 分离的语义。 |
| Decision capture after closeout | `docs/_legacy_pmo/workflows/sprint-lifecycle-workflow.md` + `docs/_legacy_pmo/PMO_OPERATING_MANUAL.md` | `docs/pmo/protocols/sprint-workflow.md` + `docs/pmo/policies/decision-capture-policy.md` + `docs/pmo/state/decision_log.md` | `已成立` | 这是新 PMO 相比旧 PMO 的强化点，已经从“有槽位但常空着”变成制度化规则。 |
| Validation expectation | `docs/_legacy_pmo/PMO_OPERATING_MANUAL.md` + `docs/_legacy_pmo/workflows/sprint-lifecycle-workflow.md` + `docs/_legacy_pmo/EXECUTION_HANDOFF_PROTOCOL.md` | `docs/pmo/protocols/sprint-workflow.md` + `docs/pmo/policies/validation-floor-policy.md` + `docs/pmo/state/templates/execution-report.template.md` | `已成立` | 新 PMO 已承接并去掉了旧 PMO 中过强的前端默认视角。 |
| Escalation boundary awareness | `docs/_legacy_pmo/PMO_OPERATING_MANUAL.md` + `docs/_legacy_pmo/EXECUTION_HANDOFF_PROTOCOL.md` | `docs/pmo/PMO_OPERATING_MANUAL.md` + `docs/pmo/protocols/execution-handoff-protocol.md` + `docs/pmo/baselines/system-baseline.md` | `部分成立` | 新 PMO 已经有边界感和升级点，但旧 manual 里那种更细的边界枚举还没有完全重新安家。 |
| Skill routing entry | `docs/_legacy_pmo/PMO_OPERATING_MANUAL.md` | `docs/pmo/PMO_OPERATING_MANUAL.md` + 已切换的 skill 入口 | `部分成立` | 新 PMO 已成为 skill 默认入口，但 manual 里还没有重新承接旧 manual 那种显式 skill routing 说明。 |
| Baseline audit entry | `docs/_legacy_pmo/PMO_OPERATING_MANUAL.md` | `docs/pmo/PMO_OPERATING_MANUAL.md` + `docs/pmo/baselines/*` | `部分成立` | truth baseline 已重建，但旧 manual 那种“默认 baseline 审计入口说明”还没有完全恢复。 |
| Discussion runtime surface | `docs/_legacy_pmo/workflows/discussion-workflow.md` + `docs/_legacy_pmo/state/discussion_batches/index.md` | `docs/pmo/protocols/discussion-workflow.md` + `docs/pmo/state/discussion_index.md` + `docs/pmo/state/discussions/*` | `已成立` | 新 PMO 已经完成了一次真实 `discussion -> judgment writeback -> idea_backlog retention` 运行：batch、index、current focus、current PMO judgment、open questions 与 promotion outcome 都在新 `docs/pmo/**` 上被实际使用，不再只是结构/模板层。 |
| Discussion batch index | `docs/_legacy_pmo/state/discussion_batches/index.md` | `docs/pmo/state/discussion_index.md` | `已成立` | 新 PMO 已明确重建顶层 discussion index，并保留 batch 状态、current focus 与 promotion direction 这些运行面信息。 |
| Theme clustering with single active focus | `docs/_legacy_pmo/workflows/discussion-workflow.md` + `docs/_legacy_pmo/state/discussion_batches/discussion_batch_001.md` | `docs/pmo/protocols/discussion-workflow.md` + `docs/pmo/state/templates/discussion-batch.template.md` | `已成立` | 新 PMO 已保留 theme clustering 与单一 active focus 规则，而且 batch template 已有对应承接位。 |
| Possible slices preservation | `docs/_legacy_pmo/workflows/discussion-workflow.md` + `docs/_legacy_pmo/state/discussion_batches/discussion_batch_001.md` | `docs/pmo/protocols/discussion-workflow.md` + `docs/pmo/state/templates/discussion-batch.template.md` | `已成立` | 新 PMO 已把“theme 可以聚类，但不能吞掉原始执行粒度”这条旧经验正式制度化。 |
| Slice-level promotion | `docs/_legacy_pmo/workflows/promotion-workflow.md` + `docs/_legacy_pmo/state/discussion_batches/discussion_batch_001.md` | `docs/pmo/protocols/discussion-workflow.md` + `docs/pmo/protocols/promotion-workflow.md` | `已成立` | 新 PMO 已明确允许 promotion 从 theme 或 possible slice 两个层级发生，不再要求所有提升都先回到粗粒度 theme。 |
| Batch compression after promotion | `docs/_legacy_pmo/workflows/discussion-workflow.md` + `docs/_legacy_pmo/workflows/promotion-workflow.md` + `docs/_legacy_pmo/state/discussion_batches/discussion_batch_001.md` | `docs/pmo/protocols/discussion-workflow.md` + `docs/pmo/state/templates/discussion-batch.template.md` | `已成立` | 新 PMO 已承接 promotion 后只保留压缩摘要与引用、不长期重复正式 PMO state 内容这条旧经验。 |
| Current sprint state card | `docs/_legacy_pmo/state/current_sprint.md` | `docs/pmo/state/current_sprint.md` | `已成立` | 新 PMO 已保留 canonical current-sprint state card，并把它收窄成更纯的 active/idle 运行面，而不是继续混入大量 closeout 摘要。 |
| Next PMO action visibility | `docs/_legacy_pmo/state/current_sprint.md` | `docs/pmo/state/current_sprint.md` | `已成立` | 新 current_sprint 仍然保留 “下一步该做什么” 这个对 PMO 很重要的运行提示。 |
| Bounded candidate pool | `docs/_legacy_pmo/state/sprint_candidates.md` | `docs/pmo/state/sprint_candidates.md` | `已成立` | 新 PMO 保留了至多 3 个候选、避免无限堆叠、候选选中后进入 current_sprint 的主语义。 |
| Candidate readiness discipline | `docs/_legacy_pmo/state/sprint_candidates.md` + `docs/_legacy_pmo/workflows/promotion-workflow.md` | `docs/pmo/state/sprint_candidates.md` + `docs/pmo/protocols/promotion-workflow.md` | `已成立` | 新 PMO 已保留 bounded / ready / almost-ready / blocked 这类候选成熟度纪律，而且与 promotion 流程一致。 |
| Retained pre-candidate ideas | `docs/_legacy_pmo/state/idea_backlog.md` | `docs/pmo/state/idea_backlog.md` | `已成立` | 新 backlog 继续承担 discussion 结果的正式保留位，但不把仍在 shaping 的内容误写成 candidate。 |
| Backlog next-action carrying | `docs/_legacy_pmo/state/idea_backlog.md` | `docs/pmo/state/idea_backlog.md` | `已成立` | 旧 backlog 中 “Suggested next action” 的有效语义已经被保留，有助于后续再分诊。 |
| Durable planning memory | `docs/_legacy_pmo/state/decision_log.md` + `docs/_legacy_pmo/workflows/promotion-workflow.md` | `docs/pmo/state/decision_log.md` + `docs/pmo/policies/decision-capture-policy.md` | `已成立` | 旧 decision_log 虽然未被充分使用，但它承载的“长期记忆面”在新 PMO 中已经真正制度化。 |
| Decision-oriented record template | `docs/_legacy_pmo/state/decision_log.md` | `docs/pmo/state/decision_log.md` | `已成立` | 新 decision_log 保留了简短、面向决策的记录形态，而且比旧版本更可实际运行。 |
| Active execution task surface | `docs/_legacy_pmo/outbox/execution_task.md` + `docs/_legacy_pmo/EXECUTION_HANDOFF_PROTOCOL.md` | `docs/pmo/state/execution_task.md` + `docs/pmo/state/templates/execution-task.template.md` + `docs/pmo/protocols/execution-handoff-protocol.md` | `已成立` | 新 PMO 已把旧执行任务面的三层语义拆清：活文件、模板文件、handoff protocol，各自职责比旧系统更清楚。 |
| Execution report surface | `docs/_legacy_pmo/inbox/execution_report.md` + `docs/_legacy_pmo/EXECUTION_HANDOFF_PROTOCOL.md` + `docs/_legacy_pmo/workflows/sprint-lifecycle-workflow.md` | `docs/pmo/state/execution_report.md` + `docs/pmo/state/templates/execution-report.template.md` + `docs/pmo/protocols/execution-handoff-protocol.md` + `docs/pmo/protocols/sprint-workflow.md` | `已成立` | 旧 report 的运行语义已经被新 PMO 承接，而且新 PMO 把活文件、模板和 closeout 要求拆得更干净。 |
| Handoff activation overwrite rule | `docs/_legacy_pmo/outbox/execution_task.md` + `docs/_legacy_pmo/EXECUTION_HANDOFF_PROTOCOL.md` | `docs/pmo/state/execution_task.md` + `docs/pmo/protocols/execution-handoff-protocol.md` | `已成立` | 新 PMO 明确保留“只有 sprint 被选中并激活后，execution_task 才被 overwrite 为 active contract”这条规则。 |
| Report validation / unverified / residual risk capture | `docs/_legacy_pmo/inbox/execution_report.md` | `docs/pmo/state/templates/execution-report.template.md` + `docs/pmo/state/execution_report.md` + `docs/pmo/policies/validation-floor-policy.md` | `已成立` | 旧 report 中最有价值的 closeout 维度——已做验证、未验证区域、残余风险、需升级事项——都已被新 PMO 显式保留。 |
| Execution boundary compliance recording | `docs/_legacy_pmo/inbox/execution_report.md` | `docs/pmo/state/templates/execution-task.template.md` + `docs/pmo/protocols/execution-handoff-protocol.md` | `部分成立` | 新 PMO 已有 Safe Touch Zones 和 Escalation Points，但旧 report 中那种显式 boundary compliance 小节还没有单独恢复成固定 report 结构。 |
| Static system truth baseline | `docs/architecture/system-baseline.md` | `docs/pmo/baselines/system-baseline.md` | `已成立` | 新 PMO 已重建静态系统真相基线，而且去掉了旧文档里夹带的运行规则语气。 |
| Runtime truth baseline | `docs/architecture/runtime-workflow.md` | `docs/pmo/baselines/runtime-baseline.md` | `已成立` | 新 PMO 已把“系统怎么跑”与“系统由什么组成”拆开，runtime truth 已有独立承接位。 |
| Public/private split truth recording | `docs/architecture/system-baseline.md` + `docs/architecture/private-core-boundary.md` | `docs/pmo/baselines/system-baseline.md` + `docs/pmo/baselines/private-core-boundary.md` | `已成立` | 新 PMO 现在已经同时拥有 public/private split 的系统真相与独立 boundary record，不再依赖旧 boundary 文档。 |
| Focus and provenance runtime truth | `docs/architecture/system-baseline.md` + `docs/architecture/runtime-workflow.md` | `docs/pmo/baselines/system-baseline.md` + `docs/pmo/baselines/runtime-baseline.md` | `已成立` | 新 PMO 已承接 currentFocusTaskId、semantic provenance fields、archive linkage 等关键运行语义。 |
| AI invocation matrix truth | `docs/architecture/runtime-workflow.md` + `docs/architecture/system-baseline.md` | `docs/pmo/baselines/system-baseline.md` + `docs/pmo/baselines/runtime-baseline.md` | `已成立` | 新 PMO 已明确保留 backend-mediated 与 frontend-direct AI surfaces 的真实分布，并写实了 Dashboard 仍前端直连的现状。 |
| Architecture-sensitive areas for escalation | `docs/guides/development-constraints.md` + `docs/architecture/system-baseline.md` | `docs/pmo/protocols/execution-handoff-protocol.md` + `docs/pmo/state/templates/execution-task.template.md` + `docs/pmo/baselines/system-baseline.md` | `部分成立` | 新 PMO 已有 safe touch / escalation 机制，但旧 guides 中那种集中列出 architecture-sensitive areas 的显式入口还没有完整迁入。 |
| AI fallback expectation | `docs/guides/development-constraints.md` | `docs/pmo/policies/validation-floor-policy.md` + `docs/pmo/baselines/system-baseline.md` | `部分成立` | 新 PMO 仍能看见 fallback 现实，但“每个 AI feature 都应有 fallback path” 这条旧 guide 规则还没有被单独收成新 PMO policy。 |
| Feature completion checklist | `docs/guides/development-constraints.md` | `docs/pmo/protocols/sprint-workflow.md` + `docs/pmo/policies/validation-floor-policy.md` + `docs/pmo/state/templates/execution-task.template.md` | `部分成立` | 新 PMO 已吸收其中最关键的 closeout/validation/boundary 维度，但旧 guide 那种单独 checklist 入口还没有完整恢复。 |
| Backend API truth baseline | `docs/architecture/backend-api.md` | `docs/pmo/baselines/backend-api.md` | `已成立` | 新 PMO 现在已经有独立的 backend API truth baseline，不再只靠 system/runtime baseline 顺带提及。 |
| Model and route contract baseline | `docs/architecture/backend-api.md` | `docs/pmo/baselines/backend-api.md` | `已成立` | Note/Project/Task 字段与 route surface 的集中说明，现在已经在新 PMO 中有独立承接位。 |
| Architecture-sensitive contract notes | `docs/architecture/backend-api.md` | `docs/pmo/baselines/backend-api.md` + `docs/pmo/baselines/system-baseline.md` + `docs/pmo/protocols/execution-handoff-protocol.md` | `已成立` | 旧 backend-api 文档里最重要的 API-level architecture-sensitive contract notes，现在已被 baseline 与 handoff protocol 共同承接。 |
| Detailed private-core boundary record | `docs/architecture/private-core-boundary.md` | `docs/pmo/baselines/private-core-boundary.md` | `已成立` | 新 PMO 现在已经有独立的 private-core boundary record，旧边界文档的 canonical 角色已被承接。 |
| Private-core-owned topic handling rule | `docs/architecture/private-core-boundary.md` | `docs/pmo/baselines/private-core-boundary.md` + `docs/pmo/protocols/discussion-workflow.md` + `docs/pmo/history/legacy-transition-notes.md` | `已成立` | 新 PMO 现在已经把“private-core-owned 主题只在 public repo 保留最小协调记录”这条规则写进 boundary record 与 discussion workflow。 |
| Roadmap baseline | `docs/architecture/roadmap.md` | `docs/pmo/baselines/roadmap.md` | `已成立` | 新 PMO 已经重建 roadmap baseline，并保留 shipped milestones、active debt 与 cleanup priorities 这三层核心结构。 |
| Documentation sync trigger rules | `docs/guides/documentation-sync.md` | `docs/pmo/policies/documentation-sync-policy.md` + `docs/pmo/policies/documentation-sync-guide.md` + `docs/pmo/protocols/sprint-workflow.md` | `已成立` | 新 PMO 已按新分层重建 documentation sync：policy 定义触发条件，guide 定义最小检查路径，sprint closeout 也已挂上 documentation-sync outcome 检查点。 |
| Canonical doc maintenance scope | `docs/guides/documentation-sync.md` | `docs/pmo/policies/documentation-sync-policy.md` + `docs/pmo/policies/documentation-sync-guide.md` + `docs/pmo/PMO_OPERATING_MANUAL.md` + `docs/pmo/baselines/*` + `CLAUDE.md` | `已成立` | 新 PMO 现在已经明确了强同步面、弱同步面、execution entry 文档以及 canonical runtime / baseline 范围，不再只靠旧 guide 的隐性大表。 |
| Testing and UI review decision guide | `docs/guides/testing-and-ui-review.md` | `docs/pmo/policies/validation-floor-policy.md` + `docs/pmo/policies/testing-and-ui-review-guide.md` + `docs/pmo/protocols/sprint-workflow.md` + `docs/pmo/state/templates/execution-report.template.md` | `已成立` | 新 PMO 现在已经把验证底线 policy、具体验证层选择规则和报告契约拆开承接，不再只靠 workflow 和 report 模板隐式拼出来。 |
| Project-specific UI review specifics | `docs/guides/testing-and-ui-review.md` | `docs/pmo/policies/testing-and-ui-review-guide.md` | `已成立` | 旧 guide 里对 Notes UI Review v1 的稳定页面态和用途说明，已经在新 PMO 的 project-specific review guide 中被显式承接。 |

## 第一批建议审计项

- current sprint 状态管理
- sprint candidate 管理
- idea backlog 保留机制
- durable decision capture
- discussion 入口与 batch 管理
- possible slices 保真
- promotion 流程
- sprint activation human gate
- execution handoff contract
- execution report closeout contract
- validation expectation
- baseline audit reference
- boundary escalation
- PMO operating entrypoint
- skill cutover readiness
