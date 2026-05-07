import type { ObjectId } from '../../middleware/objectIdParsing.js';
import {
  buildArchiveFilter,
  combineFilters
} from './queryFilters.js';
import {
  deriveTaskLifecycleStatus,
  type ProjectRuntimeRecord,
  type RuntimeDocument,
  type TaskRuntimeRecord
} from './lifecycle.js';

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
