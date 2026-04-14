# Sayachan Lite - 后端 API 接口

> 项目架构审计文档 | 最后更新: 2026-04-15

---

## 1. API 概览

- **Base URL**: `http://localhost:3001` (开发) / 生产环境配置的域名
- **Content-Type**: `application/json`
- **CORS**: 已启用，需配置 `FRONTEND_ORIGIN`

---

## 2. 接口总览

| 方法 | 路径 | 说明 | 位置 |
|------|------|------|------|
| GET | `/health` | 健康检查 | `routes/index.js:10` |
| GET | `/notes` | 获取笔记列表 | `routes/index.js:20` |
| POST | `/notes` | 创建笔记 | `routes/index.js:31` |
| PUT | `/notes/:id` | 更新笔记 | `routes/index.js:42` |
| DELETE | `/notes/:id` | 删除笔记 | `routes/index.js:59` |
| PUT | `/notes/:id/pin` | 置顶笔记 | `routes/index.js:72` |
| PUT | `/notes/:id/unpin` | 取消置顶 | `routes/index.js:89` |
| PUT | `/notes/:id/archive` | 归档笔记 | `routes/index.js:106` |
| PUT | `/notes/:id/restore` | 恢复笔记 | `routes/index.js:138` |
| GET | `/projects` | 获取项目列表 | `routes/index.js:170` |
| POST | `/projects` | 创建项目 | `routes/index.js:181` |
| PUT | `/projects/:id` | 更新项目 | `routes/index.js:194` |
| DELETE | `/projects/:id` | 删除项目 | `routes/index.js:211` |
| PUT | `/projects/:id/pin` | 置顶项目 | `routes/index.js:224` |
| PUT | `/projects/:id/unpin` | 取消置顶 | `routes/index.js:241` |
| PUT | `/projects/:id/archive` | 归档项目 | `routes/index.js:258` |
| PUT | `/projects/:id/restore` | 恢复项目 | `routes/index.js:292` |
| GET | `/tasks` | 获取任务列表 | `routes/index.js:326` |
| POST | `/tasks` | 创建任务 | `routes/index.js:344` |
| PUT | `/tasks/:id` | 更新任务 | `routes/index.js:364` |
| DELETE | `/tasks/:id` | 删除任务 | `routes/index.js:412` |
| POST | `/ai/notes/tasks` | AI: 从笔记生成任务 | `routes/ai.js:34` |
| POST | `/ai/projects/next-action` | AI: 生成项目下一步 | `routes/ai.js:119` |
| POST | `/ai/chat` | AI: 通用对话聊天 | `routes/ai.js:222` |

---

## 3. 详细接口说明

### 3.1 Health Check

```http
GET /health
```

**Response**:
```json
{
  "status": "ok",
  "service": "backend",
  "timestamp": "2026-04-12T10:30:00.000Z",
  "db": "connected"
}
```

---

### 3.2 Notes 接口

#### GET /notes

获取笔记列表（默认不含已归档）。

```http
GET /notes
GET /notes?archived=true  # 仅获取已归档
```

**Query Parameters**:
| 参数 | 类型 | 说明 |
|------|------|------|
| archived | boolean | `true` 时仅返回已归档笔记 |

**Response**:
```json
[
  {
    "_id": "...",
    "title": "笔记标题",
    "content": "笔记内容",
    "status": "active",
    "isPinned": true,
    "pinnedAt": "2026-04-12T10:00:00.000Z",
    "createdAt": "2026-04-10T08:00:00.000Z",
    "updatedAt": "2026-04-12T10:00:00.000Z"
  }
]
```

**排序规则**: `isPinned` desc → `pinnedAt` desc → `updatedAt` desc

---

#### POST /notes

创建新笔记。

```http
POST /notes
Content-Type: application/json

{
  "title": "笔记标题",
  "content": "笔记内容（可选）"
}
```

**Request Body**:
| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| title | string | ✓ | 笔记标题 |
| content | string | ✗ | 笔记内容，默认为空字符串 |

**Response** (201 Created):
```json
{
  "_id": "...",
  "title": "笔记标题",
  "content": "笔记内容",
  "status": "active",
  "isPinned": false,
  "pinnedAt": null,
  "createdAt": "...",
  "updatedAt": "..."
}
```

