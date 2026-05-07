import Router from '@koa/router';

import type {
  AiChatDto,
  AiNoteTaskRequestDto,
  AiProjectNextActionRequestDto
} from './schemas/ai.js';
import type {
  AuthenticatedRouteState,
  RouteHandler
} from './routeTypes.js';
import aiService from '../services/aiService.js';
import { requireCurrentUser } from '../middleware/currentUser.js';
import { validateBody } from '../middleware/requestBodyValidation.js';
import {
  aiChatSchema,
  aiNoteTaskRequestSchema,
  aiProjectNextActionRequestSchema
} from './schemas/ai.js';

type AiState = AuthenticatedRouteState;
type AiHandler = RouteHandler<AiState>;

const router = new Router<AiState>();

function validatedBody<TBody>(ctx: Parameters<AiHandler>[0]): TBody {
  return ctx.state.validatedBody as TBody;
}

// POST /ai/notes/tasks - Generate tasks from a note
router.post('/ai/notes/tasks', requireCurrentUser, validateBody<AiNoteTaskRequestDto, AiState>(aiNoteTaskRequestSchema), (async (ctx) => {
  const result = await aiService.generateNoteTaskDrafts(validatedBody<AiNoteTaskRequestDto>(ctx), ctx.state.userId);
  if (!result.found) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  ctx.body = result.body;
}) as AiHandler);

// POST /ai/projects/next-action - Suggest next action for a project
router.post('/ai/projects/next-action', requireCurrentUser, validateBody<AiProjectNextActionRequestDto, AiState>(aiProjectNextActionRequestSchema), (async (ctx) => {
  const result = await aiService.suggestProjectNextActions(validatedBody<AiProjectNextActionRequestDto>(ctx), ctx.state.userId);
  if (!result.found) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  ctx.body = result.body;
}) as AiHandler);

// POST /ai/chat - Orchestrated chat entry for AI substrate v0.1
router.post('/ai/chat', validateBody<AiChatDto, AiState>(aiChatSchema), (async (ctx) => {
  ctx.body = await aiService.chat(validatedBody<AiChatDto>(ctx));
}) as AiHandler);

const exportedRouter = Object.assign(router, {
  __test__: aiService.__test__
});

export default exportedRouter;
