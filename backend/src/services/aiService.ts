import { type ObjectId, optionalObjectId } from '../middleware/objectIdParsing';
import type {
  AiChatDto,
  AiResourcePayloadDto
} from '../routes/schemas/ai';

const { chat: runChat } = require('../ai/bridge') as typeof import('../ai/bridge');
const Note = require('../models/Note') as typeof import('../models/Note');
const Project = require('../models/Project') as typeof import('../models/Project');
const Task = require('../models/Task') as typeof import('../models/Task');

type AiPayload = {
  _id?: unknown;
  id?: unknown;
  title?: string;
  content?: string;
  name?: string;
  summary?: string;
  status?: string;
  currentFocusTaskId?: unknown;
  toObject?: () => AiPayload;
};

type AiMessageContent = string | Array<{ type?: unknown; text?: unknown }>;

type AiCompletionResponse = {
  choices?: Array<{
    message?: {
      content?: AiMessageContent;
    };
  }>;
};

type AiBodyResult<TBody> = {
  found: true;
  body: TBody;
};

type AiNotFoundResult = {
  found: false;
};

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function errorStack(error: unknown): string | undefined {
  return error instanceof Error ? error.stack : undefined;
}

function textFromMessageContent(messageContent: AiMessageContent | undefined): string {
  if (typeof messageContent === 'string') {
    return messageContent.trim();
  }

  if (Array.isArray(messageContent)) {
    const textItem = messageContent.find(item => item?.type === 'text');
    return typeof textItem?.text === 'string' ? textItem.text.trim() : '';
  }

  return '';
}

// Phase 3: task-based focus only
async function getProjectFocusContext(project: AiPayload | null | undefined, userId: ObjectId): Promise<string> {
  if (project?.currentFocusTaskId && userId) {
    try {
      const focusTask = await Task.findOne({ _id: project.currentFocusTaskId, userId });
      if (focusTask?.title?.trim()) {
        return focusTask.title.trim();
      }
    } catch (error: unknown) {
      console.error('[AI Route] Failed to resolve focus task:', errorMessage(error));
    }
  }
  return '';
}

// Fallback response when API key is missing or request fails
function noteTaskFallback(note: AiPayload | null): { drafts: string[] } {
  const title = note?.title || '(无标题)';
  return {
    drafts: [
      `基于 "${title}" 的下一步`,
      `整理 "${title}" 的关键点`
    ]
  };
}

function projectNextActionFallback(project: AiPayload | null): { suggestions: string[] } {
  const status = project?.status || 'unknown';
  const statusMap = {
    pending: ['明确里程碑并设定截止日期', '梳理项目依赖关系'],
    in_progress: ['检查当前进度并更新阻塞项', '协调相关资源推进任务'],
    completed: ['记录项目成果并归档', '总结经验教训'],
    on_hold: ['重新评估依赖和时间线', '确定是否需要重启项目']
  };
  return {
    suggestions: statusMap[status as keyof typeof statusMap] || ['明确里程碑并设定截止日期']
  };
}

function chatFallback() {
  return { reply: '我在这，我们先把当前最重要的一步理清楚。' };
}

function getPayloadId(payload: AiPayload | null | undefined): unknown {
  return payload?._id || payload?.id || null;
}

function normalizeDoc(doc: AiPayload | null): AiPayload | null {
  return doc?.toObject ? doc.toObject() : doc;
}

async function resolveOwnedNotePayload(payload: AiPayload | null | undefined, userId: ObjectId): Promise<AiPayload | null> {
  const noteId = optionalObjectId(getPayloadId(payload), 'request.body._id');
  if (!noteId) {
    return payload || {};
  }

  const note = await Note.findOne({ _id: noteId, userId });

  return normalizeDoc(note);
}

async function resolveOwnedProjectPayload(payload: AiPayload | null | undefined, userId: ObjectId): Promise<AiPayload | null> {
  const projectId = optionalObjectId(getPayloadId(payload), 'request.body._id');
  if (!projectId) {
    return payload || {};
  }

  const project = await Project.findOne({ _id: projectId, userId });

  return normalizeDoc(project);
}