---

#### PUT /notes/:id

更新笔记。

```http
PUT /notes/:id
Content-Type: application/json

{
  "title": "新标题",
  "content": "新内容"
}
```

**Response**:
```json
{
  "_id": "...",
  "title": "新标题",
  "content": "新内容",
  ...
}
```

**Error** (404):
```json
{ "error": "Note not found" }
```

---

#### DELETE /notes/:id

删除笔记。

```http
DELETE /notes/:id
```

**Response**: 204 No Content

---

#### PUT /notes/:id/pin

置顶笔记。

```http
PUT /notes/:id/pin
```

**说明**: 更新 `isPinned: true` 和 `pinnedAt: Date.now()`，不更新内容时间戳。

**Response**: 更新后的笔记对象

---

#### PUT /notes/:id/unpin

取消置顶笔记。

```http
PUT /notes/:id/unpin
```

**说明**: 更新 `isPinned: false` 和 `pinnedAt: null`，不更新内容时间戳。

---

#### PUT /notes/:id/archive

归档笔记（级联归档关联 Tasks）。

```http
PUT /notes/:id/archive
```

**级联行为**:
- 将笔记 `status` 设为 `archived`
- 将所有 `originModule: 'note'` 且 `originId` 匹配的 Task 也设为 `archived`

**Response**: 更新后的笔记对象

---

#### PUT /notes/:id/restore

恢复笔记（级联恢复关联 Tasks）。

```http
PUT /notes/:id/restore
```

**级联行为**:
- 将笔记 `status` 设为 `active`
- 将所有 `originModule: 'note'` 且 `originId` 匹配的已归档 Task 恢复为 `active`

---

### 3.3 Projects 接口

#### GET /projects

获取项目列表。

```http
GET /projects
GET /projects?archived=true  # 仅获取已归档
```

**Response**:
```json
[
  {
    "_id": "...",
    "name": "项目名称",
    "summary": "项目描述",
    "status": "in_progress",
    "nextAction": "当前聚焦点",
    "lastCompletedAction": "最近完成",
    "focusHistory": ["已完成项1", "已完成项2"],
    "isPinned": false,
    "pinnedAt": null,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

#### POST /projects

创建新项目。

```http
POST /projects
Content-Type: application/json

{
  "name": "项目名称",
  "summary": "项目描述",
  "status": "pending",
  "nextAction": "初始聚焦点（可选）"
}
```

**Request Body**:
| 字段 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| name | string | ✓ | - | 项目名称 |
| summary | string | ✓ | - | 项目描述 |
| status | string | ✗ | "pending" | pending/in_progress/completed/on_hold |
| nextAction | string | ✗ | "" | 当前聚焦点 |

---

#### PUT /projects/:id

更新项目。

```http
PUT /projects/:id
Content-Type: application/json

{
  "name": "新名称",
  "summary": "新描述",
  "status": "in_progress",
  "nextAction": "新的聚焦点"
}
```

---

#### PUT /projects/:id/pin / unpin

置顶/取消置顶项目。

```http
PUT /projects/:id/pin
PUT /projects/:id/unpin
```

---

#### PUT /projects/:id/archive

归档项目（级联归档关联 Tasks）。

```http
PUT /projects/:id/archive
```

**级联行为**:
- 归档项目
- 归档所有 `linkedProjectId` 匹配或 `originId` 匹配的 Task

---

#### PUT /projects/:id/restore

恢复项目（级联恢复关联 Tasks）。

```http
PUT /projects/:id/restore
```

**级联行为**:
- 恢复项目为 `pending` 状态
- 恢复所有关联的已归档 Task 为 `active`

---

### 3.4 Tasks 接口

#### GET /tasks

获取任务列表。

```http
GET /tasks                    # 默认不含已归档
GET /tasks?archived=true      # 仅已归档
GET /tasks?projectId=xxx      # 指定项目的任务
```

**Query Parameters**:
| 参数 | 类型 | 说明 |
|------|------|------|
| archived | boolean | `true` 时仅返回已归档任务 |
| projectId | string | 按关联项目筛选 |

**Response**:
```json
[
  {
    "_id": "...",
    "title": "任务标题",
    "creationMode": "manual",
    "originModule": "project_focus",
    "originId": "project-id",
    "originLabel": "项目名称",
    "linkedProjectId": "project-id",
    "linkedProjectName": "项目名称",
    "status": "active",
    "completed": false,
    "createdAt": "...",
    "updatedAt": "..."
  }
]
```

---

#### POST /tasks

创建任务。

```http
POST /tasks
Content-Type: application/json

