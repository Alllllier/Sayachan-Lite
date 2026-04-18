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

当前旧 PMO 仍然保留在原路径中。

原因不是它仍然是理想结构，而是：

- 还没有完成新 PMO 的切换
- 旧 PMO 里仍然有 active runtime surface 和历史材料
- 直接删除或硬切风险太高

## 旧 PMO 的后续处理方向

后续更倾向于：

- 新 PMO 在新路径中先稳定运行
- 旧 PMO 再整体迁入明确的 `legacy` 区

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

- 在新 PMO 真正跑稳之前，不急着大规模迁移旧文件
- 在明确切换之前，旧 PMO 仍然可以作为历史参考
- 一旦新 PMO 成为 active canonical runtime，旧 PMO 应整体降级为 history / legacy，而不是继续与新 PMO 并列长期活跃
