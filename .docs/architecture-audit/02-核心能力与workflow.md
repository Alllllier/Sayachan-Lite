# Sayachan Lite - 核心能力与 Workflow

> 项目架构审计文档 | 最后更新: 2026-04-16

---

## 1. 产品定位

Sayachan Lite 是 **Sayachan 的轻量级版本**，一款极简个人生产力工具，帮助用户通过清晰的工作流管理 Notes、Projects 和 Tasks。

**核心设计理念**：
- 不追求功能全，只抓核心工作流的有效落地
- 聚焦"聚焦-执行-回顾"闭环
- AI 辅助是增强而非必需（所有 AI 功能都有 fallback）

---

## 2. 核心能力矩阵

| 能力 | 状态 | 说明 |
|------|------|------|
| **Notes** | ✅ 已实现 | 笔记记录与 CRUD，支持置顶/归档 |
| **Projects** | ✅ 已实现 | 项目管理，含状态、聚焦点、推进轨迹 |
| **Tasks** | ✅ 已实现 | 任务执行与管理，支持来源追踪 |
| **Dashboard** | ✅ 已实现 | 周回顾、聚焦推荐、Action Plan、Task 生成 |
| **AI 辅助** | ✅ 已实现 | 基于 GLM 的智能建议（可选，有 fallback） |

---

## 3. 核心 Workflow

### 3.1 主工作流

```
Focus → Task → Completion → Memory → Next Focus
```

| 阶段 | 动作 | 系统行为 |
|------|------|----------|
| **1. Focus** | Dashboard 推荐聚焦方向，从 Projects 设定当前聚焦点（Task-based Focus） | AI 基于项目上下文推荐；用户通过 Task 确认焦点 |
| **2. Task** | 从 Notes 或 Dashboard AI 生成可执行任务 | 任务自动关联来源（Note/Project/Dashboard） |
| **3. Completion** | 完成任务 | 自动触发 Focus 清理：Project 的 currentFocusTaskId 被清空 |
| **4. Memory** | Notes 和 Tasks 记录推进轨迹与关键信息 | 已完成的 Task 本身即历史；Note 记录思考 |
| **5. Next Focus** | AI 基于项目上下文推荐下一聚焦方向 | Dashboard 展示推荐，循环回到第 1 步 |

### 3.2 Workflow 可视化

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           DASHBOARD                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌─────────────┐  │
│  │ Weekly Review│  │Focus Recommend│  │ Action Plan  │  │ Task Drafts │  │
│  └──────────────┘  └──────────────┘  └──────────────┘  └─────────────┘  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          FOCUS 设定                                     │
│         Projects.currentFocusTaskId ← 当前聚焦 Task ID                  │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          TASK 生成                                      │
│   ┌──────────┐      ┌──────────┐      ┌──────────┐                     │
│   │   Note   │      │ Project  │      │ Dashboard│                     │
│   │  AI Tasks│      │Next Action│      │Task Drafts│                    │
│   └────┬─────┘      └────┬─────┘      └────┬─────┘                     │
│        └─────────────────┴─────────────────┘                            │
│                          │                                              │
│                    Tasks Collection                                     │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       TASK 完成 (触发 Focus 清理)                        │
│                                                                         │
│   Task.completed = true                                                 │
│        │                                                                │
│        ▼                                                                │
│   ┌─────────────────────────────────────────────────────────┐          │
│   │  IF task.originModule ∈ ['project', 'project_focus',    │          │
│   │                         'project_suggestion']           │          │
│   │     AND task._id == Project.currentFocusTaskId          │          │
│   │                                                         │          │
│   │     Project.currentFocusTaskId = null                   │          │
│   │     // 清空当前聚焦，等待新的 Task 关联                  │          │
│   │                                                         │          │
│   │  END IF                                                 │          │
│   └─────────────────────────────────────────────────────────┘          │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                          MEMORY 记录                                    │
│   - Notes: 保存思考、灵感、上下文                                       │
│   - Tasks: 已完成的任务即推进轨迹，通过 linkedProjectId 关联            │
│   - Projects: 仅保留当前聚焦 Task 引用（currentFocusTaskId）            │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                       NEXT FOCUS (循环)                                 │
│   Dashboard AI 基于项目上下文生成新的推荐 → 回到 FOCUS 设定             │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 4. 模块详解

### 4.1 Notes 模块

**功能**：
- 创建/编辑/删除笔记
- 置顶功能（影响排序）
- 归档功能（级联归档关联 Tasks）
- AI 生成任务（基于笔记内容）

**数据流**：
```
Note 创建 → 用户编辑内容 → AI 分析生成 Tasks → Tasks 关联到 Note
```

**排序优先级**：
1. `isPinned: true` 优先
2. `pinnedAt` 最近的优先
3. `updatedAt` 最近的优先

### 4.2 Projects 模块

