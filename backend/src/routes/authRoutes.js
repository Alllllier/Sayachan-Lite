const Router = require('@koa/router');
const authService = require('../services/authService');
const { clearSessionCookie, requireOwner, setSessionCookie } = require('../middleware/auth');

const router = new Router();

router.post('/auth/bootstrap-owner', async (ctx) => {
  ctx.status = 201;
  ctx.body = await authService.bootstrapOwner(ctx.request.body || {});
});

router.post('/auth/register', async (ctx) => {
  ctx.status = 201;
  ctx.body = await authService.registerTester(ctx.request.body || {});
});

router.post('/auth/login', async (ctx) => {
  const result = await authService.login(ctx.request.body || {});
  setSessionCookie(ctx, result.sessionToken);
  ctx.body = result;
});

router.post('/auth/logout', async (ctx) => {
  await authService.logout(ctx.cookies.get(authService.SESSION_COOKIE_NAME));
  clearSessionCookie(ctx);
  ctx.status = 204;
  ctx.body = null;
});

router.get('/auth/me', async (ctx) => {
  ctx.body = ctx.state.user || null;
});

router.post('/owner/invites', async (ctx) => {
  requireOwner(ctx);
  ctx.status = 201;
  ctx.body = await authService.createInvite(ctx.state.user);
});

router.get('/owner/invites', async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.listInvites();
});

router.post('/owner/invites/:id/revoke', async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.revokeInvite(ctx.params.id);
});

router.get('/owner/testers', async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.listTesters();
});

router.post('/owner/testers/:id/disable', async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.setTesterDisabled(ctx.params.id, true);
});

router.post('/owner/testers/:id/restore', async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.setTesterDisabled(ctx.params.id, false);
});

router.get('/owner/system-status', async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.getSystemStatus();
});

module.exports = router;
