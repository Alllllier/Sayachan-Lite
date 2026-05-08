import type { Context } from 'koa';

import { SESSION_COOKIE_NAME } from './authSession.js';

type SessionCookieOptions = {
  httpOnly: boolean;
  sameSite: 'none' | 'lax';
  secure: boolean;
  overwrite: boolean;
  maxAge?: number;
};

export function sessionCookieOptions(extra: Partial<SessionCookieOptions> = {}): SessionCookieOptions {
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
  ctx.cookies.set(SESSION_COOKIE_NAME, '', sessionCookieOptions({
    maxAge: 0,
  }));
}

export function setSessionCookie(ctx: Context, sessionToken: string): void {
  ctx.cookies.set(SESSION_COOKIE_NAME, sessionToken, sessionCookieOptions({
    maxAge: 1000 * 60 * 60 * 24 * 14,
  }));
}
