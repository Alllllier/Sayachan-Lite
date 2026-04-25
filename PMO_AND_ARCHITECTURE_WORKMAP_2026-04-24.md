# 项目工作总整理报告

- 日期：`2026-04-24`
- 项目：`personal_os_lite`
- 目的：把当前已经串在一起的 discussion、测试、架构重构、PMO 治理工作压缩成一份可执行总表，避免继续靠记忆维持全局状态。

## 一句话结论

现在的任务确实很多，但并不是一团没有结构的乱线。

当前可以整理成两条主线，加一条底层治理线：

- 产品演进线
- 测试与验证收口线
- PMO 自治理线

其中最重要的判断是：

- 前端 discussion 现在已经自然收敛成一条连续主线，而不是多条并行主线
- `discussion_batch_008` 更像母题背景，不应该继续当成当前执行入口
- 当前前端更适合按 `12 -> 11 -> 10 -> 08收口` 来理解
- 在这条线之外，已经额外浮现出一条新的 `前后端架构重构` 任务线
- 再往上看，PMO 本身也暴露出治理债：`grammar -> policy -> skill`

## 当前全局分层

### 1. 产品演进线

这条线主要解决产品前端结构和交互语言逐步稳定的问题。

当前主顺序应理解为：

`discussion_batch_012 -> discussion_batch_011 -> discussion_batch_010 -> discussion_batch_008收口`

压缩解释：

- `012`
  - 当前最贴近最近真实交 list / list grammar
  - 是现在最像“当前主入口”的 discussion
- `011`
  - 更上层的前端 style baseline / shared primitive / reusable structure
  - `012` 本身也是从这里继续拆出去的
- `010`
  - 前端显示语义之后的测试与验证 follow-up
  - 不是当前最前排施工面，更像后续验证收口线
- `008`
  - 最后回去做母题收口
  - 不应该重新变成一条新的大主线

### 2. 测试与验证收口线

这条线解决的问题不是“做功能”，而是“让后续重构和迭代有护栏”。

当前判断：

- 后端比前端更适合先补测试，再做结构重构
- 前端因为 `010 -> 011 -> 012` 这条结构线还在演进，不适合过早把很多不稳定行为全部冻结成测试
- 所以前端测试扩展更适合在 `12/11` 进一步收束后推进

### 3. 架构重构线

这是最近新浮现出来的独立任务层，不建议再塞回 `008`。

包括：

- 后端架构重构
  - service layer
  - route aggregation / router index
  - validation / error handling / config layer
- 前端架构重构
  - feature orchestration
  - composables
  - api client
  - state ownership 收束
  - 胖组件瘦身

这条线建议单独管理，不要继续借用原来的 testing / follow-up discussion 容器。

### 4. PMO 自治理线

这是当前最容易被忽视、但其实已经开始阻塞全局清晰度的一层。

它至少包含三段：

1. `grammar`
2. `policy`
3. `skill`

顺序建议是：

`先 grammar -> 再 policy -> 最后 skill`

原因：

- grammar 没稳，discussion 和 handoff 只能靠习惯
- policy 没稳，很多长期规则会漂浮在 discussion judgement 和 handoff 里
- skill 没稳，Codex 只会学到一套还没定型的做法

## discussion 现状压缩

### `discussion_batch_008`

这不是当前执行入口，更像母题背景。

它最初承接的是“简化重构之后的所有尾巴”，后来内部自然分流出了多个子线。

已经基本处理过的部分：

- runtime residue cleanup
- backend test architecture buildout（已拆出并落过）

还保留在它名义下的，主要是更大的“cross-surface test / validation baseline”母题。

因此：

- 不要再把 `008` 当作当前主入口
- 更适合把它当成最终总收口的母题容器

### `discussion_batch_009`

这是从 `008` 拆出去的后端测试专项线。

当前判断：

- 它基本已经不是当前主线
- 可以视为已落过的专项支线
- 跟当前前端主线没有强耦合

### `discussion_batch_010`

这是前端显示语义与测试覆盖 buildout 的线。

当前判断：

- 它不是无关
- 但也不是当前主线最前排
- 它更像 `11/12` 之后的验证收口线

### `discussion_batch_011`

这是前端 style baseline / shared primitives / reusable component 的上层结构线。

当前判断：

- 仍然与当前主线直接相关
- `012` 就是它进一步拆出来的一条更具体的后续线

### `discussion_batch_012`

这是当前最贴近最近真实交付和继续推进位置的一条线。

当前判断：

- 它最适合作为当前前端主入口理解
- 后面完成后再回到 `011`

## 当前优先级建议

### A. 当前最自然的主顺序

1. 继续按 `12 -> 11`
2. 再回到 `10`
3. 最后回 `08` 做母题收口

### B. 不要现在立刻抢主线的东西

- 大规模前后端架构重构
- 全面前端测试冻结
- PMO 全盘重写

这些都应该进入规划，但不建议直接抢走当前主线入口。

### C. 应该尽早插入但保持窄 scope 的东西

- discussion grammar
- handoff / execution contract template
- PMO policy layer 补全的第一批高频规则

## 当前核心问题树

### 1. 产品侧

- 前端结构还在逐步成型
- 前端 list/display grammar 仍在收口
- 前端测试扩展不能完全脱离结构稳定度
- 后端已经看见明确的分层缺口

### 2. 测试侧

