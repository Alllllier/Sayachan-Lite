import Router, { type RouterMiddleware } from '@koa/router';

import type {
  TaskCreateDto,
  TaskUpdateDto
} from './schemas/mutations';
import { type ObjectId } from '../middleware/objectIdParsing';

type CurrentUserState = {
  user?: {
    _id?: unknown;
    role?: string;
    email?: string;
  };
  userId: ObjectId;
};

type TasksState = CurrentUserState & {
  objectIds?: Record<string, ObjectId | null>;
  validatedBody?: unknown;
};

type TasksMiddleware = RouterMiddleware<TasksState>;
type TasksHandler = RouterMiddleware<TasksState>;

type RequestBodySchema<TBody> = {
  safeParse(body: unknown): { success: true; data: TBody } | { success: false; error: unknown };
};

type ValidateBody = <TBody>(schema: RequestBodySchema<TBody>) => TasksMiddleware;

type TasksServiceOptions = {
  userId: ObjectId;
};

type ListTasksOptions = TasksServiceOptions & {
  projectId?: ObjectId | null;
  archived?: unknown;
};

type TasksService = {
  listTasks(options: ListTasksOptions): Promise<unknown>;
  createTask(body: TaskCreateDto, options: TasksServiceOptions): Promise<unknown>;
  updateTask(id: ObjectId, body: TaskUpdateDto, options: TasksServiceOptions): Promise<unknown>;
  deleteTask(id: ObjectId, options: TasksServiceOptions): Promise<boolean>;
};

const tasksService = require('../services/tasksService') as TasksService;
const { requireCurrentUser } = require('../middleware/currentUser') as {
  requireCurrentUser: TasksMiddleware;
};
const { validateBody } = require('../middleware/requestBodyValidation') as {
  validateBody: ValidateBody;
};
const {
  parseParamObjectId,
  parseQueryObjectId
} = require('../middleware/objectIdParsing') as {
  parseParamObjectId: (field: string) => TasksMiddleware;
  parseQueryObjectId: (field: string, options?: { optional?: boolean }) => TasksMiddleware;
};
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

function taskId(ctx: Parameters<TasksHandler>[0]): ObjectId {
  return ctx.state.objectIds?.id as ObjectId;
}

// GET /tasks
router.get('/tasks', requireCurrentUser, parseQueryObjectId('projectId', { optional: true }), async (ctx) => {
  const { archived } = ctx.query;
  ctx.body = await tasksService.listTasks({
    projectId: ctx.state.objectIds?.projectId,
    archived,
    userId: ctx.state.userId
  });
});

// POST /tasks
router.post('/tasks', requireCurrentUser, validateBody(taskCreateSchema), async (ctx) => {
  const body = validatedBody<TaskCreateDto>(ctx);
  ctx.status = 201;
  ctx.body = await tasksService.createTask(body, { userId: ctx.state.userId });
});

// PUT /tasks/:id
router.put('/tasks/:id', requireCurrentUser, parseParamObjectId('id'), validateBody(taskUpdateSchema), async (ctx) => {
  const id = taskId(ctx);
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
router.delete('/tasks/:id', requireCurrentUser, parseParamObjectId('id'), async (ctx) => {
  const id = taskId(ctx);
  const deleted = await tasksService.deleteTask(id, { userId: ctx.state.userId });
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { error: 'Task not found' };
  } else {
    ctx.status = 204;
    ctx.body = null;
  }
});

export = router;
