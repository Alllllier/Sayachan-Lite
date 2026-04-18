# 理想 PMO 系统分层设计

> 这份文档描述的是“如果重新设计这套 PMO 系统，我会怎么分层”。
> 它不是当前仓库的现状说明，也不是立即执行的重构方案。
> 它的作用是提供一个更清晰的目标模型，帮助后续拿“现状”去对照“理想形态”。

## 1. 设计目标

这个理想模型要同时满足三件事：

- 承接当前已经存在的 PMO 功能
- 保持运行结构足够轻，不把仓库变成笨重流程系统
- 为未来扩展预留清晰接口，而不是继续靠隐式习惯增长

这里所谓的“PMO 系统”，不只是文档集合，而是一套轻量控制面。
它至少要回答：

- 当前在做什么
- 下一步能做什么
- 一个讨论怎么进入可执行状态
- 一个 sprint 怎么被交给执行层
- 一个 sprint 怎么被关闭
- 哪些规则是硬约束，哪些只是说明

## 2. 核心设计原则

如果重新设计，我会先坚持下面四条原则。

### 原则一：运行态文件和解释性文件必须分开

运行态文件应该像状态卡或记录面：

- 当前 sprint
- candidate pool
- execution task
- execution report

它们的职责应该非常单一。
它们不应该一边承担状态机角色，一边还长篇解释系统哲学。

解释性内容应该放到别的层里。

### 原则二：Protocol 和 Policy 必须分开

两者经常被混用，但语义不一样。

- `protocol` 回答：状态怎么流动，阶段怎么切换
- `policy` 回答：整个系统默认按什么规则运行

例如：

- discussion -> promotion -> sprint selection，这属于 protocol
- 模型怎么选、文档什么时候同步、验证深度怎么定，这属于 policy

### 原则三：Baseline 不应该偷偷承担 runtime contract

`baseline` 的职责是描述“当前系统实际上是什么样”。

它可以记录：

- 当前结构
- 当前风险
- 当前 debt
- 当前 runtime truth

但它不应该一边描述现状，一边又偷偷变成“必须这样做”的唯一规则来源。

### 原则四：History 只能解释过去，不能控制现在

历史记录的价值在于：

- 解释某个结构为什么会变成现在这样
- 为后续追溯提供背景

但 history 不应该变成现行规则。
一旦一个文件的主要作用是“规定现在”，它就不该继续留在 history 层。

## 3. 理想的五层结构

如果从零搭一套轻量 PMO，我会优先按下面五层来设计。

### 第一层：Runtime State

这是最核心的一层。
它是运行中的 PMO 状态机。

它应该只放当前活着的状态文件，例如：

- `current_sprint`
- `sprint_candidates`
- `idea_backlog`
- `decision_log`
- `execution_task`
- `execution_report`
- `discussion_batch_index`
- `active_discussion_batch`

这一层的特点应该是：

- 路径稳定
- 文件名稳定
- 职责单一
- 内容尽量短
- 不承担长篇解释

一句话理解：

- 这一层是“活数据面”

### 第二层：Protocol

这一层定义状态如何流动。

它回答的问题是：

- 一个 discussion 什么时候进入 backlog
- backlog 什么时候能进入 sprint candidate
- candidate 怎么变 current sprint
- execution task 怎么交付
- execution report 怎么影响 closeout

这一层典型文件会是：

- discussion workflow
- promotion workflow
- sprint lifecycle workflow
- execution handoff protocol

这一层应该尽量聚焦在：

- 输入
- 输出
- 阶段切换规则
- 必须满足的条件

它不负责讲很多背景故事。

一句话理解：

- 这一层是“流转 contract 层”

### 第三层：Policy

这一层是横向规则层。

它不负责某一个具体 sprint 的状态，而负责整个系统默认怎样运行。

典型内容包括：

- model routing
- skill growth
- documentation sync
- testing / validation floor
- development constraints

这一层应该只保留“跨模块、跨流程都成立”的规则。

它不应该承接：

- 某一次 sprint 的特殊情况
- 某个单独 batch 的细节
- 当前代码结构的完整事实盘点

一句话理解：

