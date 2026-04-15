# Sayachan Lite - Claude 开发上下文

## 项目概述

Sayachan Lite 是一个轻量级个人操作系统，聚焦 **Focus → Task → Completion → Memory → Next Focus** 核心工作流。

**技术栈**: Vue 3 + Vite + Koa.js + MongoDB

---

## 必读文档

进行任何开发前，先阅读以下文档（按优先级排序）：

1. **开发规范** - `.docs/architecture-audit/05-开发规范与约束.md`
   - 代码风格、命名规范
   - Git commit 格式
   - API 接口模板（复制粘贴使用）
   - 新增功能 Checklist

2. **技术栈** - `.docs/architecture-audit/01-技术栈.md`
   - 项目架构图
   - 前后端技术选型
   - 数据模型定义
   - 部署架构

3. **后端 API** - `.docs/architecture-audit/03-后端API接口.md`
   - 22 个接口详细说明
   - Focus 迁移逻辑
   - 级联归档机制
   - 错误处理规范

4. **核心工作流** - `.docs/architecture-audit/02-核心能力与workflow.md`
   - Focus → Task → Completion → Memory → Next Focus 流程
   - 数据流转图
   - AI 功能全景

5. **Roadmap** - `.docs/architecture-audit/04-Roadmap.md`
   - 已完成事项
   - 技术债务记录

---

## 核心约束（不可违反）

### 技术边界
- ❌ **TypeScript** - 保持 JavaScript
- ❌ **Pinia/Vuex** - 使用简单 ref 导出
- ❌ **UI 组件库** - 原生 CSS 实现
- ❌ **复杂路由改造** - 保持现状
- ❌ **架构升级重构** - 如无必要勿增实体

### 开发原则
1. **所有 AI 功能必须有 fallback** - 确保无 API Key 时可用
2. **向后兼容** - 不删除字段，标记 deprecated
3. **模型字段必须有默认值**
4. **日志必须带方括号前缀** - `[模块] 描述`

### UI 开发原则（重要）
**优先使用基线 style.css，避免重复定义样式**

基线 CSS 已定义在 `frontend/src/style.css`，包含：

| 类别 | 基线类名 | 用途 |
|------|----------|------|
| **按钮** | `.btn` | 基础按钮样式 |
| | `.btn-primary` | 主按钮（绿色） |
| | `.btn-secondary` | 次按钮（靛蓝） |
| | `.btn-danger` | 危险按钮（红色） |
| | `.btn-archive` | 归档按钮（灰蓝） |
| | `.btn-ai` | AI 按钮（金色） |
| | `.btn-ai-icon` | AI 图标按钮 |
| | `.btn-sm` / `.btn-lg` | 尺寸变体 |
| **输入框** | `.input` | 单行输入 |
| | `.textarea` | 多行输入 |
| | `.input-sm` / `.input-lg` | 尺寸变体 |
| **卡片** | `.card` | 基础卡片 |
| | `.card-elevated` | 带阴影卡片 |
| | `.card-interactive` | 可交互卡片 |
| | `.card-accent-green/blue/purple/gold` | 左边框强调色 |
| **语义Token** | `--action-primary` | 主色 #42b883 |
| | `--text-muted` | 次要文字色 |
| | `--surface-card` | 卡片背景色 |
| | `--space-md` / `--radius-md` | 间距/圆角 |

**使用示例**:
```vue
<template>
  <!-- 正确：使用基线按钮 -->
  <button class="btn btn-primary">Save</button>
  <button class="btn btn-secondary btn-sm">Edit</button>
  
  <!-- 正确：使用基线卡片 -->
  <div class="card card-accent-green">
    <h3 class="card-title">Title</h3>
    <p class="card-content">Content</p>
  </div>
  
  <!-- 正确：使用 CSS 变量 -->
  <input class="input" placeholder="Use var(--text-muted)" />
</template>

<style scoped>
/* 仅在 scoped 中写组件特有样式 */
.my-component {
  padding: var(--space-lg);
  color: var(--text-secondary);
}
</style>
```

**禁止**:
- ❌ 重复定义 `.btn` 的基础样式（padding、border、transition）
- ❌ 硬编码颜色值如 `#42b883`，应使用 `--action-primary`
- ❌ 重复定义 `.input` 的 focus 样式

**例外情况**:
- 组件特有布局（flex、grid、position）
- 组件特有动画
- 基线未覆盖的特殊样式

---

## 快速启动

### 本地开发
```bash
# 后端
cd backend
npm install
npm start

# 前端
cd frontend
npm install
npm run dev
```

### 环境变量
复制 `.env.example` 为 `.env`，填写：
- `GLM_API_KEY` - 后端 AI 调用（可选，有 fallback）
- `VITE_GLM_API_KEY` - Dashboard AI（可选）
- `MONGO_URI` - 本地 MongoDB（可选，服务可独立运行）

---

## 新增功能开发流程

