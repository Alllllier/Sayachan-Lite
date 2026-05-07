import Router, { type RouterMiddleware } from '@koa/router';
import mongoose from 'mongoose';

const router = new Router();

// GET /health
router.get('/health', ((ctx) => {
  ctx.body = {
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === mongoose.ConnectionStates.connected ? 'connected' : 'disconnected'
  };
}) as RouterMiddleware);

export default router;