- 这一层是“全局默认规则层”

### 第四层：Baseline / Truth

这一层描述当前系统真实长什么样。

典型内容包括：

- system baseline
- runtime workflow baseline
- backend API baseline
- roadmap

它应该回答：

- 当前系统结构是什么
- 当前 runtime 是怎么运作的
- 当前边界在哪里
- 当前 debt 和风险在哪里

它可以有：

- debt
- risk
- change note

但不应该成为唯一的流程控制来源。

一句话理解：

- 这一层是“现状地图层”

### 第五层：Knowledge / History

这是最自由的一层，但也最容易污染别层。

它可以放：

- AI-assisted collaboration knowledge
- why-this-exists 类解释
- migration record
- 复盘和经验沉淀
- 某次结构变更的历史记录

这一层的价值是帮助理解和传承经验。

但它最不该做的事是：

- 偷偷承担 canonical contract
- 成为当前唯一操作入口

一句话理解：

- 这一层是“知识与历史沉淀层”

## 4. 如果按这个思路设计目录

如果不考虑历史包袱，我不会先按主题分目录，而会先按层级分目录。

更接近理想形态的顶层会像：

- `state/`
- `protocols/`
- `policies/`
- `baselines/`
- `history/`

然后再看是否需要视角层，比如：

- `pmo`
- `architecture`
- `ai-ops`

换句话说，我会优先保证“层级正确”，再决定“主题怎么命名”。

因为很多系统混乱，不是因为文档少，而是因为不同层级的文档被混在同一个主题目录里。

## 5. 为什么这种分层更适合未来扩展

如果未来要扩展，这个模型会更稳。

### 扩展新状态

如果要新增状态文件，比如：

- review queue
- release gate
- audit backlog

它们应该知道自己属于 `Runtime State`，不会误塞到 guide 或 history。

### 扩展新流程

如果未来要新增 protocol，比如：

- release workflow
- architecture escalation workflow

它也知道自己该落在哪一层，不会和 baseline 混住。

### 扩展新规则

如果未来增加新的全局规则，比如：

- 自动化使用规则
- review 密度规则
- skill 安装规则

它应落在 `Policy` 层，而不是某个手册角落里。

### 扩展新项目接入

如果以后要接入新项目，最重要的不是复制目录名，而是让新项目能提供：

- runtime state 入口
- protocol 兼容面
- baseline truth
- policy 对齐点

这会比简单照抄目录结构安全得多。

## 6. 和当前系统相比，最大的改进点在哪里

如果把这个理想模型和当前系统相比，最大的改善不是“更漂亮”，而是下面三点。

### 改进一：减少语义混合

当前很多文件的问题不是内容错，而是同一文件里混了：

- 现状盘点
- 流程规则
- 操作建议
- 历史解释

理想分层的第一收益，就是让这些东西不再天然混住。

### 改进二：让扩展变成显式扩展

当前很多新规则、新文件、新路径，是在使用中慢慢长出来的。

理想模型下，扩展应该变成明确选择：

- 这是状态？
- 这是 protocol？
- 这是 policy？
- 这是 baseline？
- 这是 history？

一旦先问这一步，系统就没那么容易失控。

### 改进三：让“哪些东西不能乱动”更清楚

当前很多风险来自：

- 看起来像说明文档
- 实际却已经是运行 contract

理想模型下，至少能先让运行态文件和解释性文件分开。
这样一眼就知道哪些是轻易不能乱动的。

## 7. 这个理想模型最重要的提醒

这个模型不是在说：

- 当前目录一定要立刻全部改掉

它真正的作用是：

- 给现状提供一个对照坐标系

后面无论是继续梳理、做轻整理，还是未来真的做重构，都可以先问：

- 这份文件现在属于哪一层
- 它是不是跨层了
- 它的主职责和放置位置是不是一致

只要这几个问题开始被稳定使用，系统就会慢慢变清楚。

## 8. 一句话总结

理想的 PMO 系统，不应该先按“文档主题”组织，
而应该先按“系统层级”组织：

- state
- protocol
- policy
- baseline
- history

只有先把层级分开，未来的扩展才不会继续靠隐式习惯堆起来。
