const Router = require('@koa/router');
const authService = require('../services/authService');
const route = require('./routeBoundary');
const { clearSessionCookie, requireOwner, setSessionCookie } = require('../middleware/auth');

const router = new Router();

router.post('/auth/bootstrap-owner', route(async (ctx) => {
  ctx.status = 201;
  ctx.body = await authService.bootstrapOwner(ctx.request.body || {});
}));

router.post('/auth/register', route(async (ctx) => {
  ctx.status = 201;
  ctx.body = await authService.registerTester(ctx.request.body || {});
}));

router.post('/auth/login', route(async (ctx) => {
  const result = await authService.login(ctx.request.body || {});
  setSessionCookie(ctx, result.sessionToken);
  ctx.body = result;
}));

router.post('/auth/logout', route(async (ctx) => {
  await authService.logout(ctx.cookies.get(authService.SESSION_COOKIE_NAME));
  clearSessionCookie(ctx);
  ctx.status = 204;
  ctx.body = null;
}));

router.get('/auth/me', route(async (ctx) => {
  ctx.body = ctx.state.user || null;
}));

router.post('/owner/invites', route(async (ctx) => {
  requireOwner(ctx);
  ctx.status = 201;
  ctx.body = await authService.createInvite(ctx.state.user);
}));

router.get('/owner/invites', route(async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.listInvites();
}));

router.post('/owner/invites/:id/revoke', route(async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.revokeInvite(ctx.params.id);
}));

router.get('/owner/testers', route(async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.listTesters();
}));

router.post('/owner/testers/:id/disable', route(async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.setTesterDisabled(ctx.params.id, true);
}));

router.post('/owner/testers/:id/restore', route(async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.setTesterDisabled(ctx.params.id, false);
}));

router.get('/owner/system-status', route(async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.getSystemStatus();
}));

module.exports = router;
