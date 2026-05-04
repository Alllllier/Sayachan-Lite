const Router = require('@koa/router');
const mongoose = require('mongoose');

const router = new Router();

// GET /health
router.get('/health', (ctx) => {
  ctx.body = {
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
});

module.exports = router;
