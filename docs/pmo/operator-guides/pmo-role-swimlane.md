# PMO 角色泳道图

> 面向人类使用者的泳道图，说明当前 `Sayachan PMO v2` 中各角色的职责边界。

## 用途

当你想按角色来理解同一条 PMO 流程，而不是按文档或 policy 来看时，就用这张图。

它主要回答：

- Human 决定什么
- Codex 作为 PMO 拥有什么职责
- Execution Worker 在实现阶段负责什么

## 泳道图

```mermaid
flowchart LR
    subgraph H["Human"]
        H1["提出新话题<br/>或审阅 candidate 集合"]
        H2{"是否明确选择启动 sprint？"}
        H3["处理 architecture-sensitive<br/>或 high-risk escalation"]
        H4{"现在是否要求执行 commit？"}
    end

    subgraph C["Codex PMO"]
        C1["记录 discussion intake<br/>discussion_index + discussion batch"]
        C2["整理 theme、slice、<br/>open question 与 routing"]
        C3{"是否稳定到可以 promote？"}
        C4["分流到 idea_backlog.md"]
        C5["分流到 sprint_candidates.md"]
        C6["分流到 decision_log.md"]
        C7["更新 current_sprint.md"]
        C8["写入 execution_task.md"]
        C9["读取 execution_report.md"]
        C10["套用 validation 解读<br/>并做出 closeout judgment"]
        C11["执行 documentation-sync review"]
        C12["在 current_sprint.md 中记录 closeout outcome"]
        C13["分流 parked / deferred / durable follow-up"]
        C14["让 PMO 回到 idle<br/>或 next-planning state"]
    end

    subgraph E["Execution Worker"]
        E1["读取 execution_task.md"]
        E2["只实现被批准的 slice"]
        E3["如果 boundary 或 architecture<br/>assumption 不清楚就 escalate"]
        E4["写入 execution_report.md<br/>delivery + validation + risks + doc-sync notes"]
    end

    H1 --> C1
    C1 --> C2
    C2 --> C3
    C3 -- "否" --> C2
    C3 -- "Backlog" --> C4
    C3 -- "Candidate" --> C5
    C3 -- "Decision" --> C6

    C5 --> H2
    H2 -- "否" --> C5
    H2 -- "是" --> C7

    C7 --> C8
    C8 --> E1
    E1 --> E2
    E2 --> E4
    E2 --> E3
    E3 --> H3
    H3 --> C8
    E4 --> C9

    C9 --> C10
    C10 --> C11
    C10 --> C13
    C11 --> C12
    C13 --> C12
    C12 --> H4
    H4 -- "是" --> C14
    H4 -- "否" --> C14
```

## 阅读提示

- Human 仍然是 sprint selection gate 和 escalation authority。
- Codex 负责 PMO state movement、handoff writing、closeout judgment 与 documentation-sync review。
- Execution Worker 不负责 sprint selection 或 PMO closeout，但负责有边界的 implementation 和结构化 execution return。
