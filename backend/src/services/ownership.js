function requireUserId(userId) {
  if (!userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }
  return userId;
}

function ownerFilter(userId) {
  return { userId: requireUserId(userId) };
}

function ownedFilter(id, userId) {
  return { _id: id, userId: requireUserId(userId) };
}

module.exports = {
  ownedFilter,
  ownerFilter,
  requireUserId
};
