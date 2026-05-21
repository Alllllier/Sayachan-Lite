import {
  memoryEntryResponseSchema,
  type MemoryEntryDto as SharedMemoryEntryDto
} from '@sayachan/contracts';
import type { RuntimeDocument } from '../../domain/lifecycle.js';

export type MemoryEntryDto = SharedMemoryEntryDto;

function toPlainObject(entity: RuntimeDocument): Record<string, unknown> {
  return entity.toObject ? entity.toObject() : { ...entity };
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

export function toMemoryEntryDto(entry: RuntimeDocument | null | undefined): MemoryEntryDto | null | undefined {
  if (!entry) {
    return entry;
  }

  const normalized = toPlainObject(entry);
  return memoryEntryResponseSchema.parse({
    _id: publicString(normalized._id),
    type: normalized.type,
    content: normalized.content,
    active: normalized.active === true,
    source: normalized.source || 'manual',
    createdAt: publicIsoString(normalized.createdAt),
    updatedAt: publicIsoString(normalized.updatedAt)
  });
}
