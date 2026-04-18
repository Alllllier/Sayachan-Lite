# PMO 系统基线

> 用来理解当前 PMO 系统现状的工作基线，不改变它现有的运行结构。

## 目的

这份文档是当前 PMO 系统的阅读锚点。

它主要帮助回答：

- 现在是谁在驱动 PMO 流转
- 哪些文件在承担 PMO 状态面
- discussion、planning、handoff、report 现在是怎么流动的
- PMO 里主要的依赖和隐性耦合点在哪里

## 非目标

这份文档不会：

- 重定义 PMO 规则
- 替代任何 canonical PMO 文件
- 移动任何正在运行的 PMO surface
- 变成新的 sprint 状态来源

## 计划结构

这份基线会分四轮补完：

1. 角色基线
2. 文件基线
3. 流转基线
4. 依赖基线

## 当前状态

目前这份文件先保持轻量。

下一步会继续从现有 PMO manual、workflow、state file、handoff file 和 skills 里补真实现状。

## 1. 角色基线

当前 PMO 系统是围绕三个明确角色组织起来的。

### Human

Human 是架构拥有者和优先级决策者。

当前职责：

- 提出主题或目标
- 从 sprint candidate 里选一个真正启动
- 批准或否决边界变更
- 处理长期结构性 tradeoff
- 批准超出当前 sprint 范围的扩张

### Codex

Codex 是 PMO 控制层。

当前职责：

- 把目标收敛成有边界的 sprint slice
- 维持架构边界意识
- 运行 discussion、promotion、sprint lifecycle 这几类 workflow
- 产出 PMO reply、handoff prompt、closeout summary
- 选择并调用 PMO 相关 skills
- 识别风险、技术债、文档缺口和 escalation 点
- 更新 PMO state 和 outbox surface

在当前 operating model 里，Codex 明确不是默认 implementation worker。

### Claude VS Code

Claude VS Code 是当前项目 operating model 里的 execution worker。

当前职责：

- 做有边界的实现
- 停留在批准过的 touch zone 内
- 验证实现结果
- 写结构化 execution report
- 遇到架构边界时升级而不是自行跨过去

Claude 不应该重新定义架构方向。

## 2. 文件基线

当前 PMO 系统采用的是 repo-native 的文件状态模型。

### 2.1 Canonical PMO 状态文件

这些文件构成了当前 PMO 的状态面：

- `docs/pmo/state/discussion_batches/index.md`
- `docs/pmo/state/discussion_batches/*.md`
- `docs/pmo/state/idea_backlog.md`
- `docs/pmo/state/sprint_candidates.md`
- `docs/pmo/state/current_sprint.md`
- `docs/pmo/state/decision_log.md`

它们在系统里的当前职责是：

- discussion batches 用来承接 pre-backlog 的聚类讨论
- `idea_backlog.md` 存放值得保留但还没 execution-ready 的工作
- `sprint_candidates.md` 存放有边界的 execution-ready 选项
- `current_sprint.md` 存放唯一一个当前激活的 sprint
- `decision_log.md` 存放 durable decision、defer 和 rejected path

### 2.2 Canonical Handoff 文件

这些文件构成了 execution handoff 回路：

- `docs/pmo/outbox/execution_task.md`
- `docs/pmo/outbox/archive/`
- `docs/pmo/inbox/execution_report.md`

它们在系统里的当前职责是：

- `execution_task.md` 是当前激活的 execution contract
- `outbox/archive/` 用来保存同一个 sprint 中被替换掉的旧 handoff 快照
- `execution_report.md` 是结构化 execution return surface

### 2.3 Canonical 规则文件

这些文件定义了 PMO 系统“应该怎么运作”：

- `docs/pmo/PMO_OPERATING_MANUAL.md`
- `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md`
- `docs/pmo/workflows/discussion-workflow.md`
- `docs/pmo/workflows/promotion-workflow.md`
- `docs/pmo/workflows/sprint-lifecycle-workflow.md`

它们在系统里的当前职责是：

- operating manual 承担稳定的 PMO 宪法角色
- handoff protocol 定义基于文件的 execution coordination
- workflow 文件定义各个阶段的操作顺序

### 2.4 当前写入分工

当前的写入分工是：

- Codex 写 PMO state surface 和 outbox surface
- Claude 写 inbox execution report
- Human 负责选择、批准以及边界敏感决策

### 2.5 当前 skill 依赖

这套 PMO 系统还依赖项目本地 `.codex/skills/` 下的 skills。

当前 PMO-facing 的 skills 是：

- `sprint-pmo`
- `execution-prompt-compiler`
- `model-router`

这些 skill 不只是参考材料。
它们会直接影响 Codex 如何读取 PMO state、如何编译 handoff，以及如何做任务路由。

## 3. 流转基线

当前 PMO 主路径可以先理解成一条五段式流转：

