import { BadRequestError } from '../../http/httpErrors.js';
import type {
  RequestBodySchema,
  RouteContext,
  RouteMiddleware,
  ValidationIssue,
  ValidatedBodyState
} from '../../routes/routeTypes.js';

export function assertZodSchema<T>(
  schema: RequestBodySchema<T>,
  body: unknown,
  { source = 'request.body' }: { source?: string } = {}
): T {
  const result = schema.safeParse(body);
  if (result.success === false) {
    throw new BadRequestError('Invalid request body', {
      code: 'VALIDATION_ERROR',
      source,
      details: result.error.issues.map((issue) => ({
        code: issue.code,
        path: issue.path,
        message: issue.message
      }))
    });
  }

  return result.data;
}

export function validateBody<
  TBody,
  TState extends ValidatedBodyState<unknown> = ValidatedBodyState<unknown>
>(schema: RequestBodySchema<TBody>): RouteMiddleware<TState> {
  return async (ctx: RouteContext<TState>, next): Promise<void> => {
    ctx.state.validatedBody = assertZodSchema(schema, ctx.request.body);
    await next();
  };
}
