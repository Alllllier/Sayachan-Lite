import type { ObjectId } from '../domain/objectIds.js';
import Note from '../models/Note.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import {
  buildArchiveFilter,
  combineFilters
} from './queryFilters.js';

export type ProductContextStatus = 'available' | 'empty' | 'blocked';

export type ProductContextLimits = {
  maxProjects: number;
  maxTasks: number;
  maxNotes: number;
  noteExcerptChars: number;
};

export type ProductContextProject = {
  id: string;
  name: string;
  summary: string;
  status: string;
  isPinned: boolean;
  currentFocusTaskTitle: string | null;
  updatedAt: string | null;
};

export type ProductContextTask = {
  id: string;
  title: string;
  status: string;
  originModule: string;
  originId: string | null;
  updatedAt: string | null;
};

export type ProductContextNote = {
  id: string;
  title: string;
  excerpt: string;
  isPinned: boolean;
  updatedAt: string | null;
};

export type ProductContextOmission = {
  source: 'projects' | 'tasks' | 'notes';
  reason: 'limit';
  omittedCount: number | null;
};

export type ProductContextSnapshot = {
  packetType: 'product_context_snapshot';
  version: 1;
  status: ProductContextStatus;
  generatedAt: string;
  sources: Array<'projects' | 'tasks' | 'notes'>;
  limits: ProductContextLimits;
  projects: ProductContextProject[];
  tasks: ProductContextTask[];
  notes: ProductContextNote[];
  omitted: ProductContextOmission[];
};

type RuntimeDocument = {
  toObject?: () => Record<string, unknown>;
  [key: string]: unknown;
};

type LimitedResult<T> = {
  items: T[];
  truncated: boolean;
};

type BuildOptions = {
  allowDisconnected?: boolean;
  limits?: Partial<ProductContextLimits>;
  now?: Date;
};

const DEFAULT_LIMITS: ProductContextLimits = {
  maxProjects: 5,
  maxTasks: 8,
  maxNotes: 5,
  noteExcerptChars: 280
};

function mergedLimits(overrides: Partial<ProductContextLimits> = {}): ProductContextLimits {
  return {
    maxProjects: positiveLimit(overrides.maxProjects, DEFAULT_LIMITS.maxProjects),
    maxTasks: positiveLimit(overrides.maxTasks, DEFAULT_LIMITS.maxTasks),
    maxNotes: positiveLimit(overrides.maxNotes, DEFAULT_LIMITS.maxNotes),
    noteExcerptChars: positiveLimit(overrides.noteExcerptChars, DEFAULT_LIMITS.noteExcerptChars)
  };
}

function positiveLimit(value: unknown, fallback: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric) || numeric <= 0) {
    return fallback;
  }
  return Math.floor(numeric);
}

function isDatabaseReady(): boolean {
  return [Note, Project, Task].every((model) => model.db.readyState === 1);
}

function plainObject(doc: RuntimeDocument): Record<string, unknown> {
  return typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
}

function stringValue(value: unknown, fallback = ''): string {
  if (typeof value === 'string') {
    return value;
  }
  if (value === null || value === undefined) {
    return fallback;
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value.toString();
  }
  if (typeof value === 'object' && value !== null && 'toHexString' in value && typeof value.toHexString === 'function') {
    return value.toHexString();
  }
  return fallback;
}

function nullableStringValue(value: unknown): string | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }
  const normalized = stringValue(value).trim();
  return normalized || null;
}

function isoString(value: unknown): string | null {
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return null;
}

function excerpt(value: unknown, maxChars: number): string {
  const normalized = stringValue(value).replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) {
    return normalized;
  }
  return normalized.slice(0, Math.max(0, maxChars - 1)).trimEnd() + '…';
}

async function findLimited<T>(
  model: { find: (filter: Record<string, unknown>) => unknown },
  filter: Record<string, unknown>,
  sort: Record<string, 1 | -1>,
  limit: number
): Promise<LimitedResult<T>> {
  const query = model.find(filter) as {
    sort?: (sort: Record<string, 1 | -1>) => unknown;
    limit?: (limit: number) => unknown;
    then?: Promise<T[]>['then'];
  };
  const sorted = typeof query.sort === 'function' ? query.sort(sort) : query;
  const limited = sorted && typeof (sorted as { limit?: unknown }).limit === 'function'
    ? (sorted as { limit: (limit: number) => unknown }).limit(limit + 1)
    : sorted;
  const docs = await limited as T[];
  const items = Array.isArray(docs) ? docs : [];

  return {
    items: items.slice(0, limit),
    truncated: items.length > limit
  };
}

function toFocusTaskMap(tasks: RuntimeDocument[]): Map<string, string> {
  const map = new Map<string, string>();

  for (const task of tasks) {
    const normalized = plainObject(task);
    const id = stringValue(normalized._id);
    const title = stringValue(normalized.title).trim();
    if (id && title) {
      map.set(id, title);
    }
  }

  return map;
}

