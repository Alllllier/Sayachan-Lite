import type { Context, Next } from 'koa';
import { ForbiddenError, UnauthorizedError } from '../errors/httpErrors.js';
import authService from '../services/authService.js';

type SessionCookieOptions = {
  httpOnly: boolean;
  sameSite: 'none' | 'lax';
  secure: boolean;
  overwrite: boolean;
  maxAge?: number;
};

const PUBLIC_PATHS = [
  '/health',
  '/auth/bootstrap-owner',
  '/auth/register',
  '/auth/login',
  '/auth/logout',
  '/auth/me'
];

function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.includes(path);
}

function sessionCookieOptions(extra: Partial<SessionCookieOptions> = {}): SessionCookieOptions {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    overwrite: true,
    ...extra
  };
}

export function clearSessionCookie(ctx: Context): void {
  ctx.cookies.set(authService.SESSION_COOKIE_NAME, '', sessionCookieOptions({
    maxAge: 0,
  }));
}

export function setSessionCookie(ctx: Context, sessionToken: string): void {
  ctx.cookies.set(authService.SESSION_COOKIE_NAME, sessionToken, sessionCookieOptions({
    maxAge: 1000 * 60 * 60 * 24 * 14,
  }));
}

function getBearerSessionToken(ctx: Context): string | null {
  const authorization = ctx.get('Authorization');
  const match = authorization.match(/^Bearer\s+(.+)$/i);
  return match ? match[1].trim() : null;
}

export async function authMiddleware(ctx: Context, next: Next): Promise<void> {
  const cookieToken = ctx.cookies.get(authService.SESSION_COOKIE_NAME);
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

export function requireOwner(ctx: Context): void {
  if (!ctx.state.user) {
    throw new UnauthorizedError();
  }

  if (ctx.state.user.role !== 'owner') {
    throw new ForbiddenError('Owner access required');
  }
}

export {
  sessionCookieOptions
};

export default {
  authMiddleware,
  clearSessionCookie,
  requireOwner,
  sessionCookieOptions,
  setSessionCookie
};
