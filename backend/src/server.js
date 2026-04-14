const dotenv = require('dotenv');
dotenv.config();

const Koa = require('koa');
const cors = require('@koa/cors');
const { bodyParser } = require('@koa/bodyparser');
const { connectDB } = require('./database');
const routes = require('./routes');
const aiRoutes = require('./routes/ai');

const app = new Koa();
const PORT = process.env.PORT || 3001;

// CORS 配置，允许前端跨域请求
app.use(cors({
  origin: process.env.FRONTEND_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));

// Body parser，处理请求体
app.use(bodyParser());

// 挂载 AI 路由
app.use(aiRoutes.routes(), aiRoutes.allowedMethods());

// 挂载主业务路由
app.use(routes.routes(), routes.allowedMethods());

// 统一 404 处理（最后执行，仅处理真正未匹配的路由）
app.use(async (ctx, next) => {
  await next();

  // 如果路由没有设置 body，返回 404
  if (!ctx.body) {
    ctx.status = 404;
    ctx.body = { error: 'Not Found' };
  }
});

// 启动服务
async function start() {
  // 尝试连接数据库（不阻塞服务启动）
  await connectDB();

  app.listen(PORT, () => {
    console.log(`Backend server running at http://localhost:${PORT}`);
    console.log(`Health check available at http://localhost:${PORT}/health`);
    console.log(`Notes API available at http://localhost:${PORT}/notes`);
    console.log(`AI routes available at http://localhost:${PORT}/ai`);
  });
}

start().catch(console.error);
