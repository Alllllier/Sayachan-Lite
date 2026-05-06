import Router, { type RouterMiddleware } from '@koa/router';

import type {
  AuthCredentialsDto,
  RegisterTesterDto
} from './schemas/auth.js';
import authService from '../services/authService.js';
import { clearSessionCookie, requireOwner, setSessionCookie } from '../middleware/auth.js';
import {
  authCredentialsSchema,
  registerTesterSchema
} from './schemas/auth.js';
import { validateBody } from '../middleware/requestBodyValidation.js';

type OwnerUser = Parameters<typeof authService.createInvite>[0];

type AuthState = {
  user?: OwnerUser;
  validatedBody?: unknown;
};

type RequestBodySchema<TBody> = {
  safeParse(body: unknown): { success: true; data: TBody } | { success: false; error: unknown };
};

type AuthHandler = RouterMiddleware<AuthState>;
type AuthMiddleware = RouterMiddleware<AuthState>;
type ValidateBody = <TBody>(schema: RequestBodySchema<TBody>) => AuthMiddleware;

const router = new Router();

function validatedBody<TBody>(ctx: Parameters<AuthHandler>[0]): TBody {
  return ctx.state.validatedBody as TBody;
}

router.post('/auth/bootstrap-owner', validateBody(authCredentialsSchema), (async (ctx) => {
  ctx.status = 201;
  ctx.body = await authService.bootstrapOwner(validatedBody<AuthCredentialsDto>(ctx));
}) as AuthHandler);

router.post('/auth/register', validateBody(registerTesterSchema), (async (ctx) => {
  ctx.status = 201;
  ctx.body = await authService.registerTester(validatedBody<RegisterTesterDto>(ctx));
}) as AuthHandler);

router.post('/auth/login', validateBody(authCredentialsSchema), (async (ctx) => {
  const result = await authService.login(validatedBody<AuthCredentialsDto>(ctx));
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

export default router;
