# Legacy Transition Notes

> 这份文档用于说明为什么 `Sayachan PMO v2` 会出现，以及旧 PMO 后续如何进入 legacy 承接区。

## 为什么会有 PMO v2

`Sayachan PMO v2` 的直接目标不是做通用 PMO 产品，而是：

- 让 `Sayachan` 自己的 PMO 更清楚
- 让当前 PMO 更稳定
- 把旧 PMO 中已经成熟的骨架保留下来
- 把混层、重复、描述性过重、缺少 contract 的部分逐步拆开

在这之前，曾经探索过更通用的 `PMO core / host integration / adapter` 路线。

这段探索没有白做，因为它提供了：

- 更清晰的分层模型
- 对旧 PMO 混层问题的解释框架
- 对 state / protocol / policy / baseline / history 的稳定理解

但当前决定是：

- 不继续把它推进成通用 PMO 产品化工程
- 先把这些收获回流到 `Sayachan` 自己的 PMO 重构里

## 旧 PMO 的当前状态

当前旧 PMO 已经完成降级处理。

现在的状态是：

- 新 PMO 的 canonical runtime surface 位于 `docs/pmo/**`
- 旧 PMO 已迁入 `docs/_legacy_pmo/**`
- 旧 PMO 不再承担 active runtime surface，只保留历史参考价值

## 旧 PMO 的后续处理方向

这样做的主要目的不是删除历史，而是：

- 减少 `Codex` 在搜索、读取、skills 入口中继续被旧 canonical 路径干扰
- 让新 PMO 拥有明确的唯一 active runtime surface

## `ai-ops` 的当前定位与后续方向

当前 `docs/ai-ops/**` 不再被视为 `PMO v2` 的强制 active sync surface。

这是有意为之。

当前阶段优先保证的是：

- `docs/pmo/**` 的 active runtime surface
- `docs/pmo/protocols/**` 与 `docs/pmo/policies/**`
- `docs/pmo/baselines/**`
- 执行入口与 PMO closeout 流程

`ai-ops` 未来仍然值得保留，但更适合作为单独的后续重构项。

那次重构的目标应当是把它真正接入：

- PMO runtime 经验
- discussion / sprint 演化记录
- 更长期的人机协作知识资产

在那次重构完成之前，不应把 `ai-ops` 误当作已经解决了 runtime-to-knowledge sync 的成熟层。

## 后续会进入 history / legacy 的对象

当前预期会逐步进入 history / legacy 承接区的内容包括：

- 旧 PMO 的 archive handoff 文件
- 旧 PMO 中被新 PMO 替代的 manual / workflow / mixed docs
- 旧 migration 记录
- 旧 ai-ops 协作流程材料中不再作为 active PMO canonical set 的部分

## 当前规则

- 当前 active PMO surface 只认 `docs/pmo/**`
- `docs/_legacy_pmo/**` 仅作历史参考，不应再作为默认读取入口
- 后续清理工作应优先继续收口历史工作区和旧辅助目录，而不是回退到旧 PMO 结构
