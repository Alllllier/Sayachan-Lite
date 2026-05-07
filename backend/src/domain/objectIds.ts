import mongoose from 'mongoose';
import { BadRequestError } from '../errors/httpErrors.js';

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
