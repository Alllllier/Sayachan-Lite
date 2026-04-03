# Sayachan Lite

一个轻量级个人操作系统，聚焦 Focus → Task → Completion → Memory → Next Focus 核心工作流。

## 项目定位

Sayachan Lite 是 Sayachan 的轻量级版本，一款极简个人生产力工具，帮助用户通过清晰的工作流管理 Notes、Projects 和 Tasks。核心功能围绕"聚焦-执行-回顾"闭环设计，不追求功能全，只抓核心工作流的有效落地。

## 核心能力

### 已实现
- **Notes** - 笔记记录与 CRUD
- **Projects** - 项目管理（含状态、聚焦点、推进轨迹）
- **Tasks** - 任务执行与管理
- **AI 辅助** - 基于 GLM 的智能建议（可选，有 fallback）
- **Dashboard** - 周回顾、聚焦推荐、Action Plan、Task 生成

### 核心 Workflow

```
Focus → Task → Completion → Memory → Next Focus
```

1. **Focus** - Dashboard 推荐聚焦方向，从 Projects 设定当前聚焦点（Next Action）
2. **Task** - 从 Notes 或 Dashboard AI 生成可执行任务
3. **Completion** - 完成任务，自动触发 Focus 迁移（Project 焦点进入历史）
4. **Memory** - Notes 和 Projects 记录推进轨迹与关键信息
5. **Next Focus** - AI 基于历史数据推荐下一聚焦方向

## 技术栈

- **前端**: Vue 3 + Vite
- **后端**: Koa.js
- **数据库**: MongoDB + Mongoose
- **AI 集成**: GLM-4.5 Air（可选）

## 本地启动

### 前置要求
- Node.js 18+
- MongoDB（可选，不启动时服务仍可运行）

### 1. 环境变量配置

复制示例文件并填充实际值：

```bash
cp .env.example .env
```

编辑 `.env` 文件，关键变量说明：

| 变量 | 所属 | 说明 | 默认值 |
|------|------|--------|--------|
| `MONGO_URI` | Backend | MongoDB 连接串 | `mongodb://localhost:27017/personal-os-lite`（技术内部配置，可保持默认） |
| `PORT` | Backend | 后端服务端口 | `3001` |
| `FRONTEND_ORIGIN` | Backend | CORS 允许的前端地址 | `http://localhost:5173` |
| `GLM_API_KEY` | Backend | GLM API Key（用于 Notes/Projects AI） | - |
| `VITE_API_BASE_URL` | Frontend | 前端请求的后端地址 | `http://localhost:3001` |
| `VITE_GLM_API_KEY` | Frontend | **已弃用**，不再需要 | - |

**AI 调用说明**：
- Notes 的 "AI Tasks" 和 Projects 的 "Generate Next Step" 已迁移至后端代理，通过后端 `GLM_API_KEY` 调用
- Dashboard 的 Weekly Review / Focus Recommendation / Action Plan 仍为前端直连，需配置前端 API Key（可选）

### 2. 启动后端

```bash
cd backend
npm install
npm start
```

后端将运行在 `http://localhost:3001`

### 3. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端将运行在 `http://localhost:5173`

### 4. 验证

访问 `http://localhost:5173`，检查：
- 页面能正常加载
- Dashboard 显示 Notes 和 Projects 数量
- 可以创建 Notes 和 Projects

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
   - `GLM_API_KEY` - GLM API Key（用于 Notes/Projects AI suggestion，可选）
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
| POST | `/ai/notes/tasks` | AI: 从笔记生成任务（需后端 GLM_API_KEY） |
| POST | `/ai/projects/next-action` | AI: 生成项目下一步建议（需后端 GLM_API_KEY） |

## 当前边界（暂不做项）

- 不引入 TypeScript
- 不引入 Pinia
- 不引入 UI 组件库
- 不进行 vue-router 大规模改造
- 不新增大型功能系统
- 不做架构升级式重构
- 不做 UI 美化型修改

## Roadmap

### 已完成
- [x] 前端 Vue 3 骨架
- [x] 后端 Koa.js 骨架
- [x] MongoDB 连接
- [x] Notes CRUD
- [x] Projects CRUD（含 Next Action 和 Focus History）
- [x] Tasks CRUD
- [x] Focus 迁移逻辑（Task 完成触发 Project Focus → History）
- [x] AI 辅助（Summarize、Next Action、Weekly Review、Focus 推荐、Action Plan）

### 当前阶段（系统落地）
- [x] 环境变量抽离
- [x] 部署准备
- [x] GitHub 仓库整理
- [x] 部署前验收
- [x] 生产部署适配
- [x] **AI 后端代理闭环** - Notes/Projects AI suggestion 已迁移至后端

### 后续待验证
- [ ] 真实部署验证（Vercel + Render + Atlas）
- [ ] 用户使用反馈
- [ ] 核心工作流有效性验证（真实 AI 数据驱动）
- [ ] Dashboard AI 功能后端代理 - Weekly Review / Focus Recommendation / Action Plan（可选）
