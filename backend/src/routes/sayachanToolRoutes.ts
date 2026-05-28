import Router from '@koa/router';

import {
  type SayaDeskHostToolExecutionRequestDto,
  sayaDeskHostToolExecutionRequestSchema
} from '@sayachan/contracts';
import { requireCurrentUser } from '../middleware/route/currentUser.js';
import { validateBody } from '../middleware/route/requestBodyValidation.js';
import sayachanHostToolService from '../services/sayachanHostToolService.js';
import type {
  AuthenticatedRouteState,
  RouteHandler
} from './routeTypes.js';
import { validatedBody } from './routeState.js';

type SayachanToolState = AuthenticatedRouteState<SayaDeskHostToolExecutionRequestDto>;
type SayachanToolHandler = RouteHandler<SayachanToolState>;

const router = new Router<SayachanToolState>();

const executeToolHandler: SayachanToolHandler = async (ctx) => {
  ctx.body = await sayachanHostToolService.executeHostTool(
    validatedBody<SayaDeskHostToolExecutionRequestDto>(ctx),
    { userId: ctx.state.userId }
  );
};

router.post(
  '/sayachan/tools/execute',
  requireCurrentUser,
  validateBody<SayaDeskHostToolExecutionRequestDto, SayachanToolState>(sayaDeskHostToolExecutionRequestSchema),
  executeToolHandler
);

const exportedRouter = Object.assign(router, {
  __test__: sayachanHostToolService
});

export default exportedRouter;
