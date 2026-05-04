function route(handler) {
  return async (ctx, next) => {
    try {
      await handler(ctx, next);
    } catch (error) {
      if (error.status === 400) {
        ctx.status = 400;
        ctx.body = { error: error.message || 'Invalid request body' };
        return;
      }

      console.error('[Route Error] Unexpected backend route failure', error);
      ctx.status = 500;
      ctx.body = { error: 'Internal server error' };
    }
  };
}

module.exports = route;
