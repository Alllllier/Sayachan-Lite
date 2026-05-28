import Router from '@koa/router';

import {
  sayaDeskSayachanRequestSchema,
  type SayaDeskSayachanRequestDto
} from '@sayachan/contracts';
import type {
  AuthenticatedRouteState,
  RouteHandler
} from './routeTypes.js';
import sayachanService from '../services/sayachanService.js';
import { resolveCurrentUserId } from '../middleware/route/currentUser.js';
import { validateBody } from '../middleware/route/requestBodyValidation.js';
import { validatedBody } from './routeState.js';

type SayachanState = AuthenticatedRouteState;
type SayachanHandler = RouteHandler<SayachanState>;

const router = new Router<SayachanState>();

const sayachanHandler: SayachanHandler = async (ctx) => {
  ctx.body = await sayachanService.chat(validatedBody<SayaDeskSayachanRequestDto>(ctx), {
    userId: resolveCurrentUserId(ctx),
    userRole: ctx.state.user?.role
  });
};

router.post('/sayachan', validateBody<SayaDeskSayachanRequestDto, SayachanState>(sayaDeskSayachanRequestSchema), sayachanHandler);

const exportedRouter = Object.assign(router, {
  __test__: sayachanService.__test__
});

export default exportedRouter;
