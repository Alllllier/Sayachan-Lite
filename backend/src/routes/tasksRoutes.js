const Router = require('@koa/router');
const Task = require('../models/Task');
const tasksService = require('../services/tasksService');
const { requireCurrentUser } = require('../middleware/currentUser');
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

const router = new Router();

// GET /tasks
router.get('/tasks', requireCurrentUser, async (ctx) => {
  const { projectId, archived } = ctx.query;
  ctx.body = await tasksService.listTasks({ projectId, archived, userId: ctx.state.userId });
});

// POST /tasks
router.post('/tasks', requireCurrentUser, async (ctx) => {
  const body = ctx.request.body;
  validateTaskCreate(body);
  ctx.status = 201;
  ctx.body = await tasksService.createTask(body, { userId: ctx.state.userId });
});

// PUT /tasks/:id
router.put('/tasks/:id', requireCurrentUser, async (ctx) => {
  const id = ctx.params.id;
  const body = ctx.request.body;
  validateTaskUpdate(body);
  const task = await tasksService.updateTask(id, body, { userId: ctx.state.userId });
  if (!task) {
    ctx.status = 404;
    ctx.body = { error: 'Task not found' };
    return;
  }
  ctx.body = task;
});

// DELETE /tasks/:id
router.delete('/tasks/:id', requireCurrentUser, async (ctx) => {
  const id = ctx.params.id;
  const deleted = await tasksService.deleteTask(id, { userId: ctx.state.userId });
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { error: 'Task not found' };
  } else {
    ctx.status = 204;
    ctx.body = null;
  }
});

module.exports = router;
module.exports.__test__ = {
  archiveTasks: (taskFilter) => archiveTasks(Task, taskFilter),
  buildArchiveFilter,
  combineFilters,
  restoreTasks: (taskFilter) => restoreTasks(Task, taskFilter)
};
