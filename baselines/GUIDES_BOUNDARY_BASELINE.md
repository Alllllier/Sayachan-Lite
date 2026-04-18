# `docs/guides/` 边界基线

> 这份文档只做一件事：固定当前对 `docs/guides/` 的理解。
> 它不是重构方案，也不是新的 contract 文件。

## 1. 当前判断

`docs/guides/` 现在最适合被理解为：

- 通用操作说明层
- 横向约束说明层
- 文档同步、开发约束、验证方式这类“怎么做更合适”的说明层

它**不是**：

- 代码真相层
- PMO 运行状态层
- 历史迁移记录层
- repo 中唯一的硬 contract 承载层

一句话说：

`docs/guides/` 更像“跨模块的操作说明和轻约束集合”，而不是“系统唯一规则总表”。

## 2. 这个目录应该收什么

当前最适合放进 `docs/guides/` 的内容：

- 通用操作建议
- 横向开发约束
- 文档同步说明
- 测试与 UI review 的默认做法
- 不直接绑定某个单一 runtime surface 的项目级经验规则

这类内容的共同特点是：

- 服务多个模块，而不是只服务一个目录
- 帮助人更一致地做事
- 即使重要，也不一定构成最底层 canonical contract

## 3. 这个目录不应该收什么

当前最不适合继续堆进 `docs/guides/` 的内容：

- PMO state 文件
- 当前 sprint / candidate / backlog / handoff 之类运行面状态
- 系统架构事实真相
- public/private core 边界的唯一正式定义
- 某次具体迁移或具体 sprint 的历史记录

对应来说：

- 运行控制面应留在 `docs/pmo/`
- 代码真相应留在 `docs/architecture/`
- 历史记录应留在 `docs/migration/`

## 4. 当前目录里的三份文件怎么理解

### `documentation-sync.md`

当前最像：

- `guide` 为主

为什么：

- 它主要回答“改了哪些东西后，应该同步检查哪些文档”
- 本体仍然是操作说明

为什么会让人觉得边界脏：

- 它里面已经写入了不少带 contract 味道的内容
- 尤其是 canonical docs 列表、责任规则、repo hook scope

当前结论：

- 先把它当 `guide`
- 以后如果要整理，优先把“真正的 sync contract”从里面抽出来

### `development-constraints.md`

当前最像：

- `guide` 为主

为什么：

- 它是在汇总项目级开发约束、默认习惯、change hygiene 和 feature checklist
- 更像“操作守则”而不是唯一约束来源

为什么会让人觉得模糊：

- 里面有些段落已经非常接近硬约束
- 比如 architecture-sensitive areas、AI feature rules

当前结论：

- 先保留为 guide
- 后面如果某些约束变成真正的 canonical rule，再单独抽层

### `testing-and-ui-review.md`

当前最像：

- `guide` 为主

为什么：

- 它在定义轻量验证地板和 UI review 方式
- 本体是“默认验证方法”

为什么会混：

- `Report Contract` 和 `Documentation Sync Rule` 已经带了一些 contract 感

当前结论：

- 主标签仍应保留 guide
- 不建议现在把它升级成 PMO protocol

## 5. 当前最核心的问题

`docs/guides/` 的问题不是“完全放错了东西”，而是：

- guide 文件里长出了半 contract 段落
- 一些横向说明承担了超出“说明”范围的语义负担
- 目录边界已经有了，但文件内部边界还没完全长清楚

所以它现在的真实状态更像：

- 目录边界基本成立
- 文件内部语义还不够干净

## 6. 当前最推荐的整理方向

如果后面要整理 `docs/guides/`，最推荐的顺序是：

1. 先继续把每份 guide 内部的 contract 段落识别出来
2. 再判断这些 contract 是不是值得单独抽层
3. 最后才决定是否改目录结构或移动文件

也就是说：

- 先做“语义拆层”
- 不急着做“物理迁移”

## 7. 当前不建议做的事

- 不建议现在就把 `docs/guides/` 整个重命名
- 不建议现在就把三份 guide 大拆重写
- 不建议因为其中有半 contract 段落，就把整个目录改判成 contract 区
- 不建议把 `guides` 里的内容直接塞回 `architecture` 或 `pmo`

## 8. 一句话结论

`docs/guides/` 现在最适合被看成：

- 一个“目录语义已经基本成立，但文件内部仍需慢慢去混合化”的通用说明层
