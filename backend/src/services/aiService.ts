import {
  type AiChatRequestDto,
  chatResponseSchema
} from '@sayachan/contracts';
import mongoose from 'mongoose';
import { type ObjectId } from '../domain/objectIds.js';
import { chat as privateCoreChat, chatStream as privateCoreChatStream } from '../privateCore/bridge.js';
import {
  buildProductContextSnapshot,
  type ProductContextSnapshot
} from './aiProductContextService.js';
import {
  buildMemoryContextSnapshot,
  type MemoryContextSnapshot
} from './aiMemoryContextService.js';
import { executeProductContextTool } from './aiProductToolService.js';
import {
  appendAssistantMessage,
  archiveCurrentChatSession,
  loadCurrentChatSession,
  preparePersistentChatTurn
} from './chatPersistenceService.js';

type ChatRunner = typeof privateCoreChat;
type ChatStreamRunner = typeof privateCoreChatStream;
type ChatProvider = 'mock' | 'openai';
type ChatProviderReadinessCheck = (provider: ChatProvider) => boolean;
type ChatPersistenceAvailabilityCheck = () => boolean;
type ChatStreamEvent = Awaited<ReturnType<ChatStreamRunner>> extends AsyncIterable<infer TEvent> ? TEvent : never;
type ProductContextBuilder = (userId: ObjectId | null | undefined) => Promise<ProductContextSnapshot | null>;
type MemoryContextBuilder = (options: ChatExecutionOptions) => Promise<MemoryContextSnapshot | null>;
type ChatExecutionOptions = {
  userId?: ObjectId | null;
  userRole?: string | null;
};
type PreparedPersistentTurn = Awaited<ReturnType<typeof preparePersistentChatTurn>>;

let runChat: ChatRunner = privateCoreChat;
let runChatStream: ChatStreamRunner = privateCoreChatStream;
let chatProviderReadinessCheck: ChatProviderReadinessCheck = defaultChatProviderReadinessCheck;
let chatPersistenceAvailabilityCheck: ChatPersistenceAvailabilityCheck = defaultChatPersistenceAvailabilityCheck;
let productContextBuilder: ProductContextBuilder = buildProductContextSnapshot;
let memoryContextBuilder: MemoryContextBuilder = (options) => buildMemoryContextSnapshot(options.userId, { userRole: options.userRole });

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function errorStack(error: unknown): string | undefined {
  return error instanceof Error ? error.stack : undefined;
}

function chatFallback() {
  return chatResponseSchema.parse({ reply: '我在这，我们先把当前最重要的一步理清楚。' });
}

