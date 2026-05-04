# NotesPanel Legacy 审计报告

- 日期：`2026-04-23`
- 范围：`frontend/src/components/NotesPanel.vue`
- 目标：识别 `NotesPanel` 中哪些部分已经对齐当前共享 baseline，哪些部分应被视为受保护的局部语法，哪些部分属于可以渐进清理的 legacy residue。

## 总结

整体来看，`NotesPanel` 已经不再是一个 legacy 很重的 surface。它的主要对象外壳、动作语法、空状态、toast、分段切换，以及大部分字段校验提示，都已经建立在共享 UI primitive 之上。

目前剩余的清理工作主要集中在三类区域：

1. 仍然停留在页面局部的 shell / layout 样式，还没有被纳入更清晰的 panel/shell 语言。
2. 一块应该暂时保持稳定的本地 CodeMirror 编辑语法，不适合强行并入共享 primitive。
3. 少量明显的 residue 样式，以及 scoped CSS 中的死注释 / 死 class。

## 已经对齐 Baseline 的部分

以下区域已经和当前 baseline 有较好的对齐，不应再被视为主要 legacy 债务：

- Notes 的对象外壳已经使用 `Card`
  - `frontend/src/components/NotesPanel.vue:539`
  - 共享实现：`frontend/src/components/ui/Card.vue`
- 编辑态和归档态操作已经使用 `ActionRow`
  - `frontend/src/components/NotesPanel.vue:517`
  - `frontend/src/components/NotesPanel.vue:607`
  - `frontend/src/components/NotesPanel.vue:615`
- AI note action 已经使用 `ObjectActionArea`
  - `frontend/src/components/NotesPanel.vue:620`
  - 共享实现：`frontend/src/components/ui/ObjectActionArea.vue`
- AI 任务展开块外层已经使用 `SectionBlock`
  - `frontend/src/components/NotesPanel.vue:644`
  - 共享实现：`frontend/src/components/ui/SectionBlock.vue`
- 归档视图切换已经使用 `SegmentedControl`
  - `frontend/src/components/NotesPanel.vue:530`
- 空状态和 toast 已经使用共享组件
  - `frontend/src/components/NotesPanel.vue:488`
  - `frontend/src/components/NotesPanel.vue:538`
- 表单 / 错误提示已经大量复用共享 primitive
  - `input`、`field-stack`、`field-helper`、invalid state
  - `frontend/src/components/NotesPanel.vue:494-515`
  - `frontend/src/components/NotesPanel.vue:572-596`
- Markdown 渲染已经使用共享 `.markdown-body` baseline
  - `frontend/src/components/NotesPanel.vue:602`

## 应保留的局部语法

以下区域目前应继续保留在本地，不适合作为第一批激进 baseline 统一对象。

### CodeMirror Theme

参考：
- `frontend/src/components/NotesPanel.vue:111-169`

为什么现在应保留本地：
- 它是编辑器接入层，不是普通的表单样式。
- 包含大量编辑器专属选择器和交互处理：
  - `.cm-content`
  - `.cm-cursor`
  - `.cm-selectionBackground`
  - `.cm-scroller`
- 同时它已经在合理消费当前全局 token：
  - `--border-default`
  - `--radius-md`
  - `--surface-card`
  - `--font-family-base`
  - `--border-focus`
  - `--text-primary`
  - `--text-muted`

PMO 判断：
- 将其视为 `受保护的局部语法`
- 后续清理只需要处理明显的 token 漂移或重复值，不要强行把 CodeMirror 压回共享 form primitive 层。

### Note AI Task 展开块

参考：
- `frontend/src/components/NotesPanel.vue:644-656`
- 本地样式：`frontend/src/components/NotesPanel.vue:817-836`

为什么应部分保留本地：
- 外层 reveal block 已经使用 `SectionBlock`
- 内层 task item 结构仍然承载着 note-specific 的 AI draft 体验
- 只要它继续消费当前 token，本地化的内部层级是合理的

PMO 判断：
- 外层保持对齐 `SectionBlock`
- 内部 item 样式可以渐进清 residue，但不要现在就强行拍平成通用列表样式

## 明显的 Legacy Residue

以下项目是最适合优先清理的 residue。

### 1. 页面级 Shell 重复定义

参考：
- `frontend/src/components/NotesPanel.vue:664-681`

当前样式：
- `.form-section, .notes-section`
- 本地标题样式
- 本地 section header 布局

为什么是 residue：
- 这些是写在 feature 组件内部的 page/panel shell 规则，而不是更清晰的 shell 语言
- 两个容器共用了同一套 surface 处理：
  - `border: 1px solid var(--border-default)`
  - `border-radius: var(--radius-card)`
  - `padding: var(--space-lg)`
  - `background: var(--surface-panel)`
- 这更像本地 shell 重复，而不是 Notes 专属设计资产

PMO 判断：
- 先不要立刻重写
- 标记为后续 `page/panel language` 对齐候选

### 2. 叠在 ActionRow 之上的重复按钮行布局

参考：
- 模板使用：
  - `frontend/src/components/NotesPanel.vue:517`
  - `frontend/src/components/NotesPanel.vue:607`
  - `frontend/src/components/NotesPanel.vue:615`
- 本地 CSS：
  - `frontend/src/components/NotesPanel.vue:702-709`

