const PROJECT_STATUSES = new Set(['pending', 'in_progress', 'completed', 'on_hold']);
const TASK_CREATION_MODES = new Set(['ai', 'manual']);
const TASK_STATUSES = new Set(['active', 'completed']);

class BadRequestError extends Error {
  constructor(message = 'Invalid request body') {
    super(message);
    this.name = 'BadRequestError';
    this.status = 400;
  }
}

function isObjectBody(body) {
  return body && typeof body === 'object' && !Array.isArray(body);
}

function assertObjectBody(body) {
  if (!isObjectBody(body)) {
    throw new BadRequestError();
  }
}

function assertStringField(body, field, { required = false, nonEmpty = false } = {}) {
  const value = body[field];

  if (value === undefined) {
    if (required) {
      throw new BadRequestError();
    }
    return;
  }

  if (typeof value !== 'string') {
    throw new BadRequestError();
  }

  if (nonEmpty && value.trim().length === 0) {
    throw new BadRequestError();
  }
}

function assertBooleanField(body, field) {
  if (body[field] !== undefined && typeof body[field] !== 'boolean') {
    throw new BadRequestError();
  }
}

function assertEnumField(body, field, allowedValues, { required = false } = {}) {
  const value = body[field];

  if (value === undefined) {
    if (required) {
      throw new BadRequestError();
    }
    return;
  }

  if (typeof value !== 'string' || !allowedValues.has(value)) {
    throw new BadRequestError();
  }
}

function assertKnownField(body, fields) {
  if (!fields.some((field) => body[field] !== undefined)) {
    throw new BadRequestError();
  }
}

function validateNoteCreate(body) {
  assertObjectBody(body);
  assertStringField(body, 'title', { required: true, nonEmpty: true });
  assertStringField(body, 'content');
}

function validateNoteUpdate(body) {
  assertObjectBody(body);
  assertKnownField(body, ['title', 'content']);
  assertStringField(body, 'title', { nonEmpty: true });
  assertStringField(body, 'content');
}

function validateProjectCreate(body) {
  assertObjectBody(body);
  assertStringField(body, 'name', { required: true, nonEmpty: true });
  assertStringField(body, 'summary', { required: true, nonEmpty: true });
  assertEnumField(body, 'status', PROJECT_STATUSES);
}

function validateProjectUpdate(body) {
  assertObjectBody(body);
  assertKnownField(body, ['name', 'summary', 'status', 'currentFocusTaskId']);
  assertStringField(body, 'name', { nonEmpty: true });
  assertStringField(body, 'summary', { nonEmpty: true });
  assertEnumField(body, 'status', PROJECT_STATUSES);

  if (
    body.currentFocusTaskId !== undefined &&
    body.currentFocusTaskId !== null &&
    typeof body.currentFocusTaskId !== 'string'
  ) {
    throw new BadRequestError();
  }
}

function validateTaskCreate(body) {
  assertObjectBody(body);
  assertStringField(body, 'title', { required: true, nonEmpty: true });
  assertEnumField(body, 'creationMode', TASK_CREATION_MODES);
  assertStringField(body, 'originModule');
}

function validateTaskUpdate(body) {
  assertObjectBody(body);
  assertKnownField(body, ['status', 'archived', 'completed']);
  assertEnumField(body, 'status', TASK_STATUSES);
  assertBooleanField(body, 'archived');
  assertBooleanField(body, 'completed');
}

module.exports = {
  BadRequestError,
  validateNoteCreate,
  validateNoteUpdate,
  validateProjectCreate,
  validateProjectUpdate,
  validateTaskCreate,
  validateTaskUpdate
};
