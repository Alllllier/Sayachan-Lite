# Frontend Shell / Module Structure Audit

> 审计时间：2026-04-25  
> PMO 来源：`docs/pmo/state/discussions/discussion_batch_011.md`  
> 审计目标：先做结构对照，不启动实现。判断 `Notes / Projects / Dashboard` 的主要区域能否被现有 shell/module 结构语言解释；不能解释的部分，是局部特殊 case、cleanup-only，还是需要扩充结构层基线。

## 结论摘要

当前 11 的任务 2 可以成立为一个独立审计主题：现有结构基线已经能解释 `Notes` 和 `Projects` 的大部分主体结构，但还不能完整解释 `Dashboard` 的页面级模块组织。

本次审计的核心判断是：

- `List` 已经是正式可用的结构基线，不是临时样式参考。
- `ObjectCollection` 应该被看作语义角色；它可以落成 `Card collection`，也可以落成 `List`。
- `Notes` 目前更像 `Panel -> ObjectCollection<Card>`，creation form 暂时是未来 creation-flow 重做前的本地入口。
- `Projects` 目前更像 `Panel -> ObjectCollection<Card>`，其中 project card 是复合 card，内部已经包含 `DirectiveBlock + List` 和 `ObjectActionArea + SectionBlock`。
- `Dashboard` 的 saved tasks 已经能用 `Card + List` 解释；但 quick add、recent notes/projects、AI workflow 还更像 loose modules，需要 `Panel / Module` 层语言才能干净对照。

因此，下一步不宜直接做大范围 legacy cleanup。更稳的下一步是先围绕 `Notes / Projects` 定义一个很薄的 `Panel / ObjectCollection` 结构层，至少覆盖页面容器、面板标题区、对象集合容器、对象集合标题区、对象集合主体区的语义边界。

当前优先级补充：

- `Notes` 和 `Projects` 是第一轮结构重构目标，也是验证 `Panel / Module` 语言是否成立的主样本。
- `Dashboard` 暂时不作为第一轮重构目标。等 Notes/Projects 重构完成后，再检查 Dashboard 是否能自然放进新结构。
- 如果 Dashboard 仍然不能干净适配，不建议投入过多精力强行改造，尤其是当前 Dashboard AI workflow 未来可能被 AI core/product-runtime 工作重写。
- Notes/Projects 的 creation form 不作为第一轮主要结构目标。它已经落在 `Creation And List-Surface Interaction Consistency` backlog 方向里，且未来倾向重做成 hover icon 触发的 creation flow；当前 `New Note` / `New Project` 外壳可以暂时保留为本地 legacy。

## Implementation Note

2026-04-25 first cut:

- Added `frontend/src/components/ui/shell/Panel.vue`.
- Added `frontend/src/components/ui/shell/CardCollection.vue`.
- Rewired `frontend/src/views/NotesPage.vue` onto `Panel`.
- Rewired the Notes object-list region in `frontend/src/components/NotesPanel.vue` onto `CardCollection`.
- Left `New Note`, note card internals, and parked AI task draft items unchanged.
- Validation passed with frontend `npm run test` and `npm run build`; the build still reports the existing Vite large-chunk warning.

## 审计词表

### 语义角色

- `Panel`：一个主功能表面，例如 Notes、Projects、Dashboard。
- `PanelHeader`：面板级标题、主要视图切换、面板级入口。
- `ObjectCollection`：对象集合区域，例如 notes、projects、saved tasks。它描述内容关系，不直接决定视觉结构。
- `Module`：一个独立工作单元。它不是单个对象卡片，也不是对象内部 section，而是页面/面板内部的一块功能区域。本轮暂不优先用它处理 Notes/Projects creation form。
- `ModuleHeader`：模块标题、局部 view/filter 控制、模块级操作入口。
- `ModuleBody`：模块主体内容。

### 已有结构基线

