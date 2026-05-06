import Router, { type RouterMiddleware } from '@koa/router';

import type {
  TaskCreateDto,
  TaskUpdateDto
} from './schemas/mutations';

type CurrentUserState = {
  user?: {
    _id?: unknown;
    role?: string;
    email?: string;
  };
  userId: unknown;
};

type TasksState = CurrentUserState & {
  validatedBody?: unknown;
};

type TasksMiddleware = RouterMiddleware<TasksState>;
type TasksHandler = RouterMiddleware<TasksState>;

type RequestBodySchema<TBody> = {
  safeParse(body: unknown): { success: true; data: TBody } | { success: false; error: unknown };
};

type ValidateBody = <TBody>(schema: RequestBodySchema<TBody>) => TasksMiddleware;

type TasksServiceOptions = {
  userId: unknown;
};

type ListTasksOptions = TasksServiceOptions & {
  projectId?: unknown;
  archived?: unknown;
};

type TasksService = {
  listTasks(options: ListTasksOptions): Promise<unknown>;
  createTask(body: TaskCreateDto, options: TasksServiceOptions): Promise<unknown>;
  updateTask(id: string, body: TaskUpdateDto, options: TasksServiceOptions): Promise<unknown>;
  deleteTask(id: string, options: TasksServiceOptions): Promise<boolean>;
};

type TaskRuntimeHelpers = {
  archiveTasks(TaskModel: unknown, taskFilter: unknown): Promise<number>;
  buildArchiveFilter(archived: unknown): unknown;
  combineFilters(...filters: unknown[]): unknown;
  restoreTasks(TaskModel: unknown, taskFilter: unknown): Promise<number>;
};

type TasksTestExports = {
  archiveTasks(taskFilter: unknown): Promise<number>;
  buildArchiveFilter: TaskRuntimeHelpers['buildArchiveFilter'];
  combineFilters: TaskRuntimeHelpers['combineFilters'];
  restoreTasks(taskFilter: unknown): Promise<number>;
};

type TasksRouter = typeof router & {
  __test__: TasksTestExports;
};

const Task = require('../models/Task');
const tasksService = require('../services/tasksService') as TasksService;
const { requireCurrentUser } = require('../middleware/currentUser') as {
  requireCurrentUser: TasksMiddleware;
};
const { validateBody } = require('../middleware/requestBodyValidation') as {
  validateBody: ValidateBody;
};
const {
  archiveTasks,
  buildArchiveFilter,
  combineFilters,
  restoreTasks
} = require('../services/taskRuntimeHelpers') as TaskRuntimeHelpers;
const {
  taskCreateSchema,
  taskUpdateSchema
} = require('./schemas/mutations') as {
  taskCreateSchema: RequestBodySchema<TaskCreateDto>;
  taskUpdateSchema: RequestBodySchema<TaskUpdateDto>;
};

const router = new Router<TasksState>();

function validatedBody<TBody>(ctx: Parameters<TasksHandler>[0]): TBody {
  return ctx.state.validatedBody as TBody;
}

// GET /tasks
router.get('/tasks', requireCurrentUser, async (ctx) => {
  const { projectId, archived } = ctx.query;
  ctx.body = await tasksService.listTasks({ projectId, archived, userId: ctx.state.userId });
});

// POST /tasks
router.post('/tasks', requireCurrentUser, validateBody(taskCreateSchema), async (ctx) => {
  const body = validatedBody<TaskCreateDto>(ctx);
  ctx.status = 201;
  ctx.body = await tasksService.createTask(body, { userId: ctx.state.userId });
});

// PUT /tasks/:id
router.put('/tasks/:id', requireCurrentUser, validateBody(taskUpdateSchema), async (ctx) => {
  const id = ctx.params.id;
  const body = validatedBody<TaskUpdateDto>(ctx);
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

const taskRouter = router as TasksRouter;

taskRouter.__test__ = {
  archiveTasks: (taskFilter) => archiveTasks(Task, taskFilter),
  buildArchiveFilter,
  combineFilters,
  restoreTasks: (taskFilter) => restoreTasks(Task, taskFilter)
};

export = taskRouter;
