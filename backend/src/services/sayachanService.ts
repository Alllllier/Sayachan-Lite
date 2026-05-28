import {
  type SayaDeskSayachanFocusDto,
  type SayaDeskSayachanResponseDto,
  type SayaDeskSayachanTurnActivityDto,
  type SayaDeskSayachanRequestDto,
  sayaDeskSayachanResponseSchema
} from '@sayachan/contracts';
import mongoose from 'mongoose';
import { BadRequestError, HttpError } from '../http/httpErrors.js';
import { type ObjectId } from '../domain/objectIds.js';
import {
  appendAssistantMessage,
  preparePersistentTextTurn
} from './chatPersistenceService.js';
import {
  buildSayaDeskFocusSnapshot,
  buildSayaDeskHostCapabilityManifest,
  type SayaDeskAuthorizedFocusSnapshot,
  type SayaDeskHostCapabilityManifest
} from './sayachanHostContextService.js';
import {
  postSayachanCoreTurn,
  type SayachanCoreConversationMessage,
  type SayachanCoreTurnRequest,
  type SayachanCoreTurnResponse
} from './sayachanCoreClient.js';

type SayachanCoreTurnRunner = typeof postSayachanCoreTurn;
type FocusSnapshotBuilder = (
  focus: SayaDeskSayachanFocusDto | null | undefined,
  userId: ObjectId | null | undefined
) => Promise<SayaDeskAuthorizedFocusSnapshot | null>;
type HostCapabilityManifestBuilder = () => SayaDeskHostCapabilityManifest;
type ChatPersistenceAvailabilityCheck = () => boolean;
type SayachanExecutionOptions = {
  userId?: ObjectId | null;
  userRole?: string | null;
};
type PreparedPersistentTurn = Awaited<ReturnType<typeof preparePersistentTextTurn>>;

let runCoreTurn: SayachanCoreTurnRunner = postSayachanCoreTurn;
let focusSnapshotBuilder: FocusSnapshotBuilder = buildSayaDeskFocusSnapshot;
let hostCapabilityManifestBuilder: HostCapabilityManifestBuilder = buildSayaDeskHostCapabilityManifest;
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

async function buildAuthorizedContext(
  request: SayaDeskSayachanRequestDto,
  options: SayachanExecutionOptions
): Promise<Record<string, unknown> | undefined> {
  const focusSnapshot = await focusSnapshotBuilder(request.focus, options.userId);
  const authorizedContext: Record<string, unknown> = {
    host_capabilities: hostCapabilityManifestBuilder()
  };

  if (focusSnapshot) {
    authorizedContext.focus = focusSnapshot;
  }

  return Object.keys(authorizedContext).length > 0 ? authorizedContext : undefined;
}

function latestUserText(request: SayaDeskSayachanRequestDto, preparedTurn: PreparedPersistentTurn): string {
  if (preparedTurn?.latestUserText) {
    return preparedTurn.latestUserText;
  }

  return request.text.trim();
}

function messagesForCore(
  request: SayaDeskSayachanRequestDto,
  preparedTurn: PreparedPersistentTurn
): SayachanCoreConversationMessage[] {
  if (!preparedTurn) {
    return [{ role: 'user', content: request.text.trim() }];
  }

  return preparedTurn.messages
    .filter((message): message is { role: 'user' | 'assistant'; content: string } => (
      (message.role === 'user' || message.role === 'assistant')
        && typeof message.content === 'string'
        && message.content.trim().length > 0
    ))
    .map((message) => ({ role: message.role, content: message.content }));
}

function recordId(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || !('_id' in value)) {
    return undefined;
  }
  const rawId = (value as { _id?: unknown })._id;
  if (typeof rawId === 'string') {
    return rawId;
  }
  if (rawId instanceof mongoose.Types.ObjectId) {
    return rawId.toHexString();
  }
  return undefined;
}

function coreRequest(
  request: SayaDeskSayachanRequestDto,
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
      surface: request.surface,
      ...(options.userId ? { host_user_id: options.userId.toHexString() } : {}),
      ...(authorizedContext ? { authorized_context: authorizedContext } : {})
    },
    input: { text },
    conversation: {
      conversation_id: request.conversationId || (preparedTurn ? recordId(preparedTurn.conversation) : undefined),
      recent_messages: messagesForCore(request, preparedTurn)
    },
    options: {
      debug: request.options?.debug === true && canReturnDebugTrace(options),
      stream: false
    }
  };
}

function projectTurnActivity(coreResponse: SayachanCoreTurnResponse): SayaDeskSayachanTurnActivityDto | undefined {
  const activity = coreResponse.turn_activity;
  if (!activity || activity.items.length === 0) {
    return undefined;
  }

  return {
    defaultCollapsed: activity.default_collapsed,
    items: activity.items.map(item => ({
      itemId: item.item_id,
      kind: item.kind,
      status: item.status,
      text: item.text,
      display: item.display,
      canonicalMessage: item.canonical_message,
      ...(item.capability ? { capability: item.capability } : {}),
      sourceTrace: item.source_trace
    }))
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

export async function chat(request: SayaDeskSayachanRequestDto, options: SayachanExecutionOptions = {}): Promise<SayaDeskSayachanResponseDto> {
  const preparedTurn = options.userId && chatPersistenceAvailabilityCheck()
    ? await preparePersistentTextTurn({ text: request.text }, { userId: options.userId })
    : null;
  const authorizedContext = await buildAuthorizedContext(request, options);
  const turnRequest = coreRequest(request, preparedTurn, authorizedContext, options);

  try {
    const coreResponse = await runCoreTurn(turnRequest);
    const parsed = sayaDeskSayachanResponseSchema.parse({
      reply: coreResponse.response.content,
      turnId: coreResponse.turn_id,
      turnActivity: projectTurnActivity(coreResponse),
      trace: {
        traceId: coreResponse.trace.trace_id,
        debugAvailable: coreResponse.trace.debug_available
      }
    });
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
  setFocusSnapshotBuilderForTest(builder: FocusSnapshotBuilder) {
    const previous = focusSnapshotBuilder;
    focusSnapshotBuilder = builder;
    return () => {
      focusSnapshotBuilder = previous;
    };
  },
  setHostCapabilityManifestBuilderForTest(builder: HostCapabilityManifestBuilder) {
    const previous = hostCapabilityManifestBuilder;
    hostCapabilityManifestBuilder = builder;
    return () => {
      hostCapabilityManifestBuilder = previous;
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