async function resolveFocusTasks(projects: RuntimeDocument[], userId: ObjectId): Promise<Map<string, string>> {
  const ids = projects
    .map((project) => nullableStringValue(plainObject(project).currentFocusTaskId))
    .filter((id): id is string => Boolean(id));

  if (ids.length === 0) {
    return new Map();
  }

  const uniqueIds = [...new Set(ids)];
  const tasks = await Task.find({
    $and: [
      { _id: { $in: uniqueIds } },
      { userId },
      buildArchiveFilter('false'),
      { status: 'active' }
    ]
  }) as RuntimeDocument[];

  return toFocusTaskMap(tasks);
}

function projectItem(project: RuntimeDocument, focusTaskMap: Map<string, string>): ProductContextProject {
  const normalized = plainObject(project);
  const focusTaskId = nullableStringValue(normalized.currentFocusTaskId);

  return {
    id: stringValue(normalized._id),
    name: stringValue(normalized.name),
    summary: stringValue(normalized.summary),
    status: stringValue(normalized.status, 'pending'),
    isPinned: normalized.isPinned === true,
    currentFocusTaskTitle: focusTaskId ? focusTaskMap.get(focusTaskId) || null : null,
    updatedAt: isoString(normalized.updatedAt)
  };
}

function taskItem(task: RuntimeDocument): ProductContextTask {
  const normalized = plainObject(task);

  return {
    id: stringValue(normalized._id),
    title: stringValue(normalized.title),
    status: stringValue(normalized.status, 'active'),
    originModule: stringValue(normalized.originModule),
    originId: nullableStringValue(normalized.originId),
    updatedAt: isoString(normalized.updatedAt)
  };
}

function noteItem(note: RuntimeDocument, limits: ProductContextLimits): ProductContextNote {
  const normalized = plainObject(note);

  return {
    id: stringValue(normalized._id),
    title: stringValue(normalized.title),
    excerpt: excerpt(normalized.content, limits.noteExcerptChars),
    isPinned: normalized.isPinned === true,
    updatedAt: isoString(normalized.updatedAt)
  };
}

function omission(source: ProductContextOmission['source'], truncated: boolean): ProductContextOmission | null {
  if (!truncated) {
    return null;
  }

  return {
    source,
    reason: 'limit',
    omittedCount: null
  };
}

function snapshotStatus(snapshot: Pick<ProductContextSnapshot, 'projects' | 'tasks' | 'notes'>): ProductContextStatus {
  return snapshot.projects.length + snapshot.tasks.length + snapshot.notes.length > 0 ? 'available' : 'empty';
}

export async function buildProductContextSnapshot(
  userId: ObjectId | null | undefined,
  options: BuildOptions = {}
): Promise<ProductContextSnapshot | null> {
  if (!userId) {
    return null;
  }

  const limits = mergedLimits(options.limits);
  const generatedAt = (options.now || new Date()).toISOString();

  if (!options.allowDisconnected && !isDatabaseReady()) {
    return null;
  }

  const [projectResult, taskResult, noteResult] = await Promise.all([
    findLimited<RuntimeDocument>(
      Project,
      combineFilters(buildArchiveFilter('false'), { userId }),
      { isPinned: -1, pinnedAt: -1, updatedAt: -1 },
      limits.maxProjects
    ),
    findLimited<RuntimeDocument>(
      Task,
      combineFilters(buildArchiveFilter('false'), { userId }, { status: 'active' }),
      { updatedAt: -1, createdAt: -1 },
      limits.maxTasks
    ),
    findLimited<RuntimeDocument>(
      Note,
      combineFilters(buildArchiveFilter('false'), { userId }),
      { isPinned: -1, pinnedAt: -1, updatedAt: -1 },
      limits.maxNotes
    )
  ]);
  const focusTaskMap = await resolveFocusTasks(projectResult.items, userId);
  const omitted = [
    omission('projects', projectResult.truncated),
    omission('tasks', taskResult.truncated),
    omission('notes', noteResult.truncated)
  ].filter((item): item is ProductContextOmission => Boolean(item));
  const snapshot = {
    packetType: 'product_context_snapshot',
    version: 1,
    status: 'empty',
    generatedAt,
    sources: ['projects', 'tasks', 'notes'],
    limits,
    projects: projectResult.items.map((project) => projectItem(project, focusTaskMap)),
    tasks: taskResult.items.map(taskItem),
    notes: noteResult.items.map((note) => noteItem(note, limits)),
    omitted
  } satisfies ProductContextSnapshot;

  return {
    ...snapshot,
    status: snapshotStatus(snapshot)
  };
}

export const __test__ = {
  DEFAULT_LIMITS
};

export default {
  buildProductContextSnapshot,
  __test__
};
