# PMO 通用性目标

> 这份文档固定新版 PMO 的一个核心设计目标：
> 它必须是可跨项目类型接入的，
> 而不能只是一个“更干净的 Sayachan 专用 PMO”。

## 1. 核心目标

新版 PMO 要做到：

- 对现在的 Sayachan 这类 JS Web 项目可用
- 对 Python 项目可用
- 对 C# 游戏项目可用
- 对未来其他类型项目也应具备接入可能

前提是这些项目愿意接入：

- PMO 层
- 施工层
- adapter 层

也就是说，通用性的目标不是“所有项目长得一样”，而是：

- 不同项目都能把自己挂到同一套 PMO core 上

## 2. 这里所谓的“通用”到底指什么

这次的通用性，指的是下面这几层应该通用：

- Runtime State
- Protocol
- Policy
- Adapter contract
- Onboarding flow

这些内容不应该依赖：

- JavaScript
- Python
- C#
- Web app
- game project
- Sayachan 当前目录结构

如果这些层仍然依赖某种具体技术栈，那它就不是真正的 PMO core。

## 3. 不要求通用的部分

通用 PMO 不等于“项目细节统一”。

下面这些内容天然可以因项目而异：

- 架构事实文档的路径
- 测试命令
- 构建命令
- 角色命名
- execution worker 的具体选择
- 项目的边界定义
- 代码仓库的目录结构
- host integration 方式

这些差异应该由：

- adapter
- project baseline
- host integration
- execution binding

来承接。

## 4. 三类典型项目下，PMO 应该保持什么不变

### JS Web 项目

比如 Sayachan。

它可能有：

- frontend / backend
- UI review
- browser validation
- AI bridge / service

但这些都只是项目实例特征，不应该反向定义 PMO core。

### Python 项目

它可能有：

- CLI
- service
- notebook
- data pipeline
- API service

它未必有前端，未必有 UI review，未必有浏览器验证。
但它仍然应该能接入同样的：

- sprint state
- handoff
- execution report
- protocol
- policy

### C# 游戏项目

它可能有：

- engine-specific workflow
- asset pipeline
- scene / gameplay iteration
- build verification
- playtest or capture review

它和 JS Web 的实现形态差异很大，但 PMO core 仍应成立。

也就是说：

- PMO 不能把“Web app 的默认工作流”写成全局前提

## 5. 这对新版 PMO 设计提出的要求

### 要求一：核心语义必须抽象到足够高

例如：

- `validation` 应该是通用语义
- 而不是默认等于 `browser validation`

- `execution worker` 应该是通用语义
- 而不是默认等于 `Claude`

- `project truth docs` 应该是通用语义
- 而不是默认等于 `docs/architecture/*.md`

### 要求二：项目差异必须通过 adapter 承接

adapter 必须能够表达：

- 本项目的 baseline 在哪里
- 本项目的 state 文件在哪里
- 本项目的 validation 方式是什么
- 本项目的 execution binding 是什么
- 本项目的 host integration 是什么

### 要求三：host integration 不得写进 core

例如：

- `.codex/skills/` 是 Codex integration
- 不是 PMO core 本体

如果未来换宿主，core 仍然应成立。

### 要求四：Web 特有逻辑不得冒充普适逻辑

像这些东西：

- browser validation
- UI review
- frontend/backend split
- chat / AI surface

都只能作为某类项目的实例特征，不能被写成新版 PMO 的默认世界观。

## 6. 一个简单的验收问题

以后我们在设计新版 PMO 的任何一个文件时，都可以先问一个问题：

- 如果把这个文件拿去给一个 Python 项目或 C# 游戏项目接入，它还能成立吗？

如果答案是：

- “不成立，因为它默认前端、默认浏览器、默认 `.codex/skills/`、默认 Sayachan 路径”

那就说明它还没有达到通用目标。

## 7. 当前最应该避免的偏航

在正式施工时，最容易发生的偏航是：

- 以为自己在做通用 PMO
- 实际却把 Sayachan 的结构抽象成了默认模板

这类偏航包括：

- 默认 `docs/pmo/**` 才是正确路径
- 默认 `docs/architecture/**` 才是 baseline 入口
- 默认 `browser validation` 是标准验证层
- 默认 `.codex/skills/` 是系统本体的一部分
- 默认 execution worker 是某个具体 agent

这些都必须避免。

## 8. 一句话结论

新版 PMO 的目标，不是做一个“可以离开 Sayachan 存活的 Sayachan PMO”，
而是做一个真正可以接入：

- JS Web 项目
- Python 项目
- C# 游戏项目

的通用 PMO core。
