# PMO Policy 触发图

> 面向人类使用者的触发图，说明 PMO 主要 policy 检查在什么条件下被触发。

## 用途

当你想知道下面这些问题时，就看这张图：

- 在某个 PMO 时刻应该检查哪条 policy
- 什么条件会触发这条 policy
- 这条 policy 会导向什么样的 PMO 动作或 review 结果

## Policy 触发图

```mermaid
flowchart TD
    A["当前正在评估的 PMO 动作或变更"] --> B{"当前处于哪个阶段？"}

    B -- "Discussion / promotion" --> C{"是否出现了 durable planning conclusion？"}
    C -- "是" --> D["decision-capture-policy.md<br/>需要时写入 decision_log.md"]
    C -- "否" --> E["继续保留在 discussion 或普通 PMO state 中"]

    B -- "Candidate shaping / handoff / closeout" --> F{"validation expectation 或 evidence 是否不清楚？"}
    F -- "是" --> G["validation-floor-policy.md<br/>选择 minimum validation floor"]
    F -- "否" --> H["沿用当前 validation layer"]

    G --> I{"这个 sprint 是否涉及 UI 行为或展示质量？"}
    I -- "是" --> J["testing-and-ui-review-guide.md<br/>决定 logic / smoke / browser / UI review"]
    I -- "否" --> K["在风险允许时使用更轻的 validation"]

    B -- "Discussion / shaping / execution / closeout" --> L{"工作是否触及 AI-dependent behavior？"}
    L -- "是" --> M["ai-fallback-policy.md<br/>检查 fallback expectation 是否仍然可见"]
    L -- "否" --> N["不需要 AI fallback review"]

    B -- "Discussion / shaping / execution / closeout" --> O{"工作是否触及 architecture-sensitive area？"}
    O -- "是" --> P["architecture-sensitive-areas.md<br/>重新阅读 baseline，若 truth 可能变化则 escalate"]
    O -- "否" --> Q["常规实现边界"]

    B -- "Closeout" --> R{"truth、PMO runtime 或 execution behavior 是否发生变化？"}
    R -- "是" --> S["documentation-sync-policy.md<br/>识别 trigger type"]
    R -- "否" --> T["Doc sync 仍然可能被审查并记录为 no-sync-needed"]

    S --> U["documentation-sync-guide.md<br/>检查最小 canonical 集合"]
    U --> V{"Documentation-sync outcome"}
    V -- "no sync needed" --> W["在 PMO closeout 中记录结果"]
    V -- "reviewed, no update needed" --> W
    V -- "update required" --> X["更新 canonical docs<br/>然后记录结果"]

    B --> Y{"是否涉及 legacy residue 或 weak-sync note？"}
    Y -- "是" --> Z["history/reference/legacy-transition-notes.md<br/>只做轻量 reminder check"]
    Y -- "否" --> AA["不需要 legacy reminder"]

    D --> AB["PMO state 保持 durable"]
    J --> AC["Validation 选择在 handoff/report 中变得显式"]
    K --> AC
    M --> AD["Fallback implication 保持可见"]
    P --> AE["Escalation-heavy zone 保持显式"]
    W --> AF["Closeout 保持可追踪"]
    X --> AF
    Z --> AG["Weak-sync / legacy note 不会被静默忽略"]
```

## 触发说明

- `decision-capture-policy.md` 适用于主产出是 durable planning rule、deferral、approval 或 rejection 的情况。
- `validation-floor-policy.md` 适用于 PMO 必须判断证据是否足以安全 close 一个 sprint 的情况。
- `testing-and-ui-review-guide.md` 会在 sprint 改动 UI 行为或展示质量时，细化 validation 选择。
- `ai-fallback-policy.md` 适用于 AI 行为变化，或 fallback path 可能被悄悄削弱的情况。
- `architecture-sensitive-areas.md` 适用于代码看起来很小，但仍可能改变 system truth 或 boundary responsibility 的情况。
- `documentation-sync-policy.md` 与 `documentation-sync-guide.md` 适用于 closeout 阶段 truth、PMO runtime 或 execution behavior 可能发生变化的情况。
- `history/reference/legacy-transition-notes.md` 是 reminder surface，不是常规阻塞流程。
