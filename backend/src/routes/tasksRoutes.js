const Router = require('@koa/router');
const Task = require('../models/Task');
const tasksService = require('../services/tasksService');
const {
  archiveTasks,
  buildArchiveFilter,
  combineFilters,
  restoreTasks
} = require('../services/taskRuntimeHelpers');
const {
  validateTaskCreate,
  validateTaskUpdate
} = require('./requestValidation');
const route = require('./routeBoundary');

const router = new Router();

// GET /tasks
router.get('/tasks', route(async (ctx) => {
  const { projectId, archived } = ctx.query;
  ctx.body = await tasksService.listTasks({ projectId, archived });
}));

// POST /tasks
router.post('/tasks', route(async (ctx) => {
  const body = ctx.request.body;
  validateTaskCreate(body);
  ctx.status = 201;
  ctx.body = await tasksService.createTask(body);
}));

// PUT /tasks/:id
router.put('/tasks/:id', route(async (ctx) => {
  const id = ctx.params.id;
  const body = ctx.request.body;
  validateTaskUpdate(body);
  const task = await tasksService.updateTask(id, body);
  if (!task) {
    ctx.status = 404;
    ctx.body = { error: 'Task not found' };
    return;
  }
  ctx.body = task;
}));

// DELETE /tasks/:id
router.delete('/tasks/:id', route(async (ctx) => {
  const id = ctx.params.id;
  const deleted = await tasksService.deleteTask(id);
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { error: 'Task not found' };
  } else {
    ctx.status = 204;
    ctx.body = null;
  }
}));

module.exports = router;
module.exports.__test__ = {
  archiveTasks: (taskFilter) => archiveTasks(Task, taskFilter),
  buildArchiveFilter,
  combineFilters,
  restoreTasks: (taskFilter) => restoreTasks(Task, taskFilter)
};
