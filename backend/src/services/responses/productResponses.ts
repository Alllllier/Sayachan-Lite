import {
  deriveProjectLifecycleStatus,
  deriveTaskLifecycleStatus,
  isArchivedEntity,
  type ProjectLifecycleStatus,
  type ProjectRuntimeRecord,
  type RuntimeDocument,
  type TaskRuntimeRecord
} from '../../domain/tasks/lifecycle.js';

export type TaskDto = {
  _id?: unknown;
  title?: unknown;
  archived: boolean;
  completed: boolean;
  creationMode?: unknown;
  originModule?: unknown;
  originId?: unknown;
  status: 'active' | 'completed';
};

export type ProjectDto = {
  _id?: unknown;
  name?: unknown;
  summary?: unknown;
  archived: boolean;
  isPinned?: unknown;
  updatedAt?: unknown;
  currentFocusTaskId?: unknown;
  status: ProjectLifecycleStatus;
};

export type NoteDto = {
  _id?: unknown;
  title?: unknown;
  content?: unknown;
  archived: boolean;
  isPinned?: unknown;
  updatedAt?: unknown;
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

export function toTaskDto(task: TaskRuntimeRecord | null | undefined): TaskDto | null | undefined {
  if (!task) {
    return task;
  }

  const normalized = toPlainObject(task);
  const status = deriveTaskLifecycleStatus(normalized);

  const dto: TaskDto = {
    status,
    archived: isArchivedEntity(normalized),
    completed: normalized.completed === true
  };
  copyPublicFields(normalized, dto, ['_id', 'title', 'creationMode', 'originModule', 'originId']);
  return dto;
}

export function toProjectDto(project: ProjectRuntimeRecord | null | undefined): ProjectDto | null | undefined {
  if (!project) {
    return project;
  }

  const normalized = toPlainObject(project);

  const dto: ProjectDto = {
    status: deriveProjectLifecycleStatus(normalized),
    archived: isArchivedEntity(normalized)
  };
  copyPublicFields(normalized, dto, ['_id', 'name', 'summary', 'isPinned', 'updatedAt', 'currentFocusTaskId']);
  return dto;
}

export function toNoteDto(note: RuntimeDocument | null | undefined): NoteDto | null | undefined {
  if (!note) {
    return note;
  }

  const normalized = toPlainObject(note);
  const dto: NoteDto = {
    archived: isArchivedEntity(normalized)
  };
  copyPublicFields(normalized, dto, ['_id', 'title', 'content', 'isPinned', 'updatedAt']);
  return dto;
}
