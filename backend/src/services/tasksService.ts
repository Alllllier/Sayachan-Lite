import type {
  TaskCreateDto,
  TaskCreationMode,
  TaskUpdateDto
} from '@sayachan/contracts';
import type { ObjectId } from '../domain/objectIds.js';
import {
  buildArchiveFilter,
  combineFilters,
} from './queryFilters.js';
import {
  clearFocusForTask,
  isProjectOwnedTask
} from './cascadeService.js';
import {
  toNormalizedTaskDto,
  toTaskDto
} from './responses/productResponses.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

type ServiceOptions = {
  userId: ObjectId;
};

type ListTasksOptions = ServiceOptions & {
  projectId?: ObjectId | null;
  archived?: unknown;
};

type TaskCreateInput = Omit<TaskCreateDto, 'originId'> & {
  title: string;
  creationMode?: TaskCreationMode;
  originModule?: string;
  originId?: ObjectId | null;
};

type TaskUpdate = {
  status?: TaskUpdateDto['status'];
  archived?: boolean;
  completed?: boolean;
};

export async function listTasks({ projectId, archived, userId }: ListTasksOptions) {
  const filter = projectId
    ? combineFilters(buildArchiveFilter(archived), { originModule: 'project', originId: projectId }, { userId })
    : combineFilters(buildArchiveFilter(archived), { userId });
  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  return tasks.map(toTaskDto);
}

export async function createTask(body: TaskCreateInput, { userId }: ServiceOptions) {
  const taskData = {
    title: body.title,
    creationMode: body.creationMode || 'manual',
    originModule: body.originModule || '',
    originId: body.originId || null,
    status: 'active',
    archived: false,
    completed: false,
    userId
  };

  const task = await Task.create(taskData);
  return toTaskDto(task);
}

export function buildTaskUpdate(body: TaskUpdateDto): TaskUpdate {
  const update: TaskUpdate = {};

  if (body.status !== undefined) {
    update.status = body.status;
    update.archived = body.archived === true ? true : false;
  }
  if (body.archived !== undefined) {
    update.archived = Boolean(body.archived);
  }
  if (body.completed !== undefined) {
    update.completed = body.completed;
    update.status = body.completed ? 'completed' : 'active';
    if (update.archived === undefined) {
      update.archived = false;
    }
  }

  return update;
}

export async function updateTask(id: ObjectId, body: TaskUpdateDto, { userId }: ServiceOptions) {
  const existingTask = await Task.findOne({ _id: id, userId });
  if (!existingTask) {
    return null;
  }

  const normalizedExistingTask = toNormalizedTaskDto(existingTask);
  const task = await Task.findOneAndUpdate({ _id: id, userId }, buildTaskUpdate(body), { new: true, runValidators: true });
  const normalizedTask = toNormalizedTaskDto(task);

  if (!normalizedExistingTask || !normalizedTask) {
    return null;
  }

  const isBecomingCompleted = normalizedTask.status === 'completed' && normalizedExistingTask.status !== 'completed';

  if (isBecomingCompleted && task?._id && isProjectOwnedTask(task)) {
    await clearFocusForTask(Project, task._id, 'task completion', userId);
  }

  const isBecomingArchived = normalizedTask.archived && !normalizedExistingTask.archived;
  if (isBecomingArchived && task?._id) {
    await clearFocusForTask(Project, task._id, 'task archive', userId);
  }

  return normalizedTask;
}

export async function deleteTask(id: ObjectId, { userId }: ServiceOptions) {
  const task = await Task.findOneAndDelete({ _id: id, userId });

  if (!task) {
    return false;
  }

  await clearFocusForTask(Project, task._id, 'task delete', userId);
  return true;
}

export default {
  createTask,
  deleteTask,
  listTasks,
  updateTask
};
