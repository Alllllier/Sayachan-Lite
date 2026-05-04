function currentUserId(ctx) {
  const userId = ctx.state?.user?._id;
  if (!userId) {
    throw Object.assign(new Error('Authentication required'), { status: 401 });
  }
  return userId;
}

module.exports = {
  currentUserId
};
