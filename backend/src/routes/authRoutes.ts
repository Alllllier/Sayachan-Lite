import Router from '@koa/router';

import type {
  AuthCredentialsDto,
  RegisterTesterDto
} from '@sayachan/contracts';
import authService from '../services/authService.js';
import maintenanceService from '../services/maintenanceService.js';
import { SESSION_COOKIE_NAME } from '../http/authSession.js';
import { BadRequestError } from '../http/httpErrors.js';
import { requireOwnerAccess } from '../middleware/route/ownerAccess.js';
import { clearSessionCookie, setSessionCookie } from '../http/sessionCookies.js';
import {
  authCredentialsSchema,
  registerTesterSchema
} from '@sayachan/contracts';
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
const ownerAccess = requireOwnerAccess<AuthState>();
const LEGACY_PRODUCT_STATUS_CLEANUP_CONFIRM = 'clean-legacy-product-status';

const bootstrapOwnerHandler: AuthHandler = async (ctx) => {
  ctx.status = 201;
  ctx.body = await authService.bootstrapOwner(validatedBody<AuthCredentialsDto>(ctx));
};

const registerTesterHandler: AuthHandler = async (ctx) => {
  ctx.status = 201;
  ctx.body = await authService.registerTester(validatedBody<RegisterTesterDto>(ctx));
};

const loginHandler: AuthHandler = async (ctx) => {
  const result = await authService.login(validatedBody<AuthCredentialsDto>(ctx));
  setSessionCookie(ctx, result.sessionToken);
  ctx.body = result;
};

const logoutHandler: AuthHandler = async (ctx) => {
  await authService.logout(ctx.cookies.get(SESSION_COOKIE_NAME));
  clearSessionCookie(ctx);
  ctx.status = 204;
  ctx.body = null;
};

const currentUserHandler: AuthHandler = (ctx) => {
  ctx.body = ctx.state.user || null;
};

const createInviteHandler: AuthHandler = async (ctx) => {
  ctx.status = 201;
  ctx.body = await authService.createInvite(ctx.state.user as OwnerUser);
};

const listInvitesHandler: AuthHandler = async (ctx) => {
  ctx.body = await authService.listInvites();
};

const revokeInviteHandler: AuthHandler = async (ctx) => {
  ctx.body = await authService.revokeInvite(ctx.params.id);
};

const listTestersHandler: AuthHandler = async (ctx) => {
  ctx.body = await authService.listTesters();
};

const disableTesterHandler: AuthHandler = async (ctx) => {
  ctx.body = await authService.setTesterDisabled(ctx.params.id, true);
};

const restoreTesterHandler: AuthHandler = async (ctx) => {
  ctx.body = await authService.setTesterDisabled(ctx.params.id, false);
};

const systemStatusHandler: AuthHandler = async (ctx) => {
  ctx.body = await authService.getSystemStatus();
};

const cleanLegacyProductStatusHandler: AuthHandler = async (ctx) => {
  if (ctx.query.confirm !== LEGACY_PRODUCT_STATUS_CLEANUP_CONFIRM) {
    throw new BadRequestError('Maintenance cleanup confirmation required');
  }

  ctx.body = await maintenanceService.cleanLegacyProductStatus();
};

router.post('/auth/bootstrap-owner', validateBody<AuthCredentialsDto, AuthState>(authCredentialsSchema), bootstrapOwnerHandler);
router.post('/auth/register', validateBody<RegisterTesterDto, AuthState>(registerTesterSchema), registerTesterHandler);
router.post('/auth/login', validateBody<AuthCredentialsDto, AuthState>(authCredentialsSchema), loginHandler);
router.post('/auth/logout', logoutHandler);
router.get('/auth/me', currentUserHandler);
router.post('/owner/invites', ownerAccess, createInviteHandler);
router.get('/owner/invites', ownerAccess, listInvitesHandler);
router.post('/owner/invites/:id/revoke', ownerAccess, revokeInviteHandler);
router.get('/owner/testers', ownerAccess, listTestersHandler);
router.post('/owner/testers/:id/disable', ownerAccess, disableTesterHandler);
router.post('/owner/testers/:id/restore', ownerAccess, restoreTesterHandler);
router.get('/owner/system-status', ownerAccess, systemStatusHandler);
router.get('/owner/maintenance/clean-legacy-product-status', ownerAccess, cleanLegacyProductStatusHandler);

export default router;
