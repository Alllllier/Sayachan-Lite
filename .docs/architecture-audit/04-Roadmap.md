# Sayachan Lite - Roadmap

> 项目架构审计文档 | 最后更新: 2026-04-12

---

## 1. Roadmap 说明

本文档记录 Sayachan Lite 的 **已完成事项**。未来规划将在此文档基础上逐步追加。

**版本策略**: 采用迭代式开发，每个阶段聚焦核心功能落地，不追求一次性完美。

---

## 2. 已完成事项

### 2.1 基础架构

| 状态 | 事项 | 完成时间 | 关键提交 |
|------|------|----------|----------|
| ✅ | 前端 Vue 3 骨架搭建 | 2026-04-03 | `init` |
| ✅ | 后端 Koa.js 骨架搭建 | 2026-04-03 | `init` |
| ✅ | MongoDB 连接与错误处理 | 2026-04-03 | 骨架提交 |
| ✅ | 环境变量配置抽离 (.env) | 2026-04-03 | `feat: env config` |
| ✅ | CORS 跨域配置 | 2026-04-03 | 骨架提交 |

### 2.2 Notes 模块

| 状态 | 事项 | 完成时间 | 说明 |
|------|------|----------|------|
| ✅ | Notes CRUD API | 2026-04-03 | 基础增删改查 |
| ✅ | Notes 前端页面 | 2026-04-03 | NotesPage.vue |
| ✅ | 笔记置顶功能 | 2026-04-11 | 支持 Pin/Unpin |
| ✅ | 笔记归档功能 | 2026-04-12 | 级联归档关联 Tasks |
| ✅ | AI 生成任务 | 2026-04-12 | 后端代理 + fallback |
| ✅ | 置顶排序优先级 | 2026-04-12 | pinned → pinnedAt → updatedAt |

### 2.3 Projects 模块

| 状态 | 事项 | 完成时间 | 说明 |
|------|------|----------|------|
| ✅ | Projects CRUD API | 2026-04-03 | 基础增删改查 |
| ✅ | Projects 前端页面 | 2026-04-03 | ProjectsPage.vue |
| ✅ | 项目状态管理 | 2026-04-03 | pending/in_progress/completed/on_hold |
| ✅ | Next Action (聚焦点) | 2026-04-03 | 当前聚焦管理 |
| ✅ | Focus History (推进轨迹) | 2026-04-03 | 历史记录数组 |
| ✅ | 项目置顶功能 | 2026-04-11 | 支持 Pin/Unpin |
| ✅ | 项目归档功能 | 2026-04-12 | 级联归档关联 Tasks |
| ✅ | AI 下一步建议 | 2026-04-12 | 后端代理 + fallback |

### 2.4 Tasks 模块

| 状态 | 事项 | 完成时间 | 说明 |
|------|------|----------|------|
| ✅ | Tasks CRUD API | 2026-04-03 | 基础增删改查 |
| ✅ | 语义化来源追踪 | 2026-04-03 | creationMode, originModule, originId |
| ✅ | 项目关联 | 2026-04-03 | linkedProjectId/Name |
| ✅ | Focus 迁移逻辑 | 2026-04-03 | Task 完成触发 Project 焦点迁移 |
| ✅ | 任务归档视图 | 2026-04-12 | 已归档任务筛选展示 |

### 2.5 Dashboard 模块

| 状态 | 事项 | 完成时间 | 说明 |
|------|------|----------|------|
| ✅ | Dashboard 骨架 | 2026-04-03 | DashboardPage.vue |
| ✅ | 数据统计展示 | 2026-04-03 | Notes/Projects/Tasks 数量 |
| ✅ | Weekly Review | 2026-04-03 | AI 周回顾生成 |
| ✅ | Focus Recommendation | 2026-04-03 | AI 聚焦推荐 |
| ✅ | Action Plan | 2026-04-03 | AI 行动计划生成 |
| ✅ | Task Drafts | 2026-04-03 | AI 任务草稿生成 |
| ✅ | 所有 AI 功能 fallback | 2026-04-03 | 无 API Key 时本地模板 |

### 2.6 AI 集成

| 状态 | 事项 | 完成时间 | 说明 |
|------|------|----------|------|
| ✅ | GLM-4.5 Air 接入 | 2026-04-03 | 智谱 AI |
| ✅ | 前端 AI Service | 2026-04-03 | aiService.js |
| ✅ | 后端 AI 路由 | 2026-04-12 | `/ai/*` 接口 |
| ✅ | AI 后端代理闭环 | 2026-04-12 | Notes/Projects AI 迁移至后端 |
| ✅ | Response 解析兼容 | 2026-04-12 | 支持 string/array 格式 |
| ✅ | Global Companion Chat Runtime | 2026-04-15 | ChatEntry + Kimi + Dashboard Context |
| ✅ | Chat 人格基线切换 | 2026-04-15 | warm / strict / haraguro |
| ✅ | Chat Runtime Controls | 2026-04-15 | 轻量面板 + future slots 占位 |

### 2.7 Chat / Runtime

