import Router from '@koa/router';
import type { Context } from 'koa';

import {
  sayaDeskSayachanRequestSchema,
  type SayaDeskSayachanRequestDto
} from '@sayachan/contracts';
import type {
  AuthenticatedRouteState,
  RouteHandler
} from './routeTypes.js';
import sayachanService from '../services/sayachanService.js';
import { SESSION_COOKIE_NAME } from '../http/authSession.js';
import { resolveCurrentUserId } from '../middleware/route/currentUser.js';
import { validateBody } from '../middleware/route/requestBodyValidation.js';
import { validatedBody } from './routeState.js';

type SayachanState = AuthenticatedRouteState;
type SayachanHandler = RouteHandler<SayachanState>;

const router = new Router<SayachanState>();

function bearerSessionToken(ctx: Context): string | null {
  const authorization = ctx.get('Authorization');
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

function sessionTokenForCore(ctx: Context): string | null {
  return bearerSessionToken(ctx) || ctx.cookies.get(SESSION_COOKIE_NAME) || null;
}

const sayachanHandler: SayachanHandler = async (ctx) => {
  ctx.body = await sayachanService.chat(validatedBody<SayaDeskSayachanRequestDto>(ctx), {
    userId: resolveCurrentUserId(ctx),
    userRole: ctx.state.user?.role,
    hostToolSessionToken: sessionTokenForCore(ctx)
  });
};

router.post('/sayachan', validateBody<SayaDeskSayachanRequestDto, SayachanState>(sayaDeskSayachanRequestSchema), sayachanHandler);

const exportedRouter = Object.assign(router, {
  __test__: sayachanService.__test__
});

export default exportedRouter;