{
  "title": "任务标题",
  "creationMode": "manual",
  "originModule": "dashboard",
  "originId": null,
  "originLabel": "",
  "linkedProjectId": null,
  "linkedProjectName": ""
}
```

**Request Body** (语义化字段):
| 字段 | 类型 | 必需 | 默认值 | 说明 |
|------|------|------|--------|------|
| title | string | ✓ | - | 任务标题 |
| creationMode | string | ✗ | "manual" | ai / manual |
| originModule | string | ✗ | "" | 来源模块 |
| originId | mixed | ✗ | null | 来源ID |
| originLabel | string | ✗ | "" | 来源标签 |
| linkedProjectId | ObjectId | ✗ | null | 关联项目ID |
| linkedProjectName | string | ✗ | "" | 关联项目名称 |

---

#### PUT /tasks/:id

更新任务（完成/状态变更）。

```http
PUT /tasks/:id
Content-Type: application/json

{
  "completed": true,
  "status": "completed"
}
```

**重点：Focus 迁移逻辑**

当 Task 满足以下条件时，会触发 Project 的 Focus 迁移：
1. `completed` 变为 `true` 或 `status` 变为 `"completed"`
2. `originModule` 为 `"project"`, `"project_focus"`, 或 `"project_suggestion"`
3. 有关联的 `linkedProjectId`

**迁移行为**:
```javascript
// 伪代码
project.focusHistory.push(project.nextAction);
project.nextAction = '';
```

**Response**: 更新后的任务对象

---

#### DELETE /tasks/:id

删除任务。

```http
DELETE /tasks/:id
```

**Response**: 204 No Content

---

### 3.5 AI 接口

#### POST /ai/notes/tasks

从笔记内容生成任务草稿。

```http
POST /ai/notes/tasks
Content-Type: application/json

{
  "title": "笔记标题",
  "content": "笔记内容..."
}
```

**Response**:
```json
{
  "drafts": [
    "基于笔记的下一步行动1",
    "基于笔记的下一步行动2"
  ]
}
```

**Fallback** (无 API Key 或失败时):
```json
{
  "drafts": [
    "基于 \"{title}\" 的下一步",
    "整理 \"{title}\" 的关键点"
  ]
}
```

---

#### POST /ai/projects/next-action

为项目生成下一步建议。

```http
POST /ai/projects/next-action
Content-Type: application/json

{
  "name": "项目名称",
  "summary": "项目描述",
  "status": "in_progress",
  "nextAction": "当前聚焦点",
  "focusHistory": ["已完成项1", "已完成项2"]
}
```

**Response**:
```json
{
  "suggestions": [
    "具体可执行的建议1",
    "具体可执行的建议2"
  ]
}
```

**Fallback** (基于状态):
| 状态 | Fallback 建议 |
|------|---------------|
| pending | 明确里程碑并设定截止日期 / 梳理项目依赖关系 |
| in_progress | 检查当前进度并更新阻塞项 / 协调相关资源推进任务 |
| completed | 记录项目成果并归档 / 总结经验教训 |
| on_hold | 重新评估依赖和时间线 / 确定是否需要重启项目 |

---

#### POST /ai/chat

通用对话聊天接口，Sayachan 主聊天入口。

```http
POST /ai/chat
Content-Type: application/json

