import {
  type AiChatRequestDto,
  type ChatMessageDto,
  type ChatResponseDto,
  chatResponseSchema
} from '@sayachan/contracts';
import mongoose from 'mongoose';
import { BadRequestError, HttpError } from '../http/httpErrors.js';
import { type ObjectId } from '../domain/objectIds.js';
import {
  buildProductContextSnapshot,
  type ProductContextSnapshot
} from './aiProductContextService.js';
import {
  buildMemoryContextSnapshot,
  type MemoryContextSnapshot
} from './aiMemoryContextService.js';
import {
  appendAssistantMessage,
  preparePersistentChatTurn
} from './chatPersistenceService.js';
import {
  postSayachanCoreTurn,
  type SayachanCoreConversationMessage,
  type SayachanCoreTurnRequest,
  type SayachanCoreTurnResponse
} from './sayachanCoreClient.js';

type SayachanCoreTurnRunner = typeof postSayachanCoreTurn;
type ProductContextBuilder = (userId: ObjectId | null | undefined) => Promise<ProductContextSnapshot | null>;
type MemoryContextBuilder = (options: SayachanExecutionOptions) => Promise<MemoryContextSnapshot | null>;
type ChatPersistenceAvailabilityCheck = () => boolean;
type SayachanExecutionOptions = {
  userId?: ObjectId | null;
  userRole?: string | null;
};
type PreparedPersistentTurn = Awaited<ReturnType<typeof preparePersistentChatTurn>>;

let runCoreTurn: SayachanCoreTurnRunner = postSayachanCoreTurn;
let productContextBuilder: ProductContextBuilder = buildProductContextSnapshot;
let memoryContextBuilder: MemoryContextBuilder = (options) => buildMemoryContextSnapshot(options.userId, {
  userRole: options.userRole
});
let chatPersistenceAvailabilityCheck: ChatPersistenceAvailabilityCheck = defaultChatPersistenceAvailabilityCheck;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function canReturnDebugTrace(options: SayachanExecutionOptions): boolean {
  return options.userRole === 'owner' || options.userRole === 'tester';
}

function defaultChatPersistenceAvailabilityCheck(): boolean {
  return Number(mongoose.connection.readyState) === 1;
}

function isContextRecord(context: unknown): context is Record<string, unknown> {
  return Boolean(context) && typeof context === 'object' && !Array.isArray(context);
}

function sanitizeCallerContext(context: AiChatRequestDto['context']): Record<string, unknown> {
  if (!isContextRecord(context) || !isContextRecord(context.chatFocus)) {
    return {};
  }

  return { chatFocus: context.chatFocus };
}

async function buildAuthorizedContext(
  context: AiChatRequestDto['context'],
  options: SayachanExecutionOptions
): Promise<Record<string, unknown> | undefined> {
  const [productContext, memoryContext] = await Promise.all([
    productContextBuilder(options.userId),
    memoryContextBuilder(options)
  ]);
  const authorizedContext: Record<string, unknown> = {
    ...sanitizeCallerContext(context)
  };

  if (productContext) {
    authorizedContext.productContext = productContext;
  }
  if (memoryContext) {
    authorizedContext.memoryContext = memoryContext;
  }

  return Object.keys(authorizedContext).length > 0 ? authorizedContext : undefined;
}

function latestUserText(request: AiChatRequestDto, preparedTurn: PreparedPersistentTurn): string {
  if (preparedTurn?.latestUserText) {
    return preparedTurn.latestUserText;
  }

  if (typeof request.runtimeControls?.lastUserMessage === 'string' && request.runtimeControls.lastUserMessage.trim()) {
    return request.runtimeControls.lastUserMessage.trim();
  }

  const latestUser = Array.isArray(request.messages)
    ? [...request.messages].reverse().find((message) => message?.role === 'user')
    : null;
  return typeof latestUser?.content === 'string' ? latestUser.content.trim() : '';
}

