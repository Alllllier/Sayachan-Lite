import type { ObjectId } from './objectIds.js';
import { UnauthorizedError } from '../errors/httpErrors.js';

export function requireUserId(userId: ObjectId | null | undefined): ObjectId {
  if (!userId) {
    throw new UnauthorizedError();
  }
  return userId;
}

export function ownerFilter(userId: ObjectId) {
  return { userId: requireUserId(userId) };
}

export function ownedFilter(id: ObjectId, userId: ObjectId) {
  return { _id: id, userId: requireUserId(userId) };
}
