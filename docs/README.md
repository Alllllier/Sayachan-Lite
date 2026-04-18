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

### `docs/ai-ops/`

这是协作方法和 PMO/AI 工作方式的知识资产层。

它更关注：

- Codex / Claude / Human 这类协作方式
- PMO 流程如何运行
- AI-assisted development 的方法和经验
- 这套协作系统本身的知识沉淀

它不是代码真相层，也不是当前 sprint 状态层。

## 当前理解

可以先把 `docs/` 理解成五层：

- `pmo`: 运行中的控制面
- `pmo/baselines`: 代码真相与运行真相
- `ai-ops`: 协作知识资产
- `pmo/history`: 历史迁移记录与 transition notes

## 当前补充

`docs/architecture/` 已经退役。

原本属于那一层的 active truth 已迁入：

- `docs/pmo/baselines/system-baseline.md`
- `docs/pmo/baselines/runtime-baseline.md`
- `docs/pmo/baselines/backend-api.md`
- `docs/pmo/baselines/private-core-boundary.md`
- `docs/pmo/baselines/roadmap.md`

`docs/guides/` 也已经退役。

原本属于那一层的 active rules and conventions 已拆分为：

- PMO rules and companions under `docs/pmo/policies/**`
- engineering-facing conventions in `ENGINEERING_CONVENTIONS.md`

`docs/migration/` 也已经退役。

原本属于那一层的历史迁移记录已并入：

- `docs/pmo/history/**`

这份目录地图的作用是先固定理解，不代表这些目录已经是最终形态。
