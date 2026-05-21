# Sayachan

一个轻量级个人操作系统，聚焦 Focus → Task → Completion → Memory → Next Focus 核心工作流。

## 项目定位

Sayachan 是一款极简个人生产力工具，帮助用户通过清晰的工作流管理 Notes、Projects 和 Tasks。核心功能围绕"聚焦-执行-回顾"闭环设计，不追求功能全，只抓核心工作流的有效落地。

## 核心能力

### 已实现
- **Notes** - 笔记记录与 CRUD
- **Projects** - 项目管理（含状态、聚焦点、推进轨迹）
- **Tasks** - 任务执行与管理
- **AI 辅助** - Chat focus、provider runtime、只读产品上下文工具
- **Dashboard** - 快速新增任务、Saved Tasks 管理

### 核心 Workflow

```
Focus → Task → Completion → Memory → Next Focus
```

1. **Focus** - 从 Projects 设定当前聚焦点（Next Action）
2. **Task** - 从 Projects 手动添加任务、从 Dashboard 快速新增，或在 Chat 中围绕聚焦对象拆解下一步
3. **Completion** - 完成任务，自动触发 Focus 迁移（Project 焦点进入历史）
4. **Memory** - Notes 和 Projects 记录推进轨迹与关键信息
5. **Next Focus** - Chat 基于当前产品上下文和聚焦对象协助判断下一步

## 技术栈

- **前端**: Vue 3 + Vite
- **后端**: Koa.js
- **数据库**: MongoDB + Mongoose
- **AI 集成**: private-core provider runtime（mock / OpenAI）

## 本地启动

### 前置要求
- Node.js 22+
- MongoDB（可选，不启动时服务仍可运行）

### 1. 环境变量配置

后端和前端各自维护自己的本地环境文件。

```bash
# backend
cp backend/.env.example backend/.env

# frontend
cp frontend/.env.local.example frontend/.env.local
```

关键变量说明：

| 变量 | 所属 | 说明 | 默认值 |
|------|------|--------|--------|
| `MONGO_URI` | Backend | MongoDB 连接串 | `mongodb://localhost:27017/personal-os-lite`（技术内部配置，可保持默认） |
| `PORT` | Backend | 后端服务端口 | `3001` |
| `FRONTEND_ORIGIN` | Backend | CORS 允许的前端地址 | `http://localhost:5173` |
| `KIMI_API_KEY` | Backend | 可选的 Kimi API Key | - |
| `OPENAI_API_KEY` | Backend | 可选的 OpenAI API Key（用于 AI-core v2 / GPT 测试 provider） | - |
| `OPENAI_MODEL` | Backend | 可选的 OpenAI 模型名覆盖 | - |
| `VITE_API_BASE_URL` | Frontend | 前端请求的后端地址 | `http://localhost:3001` |

**AI 调用说明**：
- Notes / Projects 的旧 GLM 生成按钮已退休；对象按钮现在只设置下一轮 Chat focus，并通过同一 private-core runtime 处理
- Dashboard 旧的 Weekly Review / Focus Recommendation / Action Plan / Task Drafts fallback helper 已移除；后续如需 Dashboard AI workflow，会作为独立产品/AI 设计重做

### 2. 启动后端

```bash
cd backend
npm install
npm run dev
```

后端将运行在 `http://localhost:3001`

`npm run dev` 使用 `tsx watch src/server.ts` 直接运行 TypeScript 源码，适合本地开发。`npm start` 会先执行 `tsc` 构建，再运行 `dist/server.js`，用于验证正式后端产物路径。

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端将运行在 `http://localhost:5173`

### 4. 验证

验证流程分三层记录：

- `README.md`：本地最常用的验证命令和手动冒烟入口。
- `docs/pmo/policies/validation-floor-policy.md`：PMO closeout 的最低验证要求。
- `docs/pmo/policies/testing-and-ui-review-guide.md`：什么时候跑 logic tests、browser validation、UI review，以及怎么报告验证缺口。

常用命令：

```bash
# 聚合测试
npm run test

# 前端测试 + 类型检查
npm --prefix frontend run test
npm --prefix frontend run typecheck

# 后端测试，会先构建 backend/dist
npm --prefix backend run test

# private-core 测试
cd backend/private_core/sayachan-ai-core
npm test
```

访问 `http://localhost:5173`，检查：
- 页面能正常加载
- Dashboard 可以快速新增并管理 Saved Tasks
- 可以创建 Notes 和 Projects

需要真实登录产品做手动/浏览器冒烟时，使用 `backend/.env` 中的专用测试账号变量：

- `SAYACHAN_UI_SMOKE_EMAIL`
- `SAYACHAN_UI_SMOKE_PASSWORD`

