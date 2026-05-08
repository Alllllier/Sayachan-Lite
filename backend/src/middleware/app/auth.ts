import type { Context, Next } from 'koa';

import { clearSessionCookie } from '../../http/sessionCookies.js';
import { SESSION_COOKIE_NAME } from '../../http/authSession.js';
import authService from '../../services/authService.js';

const PUBLIC_PATHS = [
  '/health',
  '/ready',
  '/auth/bootstrap-owner',
  '/auth/register',
  '/auth/login',
  '/auth/logout',
  '/auth/me'
];

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.includes(path);
}

function getBearerSessionToken(ctx: Context): string | null {
  const authorization = ctx.get('Authorization');
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export async function authMiddleware(ctx: Context, next: Next): Promise<void> {
  const cookieToken = ctx.cookies.get(SESSION_COOKIE_NAME);
  const bearerToken = getBearerSessionToken(ctx);
  const token = bearerToken || cookieToken;
  const user = await authService.loadUserForSession(token);

  if (user) {
    ctx.state.user = user;
  } else if (cookieToken) {
    clearSessionCookie(ctx);
  }

  if (!user && !isPublicPath(ctx.path)) {
    ctx.status = 401;
    ctx.body = { error: 'Authentication required' };
    return;
  }

  await next();
}
