import type { Context } from 'koa';

import { ForbiddenError, UnauthorizedError } from '../../errors/httpErrors.js';

export function requireOwner(ctx: Context): void {
  if (!ctx.state.user) {
    throw new UnauthorizedError();
  }

  if (ctx.state.user.role !== 'owner') {
    throw new ForbiddenError('Owner access required');
  }
}
