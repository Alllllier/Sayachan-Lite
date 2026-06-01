import type {
  SayaDeskHostToolCapability,
  SayaDeskHostToolExecutionRequestDto,
  SayaDeskHostToolExecutionResultDto
} from '@sayachan/contracts';
import type { ObjectId } from '../domain/objectIds.js';
import { toObjectId } from '../domain/objectIds.js';
import { ForbiddenError } from '../http/httpErrors.js';
import Note from '../models/Note.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';
import { buildArchiveFilter, combineFilters } from './queryFilters.js';

type RuntimeDocument = {
  toObject?: () => Record<string, unknown>;
  [key: string]: unknown;
};

type ToolArgs = Record<string, unknown>;
type SearchDomain = 'notes' | 'projects' | 'tasks';
type SearchMatchMode = 'any' | 'all';
type NoteListSortBy = 'updatedAt' | 'createdAt';
type SearchExpression = {
  query: string;
  terms: string[];
  matchMode: SearchMatchMode;
  domains: SearchDomain[];
};
type HexStringLike = {
  toHexString: () => string;
};

const CONTENT_LIMIT = 6000;
const SEARCH_RESULT_LIMIT = 5;
const SEARCH_TERM_LIMIT = 6;
const SEARCH_TERM_CHAR_LIMIT = 40;
const SEARCH_DOMAINS: SearchDomain[] = ['notes', 'projects', 'tasks'];
const NOTE_LIST_DEFAULT_LIMIT = 20;
const NOTE_LIST_MAX_LIMIT = 30;
const TASK_RESULT_LIMIT = 40;

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
  if (hasToHexString(value)) {
    return value.toHexString();
  }
  return fallback;
}

function isoString(value: unknown): string | undefined {
  if (value instanceof Date) return value.toISOString();
  if (typeof value === 'string') return value;
  return undefined;
}

function clipText(value: unknown, maxChars = CONTENT_LIMIT): { text: string; truncated: boolean } {
  const normalized = stringValue(value).replace(/\s+/g, ' ').trim();
  if (normalized.length <= maxChars) {
    return { text: normalized, truncated: false };
  }
  return {
    text: `${normalized.slice(0, Math.max(0, maxChars - 1)).trimEnd()}...`,
    truncated: true
  };
}

function focusArg(args: ToolArgs): { type?: string; id?: string } {
  const focus = args.focus;
  if (!focus || typeof focus !== 'object' || Array.isArray(focus)) {
    return {};
  }
  const rawFocus = focus as Record<string, unknown>;
  return {
    type: typeof rawFocus.type === 'string' ? rawFocus.type : undefined,
    id: typeof rawFocus.id === 'string' ? rawFocus.id : undefined
  };
}

function argumentString(args: ToolArgs, key: string): string | undefined {
  const value = args[key];
  return typeof value === 'string' && value.trim() ? value.trim() : undefined;
}

function normalizedSearchTerm(value: unknown): string | undefined {
  if (typeof value !== 'string') {
    return undefined;
  }
  const normalized = value.replace(/\s+/g, ' ').trim();
  if (!normalized) {
    return undefined;
  }
  return normalized.slice(0, SEARCH_TERM_CHAR_LIMIT).trim();
}