- 后端测试框架可以继续加固
- 前端测试需要跟随结构稳定度推进
- repo-native UI review baseline 还不稳定
- worker validation expectation 还没有完全制度化

### 3. PMO侧

- discussion 模板还没稳定
- handoff 模板和使用纪律还没稳定
- policy 层过薄，很多规则被漂到 discussion / execution 中
- Codex skills 还是原始状态，尚未承接成熟 PMO 经验

## 总体推进顺序建议

建议不要再把所有事情当成同一层级排队，而是按下面理解：

### 第一阶段：先把当前前端主线继续收束

- `012`
- `011`

目标：

- 让前端共享结构语言再稳定一段
- 避免测试和架构重构过早冻结仍在流动的表面

### 第二阶段：接前端测试/验证收口

- `010`

目标：

- panel behavior coverage
- frontend validation baseline
- repo-native UI review baseline 的进一步明确

### 第三阶段：回 `008` 做母题收口

目标：

- 清点哪些 testing / validation 母题已经被后续子线消化
- 把 `008` 尽量降成 `stable` 或背景容器

### 第四阶段：显式抬升架构重构线

目标：

- 前后端架构重构独立立项
- 不再寄生在原有 testing / follow-up discussion 里

### 第五阶段：PMO 自治理线

目标：

- grammar 稳定
- policy 补全
- skill 回灌

注意：

这条线不一定完全排在最后。
更实际的做法是：

- 在当前主线推进过程中，穿插处理最必要的 grammar / handoff / policy 问题
- skill 层放到更后面

## 当前阶段判断

如果要回答“我们现在在哪一步”，我会这样标：

- 当前主入口：`discussion_batch_012`
- 当前上游背景：`discussion_batch_011`
- 当前后续验证入口：`discussion_batch_010`
- 当前母题背景：`discussion_batch_008`
- 当前新浮现任务：`前后端架构重构`
- 当前上游治理债：`PMO grammar / policy / skill`

所以当前可以认为项目所处阶段是：

> 前端结构主线继续收束中，同时已经看见后续测试收口、架构重构、PMO 自治理三条次级任务线。

## Checklist

下面这个 checklist 不是“今天就做完”，而是用来标当前所处阶段和后续推进顺序。

### A. 前端主线

- [X] `discussion_batch_012` 剩余工作收束完成
- [X] `discussion_batch_012` 可降为 `stable` 或进入更明确的 follow-up 状态
- [X] 回到 `discussion_batch_011`，确认 style baseline / shared structure 仍未收口的部分
- [X] `discussion_batch_011` 的后续范围重新压缩到可执行层
- [ ] 进入 `discussion_batch_010`，把前端 panel behavior coverage 作为主要收口对象
- [ ] repo-native UI review baseline 在 `010` 中获得更明确的默认触发规则
- [ ] 回到 `discussion_batch_008` 做 testing / validation 母题收口
- [ ] `discussion_batch_008` 尽量降为背景容器，不再承担当前执行入口角色

### B. 后端与测试

- [ ] 后端测试框架继续补强到更适合后端结构重构的程度
- [ ] service-level tests 有明确建设方案
- [ ] route / integration / validation / error-handling 测试边界更清晰
- [ ] 前端测试策略和前端结构稳定度重新对齐

### C. 前后端架构重构

- [ ] 后端架构重构作为独立任务线被明确记录
- [ ] 前端架构重构作为独立任务线被明确记录
- [ ] 确认前后端架构重构是否分成两条 discussion 管理
- [ ] 明确它们与测试框架加固之间的先后关系
- [ ] 避免把架构重构线重新塞回 `008`

### D. PMO Grammar

- [ ] discussion 模板化需求被显式记录
- [ ] handoff / execution contract 模板化需求被显式记录
- [ ] execution report / closeout 最小语法被明确
- [ ] discussion -> candidate -> execution_task -> execution_report 的实际使用链条被重新梳理

### E. PMO Policy

- [ ] 识别哪些规则本应落在 `policies/` 而不是 discussion judgement
- [ ] 识别哪些规则本应落在 `policies/` 而不是 handoff 文本
- [ ] 补第一批高频 policy，而不是一口气补完整层
- [ ] 明确 protocol 负责流程、policy 负责规则、discussion 不再长期保存治理结论

### F. PMO Skill

- [ ] 等 grammar 基本稳定后，再整理 skill 回灌范围
- [ ] 等 policy 有稳定落点后，再重写或升级相关 Codex skills
- [ ] 明确哪些 PMO 经验应该沉进 skill，哪些应保留在 repo policy/protocol/state

## 当前推荐执行顺序

如果只保留一个最简版本的顺序，就是：

1. `12`
2. `11`
3. `10`
4. `08收口`
5. 架构重构线正式抬升
6. PMO grammar
7. PMO policy
8. PMO skill

更现实一点的执行法则是：

- 主线按 `12 -> 11 -> 10 -> 08`
- grammar / handoff 模板化穿插进行
- policy 补全跟着 grammar 稳定度走
- skill 最后再管

## 最后判断

现在任务很多，不代表你们已经失控。

真正需要避免的是这三件事：

- 把所有任务继续混在同一个 discussion 母题里
- 在前端结构还没收口时过早全面冻结测试
- 在 PMO grammar 和 policy 还没稳时就急着把经验写进 skill

只要记住当前主干是：

`12 -> 11 -> 10 -> 08收口`

再把：

- 架构重构线
- PMO 自治理线

作为下一层独立任务来管理，整体就还是可控的。
