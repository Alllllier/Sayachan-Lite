class BadRequestError extends Error {
  /**
   * @param {string} [message]
   * @param {{ code?: string, source?: string, details?: Array<{ code: string, path: Array<PropertyKey>, message: string }> }} [options]
   */
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

/**
 * @template T
 * @typedef {{ success: true, data: T } | { success: false, error: { issues: Array<{ code: string, path: Array<PropertyKey>, message: string }> } }} SafeParseResult
 */

/**
 * @template T
 * @typedef {{ safeParse(body: unknown): SafeParseResult<T> }} RequestBodySchema
 */

/**
 * @template T
 * @param {RequestBodySchema<T>} schema
 * @param {unknown} body
 * @param {{ source?: string }} [options]
 * @returns {T}
 */
function assertZodSchema(schema, body, { source = 'request.body' } = {}) {
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

/**
 * @template T
 * @param {RequestBodySchema<T>} schema
 * @returns {(ctx: { request: { body: unknown }, state: Record<string, unknown> }, next: () => Promise<void>) => Promise<void>}
 */
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
