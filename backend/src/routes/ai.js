const Router = require('@koa/router');
const { chat: runChat } = require('../ai');

const router = new Router();

// Fallback response when API key is missing or request fails
function fallback(note, project, type) {
  if (type === 'note') {
    const title = note?.title || '(无标题)';
    return {
      drafts: [
        `基于 "${title}" 的下一步`,
        `整理 "${title}" 的关键点`
      ]
    };
  }

  if (type === 'project') {
    const status = project?.status || 'unknown';
    const statusMap = {
      pending: ['明确里程碑并设定截止日期', '梳理项目依赖关系'],
      in_progress: ['检查当前进度并更新阻塞项', '协调相关资源推进任务'],
      completed: ['记录项目成果并归档', '总结经验教训'],
      on_hold: ['重新评估依赖和时间线', '确定是否需要重启项目']
    };
    return {
      suggestions: statusMap[status] || ['明确里程碑并设定截止日期']
    };
  }

  return {};
}

// POST /ai/notes/tasks - Generate tasks from a note
router.post('/ai/notes/tasks', async (ctx) => {
  const note = ctx.request.body;
  const API_KEY = process.env.GLM_API_KEY;

  // Fallback: API key missing
  if (!API_KEY) {
    console.warn('[AI Route] GLM_API_KEY not found, using fallback');
    ctx.body = fallback(note, null, 'note');
    return;
  }

  const title = note?.title || '(无标题)';
  const content = (note?.content || '').slice(0, 300);

  const promptText = `始终使用简体中文输出。

基于以下笔记内容，生成 1~2 条可直接执行的 task draft：
笔记标题：${title}
笔记内容：${content}

要求：
- 每条 task 必须可直接保存为 Task.title
- 不带编号
- 不带解释文本
- 简体中文，动作导向
- 适合从这条 note 延伸的任务
- 与 note 相关或基于 note 内容扩展

用换行分隔 1~2 条 task，每条一行。`;

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4.5-air',
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 60,
        temperature: 0.3,
        thinking: { type: 'disabled' },
        stream: false
      })
    });

    if (!response.ok) {
      console.error('[AI Route] Note Tasks API request failed:', response.status);
      ctx.body = fallback(note, null, 'note');
      return;
    }

    const data = await response.json();
    let tasksText = '';
    const messageContent = data?.choices?.[0]?.message?.content;

    if (typeof messageContent === 'string') {
      tasksText = messageContent.trim();
    } else if (Array.isArray(messageContent)) {
      const textItem = messageContent.find(item => item?.type === 'text');
      tasksText = textItem?.text?.trim() || '';
    }

    if (!tasksText) {
      console.error('[AI Route] Note Tasks invalid API response');
      ctx.body = fallback(note, null, 'note');
      return;
    }

    const tasks = tasksText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 2);

    console.log('[AI Route] GLM note tasks generated');
    ctx.body = { drafts: tasks };

  } catch (error) {
    console.error('[AI Route] Note Tasks API call error:', error.message);
    ctx.body = fallback(note, null, 'note');
  }
});

// POST /ai/projects/next-action - Suggest next action for a project
router.post('/ai/projects/next-action', async (ctx) => {
  const project = ctx.request.body;
  const API_KEY = process.env.GLM_API_KEY;

  // Fallback: API key missing
  if (!API_KEY) {
    console.warn('[AI Route] GLM_API_KEY not found, using fallback');
    ctx.body = fallback(null, project, 'project');
    return;
  }

  const name = project?.name || '(无项目名)';
  const summary = project?.summary || '(无描述)';
  const status = project?.status || 'unknown';
  const nextAction = project?.nextAction || '(无)';
  // Derive last completed from focusHistory instead of deprecated lastCompletedAction field
  const lastCompletedAction = project?.focusHistory?.slice(-1)[0] || '(无)';

  // Take recent 3 items from focusHistory (most recent first)
  const recentHistory = project?.focusHistory && Array.isArray(project.focusHistory)
    ? project.focusHistory.slice(-3).reverse().join(' → ')
    : '(无)';

  const promptText = `始终使用简体中文输出。

基于以下项目信息，给出 1-2 条值得推进的下一步建议：
项目名称：${name}
项目描述：${summary}
当前状态：${status}
当前下一步：${nextAction}
最近完成：${lastCompletedAction}
推进轨迹：${recentHistory}

要求：
- 每条建议必须是具体可执行的动作
- 简短精炼，适合作为 task 标题
- 用换行分隔，每条一行
- 不带编号
- 不带解释文本
- 针对"推进"而非"总结"
- 基于推进轨迹继续向前，避免重复已完成的内容
- 如果有推进轨迹，理解整体方向后再建议下一步

输出 1-2 条建议：`;

  try {
    const response = await fetch('https://open.bigmodel.cn/api/paas/v4/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${API_KEY}`
      },
      body: JSON.stringify({
        model: 'glm-4.5-air',
        messages: [{ role: 'user', content: promptText }],
        max_tokens: 80,
        temperature: 0.3,
        thinking: { type: 'disabled' },
        stream: false
      })
    });

    if (!response.ok) {
      console.error('[AI Route] Next Action API request failed:', response.status);
      ctx.body = fallback(null, project, 'project');
      return;
    }

    const data = await response.json();
    let suggestionsText = '';
    const messageContent = data?.choices?.[0]?.message?.content;

    if (typeof messageContent === 'string') {
      suggestionsText = messageContent.trim();
    } else if (Array.isArray(messageContent)) {
      const textItem = messageContent.find(item => item?.type === 'text');
      suggestionsText = textItem?.text?.trim() || '';
    }

    if (!suggestionsText) {
      console.error('[AI Route] Next Action invalid API response');
      ctx.body = fallback(null, project, 'project');
      return;
    }

    const suggestions = suggestionsText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[0-9]+[.、]\s*/, ''))
      .filter(line => line.length > 0)
      .slice(0, 2);

    console.log('[AI Route] GLM next action suggestions generated');
    ctx.body = { suggestions };

  } catch (error) {
    console.error('[AI Route] Next Action API call error:', error.message);
    ctx.body = fallback(null, project, 'project');
  }
});

// POST /ai/chat - Orchestrated chat entry for AI substrate v0.1
router.post('/ai/chat', async (ctx) => {
  const { messages, context } = ctx.request.body;

  const KIMI_KEY = process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY;
  if (!KIMI_KEY) {
    console.warn('[AI Route] KIMI_API_KEY not found, using fallback');
    ctx.body = { reply: '我在这，我们先把当前最重要的一步理清楚。' };
    return;
  }

  try {
    // TODO: extract options (e.g. thinkingEnabled) from request body when strategy is ready
    const { reply } = await runChat(messages, context);
    console.log('[AI Route] Kimi chat reply generated, length:', reply?.length);
    ctx.body = { reply };
  } catch (error) {
    console.error('[AI Route] Chat service error:', error.message || error);
    console.error('[AI Route] Stack:', error.stack || 'no stack');
    ctx.body = { reply: '我在这，我们先把当前最重要的一步理清楚。' };
  }
});

module.exports = router;
