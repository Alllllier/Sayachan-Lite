import Router, { type RouterMiddleware } from '@koa/router';
import mongoose = require('mongoose');

const router = new Router();

// GET /health
router.get('/health', ((ctx) => {
  ctx.body = {
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
}) as RouterMiddleware);

export = router;
