# AI Core Migration Record

**迁移日期**: 2026-04-15
**迁移目标**: 将 `backend/src/ai` 整体迁移至私有 Git submodule
**私有仓库**: `git@github.com:Alllllier/sayachan-ai-core.git`

## 迁移前文件树快照

```
adaptor/index.js
adaptor/kimi.js
context/context-builder.js
context/index.js
context/sources/dashboard-snapshot.js
context/sources/session-window.js
index.js
orchestration/chat-service.js
personality/core.js
personality/index.js
```

## 迁移后架构

- `backend/src/ai/bridge.js` — 主仓库唯一 public AI 入口
- `backend/private_core/sayachan-ai-core/` — Git submodule (private)

## Bridge 导出约定

当前仅导出 `chat`，`buildSystemPrompt` 暂由 private core 内部自闭环使用。
未来若需在主仓库运行 regression test，可扩展 bridge 导出。
