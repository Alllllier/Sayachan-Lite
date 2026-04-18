# 从 `discussion_batch_001` 反推 `decision_log`

> 这份文档不修改旧 PMO 的运行文件。
> 它的作用是基于
> [discussion_batch_001.md](/C:/Users/allie/Desktop/personal_os_lite/docs/pmo/state/discussion_batches/discussion_batch_001.md)
> 反推：这次 discussion 流程里，哪些内容其实已经构成了 durable decision，
> 只是没有被正式写入 `decision_log.md`。

## 1. 先给一个总判断

这次 discussion 不是“没有产生 decision”，而是：

- decision 已经产生
- 但被吸收进了 batch 记录、promotion record 和目标 state 文件
- 没有再被单独提炼成 durable decision entry

所以旧 `decision_log.md` 之所以为空，
不是因为没有决策，
而是因为旧流程没有明确规定：

- 哪类结论必须单独入 log
- promotion 后谁负责补 log
- 什么时候一个结论已经足够 durable

## 2. 这次 discussion 中已经形成的 durable decision

下面这些内容，我认为都已经达到“应该进入 decision log”的强度。

### 决策一：`theme-001` 不应作为 bundled sprint 执行

建议 decision title：

- `theme-001 split into separate execution slices`

建议类型：

- `approved`

建议范围：

- `theme-001 / runtime authoring and markdown surface polish`

建议决策内容：

- `theme-001` 应被拆成两个独立 slice，而不是打包成一个 bundled sprint

建议原因：

- discussion 已明确认为 bundled sprint 不如拆成两个 bounded slice 清晰
- 这不是临时评论，而是已经决定了后续 shaping 方式

为什么这算 durable：

- 它不只是“这次先这么做”
- 它已经改变了这个 theme 未来如何进入执行面的方式

### 决策二：`Chat Markdown Render v1` 是 `theme-001` 的优先首发 slice

建议 decision title：

- `chat-markdown-render-v1 selected as first execution slice for theme-001`

建议类型：

- `transition-rule`

建议范围：

- `theme-001`

建议决策内容：

- 在 `theme-001` 的两个 slice 中，`Chat Markdown Render v1` 应优先于 `Notes Editor Polish v1` 作为第一执行切片

建议原因：

- discussion 里已经明确给出排序理由：这是更 bounded、风险更窄、实现影响更小的第一刀

为什么这算 durable：

- 它已经不是单次 comments，而是明确影响了 promotion 和后续 sprint 选择

### 决策三：`Notes Editor Polish v1` 应作为独立 UX slice 保留

建议 decision title：

- `notes-editor-polish-v1 remains a separate UX slice`

建议类型：

- `approved`

建议范围：

- `theme-001`

建议决策内容：

- `Notes Editor Polish v1` 不并入 chat markdown 修复，而应作为单独 UX quality slice 保留

建议原因：

- discussion 已经明确它的目标、范围和验证方式，与 chat markdown repair 不同

为什么这算 durable：

- 这决定了它未来的 candidate 形态和边界，不是临时备注

### 决策四：`theme-004` 当前阶段只进入 `idea_backlog`，不进入 `sprint_candidates`

建议 decision title：

- `theme-004 stays in idea backlog until implementation design is bounded`

建议类型：

- `deferred`

建议范围：

- `theme-004 / authentication and developer superuser model`

建议决策内容：

- `theme-004` 当前只应进入 `idea_backlog`，在 bounded implementation design 形成前，不进入 `sprint_candidates`

建议原因：

- discussion 已经明确：方向已稳定，但实现设计还不够收敛

为什么这算 durable：

- 它是一个阶段性 gating 决策，未来可以改变，但在改变前应被系统记住

### 决策五：Discussion 批次在 promotion 后应只保留压缩摘要

建议 decision title：

- `discussion batch retains compressed summary after promotion`

建议类型：

- `transition-rule`

建议范围：

- `discussion batch workflow`

建议决策内容：

- discussion batch 在完成 promotion 后，应保留压缩后的 retained summary，而不是继续承载完整 shaping 细节

建议原因：

- `discussion_batch_001.md` 里已经显式实践了这条规则
- 这已经不只是一次写法，而是 workflow 选择

为什么这算 durable：

- 它直接影响 discussion batch 和 formal state 的职责边界

## 3. 哪些内容还不够进入 `decision_log`

不是所有结论都应该进 log。

下面这些更适合继续留在：

- batch notes
- candidate content
- backlog content

而不是单独写成 durable decision。

例如：

- 某个 slice 的详细 in-scope / out-of-scope 描述
- 某个 theme 的 tags、risk、maturity
- 某次具体 promotion 的 retained summary 原文

这些更像“状态内容”或“实例细节”，不是长期记忆。

## 4. 从这次回推，能提炼出什么新版规则

这次反推最重要的收获，不只是补出几条旧 decision，而是能反推出新版 PMO 里 `decision_log` 应该怎么写。

### 规则一：`decision_log` 不记录所有结论，只记录 durable decision

也就是只记录：

- 以后不希望重新从零讨论的结论
- 会改变后续 shaping / promotion / selection / workflow 的结论

### 规则二：promotion 发生后，必须检查是否产出了 durable decision

也就是说，promotion 不应只问：

- 目标 state 文件有没有更新

还应该补问：

- 这次 promotion 有没有带出应该单独记录的 durable decision

### 规则三：阶段性 gating 结论也应该进入 `decision_log`

例如：

- 暂不进入 sprint candidate
- 必须先完成某个 design stage
- 某类 item 先固定停在 backlog

这些虽然不是永久结论，但在当前阶段是 durable 的。

### 规则四：workflow 级规则也可以进入 `decision_log`

不是只有 feature / architecture 决策才应入 log。

像这次 discussion batch 的“promotion 后保留压缩摘要”这种规则，
本质上已经是 workflow decision，也值得进入 log。

## 5. 一句话结论

`decision_log` 在旧 PMO 里之所以空着，
不是因为没有 decision，
而是因为旧流程没有把“从 discussion / promotion 中提炼 durable decision”制度化。

而 `discussion_batch_001.md` 已经足够说明：

- 新版 PMO 必须给 `decision_log` 一个明确写入规则
- 否则 decision 会继续散落在 batch、candidate、backlog 和人的记忆里