async function generateNoteTaskDrafts(
  payload: AiResourcePayloadDto,
  userId: ObjectId
): Promise<AiBodyResult<{ drafts: string[] }> | AiNotFoundResult> {
  const note = await resolveOwnedNotePayload(payload, userId);
  if (!note) {
    return { found: false };
  }

  const API_KEY = process.env.GLM_API_KEY;

  // Fallback: API key missing
  if (!API_KEY) {
    console.warn('[AI Route] GLM_API_KEY not found, using fallback');
    return { found: true, body: noteTaskFallback(note) };
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
      return { found: true, body: noteTaskFallback(note) };
    }

    const data = await response.json() as AiCompletionResponse;
    let tasksText = '';
    tasksText = textFromMessageContent(data?.choices?.[0]?.message?.content);

    if (!tasksText) {
      console.error('[AI Route] Note Tasks invalid API response');
      return { found: true, body: noteTaskFallback(note) };
    }

    const tasks = tasksText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .slice(0, 2);

    console.log('[AI Route] GLM note tasks generated');
    return { found: true, body: { drafts: tasks } };

  } catch (error) {
    console.error('[AI Route] Note Tasks API call error:', errorMessage(error));
    return { found: true, body: noteTaskFallback(note) };
  }
}

async function suggestProjectNextActions(
  payload: AiResourcePayloadDto,
  userId: ObjectId
): Promise<AiBodyResult<{ suggestions: string[] }> | AiNotFoundResult> {
  const project = await resolveOwnedProjectPayload(payload, userId);
  if (!project) {
    return { found: false };
  }

  const API_KEY = process.env.GLM_API_KEY;

  // Fallback: API key missing
  if (!API_KEY) {
    console.warn('[AI Route] GLM_API_KEY not found, using fallback');
    return { found: true, body: projectNextActionFallback(project) };
  }

  const name = project?.name || '(无项目名)';
  const summary = project?.summary || '(无描述)';
  const status = project?.status || 'unknown';
  // Canonical: task-based focus only
  const currentFocus = await getProjectFocusContext(project, userId) || '(无)';

  const promptText = `始终使用简体中文输出。

基于以下项目信息，给出 1-2 条值得推进的下一步建议：
项目名称：${name}
项目描述：${summary}
当前状态：${status}
当前下一步：${currentFocus}

要求：
- 每条建议必须是具体可执行的动作
- 简短精炼，适合作为 task 标题
- 用换行分隔，每条一行
- 不带编号
- 不带解释文本
- 针对"推进"而非"总结"

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
      return { found: true, body: projectNextActionFallback(project) };
    }

    const data = await response.json() as AiCompletionResponse;
    let suggestionsText = '';
    suggestionsText = textFromMessageContent(data?.choices?.[0]?.message?.content);

    if (!suggestionsText) {
      console.error('[AI Route] Next Action invalid API response');
      return { found: true, body: projectNextActionFallback(project) };
    }

    const suggestions = suggestionsText.split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(line => line.replace(/^[0-9]+[.、]\s*/, ''))
      .filter(line => line.length > 0)
      .slice(0, 2);

    console.log('[AI Route] GLM next action suggestions generated');
    return { found: true, body: { suggestions } };

  } catch (error) {
    console.error('[AI Route] Next Action API call error:', errorMessage(error));
    return { found: true, body: projectNextActionFallback(project) };
  }
}

async function chat({ messages, context, runtimeControls }: AiChatDto) {
  const KIMI_KEY = process.env.KIMI_API_KEY || process.env.MOONSHOT_API_KEY;
  if (!KIMI_KEY) {
    console.warn('[AI Route] KIMI_API_KEY not found, using fallback');
    return chatFallback();
  }

  try {
    // TODO: extract options (e.g. thinkingEnabled) from request body when strategy is ready
    const { reply } = await runChat(messages, context, { runtimeControls });
    console.log('[AI Route] Kimi chat reply generated, length:', reply?.length);
    return { reply };
  } catch (error) {
    console.error('[AI Route] Chat service error:', errorMessage(error));
    console.error('[AI Route] Stack:', errorStack(error) || 'no stack');
    return chatFallback();
  }
}

export = {
  chat,
  generateNoteTaskDrafts,
  suggestProjectNextActions,
  __test__: {
    getProjectFocusContext,
    resolveOwnedNotePayload,
    resolveOwnedProjectPayload
  }
};
