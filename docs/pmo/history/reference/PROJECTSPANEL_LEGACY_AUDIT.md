# ProjectsPanel Legacy 审计报告

- 日期：`2026-04-23`
- 范围：`frontend/src/components/ProjectsPanel.vue`
- 目标：识别 `ProjectsPanel` 中哪些部分已经对齐共享 baseline，哪些部分应被视为受保护的局部语法，哪些部分属于适合渐进清理的 legacy residue。

## 总结

`ProjectsPanel` 比 `NotesPanel` 更混合一些，但它已经不再被 pre-baseline 样式主导。外层对象外壳、动作语法、reveal 行为、分段控件、空状态、toast，以及大部分表单 / 错误处理，都已经建立在共享 primitive 之上。

剩余的 legacy 面主要集中在：

1. Projects 列表和创建表单这层 feature-local 的 page shell 样式。
2. 一套很密集的任务预览 / 当前聚焦 / 状态展示本地语法，其中一部分是实际设计资产，一部分是 residue。
3. 一批明显过期或已被后期覆盖的局部样式，尤其集中在 suggestion item、error block 和历史 focus 痕迹上。

## 已经对齐 Baseline 的部分

以下区域已经和当前 baseline 有较强对齐，不应再被视为主要 legacy 负担：

- 每个 project 的对象外壳已经使用 `Card`
  - `frontend/src/components/ProjectsPanel.vue:685`
  - 共享实现：`frontend/src/components/ui/Card.vue`
- focus 和 task-preview 强调区已经使用 `DirectiveBlock`
  - `frontend/src/components/ProjectsPanel.vue:766`
  - `frontend/src/components/ProjectsPanel.vue:777`
  - 共享实现：`frontend/src/components/ui/DirectiveBlock.vue`
- task-capture 与 AI suggestion reveal 内容已经使用 `SectionBlock`
  - `frontend/src/components/ProjectsPanel.vue:862`
  - `frontend/src/components/ProjectsPanel.vue:950`
  - 共享实现：`frontend/src/components/ui/SectionBlock.vue`
- 编辑态和归档态动作已经使用 `ActionRow`
  - `frontend/src/components/ProjectsPanel.vue:847`
  - `frontend/src/components/ProjectsPanel.vue:921`
- `ObjectActionArea` 已经承接：
  - 主 `Add Task` 入口
  - AI suggestion 入口
  - `frontend/src/components/ProjectsPanel.vue:851`
  - `frontend/src/components/ProjectsPanel.vue:926`
- `SegmentedControl` 已经承接：
  - archive view
  - preview filter
  - capture mode
  - `frontend/src/components/ProjectsPanel.vue:680`
  - `frontend/src/components/ProjectsPanel.vue:787`
  - `frontend/src/components/ProjectsPanel.vue:863`
- 表单 / 错误提示已经大量复用共享 primitive
  - `input`、`textarea`、`field-stack`、`field-helper`、invalid state
  - `frontend/src/components/ProjectsPanel.vue:726-762`
  - `frontend/src/components/ProjectsPanel.vue:872-911`
  - `frontend/src/components/ProjectsPanel.vue:968-1007`
- 共享 toast 与空状态已接入
  - `frontend/src/components/ProjectsPanel.vue:672`
  - `frontend/src/components/ProjectsPanel.vue:684`

## 应保留的局部语法

以下区域天然更适合作为本地语法保留，暂时不宜强行拍平到通用 primitive。

### Project Focus 与 Task Preview 语言

参考：
- 模板：`frontend/src/components/ProjectsPanel.vue:766-843`
- 本地样式：`frontend/src/components/ProjectsPanel.vue:1041-1391`
- 后期 token 化修正层：`frontend/src/components/ProjectsPanel.vue:1556-1614`

为什么现在应保留本地：
- 它承载了 project-specific 语义：
  - current focus
  - task preview filter
  - archived preview grouping
  - focus badge
  - click-to-focus task rows
- 预览语法交互性较强，并且和 project workflow 紧密耦合
- 同时它已经消费了相当一部分当前 token 体系

PMO 判断：
- 视为 `受保护的局部语法`
- 清 residue 时应只清内部过时层，不要试图把它整体压回 generic list/card primitive

### Task Capture Reveal