async function* chatFallbackStream(fallback = chatFallback()): AsyncIterable<ChatStreamEvent> {
  await Promise.resolve();
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

function defaultChatPersistenceAvailabilityCheck(): boolean {
  return Number(mongoose.connection.readyState) === 1;
}

function isChatProviderReady(provider: ChatProvider = selectedChatProvider()): boolean {
  return chatProviderReadinessCheck(provider);
}

function canReturnDebugTrace(options: ChatExecutionOptions): boolean {
  return options.userRole === 'owner' || options.userRole === 'tester';
}

function canUseMemoryCandidate(options: ChatExecutionOptions): boolean {
  return options.userRole === 'owner' || options.userRole === 'tester';
}

function isContextRecord(context: unknown): context is Record<string, unknown> {
  return Boolean(context) && typeof context === 'object' && !Array.isArray(context);
}

function sanitizeCallerContext(context: AiChatRequestDto['context']): Record<string, unknown> | undefined {
  if (!isContextRecord(context)) {
    return undefined;
  }

  return isContextRecord(context.chatFocus)
    ? { chatFocus: context.chatFocus }
    : undefined;
}

function privateCoreRuntimeControls(
  runtimeControls: AiChatRequestDto['runtimeControls'],
  provider: ChatProvider,
  options: ChatExecutionOptions = {},
  serverProviderState?: unknown
) {
  const { debugTrace, memoryCandidate, providerState: callerProviderState, ...safeRuntimeControls } = runtimeControls || {};
  const controls: Record<string, unknown> = {
    ...safeRuntimeControls,
    provider
  };

  if (debugTrace === true && canReturnDebugTrace(options)) {
    controls.debugTrace = true;
  }

  if (memoryCandidate === true && provider === 'openai' && canUseMemoryCandidate(options)) {
    controls.memoryCandidate = { enabled: true };
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

  const providerState = serverProviderState || (!options.userId ? callerProviderState : undefined);
  if (providerState) {
    return {
      ...controls,
      providerState
    };
  }
  return controls;
}

function mergeTrustedContext(
  context: AiChatRequestDto['context'],
  productContext: ProductContextSnapshot | null,
  memoryContext: MemoryContextSnapshot | null
): Record<string, unknown> | undefined {
  const safeContext = sanitizeCallerContext(context);
  const trustedContext: Record<string, unknown> = {
    ...(isContextRecord(safeContext) ? safeContext : {})
  };

  if (productContext) {
    trustedContext.productContext = productContext;
  }
  if (memoryContext) {
    trustedContext.memoryContext = memoryContext;
  }

  return Object.keys(trustedContext).length > 0 ? trustedContext : undefined;
}

async function buildPrivateCoreContext(
  context: AiChatRequestDto['context'],
  options: ChatExecutionOptions
): Promise<Record<string, unknown> | undefined> {
  const [productContext, memoryContext] = await Promise.all([
    productContextBuilder(options.userId),
    memoryContextBuilder(options)
  ]);
  return mergeTrustedContext(context, productContext, memoryContext);
}

async function prepareTurnForPersistence(
  request: AiChatRequestDto,
  options: ChatExecutionOptions
): Promise<PreparedPersistentTurn> {
  if (!options.userId || !chatPersistenceAvailabilityCheck()) {
    return null;
  }

  try {
    return await preparePersistentChatTurn(request, { userId: options.userId });
  } catch (error) {
    console.error('[AI Route] Chat persistence prepare failed:', errorMessage(error));
    return null;
  }
}

async function persistAssistantReply(
  preparedTurn: PreparedPersistentTurn,
  reply: string,
  result: {
    providerState?: unknown;
    sourceReceipts?: unknown;
    memoryCandidate?: unknown;
  },
  options: ChatExecutionOptions
): Promise<void> {
  if (!preparedTurn || !options.userId) {
    return;
  }

  try {
    await appendAssistantMessage(preparedTurn, reply, result, { userId: options.userId });
  } catch (error) {
    console.error('[AI Route] Chat persistence assistant append failed:', errorMessage(error));
  }
}

function messagesForCore(request: AiChatRequestDto, preparedTurn: PreparedPersistentTurn) {
  return preparedTurn?.messages || request.messages;
}

export async function chat({ messages, context, runtimeControls }: AiChatRequestDto, options: ChatExecutionOptions = {}) {
  const request = { messages, context, runtimeControls };
  const provider = selectedChatProvider();
  const preparedTurn = await prepareTurnForPersistence(request, options);

  if (!isChatProviderReady(provider)) {
    console.warn(`[AI Route] ${provider} provider is not ready, using fallback`);
    const fallback = chatFallback();
    await persistAssistantReply(preparedTurn, fallback.reply, fallback, options);
    return fallback;
  }

  try {
    // TODO: extract options (e.g. thinkingEnabled) from request body when strategy is ready
    const privateCoreContext = await buildPrivateCoreContext(context, options);
    const result = await runChat(messagesForCore(request, preparedTurn), privateCoreContext, {
      runtimeControls: privateCoreRuntimeControls(runtimeControls, provider, options, preparedTurn?.providerState)
    });
    console.log('[AI Route] Private-core v3 chat reply generated, length:', result.reply?.length);
    const parsed = chatResponseSchema.parse(result);
    await persistAssistantReply(preparedTurn, parsed.reply, parsed, options);
    return parsed;
  } catch (error) {
    console.error('[AI Route] Chat service error:', errorMessage(error));
    console.error('[AI Route] Stack:', errorStack(error) || 'no stack');
    const fallback = chatFallback();
    await persistAssistantReply(preparedTurn, fallback.reply, fallback, options);
    return fallback;
  }
}

export async function* chatStream({ messages, context, runtimeControls }: AiChatRequestDto, options: ChatExecutionOptions = {}): AsyncIterable<ChatStreamEvent> {
  const request = { messages, context, runtimeControls };
  const provider = selectedChatProvider();
  const preparedTurn = await prepareTurnForPersistence(request, options);

  if (!isChatProviderReady(provider)) {
    console.warn(`[AI Route] ${provider} provider is not ready, using streaming fallback`);
    const fallback = chatFallback();
    await persistAssistantReply(preparedTurn, fallback.reply, fallback, options);
    yield* chatFallbackStream(fallback);
    return;
  }

  try {
    const privateCoreContext = await buildPrivateCoreContext(context, options);
    for await (const event of runChatStream(messagesForCore(request, preparedTurn), privateCoreContext, {
      runtimeControls: privateCoreRuntimeControls(runtimeControls, provider, options, preparedTurn?.providerState)
    })) {
      if (event?.type === 'completed') {
        const reply = event.output?.reply || event.text || '';
        await persistAssistantReply(preparedTurn, reply, {
          providerState: event.output?.providerState || event.providerState,
          sourceReceipts: event.output?.sourceReceipts || event.sourceReceipts,
          memoryCandidate: event.output?.memoryCandidate || event.memoryCandidate
        }, options);
      }
      yield event;
    }
  } catch (error) {
    console.error('[AI Route] Chat stream service error:', errorMessage(error));
    console.error('[AI Route] Stack:', errorStack(error) || 'no stack');
    const fallback = chatFallback();
    await persistAssistantReply(preparedTurn, fallback.reply, fallback, options);
    yield* chatFallbackStream(fallback);
  }
}

export async function currentChatSession(options: ChatExecutionOptions = {}) {
  if (!options.userId || !chatPersistenceAvailabilityCheck()) {
    return { messages: [] };
  }

  return loadCurrentChatSession({ userId: options.userId });
}

export async function startNewChatSession(options: ChatExecutionOptions = {}) {
  if (!options.userId || !chatPersistenceAvailabilityCheck()) {
    return { messages: [] };
  }

  return archiveCurrentChatSession({ userId: options.userId });
}

export const __test__ = {
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
  setChatPersistenceAvailabilityCheckForTest(check: ChatPersistenceAvailabilityCheck) {
    const previous = chatPersistenceAvailabilityCheck;
    chatPersistenceAvailabilityCheck = check;
    return () => {
      chatPersistenceAvailabilityCheck = previous;
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
  },
  setMemoryContextBuilderForTest(builder: MemoryContextBuilder) {
    const previous = memoryContextBuilder;
    memoryContextBuilder = builder;
    return () => {
      memoryContextBuilder = previous;
    };
  }
};

export default {
  chat,
  currentChatSession,
  startNewChatSession,
  chatStream,
  __test__
};
