import type { ObjectId } from '../domain/objectIds.js';

export type MemoryContextItemType = 'preference' | 'continuity_hint';
export type MemoryContextSource = 'backend_seed_v0';

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

const MEMORY_SEED_ROLES = new Set(['owner', 'tester']);

const SEED_ITEMS: MemoryContextItem[] = [
  {
    type: 'preference',
    content: 'The user prefers complex AI architecture to be explained first in plain language, then with concise system boundaries.',
    source: 'backend_seed_v0'
  },
  {
    type: 'continuity_hint',
    content: 'The user is actively building Sayachan / personal_os_lite and wants architectural tradeoffs to stay visible before implementation.',
    source: 'backend_seed_v0'
  }
];

export async function buildMemoryContextSnapshot(
  userId: ObjectId | null | undefined,
  options: BuildMemoryContextOptions = {}
): Promise<MemoryContextSnapshot | null> {
  await Promise.resolve();
  if (!userId || !MEMORY_SEED_ROLES.has(options.userRole || '')) {
    return null;
  }

  return {
    packetType: 'memory_context_snapshot',
    version: 1,
    status: SEED_ITEMS.length > 0 ? 'available' : 'empty',
    generatedAt: (options.now || new Date()).toISOString(),
    source: 'backend_seed_v0',
    items: SEED_ITEMS.map((item) => ({ ...item }))
  };
}

export const __test__ = {
  SEED_ITEMS,
  MEMORY_SEED_ROLES
};

export default {
  buildMemoryContextSnapshot,
  __test__
};
