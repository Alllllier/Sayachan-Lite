import Router from '@koa/router';
import { once } from 'node:events';
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

async function writeSseEvent(ctx: Parameters<SayachanHandler>[0], event: unknown): Promise<void> {
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

const sayachanStreamHandler: SayachanHandler = async (ctx) => {
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
    for await (const event of sayachanService.chatStream(validatedBody<SayaDeskSayachanRequestDto>(ctx), {
      userId: resolveCurrentUserId(ctx),
      userRole: ctx.state.user?.role,
      hostToolSessionToken: sessionTokenForCore(ctx)
    })) {
      if (closed) {
        break;
      }
      await writeSseEvent(ctx, event);
    }
  } catch (error) {
    if (!closed) {
      await writeSseEvent(ctx, {
        packetType: 'saya_desk_sayachan_stream_event',
        version: 1,
        type: 'error',
        error: {
          code: 'SAYACHAN_STREAM_ROUTE_ERROR',
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

router.post('/sayachan', validateBody<SayaDeskSayachanRequestDto, SayachanState>(sayaDeskSayachanRequestSchema), sayachanHandler);
router.post('/sayachan/stream', validateBody<SayaDeskSayachanRequestDto, SayachanState>(sayaDeskSayachanRequestSchema), sayachanStreamHandler);

const exportedRouter = Object.assign(router, {
  __test__: sayachanService.__test__
});

export default exportedRouter;
