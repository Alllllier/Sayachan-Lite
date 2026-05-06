// @ts-ignore dto-pilot keeps module resolution narrow and relies on runtime package loading.
const Router = require('@koa/router');
const projectsService = require('../services/projectsService');
const { requireCurrentUser } = require('../middleware/currentUser');
const { validateBody } = require('../middleware/requestBodyValidation');
const {
  projectCreateSchema,
  projectUpdateSchema
} = require('./schemas/mutations');

const router = new Router();

// GET /projects
router.get('/projects', requireCurrentUser, async (ctx) => {
  const { archived } = ctx.query;
  ctx.body = await projectsService.listProjects({ archived, userId: ctx.state.userId });
});

// POST /projects
router.post('/projects', requireCurrentUser, validateBody(projectCreateSchema), async (ctx) => {
  /** @type {import('./schemas/mutations').ProjectCreateDto} */
  const body = ctx.state.validatedBody;
  ctx.status = 201;
  ctx.body = await projectsService.createProject(body, { userId: ctx.state.userId });
});

// PUT /projects/:id
router.put('/projects/:id', requireCurrentUser, validateBody(projectUpdateSchema), async (ctx) => {
  const id = ctx.params.id;
  /** @type {import('./schemas/mutations').ProjectUpdateDto} */
  const body = ctx.state.validatedBody;
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

module.exports = router;
