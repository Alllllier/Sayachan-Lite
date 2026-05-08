import Router, { type RouterMiddleware } from '@koa/router';
import mongoose from 'mongoose';

const router = new Router();

function dbStatus(): 'connected' | 'disconnected' {
  return mongoose.connection.readyState === mongoose.ConnectionStates.connected ? 'connected' : 'disconnected';
}

// GET /health
router.get('/health', ((ctx) => {
  ctx.body = {
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    db: dbStatus()
  };
}) as RouterMiddleware);

// GET /ready
router.get('/ready', ((ctx) => {
  const db = dbStatus();
  const ready = db === 'connected';

  ctx.status = ready ? 200 : 503;
  ctx.body = {
    status: ready ? 'ok' : 'unavailable',
    service: 'backend',
    timestamp: new Date().toISOString(),
    db
  };
}) as RouterMiddleware);

export default router;
