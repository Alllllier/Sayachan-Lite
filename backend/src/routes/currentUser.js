function resolveCurrentUserId(ctx) {
  const userId = ctx.state?.user?._id;
  if (!userId) {
    return null;
  }
  return userId;
}

async function requireCurrentUser(ctx, next) {
  const userId = resolveCurrentUserId(ctx);
  if (!userId) {
    ctx.status = 401;
    ctx.body = { error: 'Authentication required' };
    return;
  }

  ctx.state.userId = userId;
  await next();
}

module.exports = {
  requireCurrentUser,
  resolveCurrentUserId
};
