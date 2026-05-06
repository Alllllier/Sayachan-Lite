import Router, { type RouterMiddleware } from '@koa/router';

const authService = require('../services/authService') as typeof import('../services/authService');
const { clearSessionCookie, requireOwner, setSessionCookie } = require('../middleware/auth') as typeof import('../middleware/auth');

type OwnerUser = Parameters<typeof authService.createInvite>[0];
type AuthCredentials = Parameters<typeof authService.login>[0];
type RegisterTesterInput = Parameters<typeof authService.registerTester>[0];

type AuthState = {
  user?: OwnerUser;
};

type AuthHandler = RouterMiddleware<AuthState>;

const router = new Router();

function requestBody<TBody>(ctx: Parameters<AuthHandler>[0]): TBody {
  return ((ctx.request as typeof ctx.request & { body?: unknown }).body || {}) as TBody;
}

router.post('/auth/bootstrap-owner', (async (ctx) => {
  ctx.status = 201;
  ctx.body = await authService.bootstrapOwner(requestBody<AuthCredentials>(ctx));
}) as AuthHandler);

router.post('/auth/register', (async (ctx) => {
  ctx.status = 201;
  ctx.body = await authService.registerTester(requestBody<RegisterTesterInput>(ctx));
}) as AuthHandler);

router.post('/auth/login', (async (ctx) => {
  const result = await authService.login(requestBody<AuthCredentials>(ctx));
  setSessionCookie(ctx, result.sessionToken);
  ctx.body = result;
}) as AuthHandler);

router.post('/auth/logout', (async (ctx) => {
  await authService.logout(ctx.cookies.get(authService.SESSION_COOKIE_NAME));
  clearSessionCookie(ctx);
  ctx.status = 204;
  ctx.body = null;
}) as AuthHandler);

router.get('/auth/me', (async (ctx) => {
  ctx.body = ctx.state.user || null;
}) as AuthHandler);

router.post('/owner/invites', (async (ctx) => {
  requireOwner(ctx);
  ctx.status = 201;
  ctx.body = await authService.createInvite(ctx.state.user as OwnerUser);
}) as AuthHandler);

router.get('/owner/invites', (async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.listInvites();
}) as AuthHandler);

router.post('/owner/invites/:id/revoke', (async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.revokeInvite(ctx.params.id);
}) as AuthHandler);

router.get('/owner/testers', (async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.listTesters();
}) as AuthHandler);

router.post('/owner/testers/:id/disable', (async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.setTesterDisabled(ctx.params.id, true);
}) as AuthHandler);

router.post('/owner/testers/:id/restore', (async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.setTesterDisabled(ctx.params.id, false);
}) as AuthHandler);

router.get('/owner/system-status', (async (ctx) => {
  requireOwner(ctx);
  ctx.body = await authService.getSystemStatus();
}) as AuthHandler);

export = router;
