const Router = require('@koa/router');
const mongoose = require('mongoose');
const route = require('./routeBoundary');

const router = new Router();

// GET /health
router.get('/health', route((ctx) => {
  ctx.body = {
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
}));

module.exports = router;