`discussion -> promotion -> sprint selection -> execution handoff -> closeout / next step`

这一部分先记录主路径，不急着展开所有例外分支。

### 3.1 Discussion 阶段

入口通常是 Human 提出一个主题、问题、bug 或机会点。

当前处理方式：

- Codex 先进入 `discussion-workflow`
- 讨论先落在 `docs/pmo/state/discussion_batches/` 下面
- batch 里可以做 theme clustering，也可以保留 `possible slices`
- discussion 阶段的目标不是立刻 execution-ready，而是把问题聚类、收敛、找出可行动方向

这一阶段的输出有三种可能：

- 进入 `idea_backlog.md`
- 进入 `sprint_candidates.md`
- 进入 `decision_log.md`

### 3.2 Promotion 阶段

当 discussion 结果足够稳定时，Codex 会进入 `promotion-workflow`。

当前判断逻辑大致是：

- 还值得保留，但还没 execution-ready -> `idea_backlog.md`
- 已经有边界、可以比较、可以启动 -> `sprint_candidates.md`
- 主要产物是规则、决策、defer、reject -> `decision_log.md`

这一步的关键作用是：

- 不让 discussion file 变成唯一 source of truth
- 把“讨论结果”变成正式 PMO 状态

### 3.3 Sprint Selection 阶段

当 `sprint_candidates.md` 里已经有 execution-ready 候选项时，Human 会从中选一个真正启动。

当前规则很明确：

- `sprint_candidates.md` 最多保留 3 个候选项
- 选中的候选项会被移入 `current_sprint.md`
- `current_sprint.md` 只承载一个当前激活的 sprint

换句话说：

- `sprint_candidates.md` 是“可选池”
- `current_sprint.md` 是“当前激活态”

### 3.4 Execution Handoff 阶段

当一个 sprint 被正式选中后，Codex 会进入 sprint lifecycle 和 execution handoff 回路。

当前主路径是：

1. Codex 更新 `current_sprint.md`
2. Codex 写 `docs/pmo/outbox/execution_task.md`
3. Human 指示当前 execution worker 从 outbox 开始执行
4. Execution worker 执行后写 `docs/pmo/inbox/execution_report.md`

这一段里几个文件的职责区分很重要：

- `current_sprint.md` 是轻量 PMO 状态卡
- `execution_task.md` 是真正的 execution contract
- `execution_report.md` 是 execution return surface

如果同一个 sprint 中需要 follow-up handoff：

- 旧的 outbox 会先进入 `docs/pmo/outbox/archive/`
- 当前 `execution_task.md` 会被覆盖成新的 active slice

如果当前没有 active sprint handoff：

- `execution_task.md` 不会被删除
- 它会保持一个 `idle placeholder` 状态

### 3.5 Closeout 与下一步阶段

Execution worker 回写 `execution_report.md` 之后，Codex 会读取报告并决定：

- sprint 是否 ready for closeout
- 是否还需要补验证
- 是否需要 follow-up handoff
- 是否应该进入 commit
- 下一个最合理的 sprint 是什么

这里有一个当前系统里非常重要的规则：

- `closeout` 和 `commit` 不是一回事

也就是说：

- 一个 sprint 可以已经交付并验证
- 但 git commit 仍然还没发生
- `current_sprint.md` 里需要明确写出这种状态，而不是默认“close = committed”

### 3.6 当前实例状态

以当前仓库的现状来看：

- `current_sprint.md` 里的当前 sprint 是 `Chat Markdown Render v1`
- 它的状态是 `closed`
- `execution_task.md` 当前是 `idle`
- `execution_report.md` 对应的是上一轮已完成 sprint 的报告
- `sprint_candidates.md` 里当前主候选项是 `Notes Editor Polish v1`
- `idea_backlog.md` 里当前还保留着 exploration-stage 的架构项 `Owner-Led Auth And Invite-Gated Tester Accounts`

这说明当前系统处在：

- 上一个 sprint 已经完成并 closeout
- 当前没有 active handoff
- 下一个 sprint 还未由 Human 正式选中

的过渡状态。

## 4. 依赖基线

当前 PMO 系统的复杂度不只来自文件数量，更来自多层依赖叠在一起。

这一部分先区分两类依赖：

- 显式依赖：文档里直接写出来、能从引用关系看到的依赖
- 隐式耦合：没有写成严格 contract，但实际上系统已经在依赖它

### 4.1 显式依赖

当前比较明确的显式依赖主要有四层。

#### A. Manual -> Workflow

`docs/pmo/PMO_OPERATING_MANUAL.md` 明确把这些文件当成阶段入口：

- `docs/pmo/workflows/discussion-workflow.md`
- `docs/pmo/workflows/promotion-workflow.md`
- `docs/pmo/workflows/sprint-lifecycle-workflow.md`
- `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md`

也就是说：

- operating manual 自己不承担全部细节
- 它把顺序和阶段细节下放给 workflow 和 protocol

