const authService = require('../services/authService');

const PUBLIC_PATHS = [
  '/health',
  '/auth/bootstrap-owner',
  '/auth/register',
  '/auth/login',
  '/auth/logout',
  '/auth/me'
];

function isPublicPath(path) {
  return PUBLIC_PATHS.includes(path);
}

function sessionCookieOptions(extra = {}) {
  const isProduction = process.env.NODE_ENV === 'production';
  return {
    httpOnly: true,
    sameSite: isProduction ? 'none' : 'lax',
    secure: isProduction,
    overwrite: true,
    ...extra
  };
}

function clearSessionCookie(ctx) {
  ctx.cookies.set(authService.SESSION_COOKIE_NAME, '', sessionCookieOptions({
    maxAge: 0,
  }));
}

function setSessionCookie(ctx, sessionToken) {
  ctx.cookies.set(authService.SESSION_COOKIE_NAME, sessionToken, sessionCookieOptions({
    maxAge: 1000 * 60 * 60 * 24 * 14,
  }));
}

async function authMiddleware(ctx, next) {
  const token = ctx.cookies.get(authService.SESSION_COOKIE_NAME);
  const user = await authService.loadUserForSession(token);

  if (user) {
    ctx.state.user = user;
  } else if (token) {
    clearSessionCookie(ctx);
  }

  if (!user && !isPublicPath(ctx.path)) {
    ctx.status = 401;
    ctx.body = { error: 'Authentication required' };
    return;
  }

  await next();
}

function requireOwner(ctx) {
  if (!ctx.state.user) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }

  if (ctx.state.user.role !== 'owner') {
    throw Object.assign(new Error('Owner access required'), { status: 403 });
  }
}

module.exports = {
  authMiddleware,
  clearSessionCookie,
  requireOwner,
  sessionCookieOptions,
  setSessionCookie
};
