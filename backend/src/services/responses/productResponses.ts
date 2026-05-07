import {
  deriveProjectLifecycleStatus,
  deriveTaskLifecycleStatus,
  isArchivedEntity,
  type ProjectLifecycleStatus,
  type ProjectRuntimeRecord,
  type RuntimeDocument,
  type TaskRuntimeRecord
} from '../../domain/tasks/lifecycle.js';

export type TaskDto = Record<string, unknown> & {
  archived: boolean;
  completed: boolean;
  status: 'active' | 'completed';
};

export type ProjectDto = Record<string, unknown> & {
  archived: boolean;
  status: ProjectLifecycleStatus;
};

export type NoteDto = Record<string, unknown> & {
  archived: boolean;
};

function toPlainObject(entity: RuntimeDocument): Record<string, unknown> {
  return entity.toObject ? entity.toObject() : { ...entity };
}

export function toTaskDto(task: TaskRuntimeRecord | null | undefined): TaskDto | null | undefined {
  if (!task) {
    return task;
  }

  const normalized = toPlainObject(task);
  const status = deriveTaskLifecycleStatus(normalized);

  return {
    ...normalized,
    status,
    archived: isArchivedEntity(normalized),
    completed: normalized.completed === true
  };
}

export function toProjectDto(project: ProjectRuntimeRecord | null | undefined): ProjectDto | null | undefined {
  if (!project) {
    return project;
  }

  const normalized = toPlainObject(project);

  return {
    ...normalized,
    status: deriveProjectLifecycleStatus(normalized),
    archived: isArchivedEntity(normalized)
  };
}

export function toNoteDto(note: RuntimeDocument | null | undefined): NoteDto | null | undefined {
  if (!note) {
    return note;
  }

  const normalized = toPlainObject(note);
  return {
    ...normalized,
    archived: isArchivedEntity(normalized)
  };
}
