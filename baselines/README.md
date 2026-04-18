# Baselines 导航

> 这个目录不是运行态 PMO。
> 它更像施工前的理解层、判断层和设计层。
>
> 当前最重要的用途有两类：
>
> - 理解旧系统
> - 为新版 PMO 重建做准备

## 1. 最推荐的阅读顺序

如果目标是准备正式开始新版 PMO 施工，建议按这个顺序读：

1. [新版 PMO 平行重建计划](C:/Users/allie/Desktop/personal_os_lite/baselines/NEW_PMO_REBUILD_PLAN.md)
2. [PMO 通用性目标](C:/Users/allie/Desktop/personal_os_lite/baselines/PMO_UNIVERSALITY_GOAL.md)
3. [理想 PMO 系统分层设计](C:/Users/allie/Desktop/personal_os_lite/baselines/IDEAL_PMO_LAYERED_DESIGN.md)
4. [PMO 宿主去耦设计](C:/Users/allie/Desktop/personal_os_lite/baselines/PMO_HOST_DECOUPLING.md)
5. [当前 PMO 系统分层映射](C:/Users/allie/Desktop/personal_os_lite/baselines/PMO_LAYER_MAPPING.md)

如果目标是回看旧系统为什么会长成现在这样，建议读：

1. [PMO 系统基线](C:/Users/allie/Desktop/personal_os_lite/baselines/PMO_SYSTEM_BASELINE.md)
2. [PMO 系统判断](C:/Users/allie/Desktop/personal_os_lite/baselines/PMO_SYSTEM_ASSESSMENT.md)
3. [PMO 系统演化笔记](C:/Users/allie/Desktop/personal_os_lite/baselines/PMO_EVOLUTION_NOTES.md)

## 2. 方向锚点

这组文档用来回答：

- 我们为什么不继续修旧 PMO
- 新版 PMO 要达到什么目标
- 理想结构应该长什么样
- 宿主和施工层应该怎么去耦

包含：

- [NEW_PMO_REBUILD_PLAN.md](C:/Users/allie/Desktop/personal_os_lite/baselines/NEW_PMO_REBUILD_PLAN.md)
- [PMO_UNIVERSALITY_GOAL.md](C:/Users/allie/Desktop/personal_os_lite/baselines/PMO_UNIVERSALITY_GOAL.md)
- [IDEAL_PMO_LAYERED_DESIGN.md](C:/Users/allie/Desktop/personal_os_lite/baselines/IDEAL_PMO_LAYERED_DESIGN.md)
- [PMO_HOST_DECOUPLING.md](C:/Users/allie/Desktop/personal_os_lite/baselines/PMO_HOST_DECOUPLING.md)
- [PMO_POLICY_BACKLOG.md](C:/Users/allie/Desktop/personal_os_lite/baselines/PMO_POLICY_BACKLOG.md)

## 3. 现状理解

这组文档用来回答：

- 当前 PMO 系统实际怎么运转
- 当前结构的主要问题在哪
- 理想五层和现状之间差距在哪里
- 这套系统是怎么演化出来的

包含：

- [PMO_SYSTEM_BASELINE.md](C:/Users/allie/Desktop/personal_os_lite/baselines/PMO_SYSTEM_BASELINE.md)
- [PMO_SYSTEM_ASSESSMENT.md](C:/Users/allie/Desktop/personal_os_lite/baselines/PMO_SYSTEM_ASSESSMENT.md)
- [PMO_LAYER_MAPPING.md](C:/Users/allie/Desktop/personal_os_lite/baselines/PMO_LAYER_MAPPING.md)
- [PMO_EVOLUTION_NOTES.md](C:/Users/allie/Desktop/personal_os_lite/baselines/PMO_EVOLUTION_NOTES.md)

## 4. Docs 诊断

这组文档用来回答：

- `docs/` 目录当前怎么分类
- 哪些文件是什么标签
- 哪些地方是混合体
- 哪些地方适合未来轻整理

包含：

- [DOC_LABELS.md](C:/Users/allie/Desktop/personal_os_lite/baselines/DOC_LABELS.md)
- [DOCS_INVENTORY_DRAFT.md](C:/Users/allie/Desktop/personal_os_lite/baselines/DOCS_INVENTORY_DRAFT.md)
- [DOCS_INVENTORY_REVIEW.md](C:/Users/allie/Desktop/personal_os_lite/baselines/DOCS_INVENTORY_REVIEW.md)
- [DOCS_REFACTOR_PRIORITIES.md](C:/Users/allie/Desktop/personal_os_lite/baselines/DOCS_REFACTOR_PRIORITIES.md)
- [GUIDES_BOUNDARY_BASELINE.md](C:/Users/allie/Desktop/personal_os_lite/baselines/GUIDES_BOUNDARY_BASELINE.md)

## 5. 工具

这组是辅助脚本和生成用工具。

包含：

- [tools/generate_docs_inventory.py](C:/Users/allie/Desktop/personal_os_lite/baselines/tools/generate_docs_inventory.py)

## 6. 当前状态

可以把当前 `baselines/` 理解成：

- 旧系统理解层
- docs 诊断层
- 新版 PMO 施工前设计层
- 重建过程中的临时工作台账层

它不是最终的 PMO core，也不是运行中的 PMO 状态面。
