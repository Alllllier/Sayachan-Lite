import Router, { type RouterMiddleware } from '@koa/router';

import type {
  ProjectCreateDto,
  ProjectUpdateDto
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

type ProjectsState = CurrentUserState & {
  objectIds?: Record<string, ObjectId | null>;
  validatedBody?: unknown;
};

type ProjectsMiddleware = RouterMiddleware<ProjectsState>;
type ProjectsHandler = RouterMiddleware<ProjectsState>;

type RequestBodySchema<TBody> = {
  safeParse(body: unknown): { success: true; data: TBody } | { success: false; error: unknown };
};

type ValidateBody = <TBody>(schema: RequestBodySchema<TBody>) => ProjectsMiddleware;

type ProjectsServiceOptions = {
  userId: ObjectId;
};

type ListProjectsOptions = ProjectsServiceOptions & {
  archived?: unknown;
};

type ProjectUpdateServiceBody = Omit<ProjectUpdateDto, 'currentFocusTaskId'> & {
  currentFocusTaskId?: ObjectId | null;
};

type ProjectsService = {
  listProjects(options: ListProjectsOptions): Promise<unknown>;
  createProject(body: ProjectCreateDto, options: ProjectsServiceOptions): Promise<unknown>;
  updateProject(id: ObjectId, body: ProjectUpdateServiceBody, options: ProjectsServiceOptions): Promise<unknown>;
  deleteProject(id: ObjectId, options: ProjectsServiceOptions): Promise<boolean>;
  pinProject(id: ObjectId, options: ProjectsServiceOptions): Promise<unknown>;
  unpinProject(id: ObjectId, options: ProjectsServiceOptions): Promise<unknown>;
  archiveProject(id: ObjectId, options: ProjectsServiceOptions): Promise<unknown>;
  restoreProject(id: ObjectId, options: ProjectsServiceOptions): Promise<unknown>;
};

const projectsService = require('../services/projectsService') as ProjectsService;
const { requireCurrentUser } = require('../middleware/currentUser') as {
  requireCurrentUser: ProjectsMiddleware;
};
const { validateBody } = require('../middleware/requestBodyValidation') as {
  validateBody: ValidateBody;
};
const {
  parseBodyObjectId,
  parseParamObjectId
} = require('../middleware/objectIdParsing') as {
  parseBodyObjectId: (field: string, options?: { optional?: boolean }) => ProjectsMiddleware;
  parseParamObjectId: (field: string) => ProjectsMiddleware;
};
const {
  projectCreateSchema,
  projectUpdateSchema
} = require('./schemas/mutations') as {
  projectCreateSchema: RequestBodySchema<ProjectCreateDto>;
  projectUpdateSchema: RequestBodySchema<ProjectUpdateDto>;
};

const router = new Router<ProjectsState>();

function validatedBody<TBody>(ctx: Parameters<ProjectsHandler>[0]): TBody {
  return ctx.state.validatedBody as TBody;
}

function projectId(ctx: Parameters<ProjectsHandler>[0]): ObjectId {
  return ctx.state.objectIds?.id as ObjectId;
}

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

// GET /projects
router.get('/projects', requireCurrentUser, async (ctx) => {
  const { archived } = ctx.query;
  ctx.body = await projectsService.listProjects({ archived, userId: ctx.state.userId });
});

// POST /projects
router.post('/projects', requireCurrentUser, validateBody(projectCreateSchema), async (ctx) => {
  const body = validatedBody<ProjectCreateDto>(ctx);
  ctx.status = 201;
  ctx.body = await projectsService.createProject(body, { userId: ctx.state.userId });
});

// PUT /projects/:id
router.put(
  '/projects/:id',
  requireCurrentUser,
  parseParamObjectId('id'),
  validateBody(projectUpdateSchema),
  parseBodyObjectId('currentFocusTaskId', { optional: true }),
  async (ctx) => {
  const id = projectId(ctx);
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
router.delete('/projects/:id', requireCurrentUser, parseParamObjectId('id'), async (ctx) => {
  const id = projectId(ctx);
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
router.put('/projects/:id/pin', requireCurrentUser, parseParamObjectId('id'), async (ctx) => {
  const id = projectId(ctx);
  const project = await projectsService.pinProject(id, { userId: ctx.state.userId });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }
  ctx.body = project;
});

// PUT /projects/:id/unpin - Unpin project (does not update content timestamp)
router.put('/projects/:id/unpin', requireCurrentUser, parseParamObjectId('id'), async (ctx) => {
  const id = projectId(ctx);
  const project = await projectsService.unpinProject(id, { userId: ctx.state.userId });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }
  ctx.body = project;
});

// PUT /projects/:id/archive - Archive project and cascade to tasks
router.put('/projects/:id/archive', requireCurrentUser, parseParamObjectId('id'), async (ctx) => {
  const id = projectId(ctx);
  const project = await projectsService.archiveProject(id, { userId: ctx.state.userId });

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  ctx.body = project;
});

// PUT /projects/:id/restore - Restore project and cascade to tasks
router.put('/projects/:id/restore', requireCurrentUser, parseParamObjectId('id'), async (ctx) => {
  const id = projectId(ctx);
  const project = await projectsService.restoreProject(id, { userId: ctx.state.userId });

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  ctx.body = project;
});

export = router;
