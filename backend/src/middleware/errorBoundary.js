async function errorBoundary(ctx, next) {
  try {
    await next();
  } catch (error) {
    if (error.status && error.status >= 400 && error.status < 500) {
      ctx.status = error.status;
      ctx.body = { error: error.message || 'Invalid request body' };
      return;
    }

    console.error('[Route Error] Unexpected backend route failure', error);
    ctx.status = 500;
    ctx.body = { error: 'Internal server error' };
  }
}

module.exports = {
  errorBoundary
};
