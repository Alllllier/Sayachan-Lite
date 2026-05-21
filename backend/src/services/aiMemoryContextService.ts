import type { ObjectId } from '../domain/objectIds.js';
import type { RuntimeDocument } from '../domain/lifecycle.js';
import MemoryEntry from '../models/MemoryEntry.js';

export type MemoryContextItemType = 'preference' | 'continuity_hint';
export type MemoryContextSource = 'memory_ledger_v1' | 'manual' | 'assistant_suggested_user_approved';

export type MemoryContextItem = {
  type: MemoryContextItemType;
  content: string;
  source: MemoryContextSource;
};

export type MemoryContextSnapshot = {
  packetType: 'memory_context_snapshot';
  version: 1;
  status: 'available' | 'empty';
  generatedAt: string;
  source: MemoryContextSource;
  items: MemoryContextItem[];
};

type BuildMemoryContextOptions = {
  userRole?: string | null;
  now?: Date;
};

const MEMORY_ACCESS_ROLES = new Set(['owner', 'tester']);

function toPlainObject(entity: RuntimeDocument): Record<string, unknown> {
  return entity.toObject ? entity.toObject() : { ...entity };
}

function memoryItem(entry: RuntimeDocument): MemoryContextItem | null {
  const normalized = toPlainObject(entry);
  if (normalized.type !== 'preference' && normalized.type !== 'continuity_hint') {
    return null;
  }
  if (typeof normalized.content !== 'string' || normalized.content.trim().length === 0) {
    return null;
  }

  return {
    type: normalized.type,
    content: normalized.content.trim(),
    source: normalized.source === 'assistant_suggested_user_approved'
      ? 'assistant_suggested_user_approved'
      : 'manual'
  };
}

export async function buildMemoryContextSnapshot(
  userId: ObjectId | null | undefined,
  options: BuildMemoryContextOptions = {}
): Promise<MemoryContextSnapshot | null> {
  if (!userId || !MEMORY_ACCESS_ROLES.has(options.userRole || '')) {
    return null;
  }

  const entries = await MemoryEntry.find({ userId, active: true }).sort({ updatedAt: -1 });
  const items = entries.map(memoryItem).filter(Boolean) as MemoryContextItem[];

  return {
    packetType: 'memory_context_snapshot',
    version: 1,
    status: items.length > 0 ? 'available' : 'empty',
    generatedAt: (options.now || new Date()).toISOString(),
    source: 'memory_ledger_v1',
    items
  };
}

export const __test__ = {
  MEMORY_ACCESS_ROLES
};

export default {
  buildMemoryContextSnapshot,
  __test__
};
