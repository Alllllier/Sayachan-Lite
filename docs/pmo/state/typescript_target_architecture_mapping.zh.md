# TypeScript 目标架构映射

- Sprint: `TypeScript Target Architecture Mapping`
- 状态: `planning artifact`
- 最后更新: `2026-05-05`
- 范围: 仅文档审计；没有 TypeScript 迁移或运行时变更

## 目的

本文档定义 Sayachan 未来进入 TypeScript 时代时的目标职责模型，并按职责把当前 JavaScript 模块映射到目标架构中。

这不是迁移计划、包管理决策、运行时 schema 库决策，也不是删除批准。迁移动作只是给未来 PMO 路由使用的分类：

- `keep`: 保留该职责作为持久边界；未来类型迁移主要是标注或收紧它。
- `merge`: 当类型契约存在后，可能合并重复的契约或 shape 工作。
- `replace`: 在未来批准的 slice 中，可能用类型化或运行时 schema 边界替换当前临时验证/归一化实现。
- `split`: 在类型采用前后，可能拆分混合职责。
- `defer`: 暂缓，等后续架构或产品 slice 真正需要时再处理。
- `delete-candidate`: 只有在测试和运行时审查证明该文件/层没有持久行为、副作用、语义或边界所有权后，才可能删除。

## 目标 TypeScript 时代职责模型

### 1. 领域契约与 DTO

目标职责：

- 为 Note、Project、Task、User、Invite、Session、cockpit snapshot、chat runtime controls、AI 请求/响应 DTO 定义稳定的公开领域类型。
- 区分持久化模型 shape、API 响应 shape、前端可编辑表单/输入 shape。
- 用明确的 union 表达生命周期和来源：task status、project status、creation mode、origin module、account role/status、archived/active views。

迁移姿态：

- 类型应先澄清边界；只有当契约能减少真实歧义时，再跟进文件转换。
- 在 workspace/shared package 出现前，共享契约可以先靠近 feature/API 边界放置。

### 2. 运行时 Schema 与外部输入验证

目标职责：

- 保持运行时验证与 TypeScript 类型分离。
- 在后端 HTTP 边界验证不可信外部输入：auth/session payload、note/project/task mutation、持久化 AI note/project payload、chat payload、owner 操作和 query 参数。
- 在 route/middleware 层归一化后端错误响应。

迁移姿态：

- TypeScript 不应替代运行时验证。
- 未来 schema-library slice 可以替换当前临时 validator 实现，但依赖选择明确不在本文档范围内。

### 3. 前端 Feature API 边界

目标职责：

- 保留 feature `*.api` 模块作为 transport/endpoint 边界。
- 类型化 request/response DTO 应优先放在这些模块附近。
- API 模块继续负责 endpoint 选择、通过 shared client 进行带凭证请求、响应解析和传输错误。

迁移姿态：

- 即使内部 helper 被简化，也要保留 API 边界文件。

### 4. 前端 Feature Rules 边界

目标职责：

- 保持纯产品规则与 Vue component rendering、网络副作用分离。
- 将 display-state 推导、表单验证、preview 分桶、focus eligibility、archive action 推导、markdown send rules、task payload 语义编码为类型化纯函数。

迁移姿态：

- rules 模块是高价值 typed island，因为它们纯粹且承载行为。
- 少量只重复 DTO shape 的 rules，在领域契约存在后，可能成为 merge/delete candidate。

### 5. 前端 Feature Composables

目标职责：

- Composable 负责 feature state、API 调用、cache hydration、optimistic/local mutation sync、toast callback、AI fallback handling、parent refresh hook 的编排。
- Composable 应消费 typed API/rules，而不是直接拥有领域契约。

迁移姿态：

- 保留为持久产品编排边界。
- 只有当 typed contracts 暴露出 composable 混合了无关运行时职责时，才考虑拆分。

### 6. 共享前端服务与 Stores

目标职责：

- 共享服务负责跨 feature 的运行时桥接：API client、task runtime、resource cache、cockpit context 推导、markdown rendering。
- Store 负责全局 UI/runtime 状态：auth account/session state、chat shell state、cockpit signals、runtime controls。
- account-scoped 与 device-level persistence 规则应明确且类型化。