当前样式：
- `.form-buttons, .card-buttons { display: flex; gap: 8px; justify-content: flex-end; }`
- `.card-buttons { margin-top: 16px; }`

为什么是 residue：
- `ActionRow` 已经负责 grouped action 布局
- 本地规则部分重复了这一层语法，而不是只表达必要的局部 spacing 例外

PMO 判断：
- 很适合清理
- 可能最终只保留极少量 margin / placement 规则，或者如果共享 spacing 已经足够，就直接移除

### 3. AI Task Item 的硬编码旧样式

参考：
- `frontend/src/components/NotesPanel.vue:728-750`

当前 residue 信号：
- `background: white`
- `border-radius: 4px`
- `font-size: 12px`
- `color: #555`
- `margin-bottom: 6px`
- `gap: 10px`

为什么是 residue：
- 这些值已经偏离当前 token 化 baseline
- 其中一部分后来已经被更对齐的 override 覆盖：
  - `frontend/src/components/NotesPanel.vue:830-836`
- 也就是说同一块 surface 实际上叠了两代样式：
  - 通用 `.ai-task-item`
  - 更后期的 `.note-ai-tasks .ai-task-item`

PMO 判断：
- 高价值清理候选
- 应围绕后期 token 化规则收口，并移除早期硬编码层

### 4. 本地 Error Banner

参考：
- 模板：`frontend/src/components/NotesPanel.vue:490`
- 本地 CSS：`frontend/src/components/NotesPanel.vue:757-763`

当前样式：
- `background: #fee`
- `color: #c33`
- `border-radius: 4px`
- `margin-bottom: 20px`

为什么是 residue：
- 这是旧式独立 alert 样式，与当前共享 baseline 词汇不一致
- 同时使用了裸色值和旧 spacing 单位

PMO 判断：
- 很适合清理
- 后续要么对齐未来共享 feedback/alert pattern，要么保留本地但完成 token 化

### 5. 疑似未使用的 Class

参考：
- `frontend/src/components/NotesPanel.vue:722-725`

候选：
- `.save-success`

观察：
- 当前在 `NotesPanel.vue` 模板中没有发现匹配使用

PMO 判断：
- 高概率是 dead CSS
- 在做一次全仓 repo-wide usage 检查后，可作为低风险删除候选

### 6. 过期注释

参考：
- `frontend/src/components/NotesPanel.vue:766`
- `frontend/src/components/NotesPanel.vue:768`

例子：
- `/* .note-card uses the shared .card baseline */`
- `/* Markdown display uses global .markdown-body baseline from style.css */`

为什么是 residue：
- 第二条注释还在引用已经不存在的 `style.css`
- 这些注释大多只是重复当前 ownership，没有提供额外信息

PMO 判断：
- 低风险清理项
- 作为 hygiene cleanup 一并移除或更新

## 结构性观察

### `.note-card` 规则重复出现

参考：
- `frontend/src/components/NotesPanel.vue:688-700`
- `frontend/src/components/NotesPanel.vue:780-782`

观察：
- `.note-card` 在多个位置被定义
- 一处负责 archived state 和定位
- 后一处又追加了 `gap: var(--space-sm)`

PMO 判断：
- 不一定错误，但会增加本地样式碎片化
- 下轮 cleanup 时值得收口

### Archived Note 的视觉处理

参考：
- `frontend/src/components/NotesPanel.vue:692-700`

观察：
- `.note-card.archived` 当前设置了：
  - `opacity: 0.75`
  - `background: var(--surface-panel)`
  - `border-color: var(--border-default)`
- 由于共享 `.card` baseline 更偏向 shadow，而不是 border 驱动，`border-color` 这一条在最终渲染里可能价值较低，甚至未必真正生效

PMO 判断：
- 这块在动之前需要先做视觉核对
- 优先级低于前面那些更明确的 residue 项

## 建议的清理顺序

### Pass 1：低风险卫生清理

- 移除引用旧全局样式文件的过期注释
- 确认 `.save-success` 是否全仓未使用，若是则删除
- 复核 `.menu-item { box-shadow: none; }` 是否仍有必要
  - `frontend/src/components/NotesPanel.vue:776-778`

### Pass 2：Token / 样式 Residue 清理

- 规范化本地 error banner
- 收口重复的 `ActionRow` 布局规则
- 将 AI task item 样式统一到后期 token 化规则

### Pass 3：Panel / Shell 语言复核

- 将 `.form-section` 和 `.notes-section` 重新视为 page-shell 语言问题，而不是 feature-local styling
- 这一步应和 `ProjectsPanel` 一起做，而不是单独做，避免两边继续漂移

### 明确延后

- CodeMirror theme 重设计
- Markdown 渲染重设计
- AI task reveal 交互重设计
- Notes 大范围信息架构改造

## 建议的 PMO 定性

`NotesPanel` 现在不应再被定性为一个 legacy 很重的 surface。更准确的说法是：

- 基本已经对齐 baseline 的 shell 和 action grammar
- 外加一个受保护的 editor 子表面
- 再加一小层 scoped CSS residue

因此下一轮 Notes 清理更适合定义成：

- 一个窄范围 residue cleanup pass

而不是：

- 一个广义的重设计 sprint
