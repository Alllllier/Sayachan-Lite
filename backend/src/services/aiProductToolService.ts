import type { ObjectId } from '../domain/objectIds.js';
import { toObjectId } from '../domain/objectIds.js';
import {
  deriveProjectLifecycleStatus,
  deriveTaskLifecycleStatus,
  isArchivedEntity
} from '../domain/lifecycle.js';
import Note from '../models/Note.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { buildArchiveFilter, combineFilters } from './queryFilters.js';

type RuntimeDocument = {
  toObject?: () => Record<string, unknown>;
  [key: string]: unknown;
};

type ProductToolRequest = {
  name: string;
  arguments?: Record<string, unknown>;
  userId: ObjectId;
};

const PRODUCT_DOMAINS = new Set(['projects', 'notes', 'tasks']);
const TASK_STATUSES = new Set(['active', 'completed']);
const NOTE_CONTENT_DEFAULT_CHARS = 2000;
const NOTE_CONTENT_MAX_CHARS = 4000;
const SEARCH_DEFAULT_LIMIT = 5;
const SEARCH_MAX_LIMIT = 10;

function plainObject(doc: RuntimeDocument | null | undefined): Record<string, unknown> {
  if (!doc) return {};
  return typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
}

function asRuntimeDocument(value: unknown): RuntimeDocument | null {
  return value && typeof value === 'object' ? value as RuntimeDocument : null;
}

function asRuntimeDocuments(value: unknown): RuntimeDocument[] {
  return Array.isArray(value)
    ? value.filter((item): item is RuntimeDocument => Boolean(item) && typeof item === 'object')
    : [];
}

function stringValue(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return value.toString();
  if (typeof value === 'object' && value !== null && 'toHexString' in value && typeof value.toHexString === 'function') {
    return value.toHexString();
  }
  return fallback;
}

function nullableStringValue(value: unknown): string | null {
  const normalized = stringValue(value).trim();
  return normalized || null;
}

function isoString(value: unknown): string | null {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return null;
}

function boundedInteger(value: unknown, fallback: number, min: number, max: number): number {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return fallback;
  return Math.max(min, Math.min(max, Math.floor(numeric)));
}

