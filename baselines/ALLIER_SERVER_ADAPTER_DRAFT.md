# `allier-server` 接入草案

> 这是一份 AI draft。
> 它的目标不是直接作为项目真相落地，
> 而是验证新版 PMO 的 adapter / onboarding 逻辑是否能挂到一个轻量 Node API 项目上。

## 1. 适配性判断

### 结论

`allier-server` 适合作为第一轮 **minimum viable onboarding** 测试项目。

### 为什么适合

- 项目很小，结构干净，适合验证最小接入流程
- 它不是 Sayachan 那种前端为主的 Web app，能测试新版 PMO 是否真的摆脱了 browser/UI 视角
- 它几乎没有现成 PMO 或文档系统，正适合测试“从较轻状态起步”的接入能力
- 它是你自己的项目，比 fork 别人的 repo 更容易接受接入实验

### 局限

- 它更适合测试 `minimum viable onboarding`
- 暂时不太适合测试成熟增强能力，例如：
  - 完整 discussion batch
  - 成熟 validation profile
  - 成熟 truth docs
  - 成熟 host integration 规范

## 2. 项目现实概览

### 技术形态

- 项目类型：`Node API service`
- 运行形态：`Koa + Mongoose backend`
- 主入口：[app.js](/C:/Users/allie/Desktop/personal_os_lite/_tmp_allier_server_review/app.js)

### 当前结构

- `app.js`
- `src/config`
- `src/routes`
- `src/controllers`
- `src/models`
- `src/middlewares`
- `src/utils`
- `scripts/init-admin.js`
- `TODO.md`

### 当前已观察到的 route surface

- `/posts`
- `/admin`
- `/uploads`

## 3. AI Draft Project Adapter

## 1. Project Identity

- Project name: `allier-server`
- Project type: `Node backend API`
- Runtime shape: `single-service Koa application with MongoDB`
- Main stack: `Node.js, Koa, Mongoose`

## 2. Core Runtime State Mapping

当前项目内还没有现成 PMO state 文件。
下面是为了接入新版 PMO 而建议的新建路径草案：

- `current_sprint`: `ops/pmo/state/current_sprint.md`
- `sprint_candidates`: `ops/pmo/state/sprint_candidates.md`
- `idea_backlog`: `ops/pmo/state/idea_backlog.md`
- `decision_log`: `ops/pmo/state/decision_log.md`
- `execution_task`: `ops/pmo/outbox/execution_task.md`
- `execution_report`: `ops/pmo/inbox/execution_report.md`

判断：

- 这个项目很轻，不建议一开始就照抄 Sayachan 的 `docs/pmo/**`
- 更适合用一个更轻的 `ops/pmo/**` 路径起步

## 3. Truth / Baseline Mapping

当前项目没有成熟的 truth docs。
第一轮接入可先用“现有事实来源 + 后续补 baseline”方式承接。

建议映射：

- system baseline:
  - 当前事实来源：
    - [app.js](/C:/Users/allie/Desktop/personal_os_lite/_tmp_allier_server_review/app.js)
    - [package.json](/C:/Users/allie/Desktop/personal_os_lite/_tmp_allier_server_review/package.json)
  - 建议未来路径：
    - `ops/baselines/system_baseline.md`

- runtime truth:
  - 当前事实来源：
    - `src/routes/*.js`
    - `src/controllers/*.js`
  - 建议未来路径：
    - `ops/baselines/runtime_truth.md`

- API / contract baseline:
  - 当前事实来源：
    - [src/routes/posts.js](/C:/Users/allie/Desktop/personal_os_lite/_tmp_allier_server_review/src/routes/posts.js)
    - [src/routes/admin.js](/C:/Users/allie/Desktop/personal_os_lite/_tmp_allier_server_review/src/routes/admin.js)
    - [src/routes/uploads.js](/C:/Users/allie/Desktop/personal_os_lite/_tmp_allier_server_review/src/routes/uploads.js)
  - 建议未来路径：
    - `ops/baselines/api_contracts.md`

- roadmap / debt surface:
  - 当前事实来源：
    - [TODO.md](/C:/Users/allie/Desktop/personal_os_lite/_tmp_allier_server_review/TODO.md)
  - 建议未来路径：
    - `ops/baselines/roadmap_and_debt.md`

## 4. Core Validation Profile

- current validation capabilities:
  - 目前没有明确测试体系
  - 当前主要依赖手动运行和基本启动验证

- primary validation approach:
  - `node app.js` 级别的启动验证
  - 针对路由 / 数据流的人工接口验证

- project-specific review or test notes:
  - 当前没有 `npm test`
  - 当前也没有浏览器验证或 UI review 需求
  - 这正适合验证新版 PMO 是否能接受“低成熟 validation profile”的项目

## 5. Host Integration

- primary host: `to be decided`
- host-specific assets path: `to be decided`
- notes:
  - 这次接入测试里，host integration 先可以保持最轻
  - 暂不需要为该项目一开始就安装复杂宿主资产

## 6. Execution Binding

- default execution worker: `to be decided`
- handoff target: `to be decided`
- report writer: `execution worker`
- notes:
  - 第一轮测试里，execution binding 只需要是显式的
  - 不需要一开始就复杂化

## 7. Boundary Notes

- canonical boundary sources:
  - [app.js](/C:/Users/allie/Desktop/personal_os_lite/_tmp_allier_server_review/app.js)
  - [src/config/mongoose.js](/C:/Users/allie/Desktop/personal_os_lite/_tmp_allier_server_review/src/config/mongoose.js)
  - [scripts/init-admin.js](/C:/Users/allie/Desktop/personal_os_lite/_tmp_allier_server_review/scripts/init-admin.js)

- escalation-heavy zones:
  - MongoDB connection and env handling
  - auth flow under `src/middlewares/auth.js`
  - upload pipeline under `src/routes/uploads.js`
  - admin bootstrap script under `scripts/init-admin.js`

- safe touch zones:
  - future PMO state files under `ops/pmo/**`
  - future baseline docs under `ops/baselines/**`
  - bounded route/controller changes when driven by a selected sprint

- notes:
  - 这个项目的 boundary 不是 AI/private-core 型边界
  - 更像 backend contract、auth、uploads side effects、DB bootstrap 这类边界

## 8. Mature Extension Mapping

### Discussion Extensions

- `discussion_batches_index`: not present yet
- `active_discussion_batch`: not present yet

建议：

- 第一轮 minimum onboarding 不强求
- 如果 PMO 在这个项目上跑顺，再补 mature discussion 机制

### Validation Extensions

- validation layers: not present yet
- default validation floor: not present yet
- project-specific review model: not present yet

建议：

- 第一轮只记录“当前没有成熟 validation 体系”
- 不要强行补齐

## 4. 接入建议

如果要把它作为第一轮测试项目，最推荐的顺序是：

1. 在项目里建立 `ops/pmo/` 和 `ops/baselines/` 轻量路径
2. 落最小 state surface
3. 先不强求 mature discussion batch
4. 用一个很小的真实事项跑通：
   - candidate
   - current sprint
   - execution task
   - execution report
   - closeout

## 5. 一句话结论

`allier-server` 不是一个适合测试“成熟 PMO 全能力”的项目，
但它非常适合测试：

- 新版 PMO 能不能在一个轻量 Node API 项目上最低成本接起来
