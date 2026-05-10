# Docs Map

这份说明只用来回答一件事：当前 `docs/` 目录下各个子目录分别承担什么角色。

它不是新的 PMO manual，也不是新的 architecture baseline。
它只是 `docs/` 的入口地图。

## 目录分层

### `docs/pmo/`

这是当前项目的稳定 PMO 规则、基线、工具和模板层。

频繁变化的 PMO 运行态已经移到项目内的独立 git repo：

```text
.pmo_runtime/
```

`docs/pmo/` 保留：

- PMO workflow
- PMO operating rules
- stable baselines
- policy/protocol docs
- tools
- state templates

如果想回答：

- 现在在做什么
- 下一个能做什么
- 当前 handoff 是什么
- 上一轮 execution report 是什么

应该优先看 `.pmo_runtime/state/**` 和 `.pmo_runtime/history/**`。位置规则见 `docs/pmo/RUNTIME_LOCATION.md`。

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

- `pmo`: 稳定 PMO 控制规则和模板
- `pmo/baselines`: 代码真相与运行真相
- `ai-ops`: 协作知识资产
- `.pmo_runtime/state` / `.pmo_runtime/history`: PMO 运行态与执行历史

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

原本属于那一层的历史迁移记录已并入 PMO runtime history：

- `.pmo_runtime/history/**`

这份目录地图的作用是先固定理解，不代表这些目录已经是最终形态。
