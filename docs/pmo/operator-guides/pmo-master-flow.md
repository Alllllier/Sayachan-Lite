# PMO 主流程图

> 面向人类使用者的主流程图，说明当前 `Sayachan PMO v2` 是如何运行的。

## 用途

当你想从更高层级看 PMO runtime 全貌时，就看这张图。它覆盖：

- intake 与 discussion 分流
- candidate 比较与 human gate 的 sprint 启动
- execution handoff 与 execution return
- 带 validation 视角的 closeout
- documentation-sync review
- 作为独立仓库动作存在的 commit
- idle 状态与下一轮 planning 的回流

## 主流程图

```mermaid
flowchart TD
    A["PMO 处于 idle 或开放 planning 状态"] --> B["出现新的 intake 或继续已有 planning 话题"]
    B --> C["读取 discussion_index + 当前 discussion batch"]
    C --> D["整理 theme、slice 和 open question"]
    D --> E{"已经稳定到可以离开 discussion 吗？"}

    E -- "否" --> D
    E -- "是" --> F{"应该分流到哪里？"}

    F -- "保留 / parked 的未来工作" --> G["idea_backlog.md"]
    F -- "边界清晰的近期开工 slice" --> H["sprint_candidates.md"]
    F -- "durable rule / deferral / rejection" --> I["decision_log.md"]
    F -- "还太粗糙" --> J["继续留在 discussion batch 中<br/>标记 parked + review trigger"]

    G --> K["当 reopen trigger 出现时再重新分诊"]
    J --> K
    K --> C

    H --> L{"Human 是否明确选择启动 sprint？"}
    L -- "否" --> M["继续保留 candidate 供比较"]
    M --> H
    L -- "是" --> N["更新 current_sprint.md<br/>激活选中的 sprint"]

    N --> O["写入 execution_task.md<br/>形成有边界的 handoff contract"]
    O --> P["Execution worker 读取 contract"]
    P --> Q["实现被批准的 slice"]
    Q --> R["写入 execution_report.md"]

    R --> S["PMO 读取 execution return"]
    S --> T["判断 closeout 状态<br/>completed / partial / blocked / follow-up"]
    T --> U["套用 validation floor 进行解读"]
    U --> V{"Validation 结果"}

    V -- "验证充分" --> W["Closeout 可以写成 completed and validated"]
    V -- "部分验证 / 尚未验证" --> X["Closeout 必须把这个缺口保留下来"]
    V -- "在有意义的验证前就已阻塞" --> Y["Closeout 必须记录 blocked 状态"]

    W --> Z["检查 decision capture"]
    X --> Z
    Y --> Z

    Z --> AA{"这个 sprint 是否产出了 durable planning result？"}
    AA -- "是" --> I
    AA -- "否" --> AB["不需要更新 decision_log"]

    Z --> AC{"是否存在 deferred 或 parked 的 follow-up？"}
    AC -- "Parked / retained" --> G
    AC -- "需要 follow-up execution" --> H
    AC -- "没有" --> AD["不需要 follow-up 分流"]

    S --> AE["执行 documentation-sync review"]
    AE --> AF{"Doc-sync outcome"}
    AF -- "no sync needed" --> AG["在 current_sprint.md 中记录结果"]
    AF -- "reviewed, no update needed" --> AG
    AF -- "update required" --> AH["更新 canonical docs<br/>然后记录结果"]

    S --> AI{"Human 现在要执行 repository action 吗？"}
    AI -- "是" --> AJ["准备 commit / 将 commit 作为独立动作执行"]
    AI -- "否" --> AK["在 PMO closeout 里明确写出 commit state"]

    AG --> AL["更新 current_sprint.md 的 closeout summary"]
    AH --> AL
    AJ --> AL
    AK --> AL
    AB --> AL
    AD --> AL

    AL --> AM["回到 idle / next-planning 状态"]
    AM --> B
```

## 阅读提示

- `discussion-workflow.md` 和 `promotion-workflow.md` 负责这张图左侧的 intake 与分流部分。
- `sprint-workflow.md` 负责 sprint selection、closeout 与 commit separation。
- `execution-handoff-protocol.md` 负责 handoff 与 execution return contract。
- `validation-floor-policy.md` 规定 PMO 在 closeout 时如何解读 validation evidence。
- `documentation-sync-policy.md` 与 `documentation-sync-guide.md` 规定 execution 之后的 doc review。
