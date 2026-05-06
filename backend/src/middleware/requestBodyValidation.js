class BadRequestError extends Error {
  constructor(message = 'Invalid request body', { code, source, details } = {}) {
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

function assertZodSchema(schema, body, { source = 'request.body' } = {}) {
  const result = schema.safeParse(body);
  if (!result.success) {
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

function validateBody(schema) {
  return async (ctx, next) => {
    ctx.state.validatedBody = assertZodSchema(schema, ctx.request.body);
    await next();
  };
}

module.exports = {
  BadRequestError,
  assertZodSchema,
  validateBody
};
