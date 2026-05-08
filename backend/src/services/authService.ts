import crypto from 'crypto';
import User from '../models/User.js';
import Invite from '../models/Invite.js';
import Session from '../models/Session.js';
import {
  toCreatedInviteDto,
  toPublicInviteDto,
  toPublicUserDto,
  type UserAuthRecord
} from './responses/authResponses.js';
import {
  BadRequestError,
  ConflictError,
  ForbiddenError,
  NotFoundError,
  UnauthorizedError
} from '../http/httpErrors.js';

const PASSWORD_ITERATIONS = 210000;
const PASSWORD_KEY_LENGTH = 32;
const PASSWORD_DIGEST = 'sha256';
const SESSION_TTL_MS = 1000 * 60 * 60 * 24 * 14;
const INVITE_TTL_MS = 1000 * 60 * 60 * 24 * 31;

type AuthCredentials = {
  email: unknown;
  password: string;
};

type RegisterTesterInput = AuthCredentials & {
  inviteCode: unknown;
};

function normalizeEmail(email: unknown): string {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
}

function validateEmailPassword(email: unknown, password: unknown): void {
  if (!normalizeEmail(email) || typeof password !== 'string' || password.length < 8) {
    throw new BadRequestError('Email and password are required');
  }
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

function hashInviteCode(code: unknown): string {
  return hashToken(typeof code === 'string' ? code.trim().toUpperCase() : '');
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

function userPasswordRecord(user: UserAuthRecord): { passwordHash: string; passwordSalt: string } | null {
  if (typeof user.passwordHash !== 'string' || typeof user.passwordSalt !== 'string') {
    return null;
  }

  return {
    passwordHash: user.passwordHash,
    passwordSalt: user.passwordSalt
  };
}

function verifyPassword(password: string, user: UserAuthRecord): boolean {
  const storedPassword = userPasswordRecord(user);
  if (!storedPassword) {
    return false;
  }

  const { passwordHash } = hashPassword(password, storedPassword.passwordSalt);
  const expected = Buffer.from(storedPassword.passwordHash, 'hex');
  const actual = Buffer.from(passwordHash, 'hex');
  return expected.length === actual.length && crypto.timingSafeEqual(expected, actual);
}

export async function bootstrapOwner({ email, password }: AuthCredentials) {
  validateEmailPassword(email, password);

  const existingOwner = await User.findOne({ role: 'owner' });
  if (existingOwner) {
    throw new ConflictError('Owner already exists');
  }

  const existingEmail = await User.findOne({ email: normalizeEmail(email) });
  if (existingEmail) {
    throw new ConflictError('Email already registered');
  }

  const passwordRecord = hashPassword(password);
  const owner = await User.create({
    email: normalizeEmail(email),
    ...passwordRecord,
    role: 'owner'
  });

  return toPublicUserDto(owner);
}

export async function createInvite(owner: UserAuthRecord) {
  const rawCode = crypto.randomBytes(12).toString('base64url').toUpperCase();
  const invite = await Invite.create({
    codeHash: hashInviteCode(rawCode),
    codePreview: `${rawCode.slice(0, 4)}...${rawCode.slice(-4)}`,
    createdBy: owner._id,
    expiresAt: new Date(Date.now() + INVITE_TTL_MS)
  });

  return toCreatedInviteDto(toPublicInviteDto(invite), rawCode);
}

export async function listInvites() {
  const invites = await Invite.find({}).sort({ createdAt: -1 });
  return invites.map(toPublicInviteDto);
}

export async function revokeInvite(inviteId: unknown) {
  const invite = await Invite.findByIdAndUpdate(
    inviteId,
    { revokedAt: new Date() },
    { new: true, runValidators: true }
  );

  if (!invite) {
    throw new NotFoundError('Invite not found');
  }

  return toPublicInviteDto(invite);
}

export async function registerTester({ email, password, inviteCode }: RegisterTesterInput) {
  validateEmailPassword(email, password);

  const normalizedInviteCode = typeof inviteCode === 'string' ? inviteCode.trim() : '';
  if (!normalizedInviteCode) {
    throw new BadRequestError('Invite code is required');
  }

  const existingUser = await User.findOne({ email: normalizeEmail(email) });
  if (existingUser) {
    throw new ConflictError('Email already registered');
  }

  const invite = await Invite.findOne({ codeHash: hashInviteCode(normalizedInviteCode) });
  if (!invite || invite.revokedAt || invite.usedAt || invite.expiresAt <= new Date()) {
    throw new BadRequestError('Invite code is invalid');
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

  return toPublicUserDto(tester);
}

async function createSessionForUser(user: UserAuthRecord): Promise<string> {
  const token = crypto.randomBytes(32).toString('base64url');
  await Session.create({
    tokenHash: hashToken(token),
    userId: user._id,
    expiresAt: new Date(Date.now() + SESSION_TTL_MS)
  });

  return token;
}

export async function login({ email, password }: AuthCredentials) {
  validateEmailPassword(email, password);

  const user = await User.findOne({ email: normalizeEmail(email) });
  if (!user || !verifyPassword(password, user)) {
    throw new UnauthorizedError('Invalid email or password');
  }

  if (user.disabled) {
    throw new ForbiddenError('Account is disabled');
  }

  user.lastLoginAt = new Date();
  await user.save();

  const sessionToken = await createSessionForUser(user);
  return {
    sessionToken,
    user: toPublicUserDto(user)
  };
}

export async function loadUserForSession(sessionToken: string | null | undefined) {
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

  return toPublicUserDto(user);
}

export async function logout(sessionToken: string | null | undefined): Promise<void> {
  if (sessionToken) {
    await Session.findOneAndDelete({ tokenHash: hashToken(sessionToken) });
  }
}

export async function listTesters() {
  const users = await User.find({ role: 'tester' }).sort({ createdAt: -1 });
  return users.map(toPublicUserDto);
}

export async function setTesterDisabled(userId: unknown, disabled: unknown) {
  const update = disabled
    ? { disabled: true, disabledAt: new Date() }
    : { disabled: false, disabledAt: null };
  const user = await User.findOneAndUpdate(
    { _id: userId, role: 'tester' },
    update,
    { new: true, runValidators: true }
  );

  if (!user) {
    throw new NotFoundError('Tester not found');
  }

  if (disabled) {
    await Session.deleteMany({ userId: user._id });
  }

  return toPublicUserDto(user);
}

export async function getSystemStatus() {
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

export const __test__ = {
  hashInviteCode,
  hashPassword,
  verifyPassword
};

export default {
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
  __test__
};
