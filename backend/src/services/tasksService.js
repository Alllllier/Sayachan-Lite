const Project = require('../models/Project');
const Task = require('../models/Task');
const {
  buildArchiveFilter,
  clearFocusForTask,
  combineFilters,
  isProjectOwnedTask,
  normalizeTask,
  projectTaskReadFilter
} = require('./taskRuntimeHelpers');

async function listTasks({ projectId, archived } = {}) {
  const filter = projectId
    ? combineFilters(buildArchiveFilter(archived), projectTaskReadFilter(projectId))
    : buildArchiveFilter(archived);
  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  return tasks.map(normalizeTask);
}

async function createTask(body) {
  const taskData = {
    title: body.title,
    creationMode: body.creationMode || 'manual',
    originModule: body.originModule || '',
    originId: body.originId || null,
    status: 'active',
    archived: false,
    completed: false
  };

  const task = await Task.create(taskData);
  return normalizeTask(task);
}

function buildTaskUpdate(body) {
  const update = {};

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

async function updateTask(id, body) {
  const existingTask = await Task.findById(id);
  if (!existingTask) {
    return null;
  }

  const normalizedExistingTask = normalizeTask(existingTask);
  const task = await Task.findByIdAndUpdate(id, buildTaskUpdate(body), { new: true, runValidators: true });
  const normalizedTask = normalizeTask(task);

  const isBecomingCompleted = normalizedTask.status === 'completed' && normalizedExistingTask.status !== 'completed';

  if (isBecomingCompleted && isProjectOwnedTask(normalizedTask)) {
    await clearFocusForTask(Project, normalizedTask._id, 'task completion');
  }

  const isBecomingArchived = normalizedTask.archived && !normalizedExistingTask.archived;
  if (isBecomingArchived) {
    await clearFocusForTask(Project, normalizedTask._id, 'task archive');
  }

  return normalizedTask;
}

async function deleteTask(id) {
  const task = await Task.findByIdAndDelete(id);

  if (!task) {
    return false;
  }

  await clearFocusForTask(Project, task._id, 'task delete');
  return true;
}

module.exports = {
  createTask,
  deleteTask,
  listTasks,
  updateTask
};
