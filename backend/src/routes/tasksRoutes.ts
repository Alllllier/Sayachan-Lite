import Router from '@koa/router';

import type {
  TaskCreateDto,
  TaskCreationMode,
  TaskUpdateDto
} from '@sayachan/contracts';
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
import { objectId, validatedBody } from './routeState.js';
import {
  taskCreateSchema,
  taskUpdateSchema
} from '@sayachan/contracts';

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
      originId: ctx.state.objectIds?.originId ?? null
    };
  }
  return rest;
}

const listTasksHandler: TasksHandler = async (ctx) => {
  const { archived } = ctx.query;
  ctx.body = await tasksService.listTasks({
    projectId: ctx.state.objectIds?.projectId,
    archived,
    userId: ctx.state.userId
  });
};

const createTaskHandler: TasksHandler = async (ctx) => {
  const body = parsedTaskCreateBody(ctx);
  ctx.status = 201;
  ctx.body = await tasksService.createTask(body, { userId: ctx.state.userId });
};

const updateTaskHandler: TasksHandler = async (ctx) => {
  const id = objectId(ctx);
  const body = validatedBody<TaskUpdateDto>(ctx);
  const task = await tasksService.updateTask(id, body, { userId: ctx.state.userId });
  if (!task) {
    ctx.status = 404;
    ctx.body = { error: 'Task not found' };
    return;
  }
  ctx.body = task;
};

const deleteTaskHandler: TasksHandler = async (ctx) => {
  const id = objectId(ctx);
  const deleted = await tasksService.deleteTask(id, { userId: ctx.state.userId });
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { error: 'Task not found' };
  } else {
    ctx.status = 204;
    ctx.body = null;
  }
};

router.get('/tasks', requireCurrentUser, parseQueryObjectId<TasksState>('projectId', { optional: true }), listTasksHandler);
router.post('/tasks', requireCurrentUser, validateBody<TaskCreateDto, TasksState>(taskCreateSchema), parseBodyObjectId<TasksState>('originId', { optional: true }), createTaskHandler);
router.put('/tasks/:id', requireCurrentUser, parseParamObjectId<TasksState>('id'), validateBody<TaskUpdateDto, TasksState>(taskUpdateSchema), updateTaskHandler);
router.delete('/tasks/:id', requireCurrentUser, parseParamObjectId<TasksState>('id'), deleteTaskHandler);

export default router;
