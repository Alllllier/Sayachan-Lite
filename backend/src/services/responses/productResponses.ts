import {
  noteResponseSchema,
  projectResponseSchema,
  taskResponseSchema,
  type NoteDto as SharedNoteDto,
  type ProjectDto as SharedProjectDto,
  type TaskDto as SharedTaskDto
} from '@sayachan/contracts';
import {
  deriveProjectLifecycleStatus,
  deriveTaskLifecycleStatus,
  isArchivedEntity,
  type ProjectRuntimeRecord,
  type RuntimeDocument,
  type TaskRuntimeRecord
} from '../../domain/lifecycle.js';

export type TaskDto = SharedTaskDto;
export type ProjectDto = SharedProjectDto;
export type NoteDto = SharedNoteDto;

export type NormalizedTaskDto = TaskDto & {
  status: NonNullable<TaskDto['status']>;
  archived: boolean;
  completed: boolean;
};

function toPlainObject(entity: RuntimeDocument): Record<string, unknown> {
  return entity.toObject ? entity.toObject() : { ...entity };
}

function copyPublicFields(
  normalized: Record<string, unknown>,
  dto: Record<string, unknown>,
  fields: string[]
): void {
  for (const field of fields) {
    if (Object.hasOwn(normalized, field)) {
      dto[field] = normalized[field];
    }
  }
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

function hasToHexString(value: unknown): value is { toHexString: () => string } {
  return typeof value === 'object'
    && value !== null
    && 'toHexString' in value
    && typeof value.toHexString === 'function';
}

function publicNullableString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }
  return publicString(value);
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

function copyPublicStringFields(
  normalized: Record<string, unknown>,
  dto: Record<string, unknown>,
  fields: string[]
): void {
  for (const field of fields) {
    if (Object.hasOwn(normalized, field)) {
      dto[field] = publicString(normalized[field]);
    }
  }
}

export function toTaskDto(task: TaskRuntimeRecord | null | undefined): TaskDto | null | undefined {
  if (!task) {
    return task;
  }

  const normalized = toPlainObject(task);
  const status = deriveTaskLifecycleStatus(normalized);

  const dto: Record<string, unknown> = {
    status,
    archived: isArchivedEntity(normalized),
    completed: normalized.completed === true
  };
  copyPublicFields(normalized, dto, ['title', 'creationMode', 'originModule']);
  copyPublicStringFields(normalized, dto, ['_id']);
  if (Object.hasOwn(normalized, 'originId')) {
    dto.originId = publicNullableString(normalized.originId);
  }
  return taskResponseSchema.parse(dto);
}

export function toNormalizedTaskDto(task: TaskRuntimeRecord | null | undefined): NormalizedTaskDto | null | undefined {
  const dto = toTaskDto(task);
  if (!dto) {
    return dto;
  }

  return {
    ...dto,
    status: dto.status || 'active',
    archived: dto.archived === true,
    completed: dto.completed === true
  };
}

export function toProjectDto(project: ProjectRuntimeRecord | null | undefined): ProjectDto | null | undefined {
  if (!project) {
    return project;
  }

  const normalized = toPlainObject(project);

  const dto: Record<string, unknown> = {
    status: deriveProjectLifecycleStatus(normalized),
    archived: isArchivedEntity(normalized)
  };
  copyPublicFields(normalized, dto, ['name', 'summary', 'isPinned']);
  copyPublicStringFields(normalized, dto, ['_id']);
  if (Object.hasOwn(normalized, 'updatedAt')) {
    dto.updatedAt = publicIsoString(normalized.updatedAt);
  }
  if (Object.hasOwn(normalized, 'currentFocusTaskId')) {
    dto.currentFocusTaskId = publicNullableString(normalized.currentFocusTaskId);
  }
  return projectResponseSchema.parse(dto);
}

export function toNoteDto(note: RuntimeDocument | null | undefined): NoteDto | null | undefined {
  if (!note) {
    return note;
  }

  const normalized = toPlainObject(note);
  const dto: Record<string, unknown> = {
    archived: isArchivedEntity(normalized)
  };
  copyPublicFields(normalized, dto, ['title', 'content', 'isPinned']);
  copyPublicStringFields(normalized, dto, ['_id']);
  if (Object.hasOwn(normalized, 'updatedAt')) {
    dto.updatedAt = publicIsoString(normalized.updatedAt);
  }
  return noteResponseSchema.parse(dto);
}
