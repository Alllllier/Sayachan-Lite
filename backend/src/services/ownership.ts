import type { ObjectId } from '../ids/objectId';

type OwnershipError = Error & {
  status: number;
};

export function requireUserId(userId: ObjectId | null | undefined): ObjectId {
  if (!userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 }) as OwnershipError;
  }
  return userId;
}

export function ownerFilter(userId: ObjectId) {
  return { userId: requireUserId(userId) };
}

export function ownedFilter(id: ObjectId, userId: ObjectId) {
  return { _id: id, userId: requireUserId(userId) };
}