参考：
- 模板：`frontend/src/components/ProjectsPanel.vue:851-918`
- 样式：`frontend/src/components/ProjectsPanel.vue:1419-1458`

为什么现在应保留本地：
- 它是构建在 `ObjectActionArea` 和 `SectionBlock` 上的 workflow-specific 入口 surface
- single / batch capture 有明确的局部行为、校验和布局预期
- 当前大部分样式已经相对贴近 baseline

PMO 判断：
- 保留本地
- 只清明显重复或死掉的局部样式

### AI Suggestion Reveal

参考：
- 模板：`frontend/src/components/ProjectsPanel.vue:950-960`
- 样式：`frontend/src/components/ProjectsPanel.vue:1196-1228`
- 后期 token 化修正层：`frontend/src/components/ProjectsPanel.vue:1591-1614`

为什么应部分保留本地：
- 外层 reveal surface 已经挂在 `SectionBlock` 上
- suggestion item 层级仍然承载 project-specific 的 AI 语义
- 和 Notes 一样，这里是一块值得保留的局部内容模式

PMO 判断：
- 保留 feature-local suggestion grammar
- 只清早期硬编码样式层

## 明显的 Legacy Residue

以下项是最适合优先推进的 residue 清理对象。

### 1. 页面级 Shell 重复定义

参考：
- `frontend/src/components/ProjectsPanel.vue:1010-1027`

当前样式：
- `.projects-section, .project-form`
- 本地 heading 规则
- 本地 section header 布局

为什么是 residue：
- 这些是写在 feature 内部的 page/panel shell 规则，而不是更清晰的 shell 语言
- 它们和 `NotesPanel` 里的本地 shell 重复问题高度相似

PMO 判断：
- 是后续 `panel/shell language` 对齐的强候选
- 但不应单独重写，应和 `NotesPanel` 一起收口

### 2. Suggestion Item 的旧硬编码层

参考：
- `frontend/src/components/ProjectsPanel.vue:1206-1228`
- 后期 override：`frontend/src/components/ProjectsPanel.vue:1604-1614`

当前 residue 信号：
- `background: white`
- `border-radius: 4px`
- `font-size: 12px`
- `color: #555`
- `margin-bottom: 8px`
- `gap: 10px`

为什么是 residue：
- 同一块 suggestion item 实际上叠了两代样式
- 后期的 project-scoped override 已经更贴近 token 化 baseline
- 早期这一层基本就是 baseline 成形前留下的实现残留

PMO 判断：
- 高价值 cleanup 候选
- 应围绕后期 token 化块收口

### 3. 本地 Error Banner

参考：
- 模板：`frontend/src/components/ProjectsPanel.vue:675`
- CSS：`frontend/src/components/ProjectsPanel.vue:1236-1242`

当前样式：
- `background: #fee`
- `color: #c33`
- `border-radius: 4px`
- `margin-bottom: 20px`

为什么是 residue：
- 这是旧式独立 alert block
- 颜色和 spacing 都是裸值，不符合新 baseline 词汇

PMO 判断：
- 很适合清理
- 后续要么对齐共享 feedback pattern，要么保留本地但完成 token 化

### 4. 死 CSS 或高概率死 CSS

候选参考：
- `.save-success`：`frontend/src/components/ProjectsPanel.vue:1200-1203`
- `.manual-task-success`：`frontend/src/components/ProjectsPanel.vue:1412-1415`
- `.batch-task-success`：`frontend/src/components/ProjectsPanel.vue:1463-1466`
- `.focus-history` / `.focus-history.compact` / `.history-label` / `.history-trail`
  - `frontend/src/components/ProjectsPanel.vue:1247-1271`
- `.save-focus-btn`：`frontend/src/components/ProjectsPanel.vue:1092-1095`
- `.set-focus-btn`：`frontend/src/components/ProjectsPanel.vue:1392-1397`

观察：
- 这些选择器在 scoped CSS 中还存在，但在当前模板里没有找到对应挂载点

PMO 判断：
- 非常适合做低风险清理
- 在做一次全仓 usage 检查后可直接进入删除候选

### 5. 重复 / 碎片化的本地布局层

参考：
- `.project-card`：
  - `frontend/src/components/ProjectsPanel.vue:1031-1033`
  - `frontend/src/components/ProjectsPanel.vue:1548-1550`
