import type { Context, Next } from 'koa';
import { toObjectId, type ObjectId } from './objectIdParsing';

export function resolveCurrentUserId(ctx: Context): ObjectId | null {
  const userId = ctx.state?.user?._id;
  if (!userId) {
    return null;
  }
  return toObjectId(userId, 'state.user._id');
}

export async function requireCurrentUser(ctx: Context, next: Next): Promise<void> {
  const userId = resolveCurrentUserId(ctx);
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: 'Authentication required' };
    return;
  }

  ctx.state.userId = userId;
  await next();
}