**功能**：
- 创建/编辑/删除项目
- 状态管理：`pending` | `in_progress` | `completed` | `on_hold` | `archived`
- 聚焦点管理：`currentFocusTaskId`（关联到具体 Task，canonical）
- 置顶功能
- AI 下一步建议

**Focus 清理机制**：
```javascript
// 当项目关联的 Task 被完成/归档/删除时触发
if (task.originModule ∈ ['project', 'project_focus', 'project_suggestion']
    && project.currentFocusTaskId === task._id) {
  project.currentFocusTaskId = null;  // 清空当前聚焦，等待新的 Task 关联
}
```

**排序优先级**：同 Notes

### 4.3 Tasks 模块

**功能**：
- 创建/完成/删除任务
- 来源追踪（语义化字段）
- 项目关联
- 归档视图切换

**来源追踪设计**：
```javascript
// 语义化字段（新）
{
  creationMode: 'ai' | 'manual',     // 创建方式
  originModule: 'note' | 'project' | 'project_focus' | 'project_suggestion' | 'dashboard',
  originId: ObjectId | String,       // 来源实体ID
  originLabel: String,               // 来源显示标签
  linkedProjectId: ObjectId,         // 关联项目ID（如适用）
  linkedProjectName: String          // 关联项目名称
}
```

**触发 Focus 清理的条件**：
- `originModule` 为 `'project'`, `'project_focus'`, 或 `'project_suggestion'`
- Task 从未完成变为完成状态（或被归档/删除）
- 该 Task 的 `_id` 恰好是项目的 `currentFocusTaskId`

### 4.4 Dashboard 模块

**四大功能区块**：

| 区块 | 功能 | AI 调用 |
|------|------|---------|
| **Weekly Review** | 基于近期 Notes/Projects 生成周回顾 | `generateWeeklyReview()` |
| **Focus Recommendation** | 推荐当前最值得聚焦的方向 | `recommendFocus()` |
| **Action Plan** | 生成 3 条可执行行动计划 | `generateActionPlan()` |
| **Task Drafts** | 基于 Action Plan 生成具体任务草稿 | `generateTaskDrafts()` |

**使用流程**：
```
Dashboard 加载 → 并行调用 4 个 AI 接口 → 展示结果 → 用户操作
```

### 4.5 Chat Runtime 模块

**功能**：
- 全局浮动聊天入口，不依赖当前路由
- 三套人格基线切换（温暖 / 干练 / 腹黑 Haraguro）
- 按需拉取 Dashboard snapshot，避免上下文缺失
- Trait Controls：Warmth slider（0-10）+ Convergence segmented control（explore / guided / decisive）
- Shared Core + Delta Matrix 人格 prompt 架构 + Haraguro Safety Harness

**Dashboard Context 解耦设计**：
```
Dashboard 路由挂载时
    │
    ▼
watchEffect ──实时同步──> cockpitSignals（热更新）
    │
    │ 非 Dashboard 路由或首刷未就绪时
    ▼
ChatEntry.handleSend()
    │
    ├─ hasHydrated === true ──> 直接使用 store 缓存
    │
    └─ hasHydrated === false ──> refreshDashboardContext() 按需聚合 ──> 回填 store
```

**Runtime Controls 状态**：
```javascript
// stores/runtimeControls.js
{
  personalityBaseline: 'warm' | 'strict' | 'haraguro',
  futureSlots: {
    warmth: 0..10,           // 温度 slider
    convergenceMode: 'explore' | 'guided' | 'decisive',  // 收敛方式 segmented control
    reflectionDepth: null,   // reserved
    thinking: null,          // reserved
    debugContext: null       // reserved
  }
}
```
- `warmth` 与 `convergenceMode` 已接入后端 prompt modifier，支持 localStorage 持久化。
- baseline 切换时 traits 不解耦重置。

---

## 5. 数据流转图

### 5.1 Task 创建流转

