import Router from '@koa/router';

import type {
  AuthCredentialsDto,
  RegisterTesterDto
} from './schemas/auth.js';
import authService from '../services/authService.js';
import { SESSION_COOKIE_NAME } from '../domain/authSession.js';
import { requireOwner } from '../middleware/route/auth.js';
import { clearSessionCookie, setSessionCookie } from '../middleware/sessionCookies.js';
import {
  authCredentialsSchema,
  registerTesterSchema
} from './schemas/auth.js';
import { validateBody } from '../middleware/route/requestBodyValidation.js';
import { validatedBody } from './routeState.js';
import type {
  RouteHandler,
  RouteState
} from './routeTypes.js';

type OwnerUser = Parameters<typeof authService.createInvite>[0];

type AuthState = RouteState & {
  user?: OwnerUser;
};

type AuthHandler = RouteHandler<AuthState>;

const router = new Router<AuthState>();

router.post('/auth/bootstrap-owner', validateBody<AuthCredentialsDto, AuthState>(authCredentialsSchema), (async (ctx) => {
  ctx.status = 201;
  ctx.body = await authService.bootstrapOwner(validatedBody<AuthCredentialsDto>(ctx));
}) as AuthHandler);

router.post('/auth/register', validateBody<RegisterTesterDto, AuthState>(registerTesterSchema), (async (ctx) => {
  ctx.status = 201;
  ctx.body = await authService.registerTester(validatedBody<RegisterTesterDto>(ctx));
}) as AuthHandler);

router.post('/auth/login', validateBody<AuthCredentialsDto, AuthState>(authCredentialsSchema), (async (ctx) => {
  const result = await authService.login(validatedBody<AuthCredentialsDto>(ctx));
  setSessionCookie(ctx, result.sessionToken);
  ctx.body = result;
}) as AuthHandler);

router.post('/auth/logout', (async (ctx) => {
  await authService.logout(ctx.cookies.get(SESSION_COOKIE_NAME));
  clearSessionCookie(ctx);
  ctx.status = 204;
  ctx.body = null;
}) as AuthHandler);

router.get('/auth/me', ((ctx) => {
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

export default router;
