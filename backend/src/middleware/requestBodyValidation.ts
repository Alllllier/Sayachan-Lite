import { BadRequestError } from '../errors/httpErrors';

type ValidationIssue = {
  code: string;
  path: PropertyKey[];
  message: string;
};

type SafeParseResult<T> =
  | { success: true; data: T }
  | { success: false; error: { issues: ValidationIssue[] } };

type RequestBodySchema<T> = {
  safeParse(body: unknown): SafeParseResult<T>;
};

type ValidationContext = {
  request: {
    body: unknown;
  };
  state: Record<string, unknown>;
};

type Next = () => Promise<void>;

function assertZodSchema<T>(
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

function validateBody<T>(schema: RequestBodySchema<T>) {
  return async (ctx: ValidationContext, next: Next): Promise<void> => {
    ctx.state.validatedBody = assertZodSchema(schema, ctx.request.body);
    await next();
  };
}

export = {
  assertZodSchema,
  validateBody
};
