# PMO 宿主去耦设计

> 这份文档回答一个关键问题：
> 如果要重建新版 PMO，哪些东西属于 PMO core，
> 哪些属于 Codex 集成层，
> 哪些又属于 execution worker 绑定层。
>
> 这份文档的目标，是避免在重建一开始就把宿主耦合重新写回 core。

## 1. 为什么这一步现在必须做

在当前系统里，PMO 和 `Codex` 的关系比 PMO 和 `Claude` 的关系更深。

原因不只是命名问题，而是当前系统默认把 `Codex` 同时当成：

- PMO 操作者
- 文档维护者
- handoff 编译者
- state 读取者
- skill 宿主

如果不先把这些层次拆开，后面重建时就很容易出现一种假象：

- 看起来是在做可复用 PMO core
- 实际上却还是在做“Codex 专用 PMO”

## 2. 一个核心判断

当前最重要的判断是：

- `skills` 不是通用 PMO 机制
- `skills` 是 Codex 宿主机制

更准确地说：

- `.codex/skills/` 的目录结构是 Codex 专用的
- skill 的调用方式是 Codex runtime 专用的
- skill 文件本身不应被当成 PMO core 的天然组成部分

这不等于 skill 里的知识没有价值。
真正应该被拆出来的是：

- skill 中承载的 PMO 逻辑
- skill 这种“由 Codex 运行的宿主形式”

前者可以进入 core。
后者应该留在 integration 层。

## 3. 三层结构

如果要把宿主关系拆开，我建议明确区分下面三层。

### 第一层：PMO Core

这一层是宿主无关的。

它应该包含：

- Runtime State 设计
- Protocol
- Policy
- Baseline 接入要求
- Adapter contract
- Onboarding flow
- 文件模板
- 字段语义

这一层不应该假设：

- 一定由 Codex 操作
- 一定有 `.codex/skills/`
- 一定有 Claude
- 一定有某个特定 agent 名称

一句话理解：

- PMO Core 是“这套系统本身”

### 第二层：PMO Host Integration

这一层负责把 PMO core 接进某个具体宿主。

例如在当前语境下，最典型的宿主就是：

- Codex

这一层可能包括：

- 宿主专用 skill 形态
- 宿主如何读取 PMO state
- 宿主如何写 handoff / report
- 宿主如何执行 protocol
- 宿主如何映射 policy

这一层是可以换的。

也就是说：

- PMO core 不应该依赖 Codex
- 但可以有一个 `Codex integration`

一句话理解：

- integration 是“某个宿主怎样接入 PMO”

### 第三层：Execution Worker Binding

这一层负责把 execution 端接到 PMO 系统上。

典型内容包括：

- 默认 execution worker 是谁
- handoff 如何被投递给施工层
- completion report 如何被带回 PMO
- 哪些角色分工属于项目实例绑定

这一层不应该放在 PMO core 里。
它应该由：

- adapter
- 项目实例配置
- 或宿主集成层

来决定。

一句话理解：

- 这一层是“施工端如何挂上来”

## 4. 哪些东西属于 PMO Core

如果按这个思路看，下面这些应该属于 core：

- `current_sprint` 的语义定义
- `sprint_candidates` 的语义定义
- `idea_backlog` 的语义定义
- `decision_log` 的语义定义
- `execution_task` 和 `execution_report` 的最小 contract
- discussion / promotion / sprint lifecycle 的 protocol
- documentation sync / validation floor 这类横向 policy
- adapter schema
- onboarding checklist

这些内容的共同特点是：

- 不依赖某个宿主才能成立
- 不依赖某个项目路径才能成立
- 不依赖某个 execution worker 才能成立

## 5. 哪些东西属于 Codex Integration

下面这些更应该被看成 Codex integration，而不是 PMO core：

- `.codex/skills/` 目录结构
- `sprint-pmo` 这种以 Codex skill 形态存在的 PMO 入口
- `execution-prompt-compiler` 这种 Codex skill 形式的 handoff 编译器
- Codex 如何在会话里读取、维护、更新 PMO 状态
- Codex 如何把 PMO protocol 转成可执行操作

这些内容不是没价值，而是：

- 它们是“Codex 怎样接入 PMO”
- 不是“PMO 本身是什么”

## 6. 哪些东西属于 Execution Binding

下面这些更适合放在 execution binding 层：

- 默认施工层是不是 Claude
- execution handoff 是发给谁
- execution report 由谁写回
- 某个项目是否使用双 agent 模式
- 某个项目的 owner / pmo / execution 角色如何命名

这些都不应该写死在 core 里。

如果未来换成：

- 别的 execution agent
- 人工执行
- 混合施工流

PMO core 仍应成立。

## 7. 对新版 PMO 设计意味着什么

这个去耦设计会直接改变新版 PMO 的组织方式。

### 结论一：新版 PMO 不能以 skills 为中心

skills 可以存在，但它们只能是 integration 形式。

不能出现：

- “没有 skill，这个 PMO core 就不存在”

### 结论二：新版 PMO 应该先定义宿主无关 contract

先定义：

- state
- protocol
- policy
- adapter

然后再决定：

- Codex 怎么接
- execution worker 怎么接

### 结论三：宿主专用资产应该明确标记

如果未来有：

- `codex/`
- `integrations/codex/`

这种目录，那它的含义应该很明确：

- 这里是 Codex 接入层
- 不是 PMO core 本体

## 8. 对 Sayachan 的意义

这条设计对 Sayachan 很重要，因为当前 Sayachan 的 PMO 恰好是：

- PMO core
- Codex integration
- Claude execution binding

三者缠在一起长出来的。

所以如果以后真的要迁移 Sayachan，最重要的不是“换目录”，而是：

- 先把三层拆开理解
- 再分别迁移

## 9. 一句话结论

如果要重建新版 PMO，必须先承认：

- PMO core 应该是宿主无关的
- `skills` 属于 Codex integration，不属于 core
- execution worker 绑定应该放在 adapter 或项目实例层

只有这样，新的 PMO 才有可能真正接入别的项目，而不是只是在换一种方式延续 Sayachan 专用结构。
