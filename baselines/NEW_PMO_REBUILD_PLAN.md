# 新版 PMO 平行重建计划

> 这份文档描述的是下一阶段的方向：
> 不是继续在 Sayachan 现有 PMO 上做局部修补，
> 而是平行重建一个新版 PMO 系统。
>
> 这个新版 PMO 不会逐步替换当前 Sayachan PMO，
> 而是先完整建立、完整接入、完整验证，
> 最后才决定是否迁移 Sayachan。

## 1. 为什么现在适合进入“重建阶段”

当前已经具备了重建 PMO 的两个前提：

- 对理想结构有了清晰判断
- 对当前系统的形成史、分层偏差和成熟骨架有了比较稳定的理解

也就是说，现在已经不是：

- 边猜边搭
- 边跑边想

而是可以开始进入：

- 带模型重建
- 带对照验证
- 带接入测试演进

## 2. 本次重建的总体策略

本次重建采用下面这条路线：

1. 不直接改 Sayachan 当前 PMO
2. 平行建立一个新版 PMO
3. 通过 adapter 方式把新版 PMO 接入一个新项目
4. 在新项目里测试接入流程和功能达标情况
5. 只有验证通过后，才回头决定是否对 Sayachan 做大清理和 PMO 迁移

一句话说：

- Sayachan 不是实验场
- Sayachan 是未来迁移对象

## 3. 为什么不应该直接在 Sayachan 上重建

### 原因一：当前 PMO 已经是运行面

它不是普通文档目录，而是实际在承担：

- 状态机
- handoff
- closeout
- next sprint selection

直接在上面重建，风险太高。

### 原因二：最需要验证的是“可接入性”

新版 PMO 是否成立，关键不在于：

- 在 Sayachan 里看起来更整洁

而在于：

- 能不能接入另一个项目
- adapter 是否足够表达差异
- state / protocol / policy / baseline 是否真的能独立成立

### 原因三：新项目测试更容易暴露真问题

只有在新项目接入时，下面这些问题才会被真正逼出来：

- 哪些是 Sayachan 特有假设
- 哪些 adapter 字段真的必要
- 哪些 policy 写得太依赖原仓库语境
- 哪些 workflow 其实还没有做成真正的 protocol

## 4. 重建的四个阶段

### 阶段一：定义新版 PMO 骨架

这一阶段先不接任何项目。
目标是把新版 PMO 自己设计清楚。

需要明确的内容：

- Runtime State 文件集合
- Protocol 文件集合
- Policy 文件集合
- Baseline / Truth 的接入要求
- Knowledge / History 的位置
- adapter contract

这一阶段的目标不是“先做很多文件”，而是：

- 让新版 PMO 在结构上自洽

### 阶段二：做成可安装的 PMO Core

这一阶段把设计变成真正可复制、可安装、可接入的系统。

要产出的东西包括：

- 目录结构
- canonical 文件模板
- adapter 模板
- 安装说明
- onboarding checklist
- governance skills 的接入约束

这一阶段的核心问题是：

- 新版 PMO 能不能从“设计图”变成“可安装套件”

### 阶段三：接入一个新项目做完整验证

这一阶段是整个计划里最关键的验证点。

验证目标包括：

- adapter 是否足够表达项目差异
- 新项目已有文档是否能映射到 baseline 层
- 新项目已有 skills 是否能与 governance skills 共存
- 新版 PMO 的 state / protocol 是否真的能跑起来
- onboarding 流程是否足够清楚

这一阶段的成功标准不是“能接进去一点点”，而是：

- 能完整跑通一次接入流程

### 阶段四：回头处理 Sayachan

只有前面三阶段都验证通过，才进入这一步。

这一阶段的目标是：

- 不是继续实验
- 而是做正式迁移准备

需要做的事包括：

- 把旧文件映射到新分层
- 判断哪些保留
- 判断哪些归档
- 判断哪些迁移
- 最后再做 Sayachan 大清理和新版 PMO 安装

## 5. 新版 PMO 的设计原则

这次重建必须坚持下面这些原则。

### 原则一：先分层，再分目录

先确定：

- state
- protocol
- policy
- baseline
- history

再决定目录长什么样。

不能再先按主题建目录，后面再靠文档去补分层。

### 原则二：Sayachan 不得成为默认结构假设

新版 PMO 不能默认：

- Sayachan 的路径
- Sayachan 的 handoff 文件名
- Sayachan 的 AI 边界命名
- Sayachan 的 skill 组织方式

这些都只能通过 adapter 绑定。

### 原则三：Runtime State 要尽量薄

state 层应该像状态卡，而不是长篇解释文档。

状态文件应该追求：

- 路径稳定
- 语义稳定
- 字段清晰
- 内容尽量轻

### 原则四：Knowledge 不得偷偷承担 Contract

知识资产和历史文档可以解释系统，但不能成为当前唯一规则来源。

### 原则五：Protocol 和 Policy 必须分离

这是这次重建必须强制守住的一条红线。

## 6. 新版 PMO 的最小成功标准

如果这次重建要算成功，至少要满足下面几条：

- 新版 PMO 有完整分层骨架
- 有一套可安装的 core 结构
- 有 adapter contract
- 有 onboarding 入口
- 能在新项目里跑通一次接入
- 不依赖 Sayachan 的目录结构才能成立

## 7. 现阶段不做什么

为了避免偏航，这一阶段明确不做这些事：

- 不直接改 Sayachan 当前 PMO runtime 文件
- 不在当前 `docs/pmo/**` 上做半迁移
- 不先做 Sayachan 的目录大清理
- 不先做“看起来更整齐”的 cosmetic reorg
- 不把新版 PMO 先写成一堆抽象话术而不落模板

## 8. 下一步最自然的工作

如果按这个计划继续往前走，下一步最自然的是：

- 正式定义新版 PMO 的最小骨架

也就是先回答：

- 最少需要哪些 state 文件
- 最少需要哪些 protocol 文件
- 最少需要哪些 policy 文件
- adapter 至少要承接什么

## 9. 一句话结论

现在最合适的路线不是继续在旧 PMO 上修修补补，
而是：

- 平行重建一个分层更清晰、可接入新项目的新版 PMO
- 先在新项目验证
- 最后再决定是否迁移 Sayachan
