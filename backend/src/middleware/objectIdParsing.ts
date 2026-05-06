import mongoose = require('mongoose');
import type { Context, Next } from 'koa';

const { BadRequestError } = require('./requestBodyValidation') as {
  BadRequestError: new (
    message?: string,
    options?: { code?: string; source?: string }
  ) => Error;
};

export type ObjectId = mongoose.Types.ObjectId;

function isObjectId(value: unknown): value is ObjectId {
  return value instanceof mongoose.Types.ObjectId;
}

function isCanonicalObjectIdString(value: string): boolean {
  return mongoose.Types.ObjectId.isValid(value) && new mongoose.Types.ObjectId(value).toHexString() === value.toLowerCase();
}

export function toObjectId(value: unknown, source: string): ObjectId {
  if (isObjectId(value)) {
    return value;
  }

  if (typeof value === 'string' && isCanonicalObjectIdString(value)) {
    return new mongoose.Types.ObjectId(value);
  }

  throw new BadRequestError('Invalid object id', {
    code: 'INVALID_OBJECT_ID',
    source
  });
}

export function optionalObjectId(value: unknown, source: string): ObjectId | null {
  if (value === null || value === undefined || value === '') {
    return null;
  }

  return toObjectId(value, source);
}

type ObjectIdLocation = 'params' | 'query' | 'body';

type ObjectIdParsingState = {
  objectIds?: Record<string, ObjectId | null>;
};

type ObjectIdParsingContext = Context & {
  state: Context['state'] & ObjectIdParsingState;
};

function readObjectIdSource(ctx: ObjectIdParsingContext, location: ObjectIdLocation, field: string): unknown {
  if (location === 'params') {
    return ctx.params?.[field];
  }

  if (location === 'query') {
    return ctx.query?.[field];
  }

  return ctx.state.validatedBody?.[field];
}

function parsedStateKey(location: ObjectIdLocation, field: string, stateKey?: string): string {
  return stateKey || (location === 'params' && field === 'id' ? 'id' : field);
}

export function parseObjectId(
  location: ObjectIdLocation,
  field: string,
  { optional = false, stateKey }: { optional?: boolean; stateKey?: string } = {}
) {
  return async (ctx: ObjectIdParsingContext, next: Next): Promise<void> => {
    const source = `${location}.${field}`;
    const value = readObjectIdSource(ctx, location, field);
    const parsed = optional ? optionalObjectId(value, source) : toObjectId(value, source);
    ctx.state.objectIds = {
      ...ctx.state.objectIds,
      [parsedStateKey(location, field, stateKey)]: parsed
    };
    await next();
  };
}

export function parseParamObjectId(field: string, options?: { optional?: boolean; stateKey?: string }) {
  return parseObjectId('params', field, options);
}

export function parseQueryObjectId(field: string, options?: { optional?: boolean; stateKey?: string }) {
  return parseObjectId('query', field, options);
}

export function parseBodyObjectId(field: string, options?: { optional?: boolean; stateKey?: string }) {
  return parseObjectId('body', field, options);
}
