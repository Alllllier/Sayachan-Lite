import type { ObjectId } from '../../middleware/objectIdParsing.js';

export type RuntimeDocument = object & {
  toObject?: () => Record<string, unknown>;
};

export type UserAuthRecord = RuntimeDocument & {
  _id?: ObjectId;
  email?: unknown;
  role?: unknown;
  disabled?: unknown;
  passwordHash?: unknown;
  passwordSalt?: unknown;
  createdAt?: unknown;
  updatedAt?: unknown;
  lastLoginAt?: unknown;
};

export type InviteRuntimeRecord = RuntimeDocument & {
  _id?: unknown;
  codePreview?: unknown;
  createdBy?: unknown;
  expiresAt?: unknown;
  revokedAt?: unknown;
  usedAt?: unknown;
  usedBy?: unknown;
  createdAt?: unknown;
};

export type PublicUserDto = {
  _id: unknown;
  email: unknown;
  role: unknown;
  disabled: boolean;
  createdAt: unknown;
  updatedAt: unknown;
  lastLoginAt: unknown;
};

export type PublicInviteDto = {
  _id: unknown;
  codePreview: unknown;
  createdBy: unknown;
  expiresAt: unknown;
  revokedAt: unknown;
  usedAt: unknown;
  usedBy: unknown;
  createdAt: unknown;
};

function toPlainObject(entity: RuntimeDocument): Record<string, unknown> {
  return entity.toObject ? entity.toObject() : { ...entity };
}

export function toPublicUserDto(user: UserAuthRecord | null | undefined): PublicUserDto | null {
  if (!user) {
    return null;
  }

  const normalized = toPlainObject(user);
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

export function toPublicInviteDto(invite: InviteRuntimeRecord): PublicInviteDto {
  const normalized = toPlainObject(invite);
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
