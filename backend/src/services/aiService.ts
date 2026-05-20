import {
  type AiChatRequestDto,
  type AiResourceRequestDto,
  chatResponseSchema,
  noteTaskDraftsResponseSchema,
  projectNextActionsResponseSchema
} from '@sayachan/contracts';
import { type ObjectId, toObjectId } from '../domain/objectIds.js';
import { chat as privateCoreChat, chatStream as privateCoreChatStream } from '../privateCore/bridge.js';
import Note from '../models/Note.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import {
  buildProductContextSnapshot,
  type ProductContextSnapshot
} from './aiProductContextService.js';
import { executeProductContextTool } from './aiProductToolService.js';

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
type ChatRunner = typeof privateCoreChat;
type ChatStreamRunner = typeof privateCoreChatStream;
type ChatProvider = 'mock' | 'openai';
type ChatProviderReadinessCheck = (provider: ChatProvider) => boolean;
type ChatStreamEvent = Awaited<ReturnType<ChatStreamRunner>> extends AsyncIterable<infer TEvent> ? TEvent : never;
type ProductContextBuilder = (userId: ObjectId | null | undefined) => Promise<ProductContextSnapshot | null>;
type ChatExecutionOptions = {
  userId?: ObjectId | null;
  userRole?: string | null;
};

let runChat: ChatRunner = privateCoreChat;
let runChatStream: ChatStreamRunner = privateCoreChatStream;
let chatProviderReadinessCheck: ChatProviderReadinessCheck = defaultChatProviderReadinessCheck;
let productContextBuilder: ProductContextBuilder = buildProductContextSnapshot;

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
  return noteTaskDraftsResponseSchema.parse({
    drafts: [
      `基于 "${title}" 的下一步`,
      `整理 "${title}" 的关键点`
    ]
  });
}

function projectNextActionFallback(project: AiPayload | null): { suggestions: string[] } {
  const status = project?.status || 'unknown';
  const statusMap = {
    pending: ['明确里程碑并设定截止日期', '梳理项目依赖关系'],
    in_progress: ['检查当前进度并更新阻塞项', '协调相关资源推进任务'],
    completed: ['记录项目成果并归档', '总结经验教训'],
    on_hold: ['重新评估依赖和时间线', '确定是否需要重启项目']
  };
  return projectNextActionsResponseSchema.parse({
    suggestions: statusMap[status as keyof typeof statusMap] || ['明确里程碑并设定截止日期']
  });
}

function chatFallback() {
  return chatResponseSchema.parse({ reply: '我在这，我们先把当前最重要的一步理清楚。' });
}

async function* chatFallbackStream(): AsyncIterable<ChatStreamEvent> {
  await Promise.resolve();
  const fallback = chatFallback();
  yield {
    packetType: 'chat_stream_event',
    version: 1,
    type: 'text_delta',
    delta: fallback.reply,
    text: fallback.reply
  };
  yield {
    packetType: 'chat_stream_event',
    version: 1,
    type: 'completed',
    text: fallback.reply,
    output: fallback
  };
}

function normalizeChatProvider(value: unknown): ChatProvider | null {
  if (typeof value !== 'string') {
    return null;
  }

  const normalized = value.trim().toLowerCase();
  return normalized === 'mock' || normalized === 'openai' ? normalized : null;
}

function selectedChatProvider(): ChatProvider {
  return normalizeChatProvider(process.env.SAYACHAN_AI_PROVIDER) || 'mock';
}

function defaultChatProviderReadinessCheck(provider: ChatProvider): boolean {
  if (provider === 'mock') {
    return true;
  }

  return Boolean(process.env.OPENAI_API_KEY);
}

function isChatProviderReady(provider: ChatProvider = selectedChatProvider()): boolean {
  return chatProviderReadinessCheck(provider);
}

function canReturnDebugTrace(options: ChatExecutionOptions): boolean {
  return options.userRole === 'owner' || options.userRole === 'tester';
}

function privateCoreRuntimeControls(
  runtimeControls: AiChatRequestDto['runtimeControls'],
  provider: ChatProvider,
  options: ChatExecutionOptions = {}
) {
  const { debugTrace, ...safeRuntimeControls } = runtimeControls || {};
  const controls: Record<string, unknown> = {
    ...safeRuntimeControls,
    provider
  };

  if (debugTrace === true && canReturnDebugTrace(options)) {
    controls.debugTrace = true;
  }

  if (provider === 'openai' && options.userId) {
    controls.toolExecutor = (request: { name: string; arguments?: Record<string, unknown> }) => executeProductContextTool({
      name: request.name,
      arguments: request.arguments || {},
      userId: options.userId as ObjectId
    });
    controls.tools = {
      enabled: true,
      maxToolCallsPerTurn: 3,
      maxToolRounds: 2,
      toolTimeoutMs: 8000,
      maxToolResultChars: 4000
    };
  }

  if (runtimeControls?.providerState) {
    return {
      ...controls,
      providerState: runtimeControls.providerState
    };
  }
  return controls;
}

