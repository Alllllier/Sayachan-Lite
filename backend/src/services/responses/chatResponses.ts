import {
  chatExpansionOfferSchema,
  chatConversationSchema,
  chatMessageSchema,
  type ChatConversationDto,
  type ChatMessageDto
} from '@sayachan/contracts';

type RuntimeDocument = {
  toObject: () => Record<string, unknown>;
};

function isRuntimeDocument(value: unknown): value is RuntimeDocument {
  return typeof value === 'object'
    && value !== null
    && 'toObject' in value
    && typeof value.toObject === 'function';
}

function toPlainObject(entity: unknown): Record<string, unknown> {
  if (isRuntimeDocument(entity)) {
    return entity.toObject();
  }
  return entity && typeof entity === 'object' ? { ...entity } : {};
}

function hasToHexString(value: unknown): value is { toHexString: () => string } {
  return typeof value === 'object'
    && value !== null
    && 'toHexString' in value
    && typeof value.toHexString === 'function';
}

function publicString(value: unknown): string | undefined {
  if (value === null || value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value.toString();
  }
  if (hasToHexString(value)) {
    return value.toHexString();
  }
  return undefined;
}

function publicIsoString(value: unknown): string | undefined {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
}

function publicContent(value: unknown): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return '';
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value.toString();
  }
  return '';
}

function copyIfPresent(source: Record<string, unknown>, target: Record<string, unknown>, fields: string[]): void {
  for (const field of fields) {
    if (Object.hasOwn(source, field) && source[field] !== undefined) {
      target[field] = source[field];
    }
  }
}

function runtimeExpansionOffer(message: Record<string, unknown>): unknown {
  const runtimeMeta = message.runtimeMeta;
  if (!runtimeMeta || typeof runtimeMeta !== 'object' || Array.isArray(runtimeMeta)) {
    return undefined;
  }

  const expansionOffer = (runtimeMeta as { expansionOffer?: unknown }).expansionOffer;
  if (!expansionOffer || typeof expansionOffer !== 'object' || Array.isArray(expansionOffer)) {
    return undefined;
  }

  const parsed = chatExpansionOfferSchema.safeParse({
    offerId: publicString(message._id),
    status: (expansionOffer as { status?: unknown }).status
  });
  return parsed.success ? parsed.data : undefined;
}

export function toChatConversationDto(conversation: unknown): ChatConversationDto | undefined {
  if (!conversation) {
    return undefined;
  }

  const normalized = toPlainObject(conversation);
  return chatConversationSchema.parse({
    _id: publicString(normalized._id),
    createdAt: publicIsoString(normalized.createdAt),
    updatedAt: publicIsoString(normalized.updatedAt)
  });
}

export function toChatMessageDto(message: unknown): ChatMessageDto | undefined {
  if (!message) {
    return undefined;
  }

  const normalized = toPlainObject(message);
  const dto: Record<string, unknown> = {
    _id: publicString(normalized._id),
    role: normalized.role,
    content: publicContent(normalized.content),
    createdAt: publicIsoString(normalized.createdAt)
  };
  copyIfPresent(normalized, dto, ['focusSnapshot', 'sourceReceipts', 'memoryCandidate']);
  const expansionOffer = runtimeExpansionOffer(normalized);
  if (expansionOffer) {
    dto.expansionOffer = expansionOffer;
  }
  return chatMessageSchema.parse(dto);
}
