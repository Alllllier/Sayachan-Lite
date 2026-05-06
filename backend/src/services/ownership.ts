type OwnershipError = Error & {
  status: number;
};

export function requireUserId<TUserId>(userId: TUserId): NonNullable<TUserId> {
  if (!userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 }) as OwnershipError;
  }
  return userId as NonNullable<TUserId>;
}

export function ownerFilter<TUserId>(userId: TUserId) {
  return { userId: requireUserId(userId) };
}

export function ownedFilter<TId, TUserId>(id: TId, userId: TUserId) {
  return { _id: id, userId: requireUserId(userId) };
}
