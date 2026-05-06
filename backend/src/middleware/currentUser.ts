import type { Context, Next } from 'koa';
import { toObjectId, type ObjectId } from './objectIdParsing.js';
import type {
  CurrentUserState,
  OptionalCurrentUserState,
  RouteContext
} from '../routes/routeTypes.js';

type CurrentUserContext = Context & {
  state: Context['state'] & OptionalCurrentUserState;
};

export function resolveCurrentUserId(ctx: CurrentUserContext): ObjectId | null {
  const userId = ctx.state?.user?._id;
  if (!userId) {
    return null;
  }
  return toObjectId(userId, 'state.user._id');
}

export const requireCurrentUser = async <TState extends CurrentUserState>(
  ctx: RouteContext<TState>,
  next: Next
): Promise<void> => {
  const userId = resolveCurrentUserId(ctx);
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: 'Authentication required' };
    return;
  }

  ctx.state.userId = userId;
  await next();
};