function uniqueValues<T>(values: T[]): T[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function argumentStringArray(args: ToolArgs, key: string): string[] {
  const value = args[key];
  if (!Array.isArray(value)) {
    return [];
  }
  return uniqueValues(value.map(normalizedSearchTerm).filter((item): item is string => Boolean(item)))
    .slice(0, SEARCH_TERM_LIMIT);
}

function argumentInteger(
  args: ToolArgs,
  key: string,
  options: {
    fallback: number;
    min: number;
    max: number;
  }
): number {
  const { fallback, min, max } = options;
  const value = args[key];
  const parsed = typeof value === 'number'
    ? value
    : typeof value === 'string'
      ? Number.parseInt(value, 10)
      : Number.NaN;
  if (!Number.isFinite(parsed)) {
    return fallback;
  }
  return Math.min(max, Math.max(min, Math.trunc(parsed)));
}

function noteListSortBy(args: ToolArgs): NoteListSortBy {
  return args.sortBy === 'createdAt' ? 'createdAt' : 'updatedAt';
}

function normalizedSearchDomains(value: unknown): SearchDomain[] {
  if (!Array.isArray(value)) {
    return SEARCH_DOMAINS;
  }
  const domains = uniqueValues(
    value.filter((item): item is SearchDomain => (
      typeof item === 'string' && (SEARCH_DOMAINS as string[]).includes(item)
    ))
  );
  return domains.length ? domains : SEARCH_DOMAINS;
}

function normalizedSearchMatchMode(value: unknown): SearchMatchMode {
  return value === 'all' ? 'all' : 'any';
}

function searchTerms(args: ToolArgs): string[] {
  const explicitTerms = argumentStringArray(args, 'terms');
  if (explicitTerms.length) {
    return explicitTerms;
  }

  return uniqueValues([
    normalizedSearchTerm(args.query),
    normalizedSearchTerm(args.text)
  ].filter((item): item is string => Boolean(item))).slice(0, SEARCH_TERM_LIMIT);
}

function buildSearchExpression(args: ToolArgs): SearchExpression | null {
  const terms = searchTerms(args);
  if (!terms.length) {
    return null;
  }

  const query = normalizedSearchTerm(args.query)
    || normalizedSearchTerm(args.text)
    || terms.join(' ');

  return {
    query,
    terms,
    matchMode: normalizedSearchMatchMode(args.matchMode),
    domains: normalizedSearchDomains(args.domains)
  };
}

function objectIdFromText(value: string | undefined, source: string): ObjectId | null {
  if (!value) {
    return null;
  }
  try {
    return toObjectId(value, source);
  } catch {
    return null;
  }
}

function focusObjectId(args: ToolArgs, type: string, directKey: string): ObjectId | null {
  const directId = objectIdFromText(argumentString(args, directKey), `arguments.${directKey}`);
  if (directId) {
    return directId;
  }

  const focus = focusArg(args);
  if (focus.type !== type) {
    return null;
  }
  return objectIdFromText(focus.id, 'arguments.focus.id');
}

function sourceTrace(request: SayaDeskHostToolExecutionRequestDto, stage: string): string[] {
  return [
    'sayachan_host_tool_service',
    stage,
    ...(request.sourceTrace || [])
  ];
}

function toolResult(
  request: SayaDeskHostToolExecutionRequestDto,
  patch: Omit<SayaDeskHostToolExecutionResultDto, 'requestId' | 'capability' | 'sourceTrace'> & {
    sourceTrace?: string[];
  }
): SayaDeskHostToolExecutionResultDto {
  return {
    requestId: request.requestId,
    capability: request.capability,
    ...patch,
    sourceTrace: patch.sourceTrace || sourceTrace(request, 'execute')
  };
}

function unavailable(
  request: SayaDeskHostToolExecutionRequestDto,
  code: string,
  message: string
): SayaDeskHostToolExecutionResultDto {
  return toolResult(request, {
    status: 'unavailable',
    resultSummary: message,
    error: { code, message },
    sourceTrace: sourceTrace(request, 'unavailable')
  });
}

function denied(
  request: SayaDeskHostToolExecutionRequestDto,
  code: string,
  message: string
): SayaDeskHostToolExecutionResultDto {
  return toolResult(request, {
    status: 'denied',
    resultSummary: message,
    error: { code, message },
    sourceTrace: sourceTrace(request, 'denied')
  });
}

function ensureReadOnlyRequest(request: SayaDeskHostToolExecutionRequestDto): SayaDeskHostToolExecutionResultDto | null {
  if (request.risk !== 'read_only' || request.requiresConfirmation) {
    return denied(
      request,
      'HOST_TOOL_UNSUPPORTED_RISK',
      'Only read-only host capabilities can run in this lane.'
    );
  }
  return null;
}

function assertMatchingUser(request: SayaDeskHostToolExecutionRequestDto, userId: ObjectId): void {
  if (request.hostUserId !== userId.toHexString()) {
    throw new ForbiddenError('Host tool user mismatch', {
      code: 'HOST_TOOL_USER_MISMATCH',
      source: 'request.body.hostUserId'
    });
  }
}

async function getNoteContent(
  request: SayaDeskHostToolExecutionRequestDto,
  userId: ObjectId
): Promise<SayaDeskHostToolExecutionResultDto> {
  const noteId = focusObjectId(request.arguments, 'note', 'noteId');
  if (!noteId) {
    return denied(request, 'HOST_TOOL_MISSING_NOTE_ID', 'No readable note was selected for this request.');
  }

  const note = asRuntimeDocument(await Note.findOne({ _id: noteId, userId }));
  if (!note) {
    return denied(request, 'HOST_TOOL_NOTE_NOT_FOUND', 'No readable note was found for this request.');
  }

  const normalized = plainObject(note);
  const content = clipText(normalized.content);
  const title = stringValue(normalized.title, 'Untitled note');

  return toolResult(request, {
    status: 'completed',
    result: {
      packetType: 'saya_desk_host_tool_result',
      version: 1,
      note: {
        id: stringValue(normalized._id),
        title,
        content: content.text,
        updatedAt: isoString(normalized.updatedAt)
      }
    },
    resultSummary: `Read note "${title}" (${content.text.length} chars).`,
    sourceReceipts: [{ type: 'note', title }],
    truncated: content.truncated,
    sourceTrace: sourceTrace(request, 'get_note_content')
  });
}

async function getProjectContext(
  request: SayaDeskHostToolExecutionRequestDto,
  userId: ObjectId
): Promise<SayaDeskHostToolExecutionResultDto> {
  const projectId = focusObjectId(request.arguments, 'project', 'projectId');
  if (!projectId) {
    return denied(request, 'HOST_TOOL_MISSING_PROJECT_ID', 'No readable project was selected for this request.');
  }

  const project = asRuntimeDocument(await Project.findOne({ _id: projectId, userId }));
  if (!project) {
    return denied(request, 'HOST_TOOL_PROJECT_NOT_FOUND', 'No readable project was found for this request.');
  }

  const normalized = plainObject(project);
  const title = stringValue(normalized.name, 'Untitled project');
  const summary = clipText(normalized.summary, 1200);

  return toolResult(request, {
    status: 'completed',
    result: {
      packetType: 'saya_desk_host_tool_result',
      version: 1,
      project: {
        id: stringValue(normalized._id),
        name: title,
        summary: summary.text,
        status: stringValue(normalized.status),
        currentFocusTaskId: stringValue(normalized.currentFocusTaskId) || null,
        updatedAt: isoString(normalized.updatedAt)
      }
    },
    resultSummary: `Read project "${title}".`,
    sourceReceipts: [{ type: 'project', title }],
    truncated: summary.truncated,
    sourceTrace: sourceTrace(request, 'get_project_context')
  });
}

async function listNotes(
  request: SayaDeskHostToolExecutionRequestDto,
  userId: ObjectId
): Promise<SayaDeskHostToolExecutionResultDto> {
  const sortBy = noteListSortBy(request.arguments);
  const limit = argumentInteger(request.arguments, 'limit', {
    fallback: NOTE_LIST_DEFAULT_LIMIT,
    min: 1,
    max: NOTE_LIST_MAX_LIMIT
  });
  const notes = await Note.find(combineFilters(
    buildArchiveFilter('false'),
    { userId }
  )).sort({ [sortBy]: -1 }).limit(limit + 1);
  const visibleNotes = notes.slice(0, limit).map(note => {
    const normalized = plainObject(asRuntimeDocument(note));
    const title = stringValue(normalized.title, 'Untitled note');
    return {
      id: stringValue(normalized._id),
      title,
      excerpt: clipText(normalized.content, 300).text,
      createdAt: isoString(normalized.createdAt),
      updatedAt: isoString(normalized.updatedAt)
    };
  });

  return toolResult(request, {
    status: 'completed',
    result: {
      packetType: 'saya_desk_host_tool_result',
      version: 1,
      notes: visibleNotes,
      sortBy,
      limit
    },
    resultSummary: `Listed ${visibleNotes.length} note(s).`,
    sourceReceipts: visibleNotes.map(note => ({ type: 'note', title: note.title })),
    truncated: notes.length > limit,
    sourceTrace: sourceTrace(request, 'list_notes')
  });
}

async function listProjectTasks(
  request: SayaDeskHostToolExecutionRequestDto,
  userId: ObjectId
): Promise<SayaDeskHostToolExecutionResultDto> {
  const projectId = focusObjectId(request.arguments, 'project', 'projectId');
  if (!projectId) {
    return denied(request, 'HOST_TOOL_MISSING_PROJECT_ID', 'No readable project was selected for this request.');
  }

  const project = asRuntimeDocument(await Project.findOne({ _id: projectId, userId }));
  if (!project) {
    return denied(request, 'HOST_TOOL_PROJECT_NOT_FOUND', 'No readable project was found for this request.');
  }

  const tasks = await Task.find(combineFilters(
    buildArchiveFilter('false'),
    { originModule: 'project', originId: projectId, userId }
  )).sort({ createdAt: -1 }).limit(TASK_RESULT_LIMIT + 1);
  const visibleTasks = tasks.slice(0, TASK_RESULT_LIMIT).map(task => {
    const normalized = plainObject(asRuntimeDocument(task));
    return {
      id: stringValue(normalized._id),
      title: stringValue(normalized.title),
      status: stringValue(normalized.status),
      completed: normalized.completed === true,
      updatedAt: isoString(normalized.updatedAt)
    };
  });
  const projectName = stringValue(plainObject(project).name, 'Untitled project');

  return toolResult(request, {
    status: 'completed',
    result: {
      packetType: 'saya_desk_host_tool_result',
      version: 1,
      project: {
        id: projectId.toHexString(),
        name: projectName
      },
      tasks: visibleTasks
    },
    resultSummary: `Read ${visibleTasks.length} task(s) for project "${projectName}".`,
    sourceReceipts: [{ type: 'project', title: projectName }],
    truncated: tasks.length > TASK_RESULT_LIMIT,
    sourceTrace: sourceTrace(request, 'list_project_tasks')
  });
}

function escapedRegex(value: string): RegExp {
  return new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
}

function searchFieldFilter(
  fields: string[],
  patterns: RegExp[],
  matchMode: SearchMatchMode
): Record<string, unknown> {
  if (matchMode === 'all') {
    return {
      $and: patterns.map(pattern => ({
        $or: fields.map(field => ({ [field]: pattern }))
      }))
    };
  }

  return {
    $or: fields.flatMap(field => patterns.map(pattern => ({ [field]: pattern })))
  };
}

function domainSelected(expression: SearchExpression, domain: SearchDomain): boolean {
  return expression.domains.includes(domain);
}

function searchResultSummary(expression: SearchExpression, count: number): string {
  if (expression.terms.length <= 1) {
    return `Found ${count} item(s) for "${expression.query}".`;
  }
  return `Found ${count} item(s) for terms "${expression.terms.join('", "')}".`;
}

async function searchProductContext(
  request: SayaDeskHostToolExecutionRequestDto,
  userId: ObjectId
): Promise<SayaDeskHostToolExecutionResultDto> {
  const expression = buildSearchExpression(request.arguments);
  if (!expression) {
    return denied(request, 'HOST_TOOL_MISSING_QUERY', 'No search query was provided.');
  }
  const patterns = expression.terms.map(escapedRegex);

  const [notes, projects, tasks] = await Promise.all([
    domainSelected(expression, 'notes')
      ? Note.find(combineFilters(
          buildArchiveFilter('false'),
          { userId },
          searchFieldFilter(['title', 'content'], patterns, expression.matchMode)
        )).sort({ updatedAt: -1 }).limit(SEARCH_RESULT_LIMIT)
      : Promise.resolve([]),
    domainSelected(expression, 'projects')
      ? Project.find(combineFilters(
          buildArchiveFilter('false'),
          { userId },
          searchFieldFilter(['name', 'summary'], patterns, expression.matchMode)
        )).sort({ updatedAt: -1 }).limit(SEARCH_RESULT_LIMIT)
      : Promise.resolve([]),
    domainSelected(expression, 'tasks')
      ? Task.find(combineFilters(
          buildArchiveFilter('false'),
          { userId },
          searchFieldFilter(['title'], patterns, expression.matchMode)
        )).sort({ updatedAt: -1 }).limit(SEARCH_RESULT_LIMIT)
      : Promise.resolve([])
  ]);

  const noteResults = notes.map(note => {
    const normalized = plainObject(asRuntimeDocument(note));
    const title = stringValue(normalized.title, 'Untitled note');
    return {
      type: 'note' as const,
      id: stringValue(normalized._id),
      title,
      excerpt: clipText(normalized.content, 300).text,
      updatedAt: isoString(normalized.updatedAt)
    };
  });
  const projectResults = projects.map(project => {
    const normalized = plainObject(asRuntimeDocument(project));
    return {
      type: 'project' as const,
      id: stringValue(normalized._id),
      title: stringValue(normalized.name, 'Untitled project'),
      summary: clipText(normalized.summary, 300).text,
      status: stringValue(normalized.status),
      updatedAt: isoString(normalized.updatedAt)
    };
  });
  const taskResults = tasks.map(task => {
    const normalized = plainObject(asRuntimeDocument(task));
    return {
      type: 'task' as const,
      id: stringValue(normalized._id),
      title: stringValue(normalized.title, 'Untitled task'),
      status: stringValue(normalized.status),
      updatedAt: isoString(normalized.updatedAt)
    };
  });

  const sourceReceipts = [
    ...noteResults.map(note => ({ type: 'note' as const, title: note.title })),
    ...projectResults.map(project => ({ type: 'project' as const, title: project.title })),
    ...taskResults.map(task => ({ type: 'task' as const, title: task.title }))
  ];

  return toolResult(request, {
    status: 'completed',
    result: {
      packetType: 'saya_desk_host_tool_result',
      version: 1,
      query: expression.query,
      search: expression,
      notes: noteResults,
      projects: projectResults,
      tasks: taskResults
    },
    resultSummary: searchResultSummary(expression, sourceReceipts.length),
    sourceReceipts,
    truncated: false,
    sourceTrace: sourceTrace(request, 'search_product_context')
  });
}

export async function executeHostTool(
  request: SayaDeskHostToolExecutionRequestDto,
  { userId }: { userId: ObjectId }
): Promise<SayaDeskHostToolExecutionResultDto> {
  assertMatchingUser(request, userId);

  if (!isDatabaseReady()) {
    return unavailable(request, 'HOST_TOOL_DATABASE_UNAVAILABLE', 'Host data is not available right now.');
  }

  const blocked = ensureReadOnlyRequest(request);
  if (blocked) {
    return blocked;
  }

  const handlers: Record<SayaDeskHostToolCapability, () => Promise<SayaDeskHostToolExecutionResultDto>> = {
    'saya_desk.search_product_context': () => searchProductContext(request, userId),
    'saya_desk.list_notes': () => listNotes(request, userId),
    'saya_desk.get_project_context': () => getProjectContext(request, userId),
    'saya_desk.list_project_tasks': () => listProjectTasks(request, userId),
    'saya_desk.get_note_content': () => getNoteContent(request, userId)
  };

  try {
    return await handlers[request.capability]();
  } catch (error) {
    if (error instanceof ForbiddenError) {
      throw error;
    }
    return toolResult(request, {
      status: 'failed',
      resultSummary: 'Host tool execution failed.',
      error: {
        code: 'HOST_TOOL_EXECUTION_FAILED',
        message: error instanceof Error ? error.message : String(error)
      },
      sourceTrace: sourceTrace(request, 'failed')
    });
  }
}

export const __test__ = {
  buildSearchExpression,
  isDatabaseReady
};

export default {
  executeHostTool,
  __test__
};
