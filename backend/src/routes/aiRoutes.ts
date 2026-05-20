import Router from '@koa/router';
import { once } from 'node:events';

import type {
  AiChatRequestDto,
  AiResourceRequestDto
} from '@sayachan/contracts';
import type {
  AuthenticatedRouteState,
  RouteHandler
} from './routeTypes.js';
import aiService from '../services/aiService.js';
import { requireCurrentUser, resolveCurrentUserId } from '../middleware/route/currentUser.js';
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
  ctx.body = await aiService.chat(validatedBody<AiChatRequestDto>(ctx), {
    userId: resolveCurrentUserId(ctx)
  });
};

async function writeSseEvent(ctx: Parameters<AiHandler>[0], event: unknown): Promise<void> {
  const rawEventType = typeof event === 'object' && event !== null && 'type' in event
    ? (event as { type?: unknown }).type
    : undefined;
  const eventType = typeof rawEventType === 'string' && rawEventType.length > 0
    ? rawEventType
    : 'message';
  const payload = `event: ${eventType}\ndata: ${JSON.stringify(event)}\n\n`;

  if (!ctx.res.write(payload)) {
    await once(ctx.res, 'drain');
  }
}

const chatStreamHandler: AiHandler = async (ctx) => {
  ctx.status = 200;
  ctx.set('Content-Type', 'text/event-stream; charset=utf-8');
  ctx.set('Cache-Control', 'no-cache, no-transform');
  ctx.set('Connection', 'keep-alive');
  ctx.set('X-Accel-Buffering', 'no');

  const headers = ctx.response.headers;
  ctx.respond = false;
  for (const [key, value] of Object.entries(headers)) {
    if (value !== undefined) {
      ctx.res.setHeader(key, value);
    }
  }
  ctx.res.statusCode = 200;
  ctx.res.flushHeaders?.();

  let closed = false;
  ctx.req.on('close', () => {
    closed = true;
  });

  try {
    for await (const event of aiService.chatStream(validatedBody<AiChatRequestDto>(ctx), {
      userId: resolveCurrentUserId(ctx)
    })) {
      if (closed) {
        break;
      }
      await writeSseEvent(ctx, event);
    }
  } catch (error) {
    if (!closed) {
      await writeSseEvent(ctx, {
        packetType: 'chat_stream_event',
        version: 1,
        type: 'error',
        error: {
          code: 'BACKEND_STREAM_ERROR',
          message: error instanceof Error ? error.message : String(error)
        }
      });
    }
  } finally {
    if (!closed) {
      ctx.res.end();
    }
  }
};

router.post('/ai/notes/tasks', requireCurrentUser, validateBody<AiResourceRequestDto, AiState>(aiResourceRequestSchema), generateNoteTaskDraftsHandler);
router.post('/ai/projects/next-action', requireCurrentUser, validateBody<AiResourceRequestDto, AiState>(aiResourceRequestSchema), suggestProjectNextActionsHandler);
router.post('/ai/chat', validateBody<AiChatRequestDto, AiState>(aiChatRequestSchema), chatHandler);
router.post('/ai/chat/stream', validateBody<AiChatRequestDto, AiState>(aiChatRequestSchema), chatStreamHandler);

const exportedRouter = Object.assign(router, {
  __test__: aiService.__test__
});

export default exportedRouter;