- `.status-badge`：
  - `frontend/src/components/ProjectsPanel.vue:1106-1111`
  - `frontend/src/components/ProjectsPanel.vue:1120-1128`

为什么是 residue：
- 同一 local class 上叠了多层定义
- 后面的规则明显更像 token 化后的 canonical 版本，但前面的旧层还留着

PMO 判断：
- 适合做 consolidation
- 优先级中等，排在明显 dead CSS 之后

### 6. 状态 / 预览语言中的裸色值与旧单位

参考例子：
- `.status-active`
  - `frontend/src/components/ProjectsPanel.vue:1131-1134`
- `.preview-task-section-archived`
  - `frontend/src/components/ProjectsPanel.vue:1318-1322`

当前 residue 信号：
- `rgba(218, 165, 32, 0.12)`
- `#8e6514`
- `#d8dee6`

为什么是 residue：
- 这些值不一定视觉上有问题
- 但它们还没有被提炼成清晰稳定的 token 层
- 目前处于“真实局部语法”和“实现残留”之间

PMO 判断：
- 低优先级 residue
- 除非后续要统一更大的 status/color 语言，否则先不必动

## 结构性观察

### ProjectsPanel 的“后期 token 化修正层”比 Notes 更明显

参考：
- `frontend/src/components/ProjectsPanel.vue:1556-1614`

观察：
- 多个较早的本地块已经被后面的 token 化 / project-scoped 修正层部分覆盖：
  - `.project-focus-directive`
  - `.project-tasks-directive`
  - `.project-ai-suggestions`
  - `.pin-icon-btn`

PMO 判断：
- 这说明最合适的 cleanup 方式是 consolidation，而不是 redesign

### Archived Project 的视觉处理是真实产品语法，不是纯 residue

参考：
- `frontend/src/components/ProjectsPanel.vue:1035-1044`

观察：
- Archived project 有明确的视觉处理：
  - opacity 降低
  - 更 panel-like 的背景
  - focus section gradient 改变
  - focus value 弱化

PMO 判断：
- 这部分应视为有意设计的局部行为
- 除非未来全局 revisiting archive 语言，否则不建议轻易动

### Preview Grammar 是真实资产，但其内部仍有漂移

参考：
- `frontend/src/components/ProjectsPanel.vue:1279-1524`

观察：
- task preview row、focus badge、archived grouping、expanded/mobile 规则已经形成一套成型语法
- 问题不在于它该消失
- 问题在于它内部的一些值和旧辅助选择器仍然偏散

PMO 判断：
- 保留 preview grammar
- 清它周围的 residue，而不是试图把它整体抹平

## 建议的清理顺序

### Pass 1：低风险卫生清理

- 确认并删除 dead selector：
  - `.save-success`
  - `.manual-task-success`
  - `.batch-task-success`
  - `.focus-history*`
  - `.history-*`
  - `.save-focus-btn`
  - `.set-focus-btn`
- 移除那些只是在重复说明全局 ownership、但没有额外价值的旧注释

### Pass 2：Residue Consolidation

- 收口重复的 `.status-badge` 和 `.project-card` 样式层
- 将 AI suggestion item 样式收口到后期 token 化块
- 复核 `.menu-item { box-shadow: none; }` 是否仍有必要
  - `frontend/src/components/ProjectsPanel.vue:1475-1477`

### Pass 3：Feedback 与 Shell Cleanup

- 规范化本地 error banner
- 将 `.projects-section` / `.project-form` 和 Notes 那边的本地 shell 一起纳入后续 `panel/shell language` 话题

### 明确延后

- Project preview grammar 重构
- Focus 选择逻辑重构
- 将 task capture 拍平到 generic form primitive
- 更大范围的 status-system redesign

## 建议的 PMO 定性

`ProjectsPanel` 更适合被描述为：

- 已经对齐 baseline 的对象 / 动作外壳
- 外加一套比较重的受保护 workflow grammar
- 再加一层来自旧样式叠代的中等强度 residue

这意味着下一轮 cleanup 更适合聚焦于：

- dead CSS 删除
- 重复样式层 consolidation
- 明显 suggestion/error residue 的 token 化

而不应被定义为一次完整视觉重设计。
