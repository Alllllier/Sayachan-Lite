import Router, { type RouterMiddleware } from '@koa/router';
import mongoose from 'mongoose';

const router = new Router();
type HealthHandler = RouterMiddleware;

function dbStatus(): 'connected' | 'disconnected' {
  return mongoose.connection.readyState === mongoose.ConnectionStates.connected ? 'connected' : 'disconnected';
}

// GET /health
const healthHandler: HealthHandler = (ctx) => {
  ctx.body = {
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    db: dbStatus()
  };
};

router.get('/health', healthHandler);

// GET /ready
const readyHandler: HealthHandler = (ctx) => {
  const db = dbStatus();
  const ready = db === 'connected';

  ctx.status = ready ? 200 : 503;
  ctx.body = {
    status: ready ? 'ok' : 'unavailable',
    service: 'backend',
    timestamp: new Date().toISOString(),
    db
  };
};

router.get('/ready', readyHandler);

export default router;