{
  "messages": [
    { "role": "user", "content": "今天该做什么？" }
  ],
  "context": {
    "activeProjectsCount": 2,
    "activeTasksCount": 5,
    "pinnedProjectName": "Sayachan Lite",
    "currentNextAction": "完成 API 文档同步"
  },
  "runtimeControls": {
    "personalityBaseline": "warm"
  }
}
```

**Request Body**:
| 字段 | 类型 | 必需 | 说明 |
|------|------|------|------|
| messages | array | ✓ | 对话消息列表，每项含 `role` 和 `content` |
| context | object | ✗ | Dashboard snapshot，含 `activeProjectsCount`、`activeTasksCount`、`pinnedProjectName`、`currentNextAction` |
| runtimeControls | object | ✗ | 运行时控制参数，含 `personalityBaseline`（`warm`/`strict`/`haraguro`） |

**Response**:
```json
{
  "reply": "我在这，我们先把当前最重要的一步理清楚。"
}
```

**Fallback** (无 API Key 或失败时):
```json
{
  "reply": "我在这，我们先把当前最重要的一步理清楚。"
}
```

---

## 4. 错误处理

### 4.1 通用错误格式

```json
{
  "error": "错误描述"
}
```

### 4.2 HTTP 状态码

| 状态码 | 说明 |
|--------|------|
| 200 | 成功 |
| 201 | 创建成功 |
| 204 | 删除成功 |
| 404 | 资源不存在 |
| 500 | 服务器内部错误 |

### 4.3 404 处理

未匹配的路由会返回统一 404:
```json
{ "error": "Not Found" }
```

---

## 5. 数据模型 Schema

### 5.1 Note Schema

```javascript
{
  title: { type: String, required: true, trim: true },
  content: { type: String, default: '' },
  status: { type: String, enum: ['active', 'archived'], default: 'active' },
  isPinned: { type: Boolean, default: false },
  pinnedAt: { type: Date, default: null }
}
// timestamps: true (createdAt, updatedAt)
```

### 5.2 Project Schema

```javascript
{
  name: { type: String, required: true, trim: true },
  summary: { type: String, required: true },
  status: { type: String, enum: ['pending', 'in_progress', 'completed', 'on_hold', 'archived'], default: 'pending' },
  nextAction: { type: String, default: '' },
  lastCompletedAction: { type: String, default: '' },  // deprecated
  focusHistory: { type: [String], default: [] },
  isPinned: { type: Boolean, default: false },
  pinnedAt: { type: Date, default: null }
}
// timestamps: true
```

### 5.3 Task Schema

```javascript
{
  title: { type: String, required: true, trim: true },
  // 语义化字段
  creationMode: { type: String, enum: ['ai', 'manual'], default: 'manual' },
  originModule: { type: String, default: '' },
  originId: { type: mongoose.Schema.Types.Mixed, default: null },
  originLabel: { type: String, default: '' },
  linkedProjectId: { type: ObjectId, ref: 'Project', default: null },
  linkedProjectName: { type: String, default: '' },
  // 遗留字段
  source: { type: String },
  sourceDetail: { type: String, default: '' },
  projectId: { type: ObjectId, ref: 'Project', default: null },
  projectName: { type: String, default: '' },
  // 状态
  status: { type: String, enum: ['active', 'completed', 'archived'], default: 'active' },
  completed: { type: Boolean, default: false }
}
// timestamps: true
```

---

## 6. 关键业务逻辑

### 6.1 排序逻辑

**Notes & Projects**:
```javascript
.sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 })
```

**Tasks**:
```javascript
.sort({ createdAt: -1 })
```

### 6.2 Focus 迁移触发条件

```javascript
// 位于 routes/index.js:387-408
const isBecomingCompleted = 
  (body.completed === true || body.status === 'completed') &&
  (existingTask.completed !== true && existingTask.status !== 'completed');

const isProjectTask = projectId && task.originId &&
  ['project', 'project_focus', 'project_suggestion'].includes(task.originModule);

if (isBecomingCompleted && isProjectTask) {
  // 执行 Focus 迁移
}
```

### 6.3 归档级联逻辑

**Note 归档**:
```javascript
// 归档 Note
await Note.findByIdAndUpdate(id, { status: 'archived' });

// 级联归档关联 Tasks
await Task.updateMany(
  { originId: id, originModule: 'note', status: { $ne: 'archived' } },
  { status: 'archived' }
);
```

**Project 归档**:
```javascript
// 归档 Project
await Project.findByIdAndUpdate(id, { status: 'archived' });

// 级联归档所有关联 Tasks
await Task.updateMany(
  { 
    $or: [{ linkedProjectId: id }, { originId: id }],
    status: { $ne: 'archived' }
  },
  { status: 'archived' }
);
```