function excerpt(value: unknown, maxChars: number): string {
  const normalized = stringValue(value).replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, Math.max(0, maxChars - 1)).trimEnd()}...`;
}

function escapeRegex(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function safeObjectId(value: unknown): ObjectId | null {
  try {
    return toObjectId(value, 'tool.arguments.id');
  } catch {
    return null;
  }
}

function normalizeDomains(value: unknown): Array<'projects' | 'notes' | 'tasks'> {
  if (!Array.isArray(value)) return ['projects', 'notes', 'tasks'];
  const domains = value.filter((item): item is 'projects' | 'notes' | 'tasks' => (
    typeof item === 'string' && PRODUCT_DOMAINS.has(item)
  ));
  return domains.length > 0 ? [...new Set(domains)] : ['projects', 'notes', 'tasks'];
}

function projectSearchItem(project: RuntimeDocument) {
  const normalized = plainObject(project);
  return {
    type: 'project',
    id: stringValue(normalized._id),
    title: stringValue(normalized.name),
    status: deriveProjectLifecycleStatus(normalized),
    lifecycle: isArchivedEntity(normalized) ? 'archived' : 'active',
    summary: excerpt(normalized.summary, 220),
    updatedAt: isoString(normalized.updatedAt)
  };
}

function noteSearchItem(note: RuntimeDocument) {
  const normalized = plainObject(note);
  return {
    type: 'note',
    id: stringValue(normalized._id),
    title: stringValue(normalized.title),
    lifecycle: isArchivedEntity(normalized) ? 'archived' : 'active',
    excerpt: excerpt(normalized.content, 220),
    updatedAt: isoString(normalized.updatedAt)
  };
}

function taskSearchItem(task: RuntimeDocument) {
  const normalized = plainObject(task);
  return {
    type: 'task',
    id: stringValue(normalized._id),
    title: stringValue(normalized.title),
    status: deriveTaskLifecycleStatus(normalized),
    lifecycle: isArchivedEntity(normalized) ? 'archived' : 'active',
    originModule: stringValue(normalized.originModule),
    originId: nullableStringValue(normalized.originId),
    updatedAt: isoString(normalized.updatedAt)
  };
}

async function searchProductContext(args: Record<string, unknown>, userId: ObjectId) {
  const query = stringValue(args.query).trim();
  const domains = normalizeDomains(args.domains);
  const limit = boundedInteger(args.limit, SEARCH_DEFAULT_LIMIT, 1, SEARCH_MAX_LIMIT);

  if (!query) {
    return {
      status: 'empty',
      query,
      domains,
      results: []
    };
  }

  const regex = new RegExp(escapeRegex(query), 'i');
  const results: unknown[] = [];

  if (domains.includes('projects')) {
    const projects = asRuntimeDocuments(await Project.find(combineFilters(
      buildArchiveFilter('false'),
      { userId },
      { $or: [{ name: regex }, { summary: regex }] }
    )).sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 }).limit(limit));
    results.push(...projects.map(projectSearchItem));
  }

  if (domains.includes('notes')) {
    const notes = asRuntimeDocuments(await Note.find(combineFilters(
      buildArchiveFilter('false'),
      { userId },
      { $or: [{ title: regex }, { content: regex }] }
    )).sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 }).limit(limit));
    results.push(...notes.map(noteSearchItem));
  }

  if (domains.includes('tasks')) {
    const tasks = asRuntimeDocuments(await Task.find(combineFilters(
      buildArchiveFilter('false'),
      { userId },
      { title: regex }
    )).sort({ updatedAt: -1, createdAt: -1 }).limit(limit));
    results.push(...tasks.map(taskSearchItem));
  }

  return {
    status: results.length > 0 ? 'available' : 'empty',
    query,
    domains,
    limit,
    results
  };
}

function projectContextItem(project: RuntimeDocument, focusTaskTitle: string | null) {
  const normalized = plainObject(project);
  return {
    id: stringValue(normalized._id),
    title: stringValue(normalized.name),
    summary: stringValue(normalized.summary),
    status: deriveProjectLifecycleStatus(normalized),
    lifecycle: isArchivedEntity(normalized) ? 'archived' : 'active',
    isPinned: normalized.isPinned === true,
    currentFocusTaskTitle: focusTaskTitle,
    updatedAt: isoString(normalized.updatedAt)
  };
}

function taskItem(task: RuntimeDocument) {
  const normalized = plainObject(task);
  return {
    id: stringValue(normalized._id),
    title: stringValue(normalized.title),
    status: deriveTaskLifecycleStatus(normalized),
    lifecycle: isArchivedEntity(normalized) ? 'archived' : 'active',
    originModule: stringValue(normalized.originModule),
    originId: nullableStringValue(normalized.originId),
    updatedAt: isoString(normalized.updatedAt)
  };
}

async function resolveFocusTaskTitle(project: Record<string, unknown>, userId: ObjectId): Promise<string | null> {
  const focusTaskId = safeObjectId(project.currentFocusTaskId);
  if (!focusTaskId) return null;
  const focusTask = asRuntimeDocument(await Task.findOne(combineFilters(
    buildArchiveFilter('false'),
    { _id: focusTaskId, userId, status: 'active' }
  )));
  return focusTask ? stringValue(plainObject(focusTask).title).trim() || null : null;
}

async function getProjectContext(args: Record<string, unknown>, userId: ObjectId) {
  const projectId = safeObjectId(args.projectId);
  if (!projectId) return { status: 'not_found', reason: 'invalid_or_missing_project' };

  const project = asRuntimeDocument(await Project.findOne(combineFilters(
    buildArchiveFilter('false'),
    { _id: projectId, userId }
  )));
  if (!project) return { status: 'not_found', reason: 'project_not_available' };

  const projectObject = plainObject(project);
  const [focusTaskTitle, rawTasks] = await Promise.all([
    resolveFocusTaskTitle(projectObject, userId),
    Task.find(combineFilters(
      buildArchiveFilter('false'),
      { userId, originModule: 'project', originId: projectId }
    )).sort({ status: 1, updatedAt: -1, createdAt: -1 }).limit(20)
  ]);
  const tasks = asRuntimeDocuments(rawTasks);

  return {
    status: 'available',
    project: projectContextItem(project, focusTaskTitle),
    tasks: tasks.map(taskItem)
  };
}

async function listProjectTasks(args: Record<string, unknown>, userId: ObjectId) {
  const projectId = safeObjectId(args.projectId);
  if (!projectId) return { status: 'not_found', reason: 'invalid_or_missing_project' };

  const project = asRuntimeDocument(await Project.findOne(combineFilters(
    buildArchiveFilter('false'),
    { _id: projectId, userId }
  )));
  if (!project) return { status: 'not_found', reason: 'project_not_available' };

  const statuses = Array.isArray(args.status)
    ? args.status.filter((status): status is 'active' | 'completed' => typeof status === 'string' && TASK_STATUSES.has(status))
    : [];
  const statusFilter = statuses.length > 0 ? { status: { $in: statuses } } : {};
  const tasks = asRuntimeDocuments(await Task.find(combineFilters(
    buildArchiveFilter('false'),
    { userId, originModule: 'project', originId: projectId },
    statusFilter
  )).sort({ status: 1, updatedAt: -1, createdAt: -1 }).limit(50));

  return {
    status: tasks.length > 0 ? 'available' : 'empty',
    project: {
      id: stringValue(plainObject(project)._id),
      title: stringValue(plainObject(project).name)
    },
    filters: { status: statuses },
    tasks: tasks.map(taskItem)
  };
}

async function getNoteContent(args: Record<string, unknown>, userId: ObjectId) {
  const noteId = safeObjectId(args.noteId);
  if (!noteId) return { status: 'not_found', reason: 'invalid_or_missing_note' };
  const maxChars = boundedInteger(args.maxChars, NOTE_CONTENT_DEFAULT_CHARS, 200, NOTE_CONTENT_MAX_CHARS);
  const purpose = ['summarize', 'answer_question', 'extract_tasks', 'continue_context'].includes(stringValue(args.purpose))
    ? stringValue(args.purpose)
    : 'continue_context';

  const note = asRuntimeDocument(await Note.findOne(combineFilters(
    buildArchiveFilter('false'),
    { _id: noteId, userId }
  )));
  if (!note) return { status: 'not_found', reason: 'note_not_available' };

  const normalized = plainObject(note);
  const content = stringValue(normalized.content);
  const returnedContent = content.length <= maxChars ? content : content.slice(0, maxChars);

  return {
    status: 'available',
    note: {
      id: stringValue(normalized._id),
      title: stringValue(normalized.title),
      lifecycle: isArchivedEntity(normalized) ? 'archived' : 'active',
      isPinned: normalized.isPinned === true,
      updatedAt: isoString(normalized.updatedAt)
    },
    purpose,
    content: returnedContent,
    contentChars: content.length,
    returnedChars: returnedContent.length,
    truncated: returnedContent.length < content.length,
    truncationReason: returnedContent.length < content.length ? 'maxChars' : null
  };
}

export async function executeProductContextTool({ name, arguments: args = {}, userId }: ProductToolRequest): Promise<unknown> {
  if (name === 'searchProductContext') return searchProductContext(args, userId);
  if (name === 'getProjectContext') return getProjectContext(args, userId);
  if (name === 'listProjectTasks') return listProjectTasks(args, userId);
  if (name === 'getNoteContent') return getNoteContent(args, userId);

  return {
    status: 'error',
    code: 'unknown_tool',
    message: `Unknown product context tool: ${name}`
  };
}

export const __test__ = {
  NOTE_CONTENT_DEFAULT_CHARS,
  NOTE_CONTENT_MAX_CHARS,
  SEARCH_DEFAULT_LIMIT,
  SEARCH_MAX_LIMIT
};

export default {
  executeProductContextTool,
  __test__
};