迁移姿态：

- 保留持久运行时服务和 stores。
- 只有当契约定义和测试覆盖同等行为后，才考虑合并 no-type shape normalizer。

### 7. 前端 Components、Views、Router 与 UI Primitives

目标职责：

- Views 保持轻量 route page shell。
- Components 负责渲染、本地 UI-only interaction state、editor integration 和 UI event emit。
- UI primitives 保持轻行为、可复用。
- Router 负责 navigation guard、public/auth route metadata 和 redirect semantics。

迁移姿态：

- 等低风险 API/rules/service/store 类型稳定后，再考虑 SFC 转换。
- 不要因为数据契约类型化，就删除拥有交互行为的 component-local UI state。

### 8. 后端 Routes、Services、Models、Middleware

目标职责：

- Routes 负责 HTTP shape、middleware composition、request validation、response status mapping 和 route-local fallback behavior。
- Services 负责产品语义、ownership-scoped data access、archive/focus cascades 和持久化 lifecycle transitions。
- Models 负责 persistence schema、indexes、允许的 persisted enum values 和 timestamps。
- Middleware 负责 auth/session loading、current-user enforcement、owner gating 和 JSON error normalization。

迁移姿态：

- 保留 route/service/model/middleware 分离作为持久后端边界。
- 如果 AI route 内部 prompt/fallback helpers 持续增长，应在类型化前先拆分。

### 9. 公开后端到私有 AI Core Bridge

目标职责：

- public repo 负责 `/ai/chat` route shape、runtime-control payload pass-through、fallback response behavior，以及进入 private core 的 bridge contract。
- private core 负责 chat orchestration、prompt kernel、provider integration、personality composition 和更深层 context assembly policies。

迁移姿态：

- `backend/src/ai/bridge.js` 仍是进入 private core 的预期公开桥接点，未来应在 architecture-sensitive slice 中把它类型化为窄契约。
- 不要从 public repo mapping 中重新设计 private-core internals。

### 10. Validation、Tests 与 PMO Documentation

目标职责：

- 保留围绕 rules、API boundaries、stores、shared services、UI review surfaces 的 behavior-lock tests。
- PMO baselines 继续作为 truth records；只有运行时真相变化时才更新。
- execution_task/report state 保持 PMO runtime surfaces，而不是产品代码。

迁移姿态：

- TypeScript 应补充当前行为测试，而不是替代它们。
- 文档型 map 可以在 PMO closeout 后归档。

## 当前 JS 到目标架构映射

