import {
  type AiChatRequestDto,
  chatMemoryCandidateSchema,
  chatProviderStateSchema,
  chatResponseStrategySchema,
  chatSessionResponseSchema,
  chatSourceReceiptSchema,
  type ChatMessageDto,
  type ChatProviderStateSource,
  type ChatProviderStateStrategy,
  type ChatResponseStrategyDto,
  type ChatSessionResponseDto
} from '@sayachan/contracts';
import { toObjectId, type ObjectId } from '../domain/objectIds.js';
import ChatConversation from '../models/ChatConversation.js';
import ChatMessage from '../models/ChatMessage.js';
import {
  toChatConversationDto,
  toChatMessageDto
} from './responses/chatResponses.js';

const CHAT_SESSION_MESSAGE_LIMIT = 100;

type ChatProviderState = {
  strategy?: ChatProviderStateStrategy;
  source?: ChatProviderStateSource;
  previousResponseId?: string;
  lastResponseId?: string;
  status?: 'active' | 'fallback' | 'unavailable';
};

type ChatConversationRecord = {
  _id?: unknown;
  providerState?: unknown;
};

type ServiceOptions = {
  userId: ObjectId;
};

type PreparedChatTurn = {
  conversation: ChatConversationRecord;
  userMessage: unknown;
  latestUserText: string;
  messages: ChatMessageDto[];
  providerState?: ChatProviderState;
  expansionRequest?: {
    offerId: string;
    originalUserText: string;
  };
};

function recordId(record: unknown): unknown {
  return record && typeof record === 'object' && '_id' in record
    ? (record as { _id?: unknown })._id
    : undefined;
}

function conversationObjectId(record: unknown): ObjectId {
  return toObjectId(recordId(record), 'chatConversation._id');
}

function latestUserTextFromRequest({ messages, runtimeControls }: AiChatRequestDto): string {
  if (typeof runtimeControls?.lastUserMessage === 'string' && runtimeControls.lastUserMessage.trim()) {
    return runtimeControls.lastUserMessage.trim();
  }

  const latestUser = Array.isArray(messages)
    ? [...messages].reverse().find(message => message?.role === 'user')
    : null;
  return typeof latestUser?.content === 'string' ? latestUser.content.trim() : '';
}

function focusSnapshotFromContext(context: AiChatRequestDto['context']) {
  if (!context || typeof context !== 'object' || Array.isArray(context) || !context.chatFocus) {
    return undefined;
  }

  return {
    type: context.chatFocus.type,
    title: context.chatFocus.title
  };
}

