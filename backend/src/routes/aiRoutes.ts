import Router from '@koa/router';

import type {
  AiChatRequestDto,
  AiResourceRequestDto
} from '@sayachan/contracts';
import type {
  AuthenticatedRouteState,
  RouteHandler
} from './routeTypes.js';
import aiService from '../services/aiService.js';
import { requireCurrentUser } from '../middleware/route/currentUser.js';
import { validateBody } from '../middleware/route/requestBodyValidation.js';
import { validatedBody } from './routeState.js';
import {
  aiChatRequestSchema,
  aiResourceRequestSchema
} from '@sayachan/contracts';

type AiState = AuthenticatedRouteState;
type AiHandler = RouteHandler<AiState>;

const router = new Router<AiState>();

const generateNoteTaskDraftsHandler: AiHandler = async (ctx) => {
  const result = await aiService.generateNoteTaskDrafts(validatedBody<AiResourceRequestDto>(ctx), ctx.state.userId);
  if (!result.found) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  ctx.body = result.body;
};

const suggestProjectNextActionsHandler: AiHandler = async (ctx) => {
  const result = await aiService.suggestProjectNextActions(validatedBody<AiResourceRequestDto>(ctx), ctx.state.userId);
  if (!result.found) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  ctx.body = result.body;
};

const chatHandler: AiHandler = async (ctx) => {
  ctx.body = await aiService.chat(validatedBody<AiChatRequestDto>(ctx));
};

router.post('/ai/notes/tasks', requireCurrentUser, validateBody<AiResourceRequestDto, AiState>(aiResourceRequestSchema), generateNoteTaskDraftsHandler);
router.post('/ai/projects/next-action', requireCurrentUser, validateBody<AiResourceRequestDto, AiState>(aiResourceRequestSchema), suggestProjectNextActionsHandler);
router.post('/ai/chat', validateBody<AiChatRequestDto, AiState>(aiChatRequestSchema), chatHandler);

const exportedRouter = Object.assign(router, {
  __test__: aiService.__test__
});

export default exportedRouter;
