export type RuntimeDocument = object & {
  toObject?: () => Record<string, unknown>;
  archived?: unknown;
  originId?: unknown;
  originModule?: unknown;
};

export type TaskRuntimeRecord = RuntimeDocument & {
  _id?: unknown;
  completed?: boolean;
  status?: 'active' | 'completed';
};

export type ProjectRuntimeRecord = RuntimeDocument & {
  _id?: unknown;
  name?: unknown;
  status?: 'pending' | 'in_progress' | 'completed' | 'on_hold';
};

export type TaskDto = Record<string, unknown> & {
  archived: boolean;
  completed: boolean;
  status: 'active' | 'completed';
};

export type ProjectDto = Record<string, unknown> & {
  archived: boolean;
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold';
};

export type NoteDto = Record<string, unknown> & {
  archived: boolean;
};

function toPlainObject(entity: RuntimeDocument): Record<string, unknown> {
  return entity.toObject ? entity.toObject() : { ...entity };
}

export function isArchivedEntity(entity: RuntimeDocument | null | undefined): boolean {
  return entity?.archived === true;
}

export function deriveTaskLifecycleStatus(task: TaskRuntimeRecord | null | undefined): 'active' | 'completed' {
  if (task?.status === 'completed') {
    return task.status;
  }

  return 'active';
}

export function deriveProjectLifecycleStatus(project: ProjectRuntimeRecord | null | undefined): ProjectDto['status'] {
  if (
    project?.status === 'pending'
    || project?.status === 'in_progress'
    || project?.status === 'completed'
    || project?.status === 'on_hold'
  ) {
    return project.status;
  }

  return 'pending';
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
