import type { Context, Next } from 'koa';

export function resolveCurrentUserId(ctx: Context): unknown | null {
  const userId = ctx.state?.user?._id;
  if (!userId) {
    return null;
  }
  return userId;
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