| 状态 | 事项 | 完成时间 | 说明 |
|------|------|----------|------|
| ✅ | Dashboard Context 解耦 | 2026-04-15 | Chat 全局可用，按需 hydrate |
| ✅ | cockpitSignals hasHydrated | 2026-04-15 | 避免非 Dashboard 路由上下文缺失 |

### 2.8 部署与运维

| 状态 | 事项 | 完成时间 | 说明 |
|------|------|----------|------|
| ✅ | 部署架构设计 | 2026-04-03 | Vercel + Render + Atlas |
| ✅ | 环境变量模板 | 2026-04-03 | .env.example |
| ✅ | 部署文档 | 2026-04-03 | README 部署章节 |
| ✅ | GitHub 仓库整理 | 2026-04-03 | Clean repo structure |
| ✅ | 前端构建配置 | 2026-04-03 | vite.config.js |

### 2.9 UI/UX 优化

| 状态 | 事项 | 完成时间 | 说明 |
|------|------|----------|------|
| ✅ | Note Card 按钮布局优化 | 2026-04-12 | 垂直间距调整 |
| ✅ | Edit Mode 按钮位置优化 | 2026-04-12 | 提升操作便利性 |
| ✅ | Card 时间戳展示优化 | 2026-04-12 | 更清晰的日期显示 |

---

## 3. 功能演进时间线

```
2026-04-03: 项目初始化
├── 前端 Vue 3 骨架
├── 后端 Koa.js 骨架
├── MongoDB 连接
├── Notes/Projects/Tasks CRUD
├── Dashboard + AI 功能
└── 基础部署准备

2026-04-11: 置顶功能
├── Note 置顶/取消置顶
└── Project 置顶/取消置顶

2026-04-12: 归档与完善
├── 笔记归档 + 级联 Tasks
├── 项目归档 + 级联 Tasks
├── 置顶优先排序
├── AI 后端代理迁移
├── Note/Project 归档恢复
└── UI 微调优化

2026-04-15: Global Companion Chat Runtime Foundation
├── ChatEntry 全局浮动聊天入口
├── 后端 Kimi AI Substrate (adaptor / personality / context / orchestration)
├── cockpitSignals Dashboard 上下文桥接
└── Dashboard snapshot 注入 Chat prompt

2026-04-15: Runtime Controls + Context 解耦
├── Chat Runtime Controls 面板（人格基线切换）
├── 三套人格基线：温暖 / 干练 / 腹黑 (Haraguro)
├── Dashboard Context 按需解耦（非 Dashboard 路由可用）
└── cockpitSignals hasHydrated 兜底机制
```

---

## 4. 技术债务记录

### 4.1 已知问题

| 问题 | 影响 | 计划处理 |
|------|------|----------|
| Task 模型遗留字段 | 代码冗余 | 未来版本清理 |
| Dashboard AI 仍为前端直连 | 需维护两套 API Key | 可选迁移至后端 |
| 无数据迁移脚本 | 模型变更风险 | 如需要时添加 |

### 4.2 兼容性说明

- **向后兼容**: Task 模型保留 legacy 字段确保兼容性
- **API 兼容**: 所有 API 变更保持向后兼容
- **数据兼容**: 无破坏性数据变更

---

## 5. 后续待验证

以下事项已识别但 **尚未完成验证**：

| 状态 | 事项 | 说明 |
|------|------|------|
| ⏳ | 真实部署验证 | Vercel + Render + Atlas 完整流程 |
| ⏳ | 用户使用反馈 | 真实场景测试 |
| ⏳ | 核心工作流有效性 | 真实 AI 数据驱动验证 |
| ⏳ | Dashboard AI 后端代理 | Weekly Review / Focus / Action Plan (可选) |

---

## 6. 项目边界（明确不做）

以下功能/技术 **明确不在规划内**：

| 类别 | 不做事项 | 原因 |
|------|----------|------|
| 语言 | TypeScript | 保持简单，减少构建复杂度 |
| 状态管理 | Pinia / Vuex | 当前规模不需要 |
| UI 库 | Element Plus / Ant Design | 原生 CSS 足够 |
| 路由 | vue-router 大规模改造 | 当前路由结构满足需求 |
| 功能 | 大型功能系统新增 | 保持轻量 |
| 架构 | 架构升级式重构 | 如无必要勿增实体 |
| UI | 美化型修改 | 功能优先 |

---

## 7. 关键里程碑

```
M1: 骨架搭建 (已完成)
   └── 前后端基础架构 + 基础 CRUD

M2: 工作流闭环 (已完成)
   └── Focus → Task → Completion → Memory → Next Focus

M3: 归档完善 (已完成)
   └── 置顶 + 归档 + 级联 + 排序

M4: AI 优化 (部分完成)
   └── 后端代理闭环 ✅
   └── Dashboard AI 可选迁移 ⏳

M5: 生产验证 (待启动)
   └── 真实部署 + 用户反馈
```

---

## 8. 文档索引

| 文档 | 路径 |
|------|------|
| 技术栈 | `01-技术栈.md` |
| 核心能力与 Workflow | `02-核心能力与workflow.md` |
| 后端 API 接口 | `03-后端API接口.md` |
| Roadmap | `04-Roadmap.md` |
