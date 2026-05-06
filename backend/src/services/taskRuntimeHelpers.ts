import type { ObjectId } from '../middleware/objectIdParsing';

type QueryFilter = Record<string, unknown>;

type DocumentLike = Record<string, any> & {
  toObject?: () => Record<string, any>;
};

type FindableModel = {
  find(filter: unknown): Promise<DocumentLike[]>;
};

type BulkWritableModel = {
  bulkWrite(operations: unknown[]): Promise<{ modifiedCount?: number }>;
};

type TaskModel = FindableModel & BulkWritableModel;

type ProjectModel = {
  findOne(filter: unknown): Promise<DocumentLike | null>;
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

export function isArchivedEntity(entity: DocumentLike | null | undefined): boolean {
  return entity?.archived === true;
}

export function deriveTaskLifecycleStatus(task: DocumentLike | null | undefined): string {
  if (task?.status) {
    return task.status;
  }

  return task?.completed ? 'completed' : 'active';
}

export function deriveProjectLifecycleStatus(project: DocumentLike | null | undefined): string {
  if (project?.status && project.status !== 'archived') {
    return project.status;
  }

  return 'pending';
}

export function normalizeTask<TTask extends DocumentLike | null | undefined>(task: TTask) {
  if (!task) {
    return task;
  }

  const normalized = task.toObject ? task.toObject() : { ...task };
  const status = deriveTaskLifecycleStatus(normalized);

  return {
    ...normalized,
    status,
    archived: isArchivedEntity(normalized),
    completed: normalized.completed === undefined ? status === 'completed' : normalized.completed
  };
}

export function normalizeProject<TProject extends DocumentLike | null | undefined>(project: TProject) {
  if (!project) {
    return project;
  }

  const normalized = project.toObject ? project.toObject() : { ...project };

  return {
    ...normalized,
    status: deriveProjectLifecycleStatus(normalized),
    archived: isArchivedEntity(normalized)
  };
}

export function normalizeNote<TNote extends DocumentLike | null | undefined>(note: TNote) {
  if (!note) {
    return note;
  }

  const normalized = note.toObject ? note.toObject() : { ...note };
  return {
    ...normalized,
    archived: isArchivedEntity(normalized)
  };
}

export function isProjectOwnedTask(task: DocumentLike | null | undefined): boolean {
  return task?.originModule === 'project' && task?.originId;
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
