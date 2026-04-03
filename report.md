# Project 模块现状审计报告

生成时间：2026-04-02
审计范围：Project 数据结构、ProjectsPanel 操作、AI Next Step 实现、Project 与 Task 关系

---

## 1. Project 数据结构现状

**字段清单（全部持久化到 MongoDB）：**

| 字段 | 类型 | 必填 | 默认值 | UI 可编辑 | UI 使用情况 |
|------|------|------|--------|-----------|-------------|
| name | String | ✓ | - | ✓ | 列表卡片标题、编辑表单 |
| summary | String | ✓ | - | ✓ | 列表卡片正文、编辑表单 |
| status | String | - | 'pending' | ✓ | 列表卡片显示、编辑表单下拉选择 |
| nextAction | String | - | '' | ✓ | 列表卡片 "Next:" 显示、编辑表单输入框 |

**timestamps（自动生成）：** createdAt, updatedAt

**重点说明：**
- **name**：项目名称，必填，UI 核心显示
- **summary**：项目描述，必填，承载项目核心信息，AI prompt 上下文
- **nextAction**：用户手动输入的文本字段，非自动生成，作为 AI prompt 的"当前下一步"输入
- **status**：枚举值 ['pending', 'in_progress', 'completed', 'on_hold']，手动切换

---

## 2. ProjectsPanel 当前用户可执行的操作

| 操作 | 类型 | 触发位置 | 持久化 |
|------|------|----------|--------|
| **创建 project** | 持久化行为 | New Project 表单 → "Add Project" | POST /projects |
| **编辑 project** | 持久化行为 | Edit 模式 → "Save" | PUT /projects/:id |
| **删除 project** | 持久化行为 | Delete 按钮（带 confirm） | DELETE /projects/:id |
| **切换 status** | 持久化行为 | 编辑模式 dropdown | PUT /projects/:id |
| **AI Next Step** | AI 生成行为 | "AI Next Step" 按钮 | 无（仅前端临时存储） |
| **保存 suggestion 为 task** | 持久化行为 | "Save as Task" | POST /tasks |

**补充说明：**
- startEditingProject / cancelEditProject：仅局部前端行为
- aiSuggestions、savedSuggestions、saveSuccessMessages：前端临时状态，刷新页面即丢失

---

## 3. AI Next Step 的真实实现现状

**调用函数：** `suggestNextAction(project)` (aiService.js:78)

**输入字段：**
```javascript
{
  name: project?.name,
  summary: project?.summary,
  status: project?.status,
  nextAction: project?.nextAction
}
```

**生成结果返回到：**
```javascript
aiSuggestions.value[project._id] = result.suggestions || []
// 前端 ref，仅当前会话有效，无持久化
```

**结果类型：** `{ suggestions: [string] }` - 1-2 条建议文本

**是否写回 project：** 否，不写回，仅临时显示

**Suggestion 保存为 Task 后的关联：**
- 保存调用 `saveTask(suggestion, 'project')` (ProjectsPanel.vue:107)
- Task 仅携带 `{ title, source: 'project' }`
- **没有任何 projectId 关联字段**，无法追溯到原 project
- **Task 与原 Project 无任何直接联系**

---

## 4. nextAction 字段的真实产品语义

**当前语义：** **"历史遗留输入项"** → 用户手动填写/编辑的文本框

**判断依据：**
- 创建/编辑 project 时，`nextAction` 作为普通输入框存在
- AI Next Step 读取 `nextAction` 作为 prompt 的"当前下一步"输入（aiService.js:101）
- **AI 生成的 suggestions 不会自动写回 nextAction**
- 用户完成 task 后，系统不会自动更新 `nextAction`

**产品定位错位：**
- 概念上 `nextAction` 应该是"当前推进步骤"
- 实际实现是"用户手动维护的文本字段"
- AI 和用户操作都无法自动更新此字段

**结论：** `nextAction` 现在更像"项目描述字段"而非真正的"推进状态"，是一个需要用户手动同步的孤立字段。

---

## 5. Project 与 Task 的当前关系

**Task 持久化时的 metadata：**
```javascript
// taskService.js:20-42
body: JSON.stringify({ title, source })
// 只有 title 和 source='project'
```

**Task 模型字段：**
```javascript
{
  title: String,
  source: String,  // 'project' / 'dashboard' / 'note'
  status: String,
  completed: Boolean,
  timestamps
}
```

**关联关系：**
- ✅ 只有 `source='project'` 标识来源
- ❌ **不存在 `sourceProjectId` / `projectId` / 其他直接关联**
- ❌ **无法从 Task 追溯到生成它的 Project**

**Task 完成后回流：**
- **无任何回流机制**
- Task 完成后，原 Project 的 `nextAction`、`status` 均不会自动更新
- Project 面板无法显示关联 Task 的完成情况

---

## 6. 当前 Project 模块最大的流程断点

**断点位置：** 用户点击 "Save as Task" 后

**为什么断掉：**

1. **AI Suggestion → Task 保存后断链**
   - Suggestion 保存为 Task 后，与原 Project 失去联系
   - Task 独立存在，Project 无法感知 Task 的完成状态

2. **Task 完成后无法推进 Project**
   - 用户完成 Task（在 TasksPanel 或其他地方）
   - Project 面板无任何机制感知 Task 完成
   - `nextAction` 字段仍停留在旧内容，不会自动更新
   - `status` 不会从 'in_progress' 自动推进

3. **缺乏再次触发 AI Next Step 的自然入口**
   - 完成一个 task 后，用户需要手动回到 ProjectsPanel
   - 再次点击 "AI Next Step" 获取新建议
   - 新建议与已完成的 task 之间无关联认知

**来自产品设计层面的限制：**
- Task 模型没有 `projectId` 字段，不支持关联追踪
- `nextAction` 设计为手动输入，而非系统自动同步的状态字段

**来自实现层面的限制：**
- `suggestNextAction` 结果仅前端临时存储，刷新页面丢失
- `saveSuggestionAsTask` 不建立 Project ↔ Task 关联
- 无 Task 完成事件的回调机制来触发 Project 更新

**用户实际体验：**
1. 创建 project → AI Next Step → Save as Task ✓
2. 在 TasksPanel 完成 task ✓
3. **回到 ProjectsPanel → project 状态没变 → nextAction 仍是旧值 → AI Next Step 再次生成通用建议** ✗

这是"完成一步后断掉"的根本原因：Project 与 Task 之间没有数据流闭环。
