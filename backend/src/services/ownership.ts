type OwnershipError = Error & {
  status: number;
};

function requireUserId<TUserId>(userId: TUserId): NonNullable<TUserId> {
  if (!userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 }) as OwnershipError;
  }
  return userId as NonNullable<TUserId>;
}

function ownerFilter<TUserId>(userId: TUserId) {
  return { userId: requireUserId(userId) };
}

function ownedFilter<TId, TUserId>(id: TId, userId: TUserId) {
  return { _id: id, userId: requireUserId(userId) };
}

export = {
  ownedFilter,
  ownerFilter,
  requireUserId
};