```
┌──────────────────────────────────────────────────────────────────────────┐
│                              TASK 来源                                    │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌───────────┐  │
│  │   Note      │    │   Project   │    │   Project   │    │ Dashboard │  │
│  │  "AI Tasks" │    │ "Set Focus" │    │ "Generate   │    │  "Task    │  │
│  │             │    │             │    │ Next Step"  │    │  Drafts"  │  │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘    └─────┬─────┘  │
│         │                  │                  │                 │        │
│         │    originModule: │    originModule: │    originModule:│        │
│         │    "note"        │    "project"     │    "project_     │        │
│         │    originId:     │    originId:     │    suggestion"  │        │
│         │    note._id      │    project._id   │                 │        │
│         │    linkedProject:│    linkedProject:│    linkedProject:│       │
│         │    null          │    null          │    project._id   │        │
│         │                  │                  │                 │        │
│         └──────────────────┴──────────────────┴─────────────────┘        │
│                                     │                                     │
│                                     ▼                                     │
│                         ┌─────────────────────┐                          │
│                         │   POST /tasks       │                          │
│                         │   创建 Task 记录    │                          │
│                         └─────────────────────┘                          │
│                                     │                                     │
│                                     ▼                                     │
│                         ┌─────────────────────┐                          │
│                         │  Dashboard/Notes    │                          │
│                         │  展示 Task 列表     │                          │
│                         └─────────────────────┘                          │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### 5.2 Focus 清理流转

```
┌──────────────────────────────────────────────────────────────────────────┐
│                          FOCUS 清理流程                                   │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   Project.currentFocusTaskId                                             │
│        │                                                                  │
│        │  用户将某 Task 设为项目 Current Focus                              │
│        ▼                                                                  │
│   ┌──────────────────────────────────────────────┐                      │
│   │  currentFocusTaskId = task_123               │                      │
│   └──────────────────────────────────────────────┘                      │
│        │                                                                  │
│        │  Task 执行完成 / 被归档 / 被删除                                    │
│        ▼                                                                  │
│   PUT /tasks/:id 或 DELETE /tasks/:id 或 archive                         │
│        │                                                                  │
│        │  后端检测:                                                        │
│        │  - originModule 匹配 project*                                     │
│        │  - 该 task._id == currentFocusTaskId                              │
│        ▼                                                                  │
│   ┌──────────────────────────────────────────────┐                      │
│   │  currentFocusTaskId = null                   │                      │
│   │  // 清空当前聚焦，等待新的 Task 关联         │                      │
│   └──────────────────────────────────────────────┘                      │
│        │                                                                  │
│        │  用户设定新的 Current Focus Task                                    │
│        ▼                                                                  │
│   ┌──────────────────────────────────────────────┐                      │
│   │  currentFocusTaskId = task_456               │                      │
│   └──────────────────────────────────────────────┘                      │
│        │                                                                  │
│        ▼                                                                  │
│   [循环继续...]                                                           │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

---

## 6. AI 功能全景

### 6.1 AI 调用分布

```
┌──────────────────────────────────────────────────────────────────────────┐
│                           AI 调用分布                                     │
├──────────────────────────────────────────────────────────────────────────┤
│                                                                           │
│   后端代理                                                                │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  GLM                                                        │   │
│   │  POST /ai/notes/tasks       - 从笔记生成任务草稿                 │   │
│   │  POST /ai/projects/next-action - 生成项目下一步建议              │   │
│   │                                                               │   │
│   │  Kimi (Moonshot)                                              │   │
│   │  POST /ai/chat              - Sayachan 通用对话聊天              │   │
│   │  POST /ai/chat (人格基线切换) - warm / strict / haraguro         │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                    │                                      │
│   前端直连 (需要 VITE_GLM_API_KEY)                                        │
│   ┌─────────────────────────────────────────────────────────────────┐   │
│   │  summarizeText()            - 文本摘要                           │   │
│   │  generateWeeklyReview()     - 周回顾                             │   │
│   │  recommendFocus()           - 聚焦推荐                           │   │
│   │  generateActionPlan()       - 行动计划                           │   │
│   │  generateTaskDrafts()       - 任务草稿                           │   │
│   └─────────────────────────────────────────────────────────────────┘   │
│                                                                           │
│   注: Notes/Projects/Chat AI 已迁移至后端，Dashboard AI 仍为前端直连      │
│                                                                           │
└──────────────────────────────────────────────────────────────────────────┘
```

### 6.2 Fallback 机制

所有 AI 功能都有本地 fallback，确保无 API Key 时仍可正常使用：

| 功能 | Fallback 行为 |
|------|---------------|
| 文本摘要 | 截取前 50 字符 + "..." |
| 下一步建议 | 基于项目状态的预设模板 |
| 周回顾 | 统计数量 + 通用建议 |
| 聚焦推荐 | 基于活跃项目数 + 笔记数 |
| 行动计划 | 预设模板列表 |
| 任务草稿 | 基于标题的默认任务模板 |

---

## 7. 核心文件索引

| 功能 | 前端文件 | 后端文件 |
|------|----------|----------|
| Notes CRUD | `views/NotesPage.vue` | `routes/index.js` (lines 20-167) |
| Projects CRUD | `views/ProjectsPage.vue` | `routes/index.js` (lines 169-349) |
| Tasks CRUD | `components/Dashboard.vue` | `routes/index.js` (lines 350-491) |
| Focus 清理 | - | `routes/index.js` (lines 399-422) |
| Note AI | - | `routes/ai.js` (lines 51-133) |
| Project AI | - | `routes/ai.js` (lines 135-226) |
| Chat AI | `components/ChatEntry.vue` / `services/chatService.js` / `stores/runtimeControls.js` | `routes/ai.js` (lines 228-258) / `ai/bridge.js` / `private_core/sayachan-ai-core` |
| Dashboard Context | `services/dashboardContextService.js` / `stores/cockpitSignals.js` | - |
| Dashboard AI | `services/aiService.js` | - |
