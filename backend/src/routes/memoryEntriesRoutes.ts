import Router from '@koa/router';

import type {
  MemoryEntryCreateDto,
  MemoryEntryUpdateDto
} from '@sayachan/contracts';
import type {
  AuthenticatedRouteState,
  RouteHandler
} from './routeTypes.js';
import {
  memoryEntryCreateSchema,
  memoryEntryUpdateSchema
} from '@sayachan/contracts';
import { requireCurrentUser } from '../middleware/route/currentUser.js';
import { parseParamObjectId } from '../middleware/route/objectIdParsing.js';
import { validateBody } from '../middleware/route/requestBodyValidation.js';
import memoryEntriesService from '../services/memoryEntriesService.js';
import { objectId, validatedBody } from './routeState.js';

type MemoryEntriesState = AuthenticatedRouteState;
type MemoryEntriesHandler = RouteHandler<MemoryEntriesState>;

const router = new Router<MemoryEntriesState>();
const MEMORY_ACCESS_ROLES = new Set(['owner', 'tester']);

const requireMemoryAccess: MemoryEntriesHandler = async (ctx, next) => {
  if (!MEMORY_ACCESS_ROLES.has(ctx.state.user?.role || '')) {
    ctx.status = 403;
    ctx.body = { error: 'Memory access requires owner or tester role' };
    return;
  }

  await next();
};

const listMemoryEntriesHandler: MemoryEntriesHandler = async (ctx) => {
  ctx.body = await memoryEntriesService.listMemoryEntries({
    active: ctx.query.active,
    userId: ctx.state.userId
  });
};

const createMemoryEntryHandler: MemoryEntriesHandler = async (ctx) => {
  const body = validatedBody<MemoryEntryCreateDto>(ctx);
  ctx.status = 201;
  ctx.body = await memoryEntriesService.createMemoryEntry(body, { userId: ctx.state.userId });
};

const updateMemoryEntryHandler: MemoryEntriesHandler = async (ctx) => {
  const id = objectId(ctx);
  const body = validatedBody<MemoryEntryUpdateDto>(ctx);
  const entry = await memoryEntriesService.updateMemoryEntry(id, body, { userId: ctx.state.userId });
  if (!entry) {
    ctx.status = 404;
    ctx.body = { error: 'Memory entry not found' };
    return;
  }
  ctx.body = entry;
};

const activateMemoryEntryHandler: MemoryEntriesHandler = async (ctx) => {
  const id = objectId(ctx);
  const entry = await memoryEntriesService.setMemoryEntryActive(id, true, { userId: ctx.state.userId });
  if (!entry) {
    ctx.status = 404;
    ctx.body = { error: 'Memory entry not found' };
    return;
  }
  ctx.body = entry;
};

const deactivateMemoryEntryHandler: MemoryEntriesHandler = async (ctx) => {
  const id = objectId(ctx);
  const entry = await memoryEntriesService.setMemoryEntryActive(id, false, { userId: ctx.state.userId });
  if (!entry) {
    ctx.status = 404;
    ctx.body = { error: 'Memory entry not found' };
    return;
  }
  ctx.body = entry;
};

const deleteMemoryEntryHandler: MemoryEntriesHandler = async (ctx) => {
  const id = objectId(ctx);
  const deleted = await memoryEntriesService.deleteMemoryEntry(id, { userId: ctx.state.userId });
  if (!deleted) {
    ctx.status = 404;
    ctx.body = { error: 'Memory entry not found' };
    return;
  }
  ctx.status = 204;
  ctx.body = null;
};

router.get('/memory', requireCurrentUser, requireMemoryAccess, listMemoryEntriesHandler);
router.post('/memory', requireCurrentUser, requireMemoryAccess, validateBody<MemoryEntryCreateDto, MemoryEntriesState>(memoryEntryCreateSchema), createMemoryEntryHandler);
router.put('/memory/:id', requireCurrentUser, requireMemoryAccess, parseParamObjectId<MemoryEntriesState>('id'), validateBody<MemoryEntryUpdateDto, MemoryEntriesState>(memoryEntryUpdateSchema), updateMemoryEntryHandler);
router.put('/memory/:id/activate', requireCurrentUser, requireMemoryAccess, parseParamObjectId<MemoryEntriesState>('id'), activateMemoryEntryHandler);
router.put('/memory/:id/deactivate', requireCurrentUser, requireMemoryAccess, parseParamObjectId<MemoryEntriesState>('id'), deactivateMemoryEntryHandler);
router.delete('/memory/:id', requireCurrentUser, requireMemoryAccess, parseParamObjectId<MemoryEntriesState>('id'), deleteMemoryEntryHandler);

export default router;
