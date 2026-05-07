import Router from '@koa/router';

import type {
  TaskCreateDto,
  TaskCreationMode,
  TaskUpdateDto
} from './schemas/mutations.js';
import { type ObjectId } from '../domain/objectIds.js';
import type {
  AuthenticatedRouteState,
  RouteHandler
} from './routeTypes.js';

type TasksState = AuthenticatedRouteState;
type TasksHandler = RouteHandler<TasksState>;

import tasksService from '../services/tasksService.js';
import { requireCurrentUser } from '../middleware/route/currentUser.js';
import { validateBody } from '../middleware/route/requestBodyValidation.js';
import {
  parseBodyObjectId,
  parseParamObjectId,
  parseQueryObjectId
} from '../middleware/route/objectIdParsing.js';
import { objectId, parsedObjectId, validatedBody } from './routeState.js';
import {
  taskCreateSchema,
  taskUpdateSchema
} from './schemas/mutations.js';

const router = new Router<TasksState>();

type TaskCreateServiceBody = Omit<TaskCreateDto, 'originId'> & {
  title: string;
  creationMode?: TaskCreationMode;
  originModule?: string;
  originId?: ObjectId | null;
};

function parsedTaskCreateBody(ctx: Parameters<TasksHandler>[0]): TaskCreateServiceBody {
  const body = validatedBody<TaskCreateDto>(ctx);
  const { originId: _originId, ...rest } = body;
  if (body.originId !== undefined) {
    return {
      ...rest,
      originId: parsedObjectId(ctx, 'originId') ?? null
    };
  }
  return rest;
}

// GET /tasks
router.get('/tasks', requireCurrentUser, parseQueryObjectId<TasksState>('projectId', { optional: true }), async (ctx) => {
  const { archived } = ctx.query;
  ctx.body = await tasksService.listTasks({
    projectId: parsedObjectId(ctx, 'projectId'),
    archived,
    userId: ctx.state.userId
  });
});

// POST /tasks
router.post('/tasks', requireCurrentUser, validateBody<TaskCreateDto, TasksState>(taskCreateSchema), parseBodyObjectId<TasksState>('originId', { optional: true }), async (ctx) => {
  const body = parsedTaskCreateBody(ctx);
  ctx.status = 201;
  ctx.body = await tasksService.createTask(body, { userId: ctx.state.userId });
});

// PUT /tasks/:id
router.put('/tasks/:id', requireCurrentUser, parseParamObjectId<TasksState>('id'), validateBody<TaskUpdateDto, TasksState>(taskUpdateSchema), async (ctx) => {
  const id = objectId(ctx);
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
router.delete('/tasks/:id', requireCurrentUser, parseParamObjectId<TasksState>('id'), async (ctx) => {
  const id = objectId(ctx);
  const deleted = await tasksService.deleteTask(id, { userId: ctx.state.userId });
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { error: 'Task not found' };
  } else {
    ctx.status = 204;
    ctx.body = null;
  }
});

export default router;