- `Card`：单个对象或页面模块的 quiet outer shell。
- `SectionBlock`：card/module 内部的嵌套内容区。
- `DirectiveBlock`：当前关注、推荐、工作引导、当前执行区域。
- `ObjectActionArea`：对象上的主要进入动作，包含 idle/active/pending 和 attached reveal。
- `ActionRow`：普通成组动作。
- `List / ListSection / ListItem / ItemContent / ItemMeta`：轻量 display-list 基线，已在 Projects task preview 和 Dashboard saved tasks 中验证。
- `SegmentedControl`：页面级、模式级、inline filter 的共享控制基线。
- `EmptyState`：空状态基线。

## 对照矩阵

| Surface | Region | Semantic Role | Current Structural Baseline | Fit | Gap Type | PMO Judgment |
| --- | --- | --- | --- | --- | --- | --- |
| Notes | page wrapper/title | `Panel` / `PanelHeader` | local `.page` / `.page-title` | weak | new-structure-needed | 三个 page view 重复本地 page shell，适合定义薄 `Panel` 基线。 |
| Notes | New/Edit Note form | future creation entry | local `.form-section` + input baseline + `ActionRow` | medium | out-of-scope-now | 表单内部 controls 已稳定，但 creation entry 未来倾向 hover icon 触发，本轮不强行 module 化。 |
| Notes | Notes section header + archive switch | `ObjectCollection` header | local `.section-header` + `SegmentedControl(page)` | medium | baseline-extension | 可解释为 collection header，但缺共享 `ModuleHeader` / `CollectionHeader`。 |
| Notes | note cards | `ObjectCollection<Card>` | `Card` + card slots | strong | none | 这是当前最干净的 `Card` reference。 |
| Notes | note edit mode | object edit state | `Card.Body` local edit form + input baseline + `ActionRow` | medium | cleanup-only | 大体可用现有基线解释，主要是局部整理，不需要新结构。 |
| Notes | note AI action entry | object AI action | `ObjectActionArea(ai)` + trailing menu | strong | none | 已能用 controls/action 基线解释。 |
| Notes | AI task drafts | AI reveal content | `SectionBlock` + local `ai-task-item` | weak by design | local-special-case / parked | 已由 discussion 12 决定停车，等 AI core ownership 更清楚。 |
| Projects | page wrapper/title | `Panel` / `PanelHeader` | local `.page` / `.page-title` | weak | new-structure-needed | 与 Notes/Dashboard 重复，适合纳入 `Panel` 基线。 |
| Projects | Projects section header + archive switch | `ObjectCollection` header | local `.section-header` + `SegmentedControl(page)` | medium | baseline-extension | 与 Notes 同类，适合共享 header/module 语言。 |
| Projects | project cards | `ObjectCollection<Card>` | `Card` + composite body | strong-ish | none | 外壳是 `Card`，但内部是复合结构，不应强行变简单 card。 |
| Projects | project focus block | current/focus cue | `DirectiveBlock` | strong | none | 可被现有 `DirectiveBlock` 解释。 |
| Projects | task preview | nested task collection | `DirectiveBlock + List + ListSection + ListItem` | strong | none | 这是 `Section/Directive + List` 的验证样本。 |
| Projects | task capture | object action reveal | `ObjectActionArea(primary) + SectionBlock + SegmentedControl(mode)` | strong | none | 已能解释，是当前 object action grammar 的好样本。 |
| Projects | archived project actions | object secondary actions | `ActionRow` | strong | none | 不需要新结构。 |
| Projects | project AI suggestions | object AI action/reveal | `ObjectActionArea(ai) + SectionBlock + local ai-suggestion-item` | weak by design | local-special-case / parked | 与 Notes AI tasks 同类，等 AI core 后再重开。 |
| Projects | New Project form | future creation entry | local `.project-form` + input baseline + `ActionRow` | medium | out-of-scope-now | 表单 controls 已稳定，但 creation entry 未来倾向 hover icon 触发，本轮不强行 module 化。 |
| Dashboard | page wrapper/title | `Panel` / `PanelHeader` | local `.page` / `.page-title` | weak | new-structure-needed | 与 Notes/Projects 同类。 |
| Dashboard | dashboard outer container | `PanelBody` or dashboard module group | local `.dashboard` | weak | new-structure-needed | 这是当前最高层 shell 缺口之一。 |
| Dashboard | quick add | lightweight creation module | local `.quick-add-section` + input | medium | baseline-extension | input 可复用，但 quick add 的 module placement 还没有结构名。 |
| Dashboard | saved tasks | task object collection | `.card` wrapper + `List / ListSection / ListItem / ItemContent / ItemMeta` | strong | none | 已完成 12 pass-2，是 list 基线的第二锚点。 |
| Dashboard | recent notes/projects | compact object preview modules | `.card` + local `.mini-item` | medium | cleanup-only / baseline-extension | 可先视为 `Card module + compact List` 候选；若要统一，可用 `List` 吸收 mini-item。 |
| Dashboard | AI workflow container | workflow module | local `.ai-workflow` | weak | new-structure-needed | 未来 AI core 可能重写，不建议马上细抛光，但需要承认它是 module grammar 缺口。 |
| Dashboard | workflow steps | module steps / directive sequence | local `.workflow-step` | weak | new-structure-needed | 可能是 `WorkflowModule` / `ModuleStep`，但现在不宜过早抽象。 |
| Dashboard | action plan / task drafts | generated list-like outputs | local `.action-plan` / `.task-drafts` / `.draft-item` | weak by design | parked | 与 AI core 未来改造强相关，先不作为 display-list cleanup 推进。 |

