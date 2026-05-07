import type { Context } from 'koa';

import { ForbiddenError, UnauthorizedError } from '../../errors/httpErrors.js';
import type { OptionalCurrentUserState } from '../../routes/routeTypes.js';

type OwnerContext = Context & {
  state: Context['state'] & OptionalCurrentUserState;
};

export function requireOwner(ctx: OwnerContext): void {
  if (!ctx.state.user) {
    throw new UnauthorizedError();
  }

  if (ctx.state.user.role !== 'owner') {
    throw new ForbiddenError('Owner access required');
  }
}
