# PMO Policy Backlog

> 这是新版 PMO 重建过程中的临时台账。
> 它只用来收集“已经识别到、但还没正式写进 `pmo-core/policies/` 的 policy 候选”。
>
> 它不是新版 PMO 的正式结构，
> 也不是未来长期运行态文件。

## 1. 这个文件的作用

这个 backlog 用来避免一种常见偏航：

- 旧系统里有很多横向规则
- 这些规则散落在 manual、workflow、baseline、guide 甚至 discussion 里
- 重建时如果不先收集，就很容易漏掉
- 漏掉之后，它们又会重新混回别层

所以这份文件的作用是：

- 临时收集
- 等待正式 policy 化
- 被消化后逐步清空

## 2. 当前已正式进入 `pmo-core/policies/` 的项

- `decision capture`

## 3. 当前待收口的 policy 候选

### `documentation sync`

当前来源：

- `docs/guides/documentation-sync.md`

为什么像 policy：

- 它定义的是“什么变化应触发哪些文档同步检查”
- 这是横向默认规则，不是单个流程自己的 contract

当前状态：

- 已识别
- 尚未正式迁入 `pmo-core/policies/`

### `validation floor`

当前来源：

- `docs/guides/testing-and-ui-review.md`

为什么像 policy：

- 它定义的是不同风险下采用怎样的验证深度
- 这是跨 sprint、跨项目类型都应该成立的横向判断规则

当前状态：

- 已识别
- 尚未正式迁入 `pmo-core/policies/`

### `development constraints`

当前来源：

- `docs/guides/development-constraints.md`

为什么像 policy：

- 它承接的是跨模块默认开发约束
- 这类规则更适合放在 policy 层，而不是继续混在 guide 容器里

当前状态：

- 已识别
- 尚未正式迁入 `pmo-core/policies/`

### `promotion hygiene`

当前来源：

- `docs/pmo/workflows/promotion-workflow.md`
- `discussion_batch_001` 的反推结果

为什么像 policy：

- 它不只是 promotion 流转本身
- 还涉及“promotion 后保留多少摘要、什么时候要补 decision log”这类横向整洁度规则

当前状态：

- 已识别
- 还未拆成正式 policy 与 protocol 的分界

### `state minimality`

当前来源：

- 当前对新版 PMO state 设计的分层判断

为什么像 policy：

- 它回答的是“state 文件应该尽量薄，不应承担长篇解释”
- 这更像横向写作约束，而不是某个单独 state 文件自己的 contract

当前状态：

- 已识别
- 尚未正式写成 policy

### `archive and summary retention`

当前来源：

- `discussion_batch_001` 的 retained summary 做法
- 现有 PMO outbox archive 的实践

为什么像 policy：

- 它涉及“promotion 后留多少摘要”“active/archived surface 怎么分工”
- 这类规则会横跨 discussion、handoff、history 多个面

当前状态：

- 已识别
- 尚未正式写成 policy

### `host integration boundary`

当前来源：

- [PMO_HOST_DECOUPLING.md](/C:/Users/allie/Desktop/personal_os_lite/baselines/PMO_HOST_DECOUPLING.md)

为什么像 policy：

- 它定义的是 core、host integration、execution binding 三层之间的默认边界
- 虽然现在更像设计原则和 adapter / integration contract clarification，
  但未来很可能要沉淀成正式 policy

当前状态：

- 已识别
- 当前仍更接近设计边界说明，暂未正式迁入 `pmo-core/policies/`

## 4. 进入正式 policy 的标准

一个 backlog 项适合正式进入 `pmo-core/policies/`，至少要满足：

- 它确实是横向规则，而不是某个单独流程细节
- 它能跨项目类型成立
- 它不依赖 Sayachan 当前目录结构
- 它和 state / protocol / baseline 的边界已经足够清楚

## 5. 一句话结论

这份 backlog 是新版 PMO 重建期的临时收集台账。

它的理想结局不是越长越大，
而是随着 `pmo-core/policies/` 逐步成熟而越来越小。
