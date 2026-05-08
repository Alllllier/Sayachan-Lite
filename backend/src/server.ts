import Koa from 'koa';
import { connectDB } from './database.js';
import routes from './routes/index.js';
import { errorBoundary } from './middleware/app/errorBoundary.js';
import dotenv from 'dotenv';
import cors from '@koa/cors';
import { bodyParser } from '@koa/bodyparser';
import { authMiddleware } from './middleware/app/auth.js';
import { pathToFileURL } from 'url';

dotenv.config();

type CreateAppOptions = {
  corsOrigins?: string[];
  trustProxy?: boolean;
};

type StartServerOptions = CreateAppOptions & {
  port?: string | number;
};

function shouldTrustProxy(): boolean {
  return process.env.RENDER === 'true' || process.env.TRUST_PROXY === 'true';
}

function allowedOrigins(): string[] {
  const raw = process.env.FRONTEND_ORIGINS || process.env.FRONTEND_ORIGIN || 'http://localhost:5173';
  return raw
    .split(',')
    .map((origin: string) => origin.trim())
    .filter(Boolean);
}

function createApp(options: CreateAppOptions = {}): Koa {
  const app = new Koa();
  const corsOrigins = options.corsOrigins || allowedOrigins();

  // Render terminates HTTPS before forwarding requests to the Node process.
  // Trust proxy headers there so Koa can recognize secure requests for cookies.
  app.proxy = options.trustProxy ?? shouldTrustProxy();

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

  app.use(bodyParser());

  // Auth session loader and gate. Public auth/health routes opt out in the middleware.
  app.use(authMiddleware);

  app.use(routes.routes());
  app.use(routes.allowedMethods());

  app.use(async (ctx: Koa.Context, next: Koa.Next) => {
    await next();

    if (ctx.status === 404 && ctx.body === undefined) {
      ctx.status = 404;
      ctx.body = { error: 'Not Found' };
    }
  });

  return app;
}

async function startServer(options: StartServerOptions = {}): Promise<void> {
  const port = options.port || process.env.PORT || 3001;
  const app = createApp(options);

  await connectDB();

  app.listen(port, () => {
    console.log(`Backend server running at http://localhost:${port}`);
    console.log(`Health check available at http://localhost:${port}/health`);
    console.log(`Readiness check available at http://localhost:${port}/ready`);
  });
}

function isEntrypoint(): boolean {
  return Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;
}

if (isEntrypoint()) {
  startServer().catch((error: unknown) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { allowedOrigins, createApp, startServer };