function mergeProductContext(
  context: AiChatRequestDto['context'],
  productContext: ProductContextSnapshot | null
): AiChatRequestDto['context'] {
  if (!productContext) {
    return context;
  }

  if (context && typeof context === 'object' && !Array.isArray(context)) {
    return {
      ...context,
      productContext
    };
  }

  return { productContext };
}

async function buildPrivateCoreContext(
  context: AiChatRequestDto['context'],
  options: ChatExecutionOptions
): Promise<AiChatRequestDto['context']> {
  const productContext = await productContextBuilder(options.userId);
  return mergeProductContext(context, productContext);
}

function normalizeDoc(doc: AiPayload | null): AiPayload | null {
  return doc?.toObject ? doc.toObject() : doc;
}

async function resolveOwnedNotePayload(payload: AiResourceRequestDto, userId: ObjectId): Promise<AiPayload | null> {
  const noteId = toObjectId(payload._id, 'request.body._id');
  const note = await Note.findOne({ _id: noteId, userId });

  return normalizeDoc(note);
}

async function resolveOwnedProjectPayload(payload: AiResourceRequestDto, userId: ObjectId): Promise<AiPayload | null> {
  const projectId = toObjectId(payload._id, 'request.body._id');
  const project = await Project.findOne({ _id: projectId, userId });

  return normalizeDoc(project);
}

export async function generateNoteTaskDrafts(
  payload: AiResourceRequestDto,
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
    return { found: true, body: noteTaskDraftsResponseSchema.parse({ drafts: tasks }) };

  } catch (error) {
    console.error('[AI Route] Note Tasks API call error:', errorMessage(error));
    return { found: true, body: noteTaskFallback(note) };
  }
}

export async function suggestProjectNextActions(
  payload: AiResourceRequestDto,
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
    return { found: true, body: projectNextActionsResponseSchema.parse({ suggestions }) };

  } catch (error) {
    console.error('[AI Route] Next Action API call error:', errorMessage(error));
    return { found: true, body: projectNextActionFallback(project) };
  }
}

export async function chat({ messages, context, runtimeControls }: AiChatRequestDto, options: ChatExecutionOptions = {}) {
  const provider = selectedChatProvider();

  if (!isChatProviderReady(provider)) {
    console.warn(`[AI Route] ${provider} provider is not ready, using fallback`);
    return chatFallback();
  }

  try {
    // TODO: extract options (e.g. thinkingEnabled) from request body when strategy is ready
    const privateCoreContext = await buildPrivateCoreContext(context, options);
    const result = await runChat(messages, privateCoreContext, {
      runtimeControls: privateCoreRuntimeControls(runtimeControls, provider, options)
    });
    console.log('[AI Route] Private-core v3 chat reply generated, length:', result.reply?.length);
    return chatResponseSchema.parse(result);
  } catch (error) {
    console.error('[AI Route] Chat service error:', errorMessage(error));
    console.error('[AI Route] Stack:', errorStack(error) || 'no stack');
    return chatFallback();
  }
}

export async function* chatStream({ messages, context, runtimeControls }: AiChatRequestDto, options: ChatExecutionOptions = {}): AsyncIterable<ChatStreamEvent> {
  const provider = selectedChatProvider();

  if (!isChatProviderReady(provider)) {
    console.warn(`[AI Route] ${provider} provider is not ready, using streaming fallback`);
    yield* chatFallbackStream();
    return;
  }

  try {
    const privateCoreContext = await buildPrivateCoreContext(context, options);
    yield* runChatStream(messages, privateCoreContext, {
      runtimeControls: privateCoreRuntimeControls(runtimeControls, provider, options)
    });
  } catch (error) {
    console.error('[AI Route] Chat stream service error:', errorMessage(error));
    console.error('[AI Route] Stack:', errorStack(error) || 'no stack');
    yield* chatFallbackStream();
  }
}

export const __test__ = {
  getProjectFocusContext,
  resolveOwnedNotePayload,
  resolveOwnedProjectPayload,
  isChatProviderReady,
  selectedChatProvider,
  setChatProviderReadinessCheckForTest(check: ChatProviderReadinessCheck) {
    const previous = chatProviderReadinessCheck;
    chatProviderReadinessCheck = check;
    return () => {
      chatProviderReadinessCheck = previous;
    };
  },
  setChatProviderKeyCheckForTest(check: ChatProviderReadinessCheck) {
    const previous = chatProviderReadinessCheck;
    chatProviderReadinessCheck = check;
    return () => {
      chatProviderReadinessCheck = previous;
    };
  },
  setChatRunnerForTest(runner: ChatRunner) {
    const previous = runChat;
    runChat = runner;
    return () => {
      runChat = previous;
    };
  },
  setChatStreamRunnerForTest(runner: ChatStreamRunner) {
    const previous = runChatStream;
    runChatStream = runner;
    return () => {
      runChatStream = previous;
    };
  },
  setProductContextBuilderForTest(builder: ProductContextBuilder) {
    const previous = productContextBuilder;
    productContextBuilder = builder;
    return () => {
      productContextBuilder = previous;
    };
  }
};

export default {
  chat,
  chatStream,
  generateNoteTaskDrafts,
  suggestProjectNextActions,
  __test__
};