| 目标职责 | 当前 JS 模块/文件 | 迁移动作 | 理由 | 风险 / 依赖说明 |
| --- | --- | --- | --- | --- |
| 领域契约与 DTO | 当前隐含在 `frontend/src/features/**/*.api.js`、`frontend/src/services/tasks/task.rules.js`、`backend/src/models/*.js`、`backend/src/routes/requestValidation.js`、PMO baselines 中 | `replace` | 目标需要显式类型来表达 persisted models、API responses、editable inputs、AI DTOs，而不是让 shape assumptions 分散在 API/rules/validation docs 中。 | 不要把 Mongoose model shape 当作 public DTO shape。需要决定类型先放在本地 feature 附近，还是以后进入 shared package。 |
| 运行时 schema / 外部输入验证 | `backend/src/routes/requestValidation.js`、`backend/src/routes/*.js` 中的 route-level body/query checks、`backend/src/middleware/errorBoundary.js` | `replace` | 当前 ad hoc validators 在承担真实运行时保护；未来 schema guardrails 可能替换实现，而不是替换职责。 | 即使有 TS，runtime validation 也必须保留。schema-library choice 是未来 PMO slice。 |
| 共享 HTTP client / session transport | `frontend/src/services/apiClient.js` | `keep` | 集中 base URL、credentials、bearer fallback token storage 和 request transport。 | 类型应澄清 fetch options 与 error/result shapes；不要合并进 feature APIs。 |
| Auth feature API | `frontend/src/features/auth/auth.api.js` | `keep` | 当前用户、login/logout、tester registration、owner management calls 的持久 endpoint boundary。 | 未来 DTO 应区分 public auth routes 和 owner-only operations。 |
| Auth account store | `frontend/src/stores/auth.js` | `keep` | 负责 current-user/session state，以及 logout/account change 时重置 chat、cockpit signals、resource cache 等 account-scoped runtime state。 | account-boundary behavior 是持久边界；不要归为 no-type scaffolding 删除。 |
| Auth 和 owner UI | `frontend/src/views/LoginPage.vue`、`frontend/src/views/RegisterPage.vue`、`frontend/src/views/OwnerPage.vue`、`frontend/src/App.vue` | `defer` | SFC 负责 UI state、navigation、shell、owner management presentation 和 logout flow。 | 等 auth API/store contracts 稳定后再转换。 |
| 前端 router guard | `frontend/src/router/index.js` | `keep` | 负责 public/auth route metadata、owner-only route guard、current-user hydration 和 redirects。 | 持久 runtime boundary；route meta types 可以收紧，但不应吸收 auth store logic。 |
| Notes API | `frontend/src/features/notes/notes.api.js` | `keep` | note CRUD、pin/archive/restore、note AI task generation 的持久 transport boundary。 | typed responses 应区分 persisted Note 和 AI draft payloads。 |
| Notes rules | `frontend/src/features/notes/notes.rules.js` | `keep` | 负责 form validation、edit snapshots、AI state，以及 active/archived notes 的 allowed actions。 | 高价值 typed island；action derivation 是产品行为。 |
| Notes composable | `frontend/src/features/notes/useNotesFeature.js` | `keep` | 编排 note state、account-scoped cache、failed draft residue、API calls、AI draft save flow 和 refresh notifications。 | 持久 runtime/product boundary；draft/cache key rules 必须在 TS migration 后仍保留。 |
| Notes component/editor surface | `frontend/src/components/NotesPanel.vue`、`frontend/src/views/NotesPage.vue` | `split` | NotesPanel 混合 rendering、CodeMirror lifecycle、toast/menu local state 和 feature orchestration。 | SFC typing 暂缓。未来 split 可隔离 editor integration，但不能改变 note behavior。 |
| Projects API | `frontend/src/features/projects/projects.api.js` | `keep` | project CRUD、pin/archive/restore、next-action AI、focus update 的持久 transport boundary。 | focus update DTO 应明确 task-based focus。 |
| Projects rules | `frontend/src/features/projects/projects.rules.js` | `keep` | 负责 validation、task capture、preview buckets、archived branch separation、focus eligibility、focus title derivation。 | 高价值 typed island；focus/archive semantics 是 architecture-sensitive。 |
| Projects composable | `frontend/src/features/projects/useProjectsFeature.js` | `keep` | 编排 project state、project-card task cache、task capture、AI suggestion save flow 和 focus updates。 | 持久 runtime boundary；cross-feature task service dependency 应谨慎类型化。 |
| Projects component surface | `frontend/src/components/ProjectsPanel.vue`、`frontend/src/views/ProjectsPage.vue` | `split` | ProjectsPanel 在 feature orchestration 旁还拥有大量 UI-only preview/filter/menu/toast state。 | 未来可提取 preview UI state helpers；本 mapping 不改变 focus/archive behavior。 |
| 共享 task 前端契约 | `frontend/src/services/tasks/index.js`、`task.api.js`、`task.rules.js`、`task.runtime.js` | `keep` | 这是 canonical frontend shared task boundary，负责 payload construction、normalization、API calls、shared refs、active snapshots、mutation sync。 | `normalizeSavedTask` 在 API response DTO typed 后可能缩小，但 shared task service 本身是持久边界。 |
| Dashboard rules/composable | `frontend/src/features/dashboard/dashboard.rules.js`、`frontend/src/features/dashboard/useDashboardFeature.js`、`frontend/src/components/Dashboard.vue`、`frontend/src/views/DashboardPage.vue` | `keep` | Dashboard saved-task behavior 通过 shared task runtime 路由，并包含 completion/archive/delete、preview expansion、provenance display 等产品规则。 | Dashboard AI 仍为 parked；不要复活已移除的 fallback helper path。 |
| Chat API boundary | `frontend/src/features/chat/chat.api.js` | `keep` | 负责 `/ai/chat` request shape、runtime-control payload construction、last-user-message derivation、future slots 和 reply validation。 | 应与 public bridge DTO 对齐，但不能把 private-core internals 拉进 frontend。 |
| Chat rules/composable/store/UI | `frontend/src/features/chat/chat.rules.js`、`useChatFeature.js`、`frontend/src/stores/chat.js`、`frontend/src/components/Chat.vue` | `keep` | 负责 send gating、fallback reply choice、cockpit hydration decision、shell open/close state、messages 和 rendering behavior。 | 持久 public product behavior；assistant markdown 与 user plaintext rendering 应保持显式。 |
| Cockpit context bridge | `frontend/src/services/cockpitContextService.js`、`frontend/src/stores/cockpitSignals.js` | `keep` | 负责从 projects/tasks 推导 dashboard/chat context snapshot，并存储 transient signals。 | architecture-sensitive dashboard-to-chat contract；扩展前先类型化。 |
| Runtime controls store | `frontend/src/stores/runtimeControls.js` | `keep` | 负责 device-level AI behavior preferences 与 persistence。 | 应成为 typed enum/range boundary；runtime range checks 仍有价值。 |
| Resource cache | `frontend/src/services/resourceCache.js` | `keep` | 负责 Notes、Projects、project-card tasks、Dashboard saved tasks 的 account-scoped snapshot persistence。 | account scoping 是持久边界。serialization parsing 可类型化但不能删除。 |
| Markdown rendering helper | `frontend/src/utils/markdown.js` | `keep` | notes 与 assistant chat replies 共享的 sanitized markdown rendering。 | security/runtime sanitation boundary；TS 不替代 DOMPurify sanitization。 |
| UI primitive components | `frontend/src/components/ui/**` | `defer` | 行为较轻的 shared presentation primitives，主要承担 prop contracts。 | 等 app-level SFC typing patterns 确定后再转换。 |
| Backend server composition | `backend/src/server.js`、`backend/src/database.js`、`backend/src/routes/index.js` | `keep` | 负责 Koa app composition、CORS/body/auth/error middleware order、database startup、route aggregation。 | middleware order 是行为；类型变更不得重排。 |
| Backend auth/session/owner service | `backend/src/services/authService.js`、`backend/src/routes/authRoutes.js`、`backend/src/middleware/auth.js`、`backend/src/models/User.js`、`Invite.js`、`Session.js` | `keep` | 负责 phase-one auth、invite flow、owner bootstrap、legacy data assignment、sessions、owner operations、role/status model shape。 | security/account boundary；未来 DTO/schema types 应保守。 |
| Backend current-user ownership boundary | `backend/src/middleware/currentUser.js`、`backend/src/services/ownership.js` | `keep` | 负责 user id resolution 和 product services 使用的 owner-scoped query filters。 | 持久 account isolation boundary；永远不要当作 scaffolding。 |
| Backend Notes route/service/model | `backend/src/routes/notesRoutes.ts`、`backend/src/services/notesService.js`、`backend/src/models/Note.js` | `keep` | scoped note CRUD、pinning、archive/restore、note-origin task cascades 的持久 route/service/model 分离。 | service behavior 拥有 archive cascade semantics；route validation 未来可被替换。 |
| Backend Projects route/service/model | `backend/src/routes/projectsRoutes.ts`、`backend/src/services/projectsService.js`、`backend/src/models/Project.js` | `keep` | scoped project CRUD、status、focus task id、pinning、archive/restore、project-task cascades 的持久分离。 | focus/archive behavior 是 architecture-sensitive。 |
| Backend Tasks route/service/model | `backend/src/routes/tasksRoutes.js`、`backend/src/services/tasksService.js`、`backend/src/models/Task.js` | `keep` | scoped task reads/writes、provenance、lifecycle status、archive visibility、focus clearing 的持久分离。 | model/API response separation 很重要；task status/completed/archived typing 应显式。 |
| Backend task runtime helpers | `backend/src/services/taskRuntimeHelpers.js` | `split` | 负责 reusable archive filters、project-task relation filters、normalization、lifecycle derivation、focus clearing、archive/restore task cascades。 | 部分 normalizer 未来可 merge 到 DTO adapters，但 focus/cascade helpers 是行为承载且持久。 |
| Backend AI routes | `backend/src/routes/ai.js` | `split` | 当前负责 note/project AI routes、provider/fallback prompt construction、persisted ownership reloads、project focus context、chat route bridge invocation 和 route-local test exports。 | 只有在未来 AI/API boundary slice 中才拆分 route-local DTO/runtime validation 与 provider/fallback helpers；必须保留 fallbacks 和 ownership checks。 |
| Public/private AI bridge | `backend/src/ai/bridge.js`、`backend/private_core/sayachan-ai-core/**` boundary docs | `keep` | public bridge 是进入 private-core chat execution 的预期窄契约。 | architecture-sensitive；public mapping 可定义 contract shape，但不能定义 private-core implementation。 |
| Behavior-lock tests | `frontend/src/**/*.test.js`、`frontend/tests/ui-review/**/review.spec.js` | `keep` | 现有测试锁定 API boundaries、rules、stores、services、orchestration、markdown rendering 和 UI review surfaces。 | typecheck 应新增一道 gate，而不是替代这些 tests。 |
| PMO truth/runtime docs | `AGENT.md`、`docs/pmo/baselines/*.md`、`docs/pmo/state/execution_task.md`、`docs/pmo/state/execution_report.md`、discussion batch 018 | `keep` | PMO docs 承载 execution boundaries、current runtime truth 和 modernization rationale。 | 生成的 sprint artifacts 可由 PMO closeout 后归档。 |
| 本地重复 parseJsonResponse helpers | `frontend/src/features/auth/auth.api.js`、`notes.api.js`、`projects.api.js` | `merge` | 类似 response parsing 分散在多个 feature APIs 中，未来可能成为 shared typed API result helper。 | 只有在 error behavior 保持一致、tests 覆盖 endpoint-specific messages 时才合并。 |
| Backend route validation helper implementation | `backend/src/routes/requestValidation.js` | `replace` | 职责持久，但实现未来可能被与 DTO 对齐的 runtime schema declarations 替换。 | dependency/schema choice deferred；没有等价 runtime checks 前不能删除 current validation。 |
| Frontend shape normalizers | `frontend/src/services/tasks/task.rules.js` 的 `normalizeSavedTask`，以及只用于 backfill omitted fields 的 project/task preview derivation helpers | `merge` | 部分 defensive defaults 是为隐式 API response shape 补偿；typed DTOs 和 runtime schemas 存在后可能缩小。 | 不是删除批准：当前 normalizers 编码 compatibility behavior，且有测试覆盖。 |
| Backend `normalizeNote`、`normalizeProject`、`normalizeTask` helper pieces | `backend/src/services/taskRuntimeHelpers.js` | `merge` | 部分 normalization 可在 typed backend boundary 中移到 model-to-DTO adapters。 | lifecycle/focus/archive helpers 应与 pure DTO adapters 分开保留。 |
| 没有持久 package-boundary 意义的 barrel/index modules | `frontend/src/components/ui/**/index.js` 以及未来只重复 direct imports 的 barrels | `delete-candidate` | 如果 typed imports 和 IDE tooling 让 direct imports 更清晰，部分 barrels 可能不再需要。shared task package entrypoint 明确排除在外，因为 PMO 已批准它作为 canonical cross-feature import boundary。 | 只有确认不再有 public import boundary value，且没有 package/export pattern 依赖时才删除。不要在当前 shared task service decision 下把 `frontend/src/services/tasks/index.js` 归为 deletion candidate。 |
| 被未来 contracts 重复的纯解释性 shape docs | closeout 后选定的 PMO discussion 或 mapping notes | `delete-candidate` | 稳定 contracts 出现后，部分 planning notes 可归档，而不是作为 live truth 保留。 | PMO 负责归档；baselines 在 runtime truth 变化前仍是 canonical。 |

