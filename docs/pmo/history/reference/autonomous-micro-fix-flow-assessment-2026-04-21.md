# 自动化 Micro-Fix 流程评估

- 日期：`2026-04-21`
- 线程上下文：`由截图反馈触发的 UI 噪音 micro-fix`
- 评估范围：`判断这次刚完成的自动化 PMO 流程，未来是否值得作为一种正式支持的 PMO 工作模式写入体系。`

## 本次流程实际做了什么

- 人类给出了一个具体且已圈出问题的截图，并明确要求 PMO：
  - 自行分析问题
  - 自行生成 candidate
  - 自行选择最合适的 candidate
  - 使用 sub-agent 执行施工
  - 在同一 execution loop 内完成 review 和必要修正
  - 无需人类继续介入地完成 closeout 与提交
- PMO 将问题收束成一个有边界的 micro-fix，而不是把它扩大成一轮更广的 project-surface redesign。
- PMO 激活了对应的 `current_sprint.md` 和 `execution_task.md`。
- PMO 将执行委托给 sub-agent，并在主线程中独立完成了验证复跑与结果 review。
- PMO 接受结果、完成 closeout，并将运行面恢复到 idle。

## 为什么这次流程能跑通

- 问题描述是具体且可视化的，不是抽象猜测。
- 人类明确授权 PMO 跳过通常的 candidate 人工比较和手动选中步骤。
- 实现面非常窄：
  - 主要集中在一个组件模板
  - 只涉及可选的窄测试面
  - 不涉及 backend/runtime 语义变更
- must-preserve 规则在此前讨论中已经比较稳定：
  - completed task 删除线
  - archived task 不可交互
  - archived project 保持窄 action 集
- 因此 worker 能在一个非常清晰的小执行盒子里行动，而不需要再进行大范围产品判断。

## 这套流程仍然依赖了哪些“人类友好前提”

- PMO 本身已经有一套较成熟的本地操作上下文：
  - candidate shaping 习惯
  - execution handoff 习惯
  - closeout 习惯
- 这次人类给出的 delegation 权限非常强，允许自动 candidate 生成与自动选中。
- 这个问题可以通过截图很容易判断为 micro-fix，而不是更大的方向性 UI 重构。
- 仓库和既有讨论中已经存在足够多的邻近上下文，因此 PMO 可以判断哪些体验必须保留，而不需要重新开启一轮架构讨论。

## 本次观察到的收益

- 主线程上下文保持得相对干净，因为执行被隔离到了 sub-agent。
- candidate 生成加自动选中，使施工开始前就形成了清楚的 execution contract。
- review loop 很快就聚焦到了真正重要的问题：
  - 这次修复有没有在不破坏既有语义清理成果的前提下降低 UI 噪音？
- 对一个非常小的 UI 修补来说，这比重新走一轮完整人工 gating 更快。

## 本次观察到的风险

- 自动选中绕过了常规的人类比较步骤，因此它不应成为高风险或边界模糊任务的默认模式。
- 如果自动流程对 PMO 状态文件进行修改，却没有足够窄的 scope 和强制检查，PMO 状态本身会发生漂移。
- 这次实际暴露出了一个明确的 PMO hygiene 问题：
  - `docs/pmo/state/sprint_candidates.md` 曾短暂超过 “最多 3 条” 的限制。
  - 问题并不是产品判断错误，而是自动流程本身缺少对应的程序化护栏。
  - 自动流程正确完成了新 micro-fix candidate 的生成和 closeout，但没有把 candidate surface 的整理当成一个必过的收尾检查项。
  - 在人工 gating 流程里，这种问题往往会在人工 PMO 检查时被顺手发现；而在自动流程里，如果没有显式规则，这层安全网会变弱。
- 因此这次 candidate overflow 的根因是：
  - 自动流程已经覆盖了 shaping、selection、execution、review 和 closeout
  - 但它**还没有把 candidate-cap 维护视为强制 exit criterion**
  - 所以任务级工作虽然成功完成了，却仍然留下了一个 PMO surface inconsistency
- 这次流程还暴露出另一个较轻但真实的问题：
  - 自动流程一开始生成了两个 candidate，但后续真正被执行、review、closeout 持续引用的只有主方案。
  - 那个备选 candidate 没有继续在执行链中被显式维护，却仍然留在 candidate surface 上，最终更像残留噪音而不是有效备选。
  - 这说明在自动化 micro-fix 流程里，如果备选方案不会被持续显式保留和说明，那么它往往只会增加 PMO surface 复杂度。
- 这次流程仍然依赖于更早讨论中由人类种下的产品判断；它并不是一个完全脱离上下文的自主规划器。
- 这次验证仍然是窄验证，没有包含 browser-level review，因此不能把这种模式宣传成“完全自动的 UI 正确性保证”。

## 建议

- 不建议立刻把这套流程原样硬编码进 PMO。
- 更合适的做法是，把这次运行视为一个证据：未来可以考虑定义一种 **有边界的可选 `autonomous micro-fix mode`**，但必须加上更严格的护栏。
- 这套模式只适合在以下条件同时成立时使用：
  - 问题非常窄且具体
  - 人类明确授权自动 candidate 生成与自动选中
  - 实现面很小
  - must-preserve 规则已经稳定
  - 预期验证面也比较窄
- 它还不适合成为以下工作的默认流程：
  - 架构工作
  - 大范围前端重构
  - backend/runtime 重构
  - 仍然需要大量人类产品判断的模糊 UI 问题

## 对未来 PMO 的建议方向

- 先**不要**立即把这套流程正式写进 PMO。
- 更合理的下一步，是把这次运行当作一个样本，未来再考虑增加一种带明确护栏的 `autonomous micro-fix mode`，并至少要求：
  - 明确的人类 opt-in
  - 只有在低风险、强边界任务里才允许 candidate 自动选中
  - 默认只生成 **一个** candidate；只有当备选方案会被显式保留、持续说明并真正服务后续决策时，才允许生成第二个候选
  - execution handoff 里必须有明确的 must-preserve 区块
  - closeout 前必须经过 PMO review
  - 必须生成一份最终评估，判断这次自动化流程运行得是否健康
  - 必须包含 PMO hygiene 自检项，例如：
    - candidate surface 维持在 3 条以内
    - 如有需要，及时归档被挤出的 completed candidate
    - `current_sprint.md`、`execution_task.md`、`execution_report.md` 最终恢复到一致的 idle/closed 状态
    - 自动生成的评估报告需要明确记录：这次流程是干净结束，还是事后还做了 PMO hygiene 补修

## 最终判断

- `可以考虑加入，但必须有条件。`
  这次运行说明，这种自动化模式已经足够可行，值得作为未来 PMO 的一个候选工作模式继续观察。
- `不能按当前原样直接纳入。`
  如果以后真的 formalize，它也应该只是一个**窄范围、可选、强护栏**的模式，而不是对正常人类 gating PMO 流程的全面替代；其中一个具体护栏就是：自动化 micro-fix 默认只保留一个主 candidate，除非备选确实会在后续流程中被显式延续。
