import Router, { type RouterMiddleware } from '@koa/router';

import type {
  ProjectCreateDto,
  ProjectUpdateDto
} from './schemas/mutations';

type CurrentUserState = {
  user?: {
    _id?: unknown;
    role?: string;
    email?: string;
  };
  userId: unknown;
};

type ProjectsState = CurrentUserState & {
  validatedBody?: unknown;
};

type ProjectsMiddleware = RouterMiddleware<ProjectsState>;
type ProjectsHandler = RouterMiddleware<ProjectsState>;

type RequestBodySchema<TBody> = {
  safeParse(body: unknown): { success: true; data: TBody } | { success: false; error: unknown };
};

type ValidateBody = <TBody>(schema: RequestBodySchema<TBody>) => ProjectsMiddleware;

type ProjectsServiceOptions = {
  userId: unknown;
};

type ListProjectsOptions = ProjectsServiceOptions & {
  archived?: unknown;
};

type ProjectsService = {
  listProjects(options: ListProjectsOptions): Promise<unknown>;
  createProject(body: ProjectCreateDto, options: ProjectsServiceOptions): Promise<unknown>;
  updateProject(id: string, body: ProjectUpdateDto, options: ProjectsServiceOptions): Promise<unknown>;
  deleteProject(id: string, options: ProjectsServiceOptions): Promise<boolean>;
  pinProject(id: string, options: ProjectsServiceOptions): Promise<unknown>;
  unpinProject(id: string, options: ProjectsServiceOptions): Promise<unknown>;
  archiveProject(id: string, options: ProjectsServiceOptions): Promise<unknown>;
  restoreProject(id: string, options: ProjectsServiceOptions): Promise<unknown>;
};

const projectsService = require('../services/projectsService') as ProjectsService;
const { requireCurrentUser } = require('../middleware/currentUser') as {
  requireCurrentUser: ProjectsMiddleware;
};
const { validateBody } = require('../middleware/requestBodyValidation') as {
  validateBody: ValidateBody;
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
router.put('/projects/:id', requireCurrentUser, validateBody(projectUpdateSchema), async (ctx) => {
  const id = ctx.params.id;
  const body = validatedBody<ProjectUpdateDto>(ctx);
  const project = await projectsService.updateProject(id, body, { userId: ctx.state.userId });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
  } else {
    ctx.body = project;
  }
});

// DELETE /projects/:id
router.delete('/projects/:id', requireCurrentUser, async (ctx) => {
  const id = ctx.params.id;
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
router.put('/projects/:id/pin', requireCurrentUser, async (ctx) => {
  const id = ctx.params.id;
  const project = await projectsService.pinProject(id, { userId: ctx.state.userId });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }
  ctx.body = project;
});

// PUT /projects/:id/unpin - Unpin project (does not update content timestamp)
router.put('/projects/:id/unpin', requireCurrentUser, async (ctx) => {
  const id = ctx.params.id;
  const project = await projectsService.unpinProject(id, { userId: ctx.state.userId });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }
  ctx.body = project;
});

// PUT /projects/:id/archive - Archive project and cascade to tasks
router.put('/projects/:id/archive', requireCurrentUser, async (ctx) => {
  const id = ctx.params.id;
  const project = await projectsService.archiveProject(id, { userId: ctx.state.userId });

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  ctx.body = project;
});

// PUT /projects/:id/restore - Restore project and cascade to tasks
router.put('/projects/:id/restore', requireCurrentUser, async (ctx) => {
  const id = ctx.params.id;
  const project = await projectsService.restoreProject(id, { userId: ctx.state.userId });

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  ctx.body = project;
});

export = router;
