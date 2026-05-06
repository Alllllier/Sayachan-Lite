const crypto = require('crypto');
const User = require('../models/User');
const Invite = require('../models/Invite');
const Session = require('../models/Session');
const Note = require('../models/Note');
const Project = require('../models/Project');
const Task = require('../models/Task');

const SESSION_COOKIE_NAME = 'sayachan_session';
const PASSWORD_ITERATIONS = 210000;
const PASSWORD_KEY_LENGTH = 32;
const PASSWORD_DIGEST = 'sha256';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 31;

type StatusError = Error & {
  status: number;
};

type DocumentLike = Record<string, any> & {
  toObject?: () => Record<string, any>;
};

type AuthCredentials = {
  email: unknown;
  password: string;
};

type RegisterTesterInput = AuthCredentials & {
  inviteCode: unknown;
};

function statusError(status: number, message: string): StatusError {
  const error = new Error(message) as StatusError;
  error.status = status;
  return error;
}

function normalizeEmail(email: unknown): string {
  return String(email || '').trim().toLowerCase();
}

function validateEmailPassword(email: unknown, password: unknown): void {
  if (!normalizeEmail(email) || typeof password !== 'string' || password.length < 8) {
    throw statusError(400, 'Email and password are required');
  }
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function hashInviteCode(code: unknown): string {
  return hashToken(String(code || '').trim().toUpperCase());
}

function hashPassword(password: string, salt: string = crypto.randomBytes(16).toString('hex')) {
  const passwordHash = crypto.pbkdf2Sync(
    password,
    salt,
    PASSWORD_ITERATIONS,
    PASSWORD_KEY_LENGTH,
    PASSWORD_DIGEST
  ).toString('hex');

  return { passwordHash, passwordSalt: salt };
}

function verifyPassword(password: string, user: DocumentLike): boolean {
  const { passwordHash } = hashPassword(password, user.passwordSalt);
  const expected = Buffer.from(user.passwordHash, 'hex');
  const actual = Buffer.from(passwordHash, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

function publicUser(user: DocumentLike | null | undefined) {
  if (!user) {
    return null;
  }

  const normalized = user.toObject ? user.toObject() : { ...user };
  return {
    _id: normalized._id,
    email: normalized.email,
    role: normalized.role,
    disabled: normalized.disabled === true,
    createdAt: normalized.createdAt,
    updatedAt: normalized.updatedAt,
    lastLoginAt: normalized.lastLoginAt
  };
}

function publicInvite(invite: DocumentLike) {
  const normalized = invite.toObject ? invite.toObject() : { ...invite };
  return {
    _id: normalized._id,
    codePreview: normalized.codePreview,
    createdBy: normalized.createdBy,
    expiresAt: normalized.expiresAt,
    revokedAt: normalized.revokedAt,
    usedAt: normalized.usedAt,
    usedBy: normalized.usedBy,
    createdAt: normalized.createdAt
  };
}

async function assignLegacyDataToOwner(ownerId: unknown): Promise<void> {
  const unsetOwner = { $or: [{ userId: null }, { userId: { $exists: false } }] };

  await Promise.all([
    Note.updateMany(unsetOwner, { $set: { userId: ownerId } }),
    Project.updateMany(unsetOwner, { $set: { userId: ownerId } }),
    Task.updateMany(unsetOwner, { $set: { userId: ownerId } })
  ]);
}

async function bootstrapOwner({ email, password }: AuthCredentials) {
  validateEmailPassword(email, password);

  const existingOwner = await User.findOne({ role: 'owner' });
  if (existingOwner) {
    throw statusError(409, 'Owner already exists');
  }

  const existingEmail = await User.findOne({ email: normalizeEmail(email) });
  if (existingEmail) {
    throw statusError(409, 'Email already registered');
  }

  const passwordRecord = hashPassword(password);
  const owner = await User.create({
    email: normalizeEmail(email),
    ...passwordRecord,
    role: 'owner'
  });

  // Phase-one bootstrap: claim pre-auth single-user data for the first owner.
  await assignLegacyDataToOwner(owner._id);

  return publicUser(owner);
}

async function createInvite(owner: DocumentLike) {
  const rawCode = crypto.randomBytes(12).toString('base64url').toUpperCase();
  const invite = await Invite.create({
    codeHash: hashInviteCode(rawCode),
    codePreview: `${rawCode.slice(0, 4)}...${rawCode.slice(-4)}`,
    createdBy: owner._id,
    expiresAt: new Date(Date.now() + INVITE_TTL_MS)
  });

  return {
    ...publicInvite(invite),
    code: rawCode
  };
}

async function listInvites() {
  const invites = await Invite.find({}).sort({ createdAt: -1 });
  return invites.map(publicInvite);
}

async function revokeInvite(inviteId: unknown) {
  const invite = await Invite.findByIdAndUpdate(
    inviteId,
    { revokedAt: new Date() },
    { new: true, runValidators: true }
  );

  if (!invite) {
    throw statusError(404, 'Invite not found');
  }

  return publicInvite(invite);
}

async function registerTester({ email, password, inviteCode }: RegisterTesterInput) {
  validateEmailPassword(email, password);

  const normalizedInviteCode = String(inviteCode || '').trim();
  if (!normalizedInviteCode) {
    throw statusError(400, 'Invite code is required');
  }

  const existingUser = await User.findOne({ email: normalizeEmail(email) });
  if (existingUser) {
    throw statusError(409, 'Email already registered');
  }

  const invite = await Invite.findOne({ codeHash: hashInviteCode(normalizedInviteCode) });
  if (!invite || invite.revokedAt || invite.usedAt || invite.expiresAt <= new Date()) {
    throw statusError(400, 'Invite code is invalid');
  }

  const passwordRecord = hashPassword(password);
  const tester = await User.create({
    email: normalizeEmail(email),
    ...passwordRecord,
    role: 'tester'
  });

  invite.usedAt = new Date();
  invite.usedBy = tester._id;
  await invite.save();

  return publicUser(tester);
}

async function createSessionForUser(user: DocumentLike): Promise<string> {
  const token = crypto.randomBytes(32).toString('base64url');
  await Session.create({
    tokenHash: hashToken(token),
    userId: user._id,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS)
  });

  return token;
}

async function login({ email, password }: AuthCredentials) {
  validateEmailPassword(email, password);

  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user || !verifyPassword(password, user)) {
    throw statusError(401, 'Invalid email or password');
  }

  if (user.disabled) {
    throw statusError(403, 'Account is disabled');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const sessionToken = await createSessionForUser(user);
  return {
    sessionToken,
    user: publicUser(user)
  };
}

async function loadUserForSession(sessionToken: string | null | undefined) {
  if (!sessionToken) {
    return null;
  }

  const session = await Session.findOne({ tokenHash: hashToken(sessionToken) });
  if (!session || session.expiresAt <= new Date()) {
    if (session) {
      await Session.findByIdAndDelete(session._id);
    }
    return null;
  }

  const user = await User.findById(session.userId);
  if (!user || user.disabled) {
    await Session.findByIdAndDelete(session._id);
    return null;
  }

  return publicUser(user);
}

async function logout(sessionToken: string | null | undefined): Promise<void> {
  if (sessionToken) {
    await Session.findOneAndDelete({ tokenHash: hashToken(sessionToken) });
  }
}

async function listTesters() {
  const users = await User.find({ role: 'tester' }).sort({ createdAt: -1 });
  return users.map(publicUser);
}

async function setTesterDisabled(userId: unknown, disabled: unknown) {
  const update = disabled
    ? { disabled: true, disabledAt: new Date() }
    : { disabled: false, disabledAt: null };
  const user = await User.findOneAndUpdate(
    { _id: userId, role: 'tester' },
    update,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw statusError(404, 'Tester not found');
  }

  if (disabled) {
    await Session.deleteMany({ userId });
  }

  return publicUser(user);
}

async function getSystemStatus() {
  const [userCount, testerCount, inviteCount, activeSessionCount] = await Promise.all([
    User.countDocuments({}),
    User.countDocuments({ role: 'tester' }),
    Invite.countDocuments({ revokedAt: null, usedAt: null, expiresAt: { $gt: new Date() } }),
    Session.countDocuments({ expiresAt: { $gt: new Date() } })
  ]);

  return {
    userCount,
    testerCount,
    activeInviteCount: inviteCount,
    activeSessionCount,
    roles: ['owner', 'tester']
  };
}

export = {
  SESSION_COOKIE_NAME,
  bootstrapOwner,
  createInvite,
  getSystemStatus,
  listInvites,
  listTesters,
  loadUserForSession,
  login,
  logout,
  registerTester,
  revokeInvite,
  setTesterDisabled,
  __test__: {
    assignLegacyDataToOwner,
    hashInviteCode,
    hashPassword,
    verifyPassword
  }
};
