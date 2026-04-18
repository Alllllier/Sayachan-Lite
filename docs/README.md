# Docs Map

这份说明只用来回答一件事：当前 `docs/` 目录下各个子目录分别承担什么角色。

它不是新的 PMO manual，也不是新的 architecture baseline。
它只是 `docs/` 的入口地图。

## 目录分层

### `docs/pmo/`

这是当前项目的 PMO 运行控制面。

这里不只是“说明文档”，还包含：

- 状态文件
- handoff 文件
- execution report 文件
- PMO workflow
- PMO operating rules

如果想回答：

- 现在在做什么
- 下一个能做什么
- 当前 handoff 是什么
- 上一轮 execution report 是什么

应该优先看这里。

### `docs/architecture/`

这是代码真相层。

这里主要回答：

- 当前系统实际上是什么
- 运行边界是什么
- backend 和 runtime 现状是什么
- 当前 roadmap 和架构债在哪里

如果想理解“代码现在长什么样”，优先看这里。

### `docs/ai-ops/`

这是协作方法和 PMO/AI 工作方式的知识资产层。

它更关注：

- Codex / Claude / Human 这类协作方式
- PMO 流程如何运行
- AI-assisted development 的方法和经验
- 这套协作系统本身的知识沉淀

它不是代码真相层，也不是当前 sprint 状态层。

### `docs/guides/`

这是通用规则和操作说明层。

目前它的边界还不算完全稳定。

现在这里更像是收纳：

- 文档同步规则
- development constraints
- testing / UI review 这类横向 guide

也就是说，它比 `architecture/` 更偏操作说明，比 `pmo/` 更偏通用规则，但确实还有一些“从不同模块散出来”的痕迹。

### `docs/migration/`

这是历史迁移记录层。

当前它主要承载特定历史事件的迁移记录，而不是持续运行中的控制面。

如果想理解“某次重要迁移当时是怎么做的”，看这里。

## 当前理解

可以先把 `docs/` 理解成五层：

- `pmo`: 运行中的控制面
- `architecture`: 代码真相
- `ai-ops`: 协作知识资产
- `guides`: 通用规则与操作说明
- `migration`: 历史迁移记录

这份目录地图的作用是先固定理解，不代表这些目录已经是最终形态。
