import {
  type AiChatRequestDto,
  chatResponseSchema
} from '@sayachan/contracts';
import { type ObjectId } from '../domain/objectIds.js';
import { chat as privateCoreChat, chatStream as privateCoreChatStream } from '../privateCore/bridge.js';
import {
  buildProductContextSnapshot,
  type ProductContextSnapshot
} from './aiProductContextService.js';
import { executeProductContextTool } from './aiProductToolService.js';

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
): Record<string, unknown> | undefined {
  const safeContext = sanitizeCallerContext(context);

  if (!productContext) {
    return safeContext;
  }

  if (isContextRecord(safeContext)) {
    return {
      ...safeContext,
      productContext
    };
  }

  return { productContext };
}

async function buildPrivateCoreContext(
  context: AiChatRequestDto['context'],
  options: ChatExecutionOptions
): Promise<Record<string, unknown> | undefined> {
  const productContext = await productContextBuilder(options.userId);
  return mergeProductContext(context, productContext);
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
  __test__
};
