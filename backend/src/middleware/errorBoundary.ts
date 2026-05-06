import type { Context, Next } from 'koa';

type RouteError = Error & {
  status?: number;
};

function isRouteError(error: unknown): error is RouteError {
  return error instanceof Error;
}

export async function errorBoundary(ctx: Context, next: Next): Promise<void> {
  try {
    await next();
  } catch (error) {
    if (isRouteError(error) && error.status && error.status >= 400 && error.status < 500) {
      ctx.status = error.status;
      ctx.body = { error: error.message || 'Invalid request body' };
      return;
    }

    console.error('[Route Error] Unexpected backend route failure', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
}