function messagesForCore(
  request: AiChatRequestDto,
  preparedTurn: PreparedPersistentTurn
): SayachanCoreConversationMessage[] {
  const messages = preparedTurn?.messages || request.messages || [];
  return messages
    .filter((message): message is ChatMessageDto & { role: 'user' | 'assistant'; content: string } => (
      (message.role === 'user' || message.role === 'assistant')
        && typeof message.content === 'string'
        && message.content.trim().length > 0
    ))
    .map((message) => ({
      role: message.role,
      content: message.content
    }));
}

function recordId(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || !('_id' in value)) {
    return undefined;
  }
  const rawId = (value as { _id?: unknown })._id;
  return typeof rawId === 'string'
    ? rawId
    : rawId && typeof rawId === 'object' && 'toString' in rawId
      ? rawId.toString()
      : undefined;
}

function coreRequest(
  request: AiChatRequestDto,
  preparedTurn: PreparedPersistentTurn,
  authorizedContext: Record<string, unknown> | undefined,
  options: SayachanExecutionOptions
): SayachanCoreTurnRequest {
  const text = latestUserText(request, preparedTurn);
  if (!text) {
    throw new BadRequestError('Chat message is required', {
      code: 'MISSING_CHAT_MESSAGE',
      source: 'request.body.messages'
    });
  }

  return {
    host: {
      host_id: 'saya-desk',
      surface: 'workspace-chat',
      ...(options.userId ? { host_user_id: options.userId.toHexString() } : {}),
      ...(authorizedContext ? { authorized_context: authorizedContext } : {})
    },
    input: { text },
    conversation: {
      ...(preparedTurn ? { conversation_id: recordId(preparedTurn.conversation) } : {}),
      recent_messages: messagesForCore(request, preparedTurn)
    },
    options: {
      debug: request.runtimeControls?.debugTrace === true && canReturnDebugTrace(options),
      stream: false
    }
  };
}

async function persistAssistantReply(
  preparedTurn: PreparedPersistentTurn,
  coreResponse: SayachanCoreTurnResponse,
  options: SayachanExecutionOptions
): Promise<void> {
  if (!preparedTurn || !options.userId) {
    return;
  }

  try {
    await appendAssistantMessage(preparedTurn, coreResponse.response.content, {}, { userId: options.userId });
  } catch (error) {
    console.error('[Sayachan Route] Chat persistence assistant append failed:', errorMessage(error));
  }
}

export async function chat(request: AiChatRequestDto, options: SayachanExecutionOptions = {}): Promise<ChatResponseDto> {
  const preparedTurn = options.userId && chatPersistenceAvailabilityCheck()
    ? await preparePersistentChatTurn(request, { userId: options.userId })
    : null;
  const authorizedContext = await buildAuthorizedContext(request.context, options);
  const turnRequest = coreRequest(request, preparedTurn, authorizedContext, options);

  try {
    const coreResponse = await runCoreTurn(turnRequest);
    const parsed = chatResponseSchema.parse({ reply: coreResponse.response.content });
    await persistAssistantReply(preparedTurn, coreResponse, options);
    return parsed;
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }

    console.error('[Sayachan Route] Core turn failed:', errorMessage(error));
    throw new HttpError(502, 'Sayachan Core request failed', {
      code: 'SAYACHAN_CORE_REQUEST_FAILED'
    });
  }
}

export const __test__ = {
  setCoreTurnRunnerForTest(runner: SayachanCoreTurnRunner) {
    const previous = runCoreTurn;
    runCoreTurn = runner;
    return () => {
      runCoreTurn = previous;
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
  },
  setChatPersistenceAvailabilityCheckForTest(check: ChatPersistenceAvailabilityCheck) {
    const previous = chatPersistenceAvailabilityCheck;
    chatPersistenceAvailabilityCheck = check;
    return () => {
      chatPersistenceAvailabilityCheck = previous;
    };
  }
};

export default {
  chat,
  __test__
};