## 持久 Runtime / Product Boundaries

这些不应仅因为 TypeScript 能描述输入，就被折叠为 deletion candidates：

- `backend/src/ai/bridge.js` 与 public/private AI responsibility split。
- account/session/ownership boundaries：`frontend/src/stores/auth.js`、`frontend/src/services/resourceCache.js`、`backend/src/middleware/auth.js`、`backend/src/middleware/currentUser.js`、`backend/src/services/ownership.js`、`backend/src/services/authService.js`、auth models/routes。
- focus/task workflow semantics：project `currentFocusTaskId`、task provenance、active/completed/archived lifecycle、focus clearing。
- note/project/task services 与 backend task runtime helpers 中的 archive/restore cascades。
- dashboard-to-chat cockpit context：`frontend/src/services/cockpitContextService.js`、`frontend/src/stores/cockpitSignals.js`、chat context hydration rules。
- note tasks、project next action、chat 的 public AI routes 与 fallback behavior。
- sanitized markdown rendering，作为 runtime security/presentation boundary。
- behavior-lock tests 与 UI review surfaces。

## No-Type Scaffolding Candidates

这些只有在 typed contracts 和 behavior tests 证明替换安全后，才是未来简化候选：

- 分散在 feature `*.api.js` 模块中的重复 frontend API response parsing helpers。
- frontend task response normalization 中仅用于补偿缺失显式 API response contracts 的 defensive defaulting。
- 可迁移到显式 model-to-DTO adapters 的 backend normalization helpers。
- 如果 typed imports 稳定后不再代表有用 public module boundary 的部分 barrel `index.js` 文件。这不包括 `frontend/src/services/tasks/index.js`，它仍是已批准的 shared task service entrypoint。
- contracts 和 baselines 更新后可转为历史记录的 PMO planning artifacts。

