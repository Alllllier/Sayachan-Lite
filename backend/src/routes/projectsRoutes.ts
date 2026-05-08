import Router from '@koa/router';

import type {
  ProjectCreateDto,
  ProjectUpdateDto
} from '@sayachan/contracts';
import { type ObjectId } from '../domain/objectIds.js';
import type {
  AuthenticatedRouteState,
  RouteHandler
} from './routeTypes.js';

type ProjectsState = AuthenticatedRouteState;
type ProjectsHandler = RouteHandler<ProjectsState>;

type ProjectUpdateServiceBody = Omit<ProjectUpdateDto, 'currentFocusTaskId'> & {
  currentFocusTaskId?: ObjectId | null;
};

import projectsService from '../services/projectsService.js';
import { requireCurrentUser } from '../middleware/route/currentUser.js';
import { validateBody } from '../middleware/route/requestBodyValidation.js';
import {
  parseBodyObjectId,
  parseParamObjectId
} from '../middleware/route/objectIdParsing.js';
import { objectId, validatedBody } from './routeState.js';
import {
  projectCreateSchema,
  projectUpdateSchema
} from '@sayachan/contracts';

const router = new Router<ProjectsState>();

function parsedProjectUpdateBody(ctx: Parameters<ProjectsHandler>[0]): ProjectUpdateServiceBody {
  const body = validatedBody<ProjectUpdateDto>(ctx);
  if (body.currentFocusTaskId !== undefined) {
    const { currentFocusTaskId: _currentFocusTaskId, ...rest } = body;
    const parsedBody: ProjectUpdateServiceBody = { ...rest };
    parsedBody.currentFocusTaskId = ctx.state.objectIds?.currentFocusTaskId ?? null;
    return parsedBody;
  }
  return body as ProjectUpdateServiceBody;
}

const listProjectsHandler: ProjectsHandler = async (ctx) => {
  const { archived } = ctx.query;
  ctx.body = await projectsService.listProjects({ archived, userId: ctx.state.userId });
};

const createProjectHandler: ProjectsHandler = async (ctx) => {
  const body = validatedBody<ProjectCreateDto>(ctx);
  ctx.status = 201;
  ctx.body = await projectsService.createProject(body, { userId: ctx.state.userId });
};

const updateProjectHandler: ProjectsHandler = async (ctx) => {
  const id = objectId(ctx);
  const body = parsedProjectUpdateBody(ctx);
  const project = await projectsService.updateProject(id, body, { userId: ctx.state.userId });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
  } else {
    ctx.body = project;
  }
};

const deleteProjectHandler: ProjectsHandler = async (ctx) => {
  const id = objectId(ctx);
  const deleted = await projectsService.deleteProject(id, { userId: ctx.state.userId });
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
  } else {
    ctx.status = 204;
    ctx.body = null;
  }
};

const pinProjectHandler: ProjectsHandler = async (ctx) => {
  const id = objectId(ctx);
  const project = await projectsService.pinProject(id, { userId: ctx.state.userId });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }
  ctx.body = project;
};

const unpinProjectHandler: ProjectsHandler = async (ctx) => {
  const id = objectId(ctx);
  const project = await projectsService.unpinProject(id, { userId: ctx.state.userId });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }
  ctx.body = project;
};

const archiveProjectHandler: ProjectsHandler = async (ctx) => {
  const id = objectId(ctx);
  const project = await projectsService.archiveProject(id, { userId: ctx.state.userId });

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  ctx.body = project;
};

const restoreProjectHandler: ProjectsHandler = async (ctx) => {
  const id = objectId(ctx);
  const project = await projectsService.restoreProject(id, { userId: ctx.state.userId });

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  ctx.body = project;
};

router.get('/projects', requireCurrentUser, listProjectsHandler);
router.post('/projects', requireCurrentUser, validateBody<ProjectCreateDto, ProjectsState>(projectCreateSchema), createProjectHandler);
router.put(
  '/projects/:id',
  requireCurrentUser,
  parseParamObjectId<ProjectsState>('id'),
  validateBody<ProjectUpdateDto, ProjectsState>(projectUpdateSchema),
  parseBodyObjectId<ProjectsState>('currentFocusTaskId', { optional: true }),
  updateProjectHandler
);
router.delete('/projects/:id', requireCurrentUser, parseParamObjectId<ProjectsState>('id'), deleteProjectHandler);
router.put('/projects/:id/pin', requireCurrentUser, parseParamObjectId<ProjectsState>('id'), pinProjectHandler);
router.put('/projects/:id/unpin', requireCurrentUser, parseParamObjectId<ProjectsState>('id'), unpinProjectHandler);
router.put('/projects/:id/archive', requireCurrentUser, parseParamObjectId<ProjectsState>('id'), archiveProjectHandler);
router.put('/projects/:id/restore', requireCurrentUser, parseParamObjectId<ProjectsState>('id'), restoreProjectHandler);

export default router;
