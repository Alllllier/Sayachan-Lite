type ValidationIssue = {
  code: string;
  path: PropertyKey[];
  message: string;
};

type BadRequestErrorOptions = {
  code?: string;
  source?: string;
  details?: ValidationIssue[];
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

class BadRequestError extends Error {
  status: number;
  code?: string;
  source?: string;
  details?: ValidationIssue[];

  constructor(message = 'Invalid request body', { code, source, details }: BadRequestErrorOptions = {}) {
    super(message);
    this.name = 'BadRequestError';
    this.status = 400;

    if (code !== undefined) {
      this.code = code;
    }

    if (source !== undefined) {
      this.source = source;
    }

    if (details !== undefined) {
      this.details = details;
    }
  }
}

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
  BadRequestError,
  assertZodSchema,
  validateBody
};
