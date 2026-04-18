# Skill Cutover Plan

> 这份文档只回答一件事：现有治理型 skills 应该怎样切到 `Sayachan PMO v2`。

## 当前结论

真正需要切换的主技能有两个：

- `.codex/skills/sprint-pmo/SKILL.md`
- `.codex/skills/execution-prompt-compiler/SKILL.md`

辅助跟随的技能有一个：

- `.codex/skills/model-router/SKILL.md`

## 现状问题

### `sprint-pmo`

当前仍然默认依赖旧 PMO 路径和旧 PMO 入口习惯，例如：

- `docs/pmo/outbox/execution_task.md`
- `docs/pmo/state/current_sprint.md`
- `docs/pmo/inbox/execution_report.md`

它最关键的切换点不是某一条规则，而是：

- 默认应该先读旧 PMO，还是先读 `PMO v2`

### `execution-prompt-compiler`

当前也仍然默认以旧 PMO outbox/inbox 路径为 repo-native handoff surface。

它的切换重点是：

- handoff contract 的 canonical 路径
- completion report contract 的 canonical 路径

### `model-router`

它主要依赖：

- `docs/ai-ops/policies/model-routing-policy.md`

它和 PMO runtime 的直接耦合较弱，所以不是切换主阻塞项。

## 切换原则

1. 先切入口，再切细节
2. 先让 skills 默认读取 `PMO v2`
3. 旧 PMO 暂时只降级为 `legacy reference`
4. 先不要重写 skill 的整体职责，只切 canonical 路径和默认读取顺序

## 最小切换目标

### 对 `sprint-pmo`

至少要改成：

- 默认 operating entrypoint:
  - `docs/pmo/PMO_OPERATING_MANUAL.md`
- 默认 runtime state set:
  - `docs/pmo/state/current_sprint.md`
  - `docs/pmo/state/sprint_candidates.md`
  - `docs/pmo/state/idea_backlog.md`
  - `docs/pmo/state/decision_log.md`
  - `docs/pmo/state/execution_task.md`
  - `docs/pmo/state/execution_report.md`

并明确：

- 旧 `docs/pmo/**` 只作为过渡期 legacy reference

### 对 `execution-prompt-compiler`

至少要改成：

- 默认 handoff target:
  - `docs/pmo/state/execution_task.md`
- 默认 report contract target:
  - `docs/pmo/state/execution_report.md`
- 默认 protocol reference:
  - `docs/pmo/protocols/execution-handoff-protocol.md`
- 默认 PMO entry:
  - `docs/pmo/PMO_OPERATING_MANUAL.md`

### 对 `model-router`

当前不需要切 PMO runtime 入口。

只需要后续确认：

- 是否还继续从 `docs/ai-ops/policies/model-routing-policy.md` 读取
- 还是未来把该 policy 单独迁出

## 切换顺序建议

1. `sprint-pmo`
2. `execution-prompt-compiler`
3. 轻复查 `model-router`

## 当前判断

现在已经可以开始技能切换，但建议仍然按：

- 先改 skill 入口说明
- 再用一次真实线程验证
- 确认无误后再进一步清理旧 PMO 路径引用
