import type { Context, Next } from 'koa';
import { isHttpError } from '../../http/httpErrors.js';

export async function errorBoundary(ctx: Context, next: Next): Promise<void> {
  try {
    await next();
  } catch (error) {
    if (isHttpError(error)) {
      ctx.status = error.status;
      ctx.body = { error: error.message || 'Invalid request body' };
      return;
    }

    console.error('[Route Error] Unexpected backend route failure', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
}