#### B. Workflow -> State / Handoff Files

workflow 文件本身又显式依赖一组 canonical state file：

- discussion workflow 依赖 `discussion_batches/index.md` 和 batch 文件
- promotion workflow 依赖 `idea_backlog.md`、`sprint_candidates.md`、`decision_log.md`
- sprint lifecycle workflow 依赖 `sprint_candidates.md`、`current_sprint.md`、`execution_task.md`、`execution_report.md`
- handoff protocol 依赖完整的 `state/`、`outbox/`、`inbox/` 文件组

也就是说，workflow 并不是抽象流程图，它们默认这些 repo-native 文件是真实存在的。

#### C. Skill -> PMO Files

当前 `.codex/skills/` 下的 PMO-facing skills 也显式依赖 PMO 文件：

- `sprint-pmo` 直接读取 `current_sprint.md`、`execution_task.md`、`sprint_candidates.md`、`idea_backlog.md`、`execution_report.md`
- `execution-prompt-compiler` 直接假设 `execution_task.md` 和 `execution_report.md` 是 handoff loop 的主要文件
- `model-router` 直接依赖 `docs/ai-ops/policies/model-routing-policy.md`

这意味着 skill 并不是纯工具层，它们已经参与了 PMO 控制面。

#### D. Documentation Sync -> PMO / Skill / Architecture Files

`docs/guides/documentation-sync.md` 又把 PMO、AI-ops、skills、architecture docs 绑成了一张同步网。

它明确要求在这些区域变化时回看相关文件：

- `docs/pmo/**`
- `docs/ai-ops/**`
- `.codex/skills/sprint-pmo/**`
- `.codex/skills/execution-prompt-compiler/**`
- `docs/architecture/**`
- `docs/guides/**`

也就是说，这套系统里“文档同步”本身也是控制规则的一部分，而不是纯提醒。

### 4.2 隐式耦合

真正让 PMO 体系不容易拆开的，更多是这些隐式耦合。

#### A. 路径语义耦合

虽然很多地方没有写成“系统 contract”，但当前语义已经默认绑定在这些路径上：

- `current_sprint.md` = 当前激活 sprint
- `execution_task.md` = 当前 active execution contract
- `execution_report.md` = 当前 execution return surface
- `discussion_batches/` = discussion 阶段的聚类面

这些文件如果改名、换位置、拆结构，就不只是文档变动，而是会影响 PMO 的操作习惯和 skill 读取方式。

#### B. 角色语义耦合

当前系统不只是“三个角色都存在”，而是很多规则都默认：

- Codex 负责 state / outbox / PMO synthesis
- Claude 负责 execution / inbox
- Human 负责 selection 和 boundary approval

这意味着很多文件里的 wording、handoff 方式、report 结构，其实都隐式绑定在这个角色分工上。

#### C. 轻状态卡 vs 重执行合同耦合

系统里已经形成了一个很重要的分工：

- `current_sprint.md` 是轻量状态卡
- `execution_task.md` 是重执行合同

这不是单个文件里一句话的事，而是整个 handoff 回路都按这个分工在工作。
如果把两者合并，或者让其中一个失去存在感，就会影响 PMO 的清晰度。

#### D. Closeout 与 Commit 分离耦合

当前 PMO 体系里已经明确形成一个习惯：

- sprint closeout 不等于 git commit

这意味着：

- `current_sprint.md`
- `execution_report.md`
- PMO summary

这些内容都默认在表达“交付状态”和“仓库提交状态”是两条线。
这是一个非常容易在重构时被误伤的隐性规则。

#### E. Public / Private Core 边界耦合

PMO 系统不仅管任务推进，还把 public/private core 的架构边界嵌进了 escalation 逻辑里。

也就是说：

- workflow 在依赖 boundary rule
- handoff protocol 在依赖 boundary rule
- skill compile 也在依赖 boundary rule

所以它不是一个“脱离架构现实的 PMO 层”，而是和架构边界深度耦合的 PMO 层。

### 4.3 当前的脆弱点

如果从“容易出严重后果的地方”来理解，当前最脆弱的不是单个文件，而是这些耦合组合：

- workflow 和 canonical state path 的耦合
- skill 和 PMO 文件路径的耦合
- handoff protocol 和 outbox/inbox 语义的耦合
- PMO 流程和 public/private core boundary 的耦合
- documentation sync 和多套治理文件的耦合

这也是为什么现在如果对 PMO 结构理解还不完全，就不适合贸然做大规模抽离。

### 4.4 当前结论

到目前为止，可以先把当前 PMO 理解成：

- 一套 repo-native 的状态机
- 一套以 Codex 为控制层的文件驱动流程
- 一套和 execution worker、architecture boundary、documentation sync 紧密耦合的运行系统

它不是一组松散文档，而是一个已经在工作的轻量控制面。
