# PMO 使用指南

这一层用于面向人类 PMO 使用者，解释系统是如何运行的，以及应该如何阅读和操作这套 PMO。

它的定位是：

- 帮助人快速理解 PMO 的运行机制
- 解释 state / protocol / policy 之间是怎么协同的
- 提供面向操作者的总览图、泳道图和 trigger map
- 作为 canonical PMO contract 的阅读辅助，而不是替代 contract

这里的内容更偏：

- 系统运行总览
- 操作路径说明
- 角色分工图
- policy 触发图

当前包含：

- `where-to-start.md`
- `pmo-system-map.md`
- `pmo-master-flow.md`
- `policy-trigger-map.md`
- `pmo-role-swimlane.md`

## 推荐的 VS Code 配置

如果你在 VS Code 里阅读这些文档，建议安装扩展 `Markdown Preview Mermaid Support`。

扩展 ID：

- `bierner.markdown-mermaid`

这样 `operator-guides/*.md` 里的 Mermaid 图可以直接在 VS Code 的 Markdown Preview 中渲染出来，而不是只看到源码。

## 推荐阅读顺序

如果你是第一次作为人类操作者阅读这套 PMO，推荐顺序是：

1. `where-to-start.md`
2. `pmo-system-map.md`
3. `pmo-master-flow.md`
4. `policy-trigger-map.md`
5. `pmo-role-swimlane.md`
