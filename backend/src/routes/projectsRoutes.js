const Router = require('@koa/router');
const projectsService = require('../services/projectsService');
const { requireCurrentUser } = require('./currentUser');
const {
  validateProjectCreate,
  validateProjectUpdate
} = require('./requestValidation');
const route = require('./routeBoundary');

const router = new Router();

// GET /projects
router.get('/projects', requireCurrentUser, route(async (ctx) => {
  const { archived } = ctx.query;
  ctx.body = await projectsService.listProjects({ archived, userId: ctx.state.userId });
}));

// POST /projects
router.post('/projects', requireCurrentUser, route(async (ctx) => {
  const body = ctx.request.body;
  validateProjectCreate(body);
  ctx.status = 201;
  ctx.body = await projectsService.createProject(body, { userId: ctx.state.userId });
}));

// PUT /projects/:id
router.put('/projects/:id', requireCurrentUser, route(async (ctx) => {
  const id = ctx.params.id;
  const body = ctx.request.body;
  validateProjectUpdate(body);
  const project = await projectsService.updateProject(id, body, { userId: ctx.state.userId });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
  } else {
    ctx.body = project;
  }
}));

// DELETE /projects/:id
router.delete('/projects/:id', requireCurrentUser, route(async (ctx) => {
  const id = ctx.params.id;
  const deleted = await projectsService.deleteProject(id, { userId: ctx.state.userId });
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
  } else {
    ctx.status = 204;
    ctx.body = null;
  }
}));

// PUT /projects/:id/pin - Pin project (does not update content timestamp)
router.put('/projects/:id/pin', requireCurrentUser, route(async (ctx) => {
  const id = ctx.params.id;
  const project = await projectsService.pinProject(id, { userId: ctx.state.userId });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }
  ctx.body = project;
}));

// PUT /projects/:id/unpin - Unpin project (does not update content timestamp)
router.put('/projects/:id/unpin', requireCurrentUser, route(async (ctx) => {
  const id = ctx.params.id;
  const project = await projectsService.unpinProject(id, { userId: ctx.state.userId });
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }
  ctx.body = project;
}));

// PUT /projects/:id/archive - Archive project and cascade to tasks
router.put('/projects/:id/archive', requireCurrentUser, route(async (ctx) => {
  const id = ctx.params.id;
  const project = await projectsService.archiveProject(id, { userId: ctx.state.userId });

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  ctx.body = project;
}));

// PUT /projects/:id/restore - Restore project and cascade to tasks
router.put('/projects/:id/restore', requireCurrentUser, route(async (ctx) => {
  const id = ctx.params.id;
  const project = await projectsService.restoreProject(id, { userId: ctx.state.userId });

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  ctx.body = project;
}));

module.exports = router;
