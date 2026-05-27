import Router from '@koa/router';

import { aiChatRequestSchema, type AiChatRequestDto } from '@sayachan/contracts';
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
  ctx.body = await sayachanService.chat(validatedBody<AiChatRequestDto>(ctx), {
    userId: resolveCurrentUserId(ctx),
    userRole: ctx.state.user?.role
  });
};

router.post('/sayachan', validateBody<AiChatRequestDto, SayachanState>(aiChatRequestSchema), sayachanHandler);

const exportedRouter = Object.assign(router, {
  __test__: sayachanService.__test__
});

export default exportedRouter;