function normalizeProviderState(value: unknown): ChatProviderState | undefined {
  const parsed = chatProviderStateSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

function normalizeSourceReceipts(value: unknown) {
  const parsed = chatSourceReceiptSchema.array().safeParse(value);
  return parsed.success && parsed.data.length > 0 ? parsed.data : undefined;
}

function normalizeMemoryCandidate(value: unknown) {
  const parsed = chatMemoryCandidateSchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

function normalizeResponseStrategy(value: unknown): ChatResponseStrategyDto | undefined {
  const parsed = chatResponseStrategySchema.safeParse(value);
  return parsed.success ? parsed.data : undefined;
}

function coreMessagesFromDtos(messages: ChatMessageDto[]): ChatMessageDto[] {
  return messages.map(message => ({
    role: message.role,
    content: message.content
  }));
}

function expansionOfferIdFromRequest(request: AiChatRequestDto): string | undefined {
  const value = request.runtimeControls?.expansionOfferId;
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function plainObject(value: unknown): Record<string, unknown> {
  if (value && typeof value === 'object' && 'toObject' in value && typeof value.toObject === 'function') {
    return (value as { toObject: () => Record<string, unknown> }).toObject();
  }
  return value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function runtimeMetaObject(value: unknown): Record<string, unknown> {
  const normalized = plainObject(value);
  return normalized.runtimeMeta && typeof normalized.runtimeMeta === 'object' && !Array.isArray(normalized.runtimeMeta)
    ? normalized.runtimeMeta as Record<string, unknown>
    : {};
}

async function resolveExpansionRequest(
  conversationId: ObjectId,
  userId: ObjectId,
  offerId: string | undefined
): Promise<PreparedChatTurn['expansionRequest'] | undefined> {
  if (!offerId) {
    return undefined;
  }

  let offerObjectId: ObjectId;
  try {
    offerObjectId = toObjectId(offerId, 'chatExpansionOffer.offerId');
  } catch {
    return undefined;
  }

  const offerMessage = await ChatMessage.findOne({
    _id: offerObjectId,
    conversationId,
    userId,
    role: 'assistant',
    'runtimeMeta.expansionOffer.status': 'pending'
  });
  const expansionOffer = runtimeMetaObject(offerMessage).expansionOffer;
  const originalUserText = expansionOffer && typeof expansionOffer === 'object' && !Array.isArray(expansionOffer)
    ? (expansionOffer as { originalUserText?: unknown }).originalUserText
    : undefined;

  if (typeof originalUserText !== 'string' || !originalUserText.trim()) {
    return undefined;
  }

  return {
    offerId: offerObjectId.toHexString(),
    originalUserText: originalUserText.trim()
  };
}

async function markExpansionOfferAccepted(
  conversationId: ObjectId,
  userId: ObjectId,
  expansionRequest: PreparedChatTurn['expansionRequest'] | undefined,
  userMessage: unknown
): Promise<void> {
  if (!expansionRequest) {
    return;
  }

  await ChatMessage.findOneAndUpdate(
    {
      _id: toObjectId(expansionRequest.offerId, 'chatExpansionOffer.offerId'),
      conversationId,
      userId,
      role: 'assistant',
      'runtimeMeta.expansionOffer.status': 'pending'
    },
    {
      $set: {
        'runtimeMeta.expansionOffer.status': 'accepted',
        'runtimeMeta.expansionOffer.acceptedAt': new Date(),
        'runtimeMeta.expansionOffer.acceptedByMessageId': recordId(userMessage)
      }
    },
    { new: true, runValidators: true }
  );
}

async function findCurrentConversation(userId: ObjectId): Promise<ChatConversationRecord | null> {
  return ChatConversation.findOne({
    userId,
    archived: { $ne: true }
  }).sort({ updatedAt: -1 });
}

async function getOrCreateCurrentConversation(userId: ObjectId): Promise<ChatConversationRecord> {
  const existing = await findCurrentConversation(userId);
  if (existing) {
    return existing;
  }

  return ChatConversation.create({
    userId,
    archived: false,
    title: '',
    lastMessageAt: new Date()
  });
}

async function listConversationMessages(
  conversationId: ObjectId,
  userId: ObjectId,
  limit = CHAT_SESSION_MESSAGE_LIMIT
): Promise<ChatMessageDto[]> {
  const messages = await ChatMessage.find({ conversationId, userId })
    .sort({ createdAt: -1 })
    .limit(limit);
  return messages
    .slice()
    .reverse()
    .map(message => toChatMessageDto(message))
    .filter((message): message is ChatMessageDto => Boolean(message));
}

async function touchConversation(
  conversationId: ObjectId,
  userId: ObjectId,
  providerState?: ChatProviderState
): Promise<void> {
  const update: Record<string, unknown> = {
    lastMessageAt: new Date()
  };
  if (providerState) {
    update.providerState = providerState;
  }

  await ChatConversation.findOneAndUpdate(
    { _id: conversationId, userId },
    update,
    { new: true, runValidators: true }
  );
}

export async function loadCurrentChatSession({ userId }: ServiceOptions): Promise<ChatSessionResponseDto> {
  const conversation = await findCurrentConversation(userId);
  if (!conversation) {
    return chatSessionResponseSchema.parse({
      messages: []
    });
  }

  const messages = await listConversationMessages(conversationObjectId(conversation), userId);
  return chatSessionResponseSchema.parse({
    conversation: toChatConversationDto(conversation),
    messages,
    providerState: normalizeProviderState(conversation.providerState)
  });
}

export async function archiveCurrentChatSession({ userId }: ServiceOptions): Promise<ChatSessionResponseDto> {
  const conversation = await findCurrentConversation(userId);
  if (!conversation) {
    return chatSessionResponseSchema.parse({
      messages: []
    });
  }

  await ChatConversation.findOneAndUpdate(
    { _id: conversationObjectId(conversation), userId },
    {
      $set: {
        archived: true,
        lastMessageAt: new Date()
      },
      $unset: {
        providerState: 1
      }
    },
    { new: true, runValidators: true }
  );

  return chatSessionResponseSchema.parse({
    messages: []
  });
}

export async function preparePersistentChatTurn(
  request: AiChatRequestDto,
  { userId }: ServiceOptions
): Promise<PreparedChatTurn | null> {
  const content = latestUserTextFromRequest(request);
  if (!content) {
    return null;
  }

  const conversation = await getOrCreateCurrentConversation(userId);
  const conversationId = conversationObjectId(conversation);
  const expansionRequest = await resolveExpansionRequest(
    conversationId,
    userId,
    expansionOfferIdFromRequest(request)
  );
  const userMessage = await ChatMessage.create({
    conversationId,
    userId,
    role: 'user',
    content,
    focusSnapshot: focusSnapshotFromContext(request.context),
    runtimeMeta: expansionRequest
      ? {
          expansionRequest: {
            offerId: expansionRequest.offerId,
            status: 'accepted'
          }
        }
      : undefined
  });
  await markExpansionOfferAccepted(conversationId, userId, expansionRequest, userMessage);
  await touchConversation(conversationId, userId);
  const messages = await listConversationMessages(conversationId, userId);

  return {
    conversation,
    userMessage,
    latestUserText: content,
    messages: coreMessagesFromDtos(messages),
    providerState: normalizeProviderState(conversation.providerState),
    expansionRequest
  };
}

export async function appendAssistantMessage(
  preparedTurn: PreparedChatTurn,
  reply: string,
  result: {
    providerState?: unknown;
    sourceReceipts?: unknown;
    memoryCandidate?: unknown;
    responseStrategy?: unknown;
  },
  { userId }: ServiceOptions
): Promise<ChatMessageDto | undefined> {
  const conversationId = conversationObjectId(preparedTurn.conversation);
  const providerState = normalizeProviderState(result.providerState);
  const responseStrategy = normalizeResponseStrategy(result.responseStrategy);
  const runtimeMeta = responseStrategy
    ? {
        responseStrategy,
        ...(responseStrategy.action === 'expansion_offer'
          ? {
              expansionOffer: {
                status: 'pending',
                originalUserMessageId: recordId(preparedTurn.userMessage),
                originalUserText: preparedTurn.latestUserText,
                createdAt: new Date()
              }
            }
          : {})
      }
    : undefined;
  const message = await ChatMessage.create({
    conversationId,
    userId,
    role: 'assistant',
    content: reply,
    providerState,
    sourceReceipts: normalizeSourceReceipts(result.sourceReceipts),
    memoryCandidate: normalizeMemoryCandidate(result.memoryCandidate),
    runtimeMeta
  });
  await touchConversation(conversationId, userId, providerState);
  return toChatMessageDto(message);
}

export const __test__ = {
  CHAT_SESSION_MESSAGE_LIMIT,
  latestUserTextFromRequest,
  normalizeProviderState
};

export default {
  appendAssistantMessage,
  archiveCurrentChatSession,
  loadCurrentChatSession,
  preparePersistentChatTurn,
  __test__
};
