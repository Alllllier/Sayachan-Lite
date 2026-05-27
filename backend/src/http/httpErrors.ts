export type HttpErrorOptions = {
  code?: string;
  source?: string;
  details?: unknown;
};

export type HttpErrorLike = Error & {
  status: number;
  code?: string;
  source?: string;
  details?: unknown;
};

export class HttpError extends Error implements HttpErrorLike {
  status: number;
  code?: string;
  source?: string;
  details?: unknown;

  constructor(status: number, message: string, { code, source, details }: HttpErrorOptions = {}) {
    super(message);
    this.name = 'HttpError';
    this.status = status;

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

export class BadRequestError extends HttpError {
  constructor(message = 'Invalid request body', options?: HttpErrorOptions) {
    super(400, message, options);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Authentication required', options?: HttpErrorOptions) {
    super(401, message, options);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden', options?: HttpErrorOptions) {
    super(403, message, options);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not found', options?: HttpErrorOptions) {
    super(404, message, options);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict', options?: HttpErrorOptions) {
    super(409, message, options);
    this.name = 'ConflictError';
  }
}

export function isHttpError(error: unknown): error is HttpErrorLike {
  return error instanceof Error
    && typeof (error as Partial<HttpErrorLike>).status === 'number'
    && (error as Partial<HttpErrorLike>).status! >= 400
    && (error as Partial<HttpErrorLike>).status! < 600;
}
