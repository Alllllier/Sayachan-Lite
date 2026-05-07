import Router from '@koa/router';

import type {
  ProjectCreateDto,
  ProjectUpdateDto
} from './schemas/mutations.js';
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
import { objectId, parsedObjectId, validatedBody } from './routeState.js';
import {
  projectCreateSchema,
  projectUpdateSchema
} from './schemas/mutations.js';

const router = new Router<ProjectsState>();

function parsedProjectUpdateBody(ctx: Parameters<ProjectsHandler>[0]): ProjectUpdateServiceBody {
  const body = validatedBody<ProjectUpdateDto>(ctx);
  if (body.currentFocusTaskId !== undefined) {
    const { currentFocusTaskId: _currentFocusTaskId, ...rest } = body;
    const parsedBody: ProjectUpdateServiceBody = { ...rest };
    parsedBody.currentFocusTaskId = parsedObjectId(ctx, 'currentFocusTaskId') ?? null;
    return parsedBody;
  }
  return body as ProjectUpdateServiceBody;
}

// GET /projects
router.get('/projects', requireCurrentUser, async (ctx) => {
  const { archived } = ctx.query;
  ctx.body = await projectsService.listProjects({ archived, userId: ctx.state.userId });
});

// POST /projects
router.post('/projects', requireCurrentUser, validateBody<ProjectCreateDto, ProjectsState>(projectCreateSchema), async (ctx) => {
  const body = validatedBody<ProjectCreateDto>(ctx);
  ctx.status = 201;
  ctx.body = await projectsService.createProject(body, { userId: ctx.state.userId });
});

// PUT /projects/:id
router.put(
  '/projects/:id',
  requireCurrentUser,
  parseParamObjectId<ProjectsState>('id'),
  validateBody<ProjectUpdateDto, ProjectsState>(projectUpdateSchema),
  parseBodyObjectId<ProjectsState>('currentFocusTaskId', { optional: true }),
  async (ctx) => {
  const id = objectId(ctx);
  const body = parsedProjectUpdateBody(ctx);
  const project = await projectsService.updateProject(id, body, { userId: ctx.state.userId });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
  } else {
    ctx.body = project;
  }
  }
);

// DELETE /projects/:id
router.delete('/projects/:id', requireCurrentUser, parseParamObjectId<ProjectsState>('id'), async (ctx) => {
  const id = objectId(ctx);
  const deleted = await projectsService.deleteProject(id, { userId: ctx.state.userId });
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
  } else {
    ctx.status = 204;
    ctx.body = null;
  }
});

// PUT /projects/:id/pin - Pin project (does not update content timestamp)
router.put('/projects/:id/pin', requireCurrentUser, parseParamObjectId<ProjectsState>('id'), async (ctx) => {
  const id = objectId(ctx);
  const project = await projectsService.pinProject(id, { userId: ctx.state.userId });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }
  ctx.body = project;
});

// PUT /projects/:id/unpin - Unpin project (does not update content timestamp)
router.put('/projects/:id/unpin', requireCurrentUser, parseParamObjectId<ProjectsState>('id'), async (ctx) => {
  const id = objectId(ctx);
  const project = await projectsService.unpinProject(id, { userId: ctx.state.userId });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }
  ctx.body = project;
});

// PUT /projects/:id/archive - Archive project and cascade to tasks
router.put('/projects/:id/archive', requireCurrentUser, parseParamObjectId<ProjectsState>('id'), async (ctx) => {
  const id = objectId(ctx);
  const project = await projectsService.archiveProject(id, { userId: ctx.state.userId });

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  ctx.body = project;
});

// PUT /projects/:id/restore - Restore project and cascade to tasks
router.put('/projects/:id/restore', requireCurrentUser, parseParamObjectId<ProjectsState>('id'), async (ctx) => {
  const id = objectId(ctx);
  const project = await projectsService.restoreProject(id, { userId: ctx.state.userId });

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  ctx.body = project;
});

export default router;
