import { ForbiddenError, UnauthorizedError } from '../../http/httpErrors.js';
import type {
  OptionalCurrentUserState,
  RouteMiddleware
} from '../../routes/routeTypes.js';

type OwnerState = OptionalCurrentUserState;

export function requireOwnerAccess<TState extends OwnerState>(): RouteMiddleware<TState> {
  return async (ctx, next) => {
    if (!ctx.state.user) {
      throw new UnauthorizedError();
    }

    if (ctx.state.user.role !== 'owner') {
      throw new ForbiddenError('Owner access required');
    }

    await next();
  };
}