## Surface 观察

### Notes

`NotesPanel.vue` 已经高度贴近现有 baseline。`note-card` 使用 `Card`，标题、meta、body、actions 都自然落在 `Card` slots 中。编辑态使用共享 input invalid state 和 `ActionRow`，AI 入口使用 `ObjectActionArea(ai)`。

主要缺口不在单个 card，而在 card 外层：`notes-section`、`section-header` 仍是本地 panel/object-collection shell。`form-section` 暂时保留为 creation-flow 重做前的本地入口，不作为本轮结构基线主样本。

`ai-task-item` 虽然看起来可被 `ListItem` 吸收，但根据 12 的结论，它更应该停车到未来 AI core/product-runtime convergence，而不是作为 11 的近期开工点。

### Projects

`ProjectsPanel.vue` 体现了目前最复杂但也最有价值的复合结构：

- outer project 是 `Card`。
- current focus 是 `DirectiveBlock`。
- task preview 是 `DirectiveBlock + List`。
- task capture 是 `ObjectActionArea + SectionBlock`。
- archived actions 是 `ActionRow`。
- archive view switch 和 task preview filter 都已经使用 `SegmentedControl`。

这说明 existing baseline 对 Projects 的解释力已经很强。剩余缺口主要还是外层 collection/module header，以及 `project-card` 内部各 block 的命名边界是否要写入更高层结构规则。

不建议把 project card 强行简化成普通 card。它应该继续被定义为 composite card：外壳是 `Card`，内部可以容纳 `DirectiveBlock`、`SectionBlock`、`List`、`ObjectActionArea`。

### Dashboard

`Dashboard.vue` 是任务 2 最值得审计的 surface，因为它混合了：

- quick add
- saved tasks
- recent notes
- recent projects
- AI workflow
- generated review/focus/action/draft outputs

其中 saved tasks 已经稳定落入 `Card + List`。这部分不需要重开结构讨论。

Dashboard 的问题是其它模块仍大量使用 local card/module/list-like grammar：`.dashboard`、`.quick-add-section`、`.mini-item`、`.ai-workflow`、`.workflow-step`、`.action-plan`、`.task-drafts`。这些不是同一种问题：

- `mini-item` 很可能可以被现有 `List` 基线吸收。
- quick add 更像一个 `Module` 或 `PanelActionModule`。
- AI workflow 更像未来 AI core 会接管的 `WorkflowModule`，现在不应该作为视觉 cleanup 的主要目标。
- `.dashboard` 本身暴露了 `PanelBody` / `ModuleStack` 缺口。

