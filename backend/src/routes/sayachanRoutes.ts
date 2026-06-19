import Router from '@koa/router';
import { once } from 'node:events';

import {
  chatCandidateProposalStatusUpdateSchema,
  chatMessageSchema,
  sayaDeskSayachanRequestSchema,
  type ChatCandidateProposalStatusUpdateDto,
  type SayaDeskSayachanRequestDto
} from '@sayachan/contracts';
import type {
  AuthenticatedRouteState,
  RouteHandler
} from './routeTypes.js';
import sayachanService from '../services/sayachanService.js';
import { resolveCurrentUserId } from '../middleware/route/currentUser.js';
import { requireCurrentUser } from '../middleware/route/currentUser.js';
import { parseParamObjectId } from '../middleware/route/objectIdParsing.js';
import { validateBody } from '../middleware/route/requestBodyValidation.js';
import { objectId, validatedBody } from './routeState.js';
import { NotFoundError } from '../http/httpErrors.js';
import {
  findCandidateProposalForMessage,
  updateCandidateProposalStatus
} from '../services/chatPersistenceService.js';

type SayachanState = AuthenticatedRouteState;
type SayachanHandler = RouteHandler<SayachanState>;

const router = new Router<SayachanState>();

const sayachanHandler: SayachanHandler = async (ctx) => {
  ctx.body = await sayachanService.chat(validatedBody<SayaDeskSayachanRequestDto>(ctx), {
    userId: resolveCurrentUserId(ctx),
    userRole: ctx.state.user?.role,
    coreSubjectId: ctx.state.user?.coreSubjectId
  });
};

const updateCandidateProposalStatusHandler: SayachanHandler = async (ctx) => {
  const proposalId = ctx.params.proposalId;
  if (!proposalId) {
    throw new NotFoundError('Candidate proposal not found', {
      code: 'CANDIDATE_PROPOSAL_NOT_FOUND'
    });
  }
  const messageId = objectId(ctx, 'messageId');
  const update = validatedBody<ChatCandidateProposalStatusUpdateDto>(ctx);
  if (update.status === 'accepted') {
    const proposal = await findCandidateProposalForMessage(
      messageId,
      proposalId,
      { userId: ctx.state.userId }
    );
    if (!proposal) {
      throw new NotFoundError('Candidate proposal not found', {
        code: 'CANDIDATE_PROPOSAL_NOT_FOUND'
      });
    }
    await sayachanService.acceptMemoryCandidateProposal(proposal, {
      userId: ctx.state.userId,
      userRole: ctx.state.user?.role,
      coreSubjectId: ctx.state.user?.coreSubjectId,
      messageId: messageId.toHexString()
    });
  }
  const message = await updateCandidateProposalStatus(
    messageId,
    proposalId,
    update,
    { userId: ctx.state.userId }
  );
  if (!message) {
    throw new NotFoundError('Candidate proposal not found', {
      code: 'CANDIDATE_PROPOSAL_NOT_FOUND'
    });
  }
  ctx.body = chatMessageSchema.parse(message);
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
      coreSubjectId: ctx.state.user?.coreSubjectId
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
router.put(
  '/sayachan/candidates/:messageId/:proposalId/status',
  requireCurrentUser,
  parseParamObjectId<SayachanState>('messageId'),
  validateBody<ChatCandidateProposalStatusUpdateDto, SayachanState>(chatCandidateProposalStatusUpdateSchema),
  updateCandidateProposalStatusHandler
);

const exportedRouter = Object.assign(router, {
  __test__: sayachanService.__test__
});

export default exportedRouter;