### 1. 检查 Roadmap
查看 `.docs/architecture-audit/04-Roadmap.md` 确认不在"明确不做"列表中

### 2. 阅读开发规范
重点查看：
- 05-开发规范与约束.md 中的 **API 接口模板**
- **Git Commit Message 规范**
- **新增功能开发 Checklist**

### 3. 开发
- 后端：参考 `backend/src/routes/index.js` 现有模式
- 前端：参考 `frontend/src/services/` 现有 service 模式
- CSS：保持与现有组件一致的风格

### 4. 提交
```bash
# 格式: <type>(<scope>): <subject>
git commit -m "feat(note): add tag support"
git commit -m "fix(ui): correct button alignment"
```

---

## 常见问题

### 如何复用现有模式？
- **CRUD 接口**: 复制 `05-开发规范与约束.md` 中的「API 接口模板」
- **前端 Service**: 参考 `frontend/src/services/taskService.js`
- **组件结构**: 参考 `frontend/src/components/NotesPanel.vue`

### Focus 清理是什么？
当 Task 完成时，如果它关联了 Project 且恰好是当前的 `currentFocusTaskId`，会自动：
清空 Project.currentFocusTaskId

详见 `03-后端API接口.md` → 3.4 Tasks 接口 → PUT /tasks/:id

### AI 调用走前端还是后端？
- **Notes/Projects AI**: 已迁移至后端（`routes/ai.js`）
- **Dashboard AI**: 仍为前端直连（可选迁移）
- **新增 AI 功能**: 优先走后端代理

---

## 文件索引

| 用途 | 路径 |
|------|------|
| 后端入口 | `backend/src/server.js` |
| 业务路由 | `backend/src/routes/index.js` |
| AI 路由 | `backend/src/routes/ai.js` |
| Note 模型 | `backend/src/models/Note.js` |
| Project 模型 | `backend/src/models/Project.js` |
| Task 模型 | `backend/src/models/Task.js` |
| 前端入口 | `frontend/src/main.js` |
| 前端路由 | `frontend/src/router/index.js` |
| AI 服务 | `frontend/src/services/aiService.js` |
| Task 服务 | `frontend/src/services/taskService.js` |

---

## 文档同步检查（重要）

### 自动检查机制

项目配置了 **git pre-commit hook**，当修改 architecture 相关文件时会自动提醒更新文档。

**安装 hook**:
```bash
bash .claude/hooks/install-hooks.sh
```

**触发条件**:
- 修改 `backend/src/models/*.js` → 必须更新 `03-后端API接口.md` 的 Schema
- 修改 `backend/src/routes/*.js` → 必须更新 `03-后端API接口.md` 的接口说明
- 修改 `frontend/src/services/*.js` → 检查 `02-核心能力与workflow.md`
- 修改 `frontend/src/router/*.js` → 检查 `01-技术栈.md`

### 手动检查流程

当用户修改以下文件时，主动提醒同步文档：

| 修改的文件 | 需要检查的文档 | 检查点 |
|-----------|---------------|--------|
| `backend/src/models/*.js` | `03-后端API接口.md` | Schema 定义是否一致 |
| `backend/src/routes/*.js` | `03-后端API接口.md` | 接口列表、参数、响应 |
| `backend/src/routes/ai.js` | `01-技术栈.md` | AI 调用方式表 |
| `frontend/src/services/*.js` | `02-核心能力与workflow.md` | 数据流转描述 |
| `frontend/src/router/*.js` | `01-技术栈.md` | 前端项目结构 |
| `frontend/src/style.css` | `05-开发规范与约束.md` | 基线 CSS 使用规范 |
| `package.json` | `01-技术栈.md` | 技术栈版本 |

### 详细指南

参见 `.docs/architecture-audit/06-文档同步指南.md`：
- 变更类型与文档对应表
- 文档更新模板
- 提交前检查清单

---

## 记忆提示

当用户要求以下操作时，自动参考对应文档：

- **"新增 XX 功能"** → 先读 `05-开发规范与约束.md` 的「新增功能开发 Checklist」
- **"修改 API"** → 先读 `03-后端API接口.md` 了解现有接口约定
- **"调整样式"** → 先读 `05-开发规范与约束.md` 的 CSS 风格规范
- **"提交代码"** → 参照 `05-开发规范与约束.md` 的 Git Commit 规范
- **修改 architecture 文件** → 提醒同步文档并参照 `06-文档同步指南.md`
- **"新增/修改 UI"** → 优先使用 `style.css` 基线类（`.btn`、`.card`、`.input`），避免重复定义

### UI 开发快速检查
当用户要求开发 UI 相关功能时，检查：
1. 是否使用了 `style.css` 中已有的基线类？
2. 是否使用了 CSS 变量而非硬编码颜色？
3. 组件 scoped 样式是否只包含特有样式？

---

*文档版本: 2026-04-12*
*项目: Sayachan Lite*
