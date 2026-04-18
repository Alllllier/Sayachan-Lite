# Sayachan PMO Refactor

这个目录只服务于 `Sayachan` 当前 PMO 的清晰化与稳定化。

## 目标

- 不继续把当前工作推进成通用 PMO 产品化工程。
- 利用前面已经沉淀出来的分层模型，回头整理 `Sayachan` 自己的 PMO。
- 把旧 PMO 中已经成熟的骨架保留下来。
- 识别并处理混层、重复、描述性过重、缺少 contract 的部分。

## 不做什么

- 不在这里继续推进跨项目通用 `pmo-system`。
- 不把宿主无关化、skill 产品化、submodule 接入体验当成当前主目标。
- 不直接重写整个 `docs/` 目录树。

## 这次重构的工作方式

这次重构主要依赖两类现有材料：

1. `baselines/` 中已经完成的判断层
   - 旧文档分类
   - docs 盘点
   - PMO 分层模型
   - 旧系统评估
2. 当前 `docs/pmo/`、`docs/architecture/`、`docs/guides/` 中的真实运行文档

## 当前下一步

当前最值得做的是：

- 把 `Sayachan` 现有 PMO 关键文件映射到新的分层骨架：
  - `Runtime State`
  - `Protocol`
  - `Policy`
  - `Baseline / Truth`
  - `History / Knowledge`

这张映射表会作为后续整理的施工底图。

## 迁移原则备忘

- 这次优先走“并行替换”，不直接在旧 PMO 上修补。
- 旧 PMO 后续更适合整体迁到 `legacy` 区，而不是继续保留在活跃 canonical 路径里。
- 这样做的主要目的不是删除历史，而是减少 `Codex` 在搜索、读取、skills 入口中被旧 PMO 干扰。
- 旧 PMO 的具体迁移路径和切换时机，后面再单独决定；当前先专注于新 PMO 建设。

## AI-Ops 备忘

- `ai-ops` 当初的定位是承接这套 PMO / 协作系统的演化历史和知识资产。
- 当前真正缺的不是目录，而是从 PMO runtime 到 `ai-ops` 的同步链条。
- 这导致很多运行中产生的重要经验，只被局部吸收到 workflow / state / protocol 中，没有稳定进入知识资产层。
- 这个问题后面要单独处理；当前先不扩 `ai-ops`，先完成新 PMO 和 skills 的切换准备。

## Discussion 节奏观察

- 真实对话验证表明，`PMO v2` 当前的 discussion 承接已经有足够的结构感，但节奏比旧 `discussion_batch_001` 更快、更偏任务收敛。
- 旧讨论机制的一个重要有效能力，不只是 `theme -> slice -> candidate` 这条结构链，还包括“先记录、先展开、让 theme 和 slices 慢慢长出来”的低压节奏。
- 后续如果新 PMO 的 discussion 持续显得过于着急收敛，应优先在 `discussion-workflow` 或宿主行为层补这条“record first, shape gently”的规则，而不是继续压缩讨论阶段。
- 另一条尚未继承完整的旧能力是“边讨论边回写 batch”。当前宿主已经会按 discussion 语气推进，但还更依赖对话上下文记忆，而不是在形成稳定判断时及时把 `current focus`、`key judgment`、`open questions`、`possible slices` 写回 discussion batch。
- 后续如果继续调优 discussion 体验，应把 `discussion writeback habit` 当成单独问题处理：不是聊完再总结，而是在稳定结论出现时持续沉淀回 batch。
