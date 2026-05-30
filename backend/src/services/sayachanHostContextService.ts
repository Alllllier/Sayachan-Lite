import {
  sayaDeskHostCapabilityManifestSchema,
  type SayaDeskHostCapabilityManifestDto,
  type SayaDeskSayachanFocusDto
} from '@sayachan/contracts';
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

type HexStringLike = {
  toHexString: () => string;
};

export type SayaDeskAuthorizedFocusSnapshot = {
  packetType: 'saya_desk_focus_snapshot';
  version: 1;
  source: 'saya_desk_authorized_focus';
  type: 'note' | 'project' | 'task';
  id: string;
  title: string;
  summary?: string;
  excerpt?: string;
  status?: string;
  lifecycle?: 'active' | 'archived';
  currentFocusTaskTitle?: string | null;
  originModule?: string;
  originId?: string | null;
  updatedAt?: string | null;
};

export type SayaDeskHostCapabilityManifest = SayaDeskHostCapabilityManifestDto;

function isDatabaseReady(): boolean {
  return [Note, Project, Task].every((model) => Number(model.db.readyState) === 1);
}

function plainObject(doc: RuntimeDocument | null | undefined): Record<string, unknown> {
  if (!doc) return {};
  return typeof doc.toObject === 'function' ? doc.toObject() : { ...doc };
}

function asRuntimeDocument(value: unknown): RuntimeDocument | null {
  return value && typeof value === 'object' ? value as RuntimeDocument : null;
}

function hasToHexString(value: unknown): value is HexStringLike {
  return typeof value === 'object'
    && value !== null
    && 'toHexString' in value
    && typeof value.toHexString === 'function';
}

function stringValue(value: unknown, fallback = ''): string {
  if (typeof value === 'string') return value;
  if (value === null || value === undefined) return fallback;
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') return value.toString();
  if (hasToHexString(value)) return value.toHexString();
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

function excerpt(value: unknown, maxChars: number): string {
  const normalized = stringValue(value).replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) return normalized;
  return `${normalized.slice(0, Math.max(0, maxChars - 1)).trimEnd()}...`;
}

async function resolveFocusTaskTitle(project: Record<string, unknown>, userId: ObjectId): Promise<string | null> {
  const focusTaskId = nullableStringValue(project.currentFocusTaskId);
  if (!focusTaskId) return null;

  const task = asRuntimeDocument(await Task.findOne(combineFilters(
    buildArchiveFilter('false'),
    { _id: toObjectId(focusTaskId, 'focus.currentFocusTaskId'), userId, status: 'active' }
  )));
  return task ? stringValue(plainObject(task).title).trim() || null : null;
}

async function projectFocusSnapshot(id: ObjectId, userId: ObjectId): Promise<SayaDeskAuthorizedFocusSnapshot | null> {
  const project = asRuntimeDocument(await Project.findOne(combineFilters(
    buildArchiveFilter('false'),
    { _id: id, userId }
  )));
  if (!project) return null;

  const normalized = plainObject(project);
  return {
    packetType: 'saya_desk_focus_snapshot',
    version: 1,
    source: 'saya_desk_authorized_focus',
    type: 'project',
    id: stringValue(normalized._id),
    title: stringValue(normalized.name),
    summary: stringValue(normalized.summary),
    status: deriveProjectLifecycleStatus(normalized),
    lifecycle: isArchivedEntity(normalized) ? 'archived' : 'active',
    currentFocusTaskTitle: await resolveFocusTaskTitle(normalized, userId),
    updatedAt: isoString(normalized.updatedAt)
  };
}

