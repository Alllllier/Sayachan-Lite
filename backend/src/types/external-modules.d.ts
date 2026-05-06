declare module '@allier/sayachan-ai-core' {
  const aiCore: unknown;
  export default aiCore;
}

declare module '@koa/cors' {
  import type { Middleware } from 'koa';

  type CorsOptions = {
    origin?: (ctx: any) => string;
    credentials?: boolean;
  };

  export default function cors(options?: CorsOptions): Middleware;
}