本地真实登录 smoke 默认访问 `http://localhost:5173`。不要随手改成 `http://127.0.0.1:5173`，除非 `backend/.env` 的 CORS origin 也明确允许这个地址；否则浏览器会因为 origin 不匹配而出现 `Failed to fetch`。

不要把真实邮箱、密码或其他 secret 写进仓库文档；提交文档时只记录变量名和使用场景。

## 部署结构说明

### 推荐部署方案

| 组件 | 部署平台 | 说明 |
|------|----------|------|
| Frontend | Vercel | 静态前端托管 |
| Backend | Render Web Service | Node.js 服务 |
| Database | MongoDB Atlas | 云端数据库 |

### 前端部署（Vercel）

1. 将 `frontend` 目录连接到 Vercel
2. 在 Vercel 项目设置中添加环境变量：
   - `VITE_API_BASE_URL` - 后端实际地址（如 `https://your-backend.onrender.com`）

Vercel 会自动检测 `vite.config.js` 并执行 `npm run build`。

### 后端部署（Render）

1. 将 `backend` 目录连接到 Render
2. 在 Render 项目设置中添加环境变量：
   - `MONGO_URI` - MongoDB Atlas 连接串
   - `FRONTEND_ORIGIN` - 前端实际域名（如 `https://your-app.vercel.app`）
   - `PORT` - 监听端口（Render 默认为 10000，但可设为任意值）
   - `OPENAI_API_KEY` - 可选，启用 OpenAI provider
   - `SAYACHAN_AI_PROVIDER` - 可选，`mock` 或 `openai`
3. Render 会自动执行 `npm start` 启动服务

### 本地构建验证（可选）

```bash
# 前端构建测试
cd frontend
npm run build

# 后端启动测试
cd backend
npm start
```

## API 接口

| 方法 | 路径 | 说明 |
|------|------|------|
| GET | `/health` | 健康检查 |
| GET | `/notes` | 获取笔记列表 |
| POST | `/notes` | 创建笔记 |
| PUT | `/notes/:id` | 更新笔记 |
| DELETE | `/notes/:id` | 删除笔记 |
| GET | `/projects` | 获取项目列表 |
| POST | `/projects` | 创建项目 |
| PUT | `/projects/:id` | 更新项目 |
| DELETE | `/projects/:id` | 删除项目 |
| GET | `/tasks` | 获取任务列表（不含已归档） |
| POST | `/tasks` | 创建任务 |
| PUT | `/tasks/:id` | 更新任务 |
| DELETE | `/tasks/:id` | 删除任务 |
| POST | `/ai/chat` | Chat JSON 回复 |
| POST | `/ai/chat/stream` | Chat SSE 流式回复 |

## 当前工程边界

- 项目保持 JavaScript-first；不要在普通功能或修复任务中顺手引入 TypeScript。
- TypeScript 不再是永久禁区，但必须作为单独 PMO 架构候选来评估迁移范围、验证成本和回滚边界。
- 当前仓库已经是 frontend / backend 同仓结构；不要把 Monorepo 现状误读为待禁止事项。
- 不在普通任务中顺手引入 npm workspaces、pnpm workspace 或其他包管理/Monorepo 工程化迁移；这类变化需要单独维护窗口。
- Pinia 和 Vue Router 已是当前前端栈的一部分，相关改动应尊重既有 stores/router 边界。
- 不引入 UI 组件库，除非后续有明确设计系统或维护收益。
- 不做无边界的大型功能系统、架构升级式重构或纯 UI 美化型修改；需要升级时先进入 PMO 候选并限定范围。

## Roadmap

### 已完成
- [x] 前端 Vue 3 骨架
- [x] 后端 Koa.js 骨架
- [x] MongoDB 连接
- [x] Notes CRUD
- [x] Projects CRUD（含 Next Action 和 Focus History）
- [x] Tasks CRUD
- [x] Focus 迁移逻辑（Task 完成触发 Project Focus → History）
- [x] AI 辅助（Chat focus、private-core provider runtime、只读产品上下文工具）

### 当前阶段（系统落地）
- [x] 环境变量抽离
- [x] 部署准备
- [x] GitHub 仓库整理
- [x] 部署前验收
- [x] 生产部署适配
- [x] **AI core 闭环** - Notes/Projects 对象入口改为 Chat focus，旧 GLM helper routes 已退休

### 后续待验证
- [ ] 真实部署验证（Vercel + Render + Atlas）
- [ ] 用户使用反馈
- [ ] 核心工作流有效性验证（真实 AI 数据驱动）
- [ ] Dashboard AI 功能整体重构（可选，旧 fallback-only workflow 已移除）