这些不是当前删除目标：

- 带有产品决策的 rules modules
- 带 orchestration 或 side effects 的 composables
- route/service/model boundaries
- middleware 和 ownership helpers
- runtime validation
- public/private AI bridge files
- 拥有 UI interaction state、editor lifecycle、fallback behavior、archive/focus semantics 或 account-scoped persistence 的文件

## PMO 可路由后续建议

1. `Type-Aware JavaScript Baseline`: 在 root validation commands 稳定后，引入低噪声 type feedback，例如 `allowJs/checkJs/noEmit` 或等价方案。
2. `Runtime Schema And API Contract Guardrails`: 评估 auth、note/project/task mutations、AI route payloads、owner endpoints、API response adapters 的 runtime schema 方法。
3. `Frontend Typed Boundary Pilot`: 从一个 surface 的 pure rules 与 API DTOs 开始，Tasks 或 Chat 可能优先，因为它们暴露跨 surface contracts，且不要求先转换 SFC。
4. `Backend DTO / Service Boundary Pilot`: 为 Tasks 定义 model-to-DTO adapters 和 typed service inputs，覆盖 status/completed/archived 与 provenance contracts。
5. `Public AI Bridge Contract Slice`: 定义 public `/ai/chat` 与 bridge DTO contract，不重新设计 private-core internals。
6. `No-Type Scaffolding Follow-Up Audit`: 第一个 typed boundary 落地后，结合 tests 与 import graph evidence 重新评估 merge/delete candidates。
7. `Package Workspace Tooling Review`: 保持 deferred，直到 shared contract package 压力真实出现，或 root command consolidation 不够用。

## 验证说明

本文档通过只读审计验证，参照了：

- active sprint handoff 与 PMO state
- system、runtime、backend API、private-core boundary 等 PMO baselines
- architecture-sensitive area 与 documentation-sync policy guides
- frontend feature、service、store、router、component、view、utility、UI-review test file inventory
- backend route、service、model、middleware、server、database、AI bridge file inventory

未运行 runtime tests、browser validation、UI review、dependency installation，也未编辑 executable code。
