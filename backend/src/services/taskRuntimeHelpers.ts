import type { ObjectId } from '../middleware/objectIdParsing';

type QueryFilter = Record<string, unknown>;

type RuntimeDocument = object & {
  toObject?: () => Record<string, unknown>;
  archived?: unknown;
  originId?: unknown;
  originModule?: unknown;
};

type TaskRuntimeRecord = RuntimeDocument & {
  _id?: unknown;
  completed?: boolean;
  status?: 'active' | 'completed';
};

type ProjectRuntimeRecord = RuntimeDocument & {
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

type FindableModel = {
  find(filter: unknown): Promise<TaskRuntimeRecord[]>;
};

type BulkWritableModel = {
  bulkWrite(operations: unknown[]): Promise<{ modifiedCount?: number }>;
};

type TaskModel = FindableModel & BulkWritableModel;

type ProjectModel = {
  findOne(filter: unknown): Promise<ProjectRuntimeRecord | null>;
  findOneAndUpdate(filter: unknown, update: unknown): Promise<unknown>;
};

export function buildArchiveFilter(archived: unknown): QueryFilter {
  if (archived === 'true') {
    return { archived: true };
  }

  return { archived: { $ne: true } };
}

function isObjectFilter(filter: unknown): filter is QueryFilter {
  return Boolean(filter) && typeof filter === 'object' && !Array.isArray(filter);
}

export function combineFilters(...filters: unknown[]): QueryFilter {
  const clauses = filters.filter((filter): filter is QueryFilter => (
    isObjectFilter(filter) && Object.keys(filter).length > 0
  ));

  if (clauses.length === 0) {
    return {};
  }

  if (clauses.length === 1) {
    return clauses[0];
  }

  return {
    $and: clauses
  };
}

export function projectTaskRelationFilter(projectId: ObjectId): QueryFilter {
  return {
    originModule: 'project',
    originId: projectId
  };
}

export function projectTaskReadFilter(projectId: ObjectId): QueryFilter {
  return projectTaskRelationFilter(projectId);
}

export function projectTaskCascadeFilter(projectId: ObjectId): QueryFilter {
  return projectTaskRelationFilter(projectId);
}

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

export function isProjectOwnedTask(task: RuntimeDocument | null | undefined): boolean {
  return task?.originModule === 'project' && Boolean(task.originId);
}

export async function clearFocusForTask(Project: ProjectModel, taskId: ObjectId, reason: string, userId: ObjectId): Promise<boolean> {
  if (!taskId || !userId) {
    return false;
  }

  const project = await Project.findOne({ currentFocusTaskId: taskId, userId });

  if (!project) {
    return false;
  }

  await Project.findOneAndUpdate({ _id: project._id, userId }, { currentFocusTaskId: null });

  if (reason) {
    console.log(`[Focus Transition] Project "${project.name}" currentFocusTaskId cleared on ${reason}`);
  }

  return true;
}

export async function archiveTasks(Task: TaskModel, taskFilter: unknown): Promise<number> {
  const tasks = await Task.find(combineFilters(taskFilter, buildArchiveFilter('false')));

  if (tasks.length === 0) {
    return 0;
  }

  const result = await Task.bulkWrite(
    tasks.map((task) => ({
      updateOne: {
        filter: { _id: task._id },
        update: {
          archived: true,
          status: deriveTaskLifecycleStatus(task),
          completed: task.completed === true || deriveTaskLifecycleStatus(task) === 'completed'
        }
      }
    }))
  );

  return result.modifiedCount || 0;
}

export async function restoreTasks(Task: TaskModel, taskFilter: unknown): Promise<number> {
  const tasks = await Task.find(combineFilters(taskFilter, buildArchiveFilter('true')));

  if (tasks.length === 0) {
    return 0;
  }

  const result = await Task.bulkWrite(
    tasks.map((task) => {
      const status = deriveTaskLifecycleStatus(task);

      return {
        updateOne: {
          filter: { _id: task._id },
          update: {
            archived: false,
            status,
            completed: task.completed === true || status === 'completed'
          }
        }
      };
    })
  );

  return result.modifiedCount || 0;
}
