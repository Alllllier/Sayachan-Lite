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

export type ProjectLifecycleStatus = 'pending' | 'in_progress' | 'completed' | 'on_hold';

export function isArchivedEntity(entity: RuntimeDocument | null | undefined): boolean {
  return entity?.archived === true;
}

export function deriveTaskLifecycleStatus(task: TaskRuntimeRecord | null | undefined): 'active' | 'completed' {
  if (task?.status === 'completed') {
    return task.status;
  }

  return 'active';
}

export function deriveProjectLifecycleStatus(project: ProjectRuntimeRecord | null | undefined): ProjectLifecycleStatus {
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
