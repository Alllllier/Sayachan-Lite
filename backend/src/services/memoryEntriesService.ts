import type {
  MemoryEntryCreateDto,
  MemoryEntryDto,
  MemoryEntryUpdateDto
} from '@sayachan/contracts';
import type { ObjectId } from '../domain/objectIds.js';
import { changedOnlyFilter } from './queryFilters.js';
import MemoryEntry from '../models/MemoryEntry.js';
import { toMemoryEntryDto } from './responses/memoryResponses.js';

type ServiceOptions = {
  userId: ObjectId;
};

type ListMemoryEntriesOptions = ServiceOptions & {
  active?: unknown;
};

type MemoryEntryUpdate = {
  type?: MemoryEntryUpdateDto['type'];
  content?: string;
  active?: boolean;
};

function activeFilter(value: unknown): Record<string, boolean> {
  if (value === true || value === 'true') {
    return { active: true };
  }
  if (value === false || value === 'false') {
    return { active: false };
  }
  return {};
}

function normalizeContent(content: string): string {
  return content.trim();
}

export async function listMemoryEntries({ active, userId }: ListMemoryEntriesOptions): Promise<MemoryEntryDto[]> {
  const entries = await MemoryEntry.find({ userId, ...activeFilter(active) })
    .sort({ active: -1, updatedAt: -1 });
  return entries.map(toMemoryEntryDto).filter(Boolean) as MemoryEntryDto[];
}

export async function createMemoryEntry(body: MemoryEntryCreateDto, { userId }: ServiceOptions): Promise<MemoryEntryDto> {
  const entry = await MemoryEntry.create({
    type: body.type,
    content: normalizeContent(body.content),
    active: body.active !== false,
    source: 'manual',
    userId
  });

  return toMemoryEntryDto(entry) as MemoryEntryDto;
}

export function buildMemoryEntryUpdate(body: MemoryEntryUpdateDto): MemoryEntryUpdate {
  const update: MemoryEntryUpdate = {};
  if (body.type !== undefined) {
    update.type = body.type;
  }
  if (body.content !== undefined) {
    update.content = normalizeContent(body.content);
  }
  if (body.active !== undefined) {
    update.active = body.active;
  }
  return update;
}

export async function updateMemoryEntry(
  id: ObjectId,
  body: MemoryEntryUpdateDto,
  { userId }: ServiceOptions
): Promise<MemoryEntryDto | null | undefined> {
  const filter = { _id: id, userId };
  const update = buildMemoryEntryUpdate(body);
  const entry = await MemoryEntry.findOneAndUpdate(
    changedOnlyFilter(filter, update),
    update,
    { new: true, runValidators: true }
  );

  return toMemoryEntryDto(entry || await MemoryEntry.findOne(filter));
}

export async function setMemoryEntryActive(
  id: ObjectId,
  active: boolean,
  { userId }: ServiceOptions
): Promise<MemoryEntryDto | null | undefined> {
  return updateMemoryEntry(id, { active }, { userId });
}

export async function deleteMemoryEntry(id: ObjectId, { userId }: ServiceOptions): Promise<boolean> {
  const entry = await MemoryEntry.findOneAndDelete({ _id: id, userId });
  return Boolean(entry);
}

export default {
  createMemoryEntry,
  deleteMemoryEntry,
  listMemoryEntries,
  setMemoryEntryActive,
  updateMemoryEntry
};
