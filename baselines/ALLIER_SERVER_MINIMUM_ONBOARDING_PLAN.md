# `allier-server` 最小接入实施计划

> 这份文档回答的是：
> 如果拿 `allier-server` 做新版 PMO 的第一轮接入测试，
> 最小应该怎么接。
>
> 目标不是把它一口气接成成熟 PMO 项目，
> 而是跑通一条 minimum viable onboarding 主路径。

## 1. 接入目标

这一轮只验证三件事：

- 新版 PMO 能否挂到一个轻量 Node API 项目上
- 最小 state / protocol / adapter 是否足够
- candidate -> sprint -> execution -> report -> closeout 能否闭环

明确不追求：

- 一步到位的成熟 discussion batch
- 一步到位的成熟 validation profile
- 一步到位的完整 truth docs 体系

## 2. 第一轮建议新建的目录

建议在项目里新建：

- `ops/pmo/state/`
- `ops/pmo/outbox/`
- `ops/pmo/inbox/`
- `ops/baselines/`

判断：

- 这比照抄 Sayachan 的 `docs/pmo/**` 更轻
- 也更适合一个轻量后端服务项目

## 3. 第一轮建议落地的最小文件

### PMO state

- `ops/pmo/state/current_sprint.md`
- `ops/pmo/state/sprint_candidates.md`
- `ops/pmo/state/idea_backlog.md`
- `ops/pmo/state/decision_log.md`

### execution surface

- `ops/pmo/outbox/execution_task.md`
- `ops/pmo/inbox/execution_report.md`

### baseline surface

- `ops/baselines/system_baseline.md`
- `ops/baselines/api_contracts.md`
- `ops/baselines/roadmap_and_debt.md`

## 4. 第一轮明确不做的事

这一轮先不做：

- `discussion_batches_index`
- `active_discussion_batch`
- 成熟 validation floor
- documentation sync policy 的项目实例化
- 复杂 host integration 资产

原因：

- 这些都属于成熟增强能力
- 现在先验证 minimum viable onboarding 更重要

## 5. 第一轮最小接入顺序

### 第一步：落 adapter

先把项目 adapter 落下来。

这一步的目标是：

- 让 PMO core 能理解这个项目的路径、truth surface 和边界

### 第二步：落最小 state surface

先建：

- `current_sprint`
- `sprint_candidates`
- `idea_backlog`
- `decision_log`
- `execution_task`
- `execution_report`

这一步的目标是：

- 让 PMO 有地方真正落状态

### 第三步：补最轻 baseline

不用一步写很全，只要先补够：

- system baseline
- API / contract baseline
- roadmap / debt surface

这一步的目标是：

- 让项目至少有最小 truth surface

### 第四步：做一个最小 candidate

先不要挑太复杂的事项。
应该选一个：

- bounded
- 风险低
- 改动面小
- 能写出 execution report

的事项作为第一轮测试 sprint。

### 第五步：跑通一轮闭环

至少要跑通：

- candidate 写入
- human select
- current sprint 激活
- execution task 写出
- execution report 写回
- closeout 判断

## 6. 第一轮 candidate 应该长什么样

最适合作为第一轮测试 candidate 的任务应该满足：

- 不涉及 auth 重设计
- 不涉及 MongoDB schema 迁移
- 不涉及 upload 流程的大改
- 不涉及部署体系
- 最好只是一个 bounded route / controller / validation / TODO 清理类切片

也就是说：

- 用一个足够小的真实任务来测试 PMO 接入
- 不要让业务复杂度掩盖 PMO 接入问题

## 7. 第一轮成功标准

如果第一轮测试成功，至少应能回答：

- adapter 是否够用
- 最小 state surface 是否够用
- 不依赖 discussion batch 能不能先跑起来
- decision log 是否开始有实际写入时机
- execution report 模板是否适合非 Web 项目

## 8. 一句话结论

`allier-server` 的第一轮接入，不应该追求“装完整套 PMO”，
而应该追求：

- 用最轻的 `ops/pmo/` + `ops/baselines/`
- 跑通一次最小闭环
