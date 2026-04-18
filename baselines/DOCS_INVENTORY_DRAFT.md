# Docs Inventory Draft

> 这是自动生成的初稿，用来减少清点体力活，不替代人工判断。

## 使用说明

- `candidate label` 是脚本给出的候选主标签，不是最终裁决。
- `mixed risk` 表示这份文档内部可能存在多种语义层的概率。
- `reason hints` 只展示少量启发式依据，方便人工快速复核。

## 文档清单

| path | title | candidate label | mixed risk | sections | reason hints |
| --- | --- | --- | --- | ---: | --- |
| `docs/ai-ops/architecture/ai-development-system.md` | AI Development System | `contract` | `medium` | 4 | 位于 architecture，通常偏代码真相或边界规则；位于 architecture，通常也承担现状盘点；正文多次出现 canonical |
| `docs/ai-ops/architecture/public-private-development-model.md` | Public Private Development Model | `baseline` | `low` | 5 | 位于 architecture，通常偏代码真相或边界规则；位于 architecture，通常也承担现状盘点；正文多次出现 baseline |
| `docs/ai-ops/history/claude-to-codex-pmo-migration.md` | Claude To Codex PMO Migration | `history` | `medium` | 3 | 文件名包含 history 或 record；正文多次出现 canonical；正文多次出现 guide |
| `docs/ai-ops/policies/model-routing-policy.md` | Model Routing Policy | `history` | `medium` | 6 | 正文包含 default rule；正文多次出现 migration；正文包含 draft |
| `docs/ai-ops/policies/skill-growth-policy.md` | Skill Growth Policy | `contract` | `high` | 5 | 正文包含 must；正文包含 checklist |
| `docs/ai-ops/README.md` | AI Ops | `history` | `low` | 2 | README 往往承担入口说明；正文多次出现 migration；正文包含 record |
| `docs/ai-ops/workflows/codex-claude-development-loop.md` | Codex Claude Development Loop | `history` | `high` | 2 | 正文多次出现 canonical；正文包含 record；正文包含 plan |
| `docs/architecture/backend-api.md` | Backend API Baseline | `baseline` | `medium` | 12 | 位于 architecture，通常偏代码真相或边界规则；位于 architecture，通常也承担现状盘点；正文多次出现 canonical |
| `docs/architecture/private-core-boundary.md` | Private Core Boundary | `baseline` | `high` | 8 | 位于 architecture，通常偏代码真相或边界规则；位于 architecture，通常也承担现状盘点；正文包含 current shape |
| `docs/architecture/README.md` | Architecture Docs | `baseline` | `high` | 2 | README 往往承担入口说明；正文多次出现 canonical；正文包含 current system |
| `docs/architecture/roadmap.md` | Roadmap Baseline | `baseline` | `medium` | 9 | 位于 architecture，通常偏代码真相或边界规则；位于 architecture，通常也承担现状盘点；正文多次出现 canonical |
| `docs/architecture/runtime-workflow.md` | Runtime Workflow | `working note` | `high` | 14 | 位于 architecture，通常偏代码真相或边界规则；位于 architecture，通常也承担现状盘点；正文多次出现 canonical |
| `docs/architecture/system-baseline.md` | System Baseline | `baseline` | `medium` | 11 | 位于 architecture，通常偏代码真相或边界规则；位于 architecture，通常也承担现状盘点；文件名直接表明 baseline |
| `docs/guides/development-constraints.md` | Development Constraints | `guide` | `medium` | 13 | 位于 guides，通常偏操作说明；正文包含 must；正文多次出现 baseline |
| `docs/guides/documentation-sync.md` | Documentation Sync | `guide` | `medium` | 9 | 位于 guides，通常偏操作说明；正文多次出现 canonical；正文多次出现 baseline |
| `docs/guides/testing-and-ui-review.md` | Testing And UI Review | `guide` | `low` | 8 | 位于 guides，通常偏操作说明；正文包含 default rule；正文包含 purpose |
| `docs/migration/ai-core-migration-record.md` | AI Core Migration Record | `history` | `low` | 6 | 目录位于 migration，强烈偏向历史记录；文件名包含 history 或 record；正文多次出现 canonical |
| `docs/pmo/EXECUTION_HANDOFF_PROTOCOL.md` | Execution Handoff Protocol | `contract` | `medium` | 10 | 正文多次出现 canonical；正文包含 default rule；正文包含 must |
| `docs/pmo/inbox/execution_report.md` | Execution Report — Chat Markdown Render v1 | `contract` | `low` | 9 | 位于 PMO 运行面路径，强烈偏 contract |
| `docs/pmo/outbox/archive/chat-markdown-render-v1-validation-followup.md` | Execution Task Outbox | `contract` | `medium` | 9 | 位于 PMO 运行面路径，强烈偏 contract；正文包含 execution task；正文包含 record |
| `docs/pmo/outbox/archive/chat-markdown-render-v1.md` | Execution Task Outbox | `contract` | `low` | 9 | 位于 PMO 运行面路径，强烈偏 contract；正文包含 must；正文包含 execution task |
| `docs/pmo/outbox/execution_task.md` | Execution Task Outbox | `contract` | `low` | 2 | 位于 PMO 运行面路径，强烈偏 contract；正文包含 execution task |
| `docs/pmo/PMO_OPERATING_MANUAL.md` | Sayachan PMO Operating Manual | `contract` | `medium` | 17 | 正文多次出现 canonical；正文包含 default rule；正文包含 must |
| `docs/pmo/state/current_sprint.md` | Current Sprint State | `contract` | `low` | 4 | 位于 PMO 运行面路径，强烈偏 contract；正文包含 current sprint |
| `docs/pmo/state/decision_log.md` | PMO Decision Log | `contract` | `medium` | 4 | 位于 PMO 运行面路径，强烈偏 contract；正文包含 usage rule；正文包含 record |
| `docs/pmo/state/discussion_batches/discussion_batch_001.md` | Discussion Batch 001 | `contract` | `medium` | 13 | 位于 PMO 运行面路径，强烈偏 contract；正文多次出现 canonical；正文包含 record |
| `docs/pmo/state/discussion_batches/index.md` | Discussion Batches | `contract` | `low` | 5 | 位于 PMO 运行面路径，强烈偏 contract；正文多次出现 canonical；正文包含 usage rule |
| `docs/pmo/state/idea_backlog.md` | PMO Idea Backlog | `contract` | `medium` | 5 | 位于 PMO 运行面路径，强烈偏 contract；正文包含 current status；正文包含 usage rule |
| `docs/pmo/state/sprint_candidates.md` | Sprint Candidates | `contract` | `low` | 5 | 位于 PMO 运行面路径，强烈偏 contract；正文包含 usage rule |
| `docs/pmo/workflows/discussion-workflow.md` | PMO Discussion Workflow | `contract` | `medium` | 8 | 位于 PMO workflow 路径，偏运行规则；workflow 也带有操作说明属性；正文多次出现 canonical |
| `docs/pmo/workflows/promotion-workflow.md` | PMO Promotion Workflow | `contract` | `medium` | 9 | 位于 PMO workflow 路径，偏运行规则；workflow 也带有操作说明属性；正文多次出现 canonical |
| `docs/pmo/workflows/sprint-lifecycle-workflow.md` | PMO Sprint Lifecycle Workflow | `contract` | `medium` | 8 | 位于 PMO workflow 路径，偏运行规则；workflow 也带有操作说明属性；正文多次出现 canonical |
| `docs/README.md` | Docs Map | `guide` | `medium` | 7 | README 往往承担入口说明；正文多次出现 baseline；正文多次出现 guide |

## 下一步建议

1. 先按 `mixed risk = high` 的文件优先人工复核。
2. 再看 `candidate label` 和目录语义是否明显冲突。
3. 最后再判断是否需要 section-level 拆分或重写。