async function noteFocusSnapshot(id: ObjectId, userId: ObjectId): Promise<SayaDeskAuthorizedFocusSnapshot | null> {
  const note = asRuntimeDocument(await Note.findOne(combineFilters(
    buildArchiveFilter('false'),
    { _id: id, userId }
  )));
  if (!note) return null;

  const normalized = plainObject(note);
  return {
    packetType: 'saya_desk_focus_snapshot',
    version: 1,
    source: 'saya_desk_authorized_focus',
    type: 'note',
    id: stringValue(normalized._id),
    title: stringValue(normalized.title),
    excerpt: excerpt(normalized.content, 500),
    lifecycle: isArchivedEntity(normalized) ? 'archived' : 'active',
    updatedAt: isoString(normalized.updatedAt)
  };
}

async function taskFocusSnapshot(id: ObjectId, userId: ObjectId): Promise<SayaDeskAuthorizedFocusSnapshot | null> {
  const task = asRuntimeDocument(await Task.findOne(combineFilters(
    buildArchiveFilter('false'),
    { _id: id, userId }
  )));
  if (!task) return null;

  const normalized = plainObject(task);
  return {
    packetType: 'saya_desk_focus_snapshot',
    version: 1,
    source: 'saya_desk_authorized_focus',
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

export async function buildSayaDeskFocusSnapshot(
  focus: SayaDeskSayachanFocusDto | null | undefined,
  userId: ObjectId | null | undefined
): Promise<SayaDeskAuthorizedFocusSnapshot | null> {
  if (!focus || !userId || !isDatabaseReady()) {
    return null;
  }

  const id = toObjectId(focus.id, 'focus.id');
  if (focus.type === 'project') return projectFocusSnapshot(id, userId);
  if (focus.type === 'note') return noteFocusSnapshot(id, userId);
  return taskFocusSnapshot(id, userId);
}

export function buildSayaDeskHostCapabilityManifest(): SayaDeskHostCapabilityManifest {
  return sayaDeskHostCapabilityManifestSchema.parse({
    packetType: 'saya_desk_host_capability_manifest',
    version: 1,
    status: 'executable',
    tools: [
      {
        name: 'saya_desk.search_product_context',
        label: '搜索工作区内容',
        description: 'Search authorized SayaDesk notes, projects, and tasks by short user-facing terms.',
        parameterSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            query: { type: 'string', minLength: 1 },
            terms: {
              type: 'array',
              items: { type: 'string', minLength: 1 },
              maxItems: 6
            },
            matchMode: { type: 'string', enum: ['any', 'all'] },
            domains: {
              type: 'array',
              items: { type: 'string', enum: ['notes', 'projects', 'tasks'] }
            }
          }
        },
        resultSummary: 'Returns matched notes, projects, and tasks with compact excerpts and source receipts.',
        risk: 'read_only',
        requiresConfirmation: false,
        execution: 'host_gateway_route'
      },
      {
        name: 'saya_desk.get_project_context',
        label: '读取项目上下文',
        description: 'Read the authorized project summary and current focus metadata.',
        parameterSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            projectId: { type: 'string', minLength: 1 }
          }
        },
        resultSummary: 'Returns a compact authorized project context snapshot.',
        risk: 'read_only',
        requiresConfirmation: false,
        execution: 'host_gateway_route'
      },
      {
        name: 'saya_desk.list_project_tasks',
        label: '读取项目任务',
        description: 'List authorized active tasks for a project.',
        parameterSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            projectId: { type: 'string', minLength: 1 }
          }
        },
        resultSummary: 'Returns project task titles, statuses, and compact metadata.',
        risk: 'read_only',
        requiresConfirmation: false,
        execution: 'host_gateway_route'
      },
      {
        name: 'saya_desk.get_note_content',
        label: '读取笔记内容',
        description: 'Read authorized note content by note id or current note focus.',
        parameterSchema: {
          type: 'object',
          additionalProperties: false,
          properties: {
            noteId: { type: 'string', minLength: 1 }
          }
        },
        resultSummary: 'Returns note title, clipped content, updated time, and source receipt.',
        risk: 'read_only',
        requiresConfirmation: false,
        execution: 'host_gateway_route'
      }
    ]
  });
}

export default {
  buildSayaDeskFocusSnapshot,
  buildSayaDeskHostCapabilityManifest
};
