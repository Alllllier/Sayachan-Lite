import {
  type AiChatRequestDto,
  chatMemoryCandidateSchema,
  chatProviderStateSchema,
  chatSessionResponseSchema,
  chatSourceReceiptSchema,
  type ChatMessageDto,
  type ChatProviderStateSource,
  type ChatProviderStateStrategy,
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

function coreMessagesFromDtos(messages: ChatMessageDto[]): ChatMessageDto[] {
  return messages.map(message => ({
    role: message.role,
    content: message.content
  }));
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
  const userMessage = await ChatMessage.create({
    conversationId,
    userId,
    role: 'user',
    content,
    focusSnapshot: focusSnapshotFromContext(request.context)
  });
  await touchConversation(conversationId, userId);
  const messages = await listConversationMessages(conversationId, userId);

  return {
    conversation,
    userMessage,
    latestUserText: content,
    messages: coreMessagesFromDtos(messages),
    providerState: normalizeProviderState(conversation.providerState)
  };
}

export async function appendAssistantMessage(
  preparedTurn: PreparedChatTurn,
  reply: string,
  result: {
    providerState?: unknown;
    sourceReceipts?: unknown;
    memoryCandidate?: unknown;
  },
  { userId }: ServiceOptions
): Promise<ChatMessageDto | undefined> {
  const conversationId = conversationObjectId(preparedTurn.conversation);
  const providerState = normalizeProviderState(result.providerState);
  const message = await ChatMessage.create({
    conversationId,
    userId,
    role: 'assistant',
    content: reply,
    providerState,
    sourceReceipts: normalizeSourceReceipts(result.sourceReceipts),
    memoryCandidate: normalizeMemoryCandidate(result.memoryCandidate)
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