## 结构缺口分级

### Level 1: 可以直接用已有 baseline 解释

- Notes note cards -> `Card`
- Projects project cards -> `Card` composite
- Projects focus/task preview -> `DirectiveBlock + List`
- Projects task capture -> `ObjectActionArea + SectionBlock`
- Dashboard saved tasks -> `Card + List`
- archive/page/filter controls -> `SegmentedControl`
- object edit/archive/save controls -> `ActionRow`

这些区域可以进入后续 cleanup，但不需要新的结构层概念。

### Level 2: 需要薄结构扩充

这些区域不是复杂到需要新产品概念，但已经重复出现：

- `.page` / `.page-title`
- `.notes-section`
- `.projects-section`
- `.section-header`
- Dashboard 的 `.dashboard`

建议扩充一个很薄的 shell/module baseline：

- `Panel`
- `PanelHeader`
- `PanelBody`
- `Module`
- `ModuleHeader`
- `ModuleBody`
- 可选：`CollectionHeader`

注意：这不等于马上做大型 layout refactor。它只是让 Notes/Projects/Dashboard 的大块结构可以被同一套词表解释。

### Level 3: 先停车，不作为 11 近期开工点

- Notes `ai-task-item`
- Projects `ai-suggestion-item`
- Dashboard AI workflow generated outputs
- Dashboard workflow step grammar

理由：这些区域和未来 AI core ownership 高度相关。现在可以记录结构弱点，但不应优先把它们纳入 display-list 或 module baseline cleanup，否则可能优化到即将被替换的 interim UI。

## 建议的下一步 PMO 走法

### 推荐路径：Notes / Projects Panel / ObjectCollection Baseline First Pass

先围绕 Notes / Projects 写一个很薄的结构定义，再让 cleanup 使用它。Dashboard 只作为后验适配检查，不进入第一轮主范围。Creation form 暂时不作为第一轮主目标，因为它更适合跟后续 hover-icon creation flow 一起重做。

目标：

- 明确 `Panel`、`PanelHeader`、`PanelBody`、`ObjectCollection`、`ObjectCollectionHeader`、`ObjectCollectionBody` 的第一版边界。
- 明确 `ObjectCollection` 与 `Card collection` / `List` 的关系。
- 将 Notes / Projects 的 page shell、collection header、object collection 先对齐到新结构。
- 保留 `New Note` / `New Project` 当前外壳为局部 legacy，不在本轮强行 module 化。
- 保持 Dashboard 不动，最多记录后续是否可自然适配。

完成标准：

- Notes / Projects 的 page shell 与 object collection 区域都能被结构词表解释。
- Creation entry 的后续重做边界被明确排除在本轮之外。
- Dashboard 的已知不适配点被记录为后验检查项，而不是第一轮实现范围。
- 不改 AI workflow 内部语义。
- 不新增复杂视觉系统。
- 不把 `Module` 做成大而全抽象，只解决当前重复 shell/section/header 问题。

### 次选路径：Legacy Surface Cleanup First Pass

如果想马上进入执行，可以做一个窄 cleanup：

- 统一 `.page` / `.page-title`。
- 统一 Notes/Projects 的 collection header。
- 把 Dashboard recent notes/projects 的 `.mini-item` 评估迁入 `List`。

风险：

- 如果没有先定义 `Module`，cleanup 过程中仍会反复问“这块到底是 card、section、module 还是 panel body”。

## PMO 判断

当前最稳判断是：11 的下一步应该先不是“把所有 legacy cleanup 掉”，而是先用 Notes / Projects 形成一个小的 `Panel / ObjectCollection` baseline。已有 component/list 基线已经足够解释很多局部结构；creation entry 另有未来交互重做方向；Dashboard 可以等这个语言成形后再判断是否值得接入。

简短地说：

`Card / SectionBlock / DirectiveBlock / ObjectActionArea / ActionRow / List` 已经回答了“块里面是什么”。  
`Panel / ObjectCollection` 还需要回答“这些对象集合在页面里是什么关系”。
