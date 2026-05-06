import type {
  TaskCreateDto,
  TaskCreationMode,
  TaskUpdateDto
} from '../routes/schemas/mutations.js';
import type { ObjectId } from '../middleware/objectIdParsing.js';
import {
  buildArchiveFilter,
  combineFilters,
  projectTaskRelationFilter,
} from '../domain/tasks/queryFilters.js';
import {
  clearFocusForTask,
  isProjectOwnedTask
} from '../domain/tasks/cascade.js';
import { toTaskDto } from '../domain/dtos/productDtos.js';
import {
  ownedFilter,
  ownerFilter,
  requireUserId
} from '../domain/ownership.js';
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

type NormalizedTask = {
  _id?: ObjectId;
  status?: unknown;
  archived?: unknown;
};

export async function listTasks({ projectId, archived, userId }: ListTasksOptions) {
  const filter = projectId
    ? combineFilters(buildArchiveFilter(archived), projectTaskRelationFilter(projectId), ownerFilter(userId))
    : combineFilters(buildArchiveFilter(archived), ownerFilter(userId));
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
    userId: requireUserId(userId)
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
  const existingTask = await Task.findOne(ownedFilter(id, userId));
  if (!existingTask) {
    return null;
  }

  const normalizedExistingTask = toTaskDto(existingTask) as NormalizedTask;
  const task = await Task.findOneAndUpdate(ownedFilter(id, userId), buildTaskUpdate(body), { new: true, runValidators: true });
  const normalizedTask = toTaskDto(task) as NormalizedTask;

  const isBecomingCompleted = normalizedTask.status === 'completed' && normalizedExistingTask.status !== 'completed';

  if (isBecomingCompleted && normalizedTask._id && isProjectOwnedTask(normalizedTask)) {
    await clearFocusForTask(Project, normalizedTask._id, 'task completion', userId);
  }

  const isBecomingArchived = normalizedTask.archived && !normalizedExistingTask.archived;
  if (isBecomingArchived && normalizedTask._id) {
    await clearFocusForTask(Project, normalizedTask._id, 'task archive', userId);
  }

  return normalizedTask;
}

export async function deleteTask(id: ObjectId, { userId }: ServiceOptions) {
  const task = await Task.findOneAndDelete(ownedFilter(id, userId));

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
