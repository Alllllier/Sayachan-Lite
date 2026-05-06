import Koa = require('koa');
import { connectDB } from './database';
import routes = require('./routes');
import aiRoutes = require('./routes/ai');
import { errorBoundary } from './middleware/errorBoundary';

const dotenv = require('dotenv') as { config(): void };
dotenv.config();

const cors = require('@koa/cors');
const { bodyParser } = require('@koa/bodyparser');
const { authMiddleware } = require('./middleware/auth');

const app = new Koa();
const PORT = process.env.PORT || 3001;

// Render terminates HTTPS before forwarding requests to the Node process.
// Trust proxy headers there so Koa can recognize secure requests for cookies.
app.proxy = process.env.RENDER === 'true' || process.env.TRUST_PROXY === 'true';

function allowedOrigins(): string[] {
  const raw = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  return raw
    .split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean);
}

const corsOrigins = allowedOrigins();

// CORS 配置，允许前端跨域请求
app.use(cors({
  origin: (ctx: Koa.Context) => {
    const requestOrigin = ctx.get('Origin');
    if (!requestOrigin) {
      return corsOrigins[0];
    }
    return corsOrigins.includes(requestOrigin) ? requestOrigin : '';
  },
  credentials: true,
}));

// Normalize downstream parser/auth/route failures into stable JSON responses.
app.use(errorBoundary);

// Body parser，处理请求体
app.use(bodyParser());

// Auth session loader and gate. Public auth/health routes opt out in the middleware.
app.use(authMiddleware);

// 挂载 AI 路由
app.use(aiRoutes.routes());
app.use(aiRoutes.allowedMethods());

// 挂载主业务路由
app.use(routes.routes());
app.use(routes.allowedMethods());

// 统一 404 处理（最后执行，仅处理真正未匹配的路由）
app.use(async (ctx: Koa.Context, next: Koa.Next) => {
  await next();

  // 如果路由没有设置 body，返回 404
  if (!ctx.body) {
    ctx.status = 404;
    ctx.body = { error: 'Not Found' };
  }
});

// 启动服务
async function start(): Promise<void> {
  // 尝试连接数据库（不阻塞服务启动）
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
  });
}

start().catch(console.error);
