import type { ObjectId } from '../../middleware/objectIdParsing.js';

export type RuntimeDocument = object & {
  toObject?: () => Record<string, unknown>;
};

type PublicId = ObjectId | string | null | undefined;
type PublicDate = Date | null | undefined;
type AuthRole = 'owner' | 'tester';

export type UserAuthRecord = RuntimeDocument & {
  _id?: ObjectId | string;
  email?: string;
  role?: AuthRole;
  disabled?: boolean | null;
  passwordHash?: string;
  passwordSalt?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date | null;
};

export type InviteRuntimeRecord = RuntimeDocument & {
  _id?: PublicId;
  codePreview?: string;
  createdBy?: PublicId;
  expiresAt?: Date;
  revokedAt?: Date | null;
  usedAt?: Date | null;
  usedBy?: PublicId;
  createdAt?: Date;
};

export type PublicUserDto = {
  _id: PublicId;
  email: string | undefined;
  role: AuthRole | undefined;
  disabled: boolean;
  createdAt: PublicDate;
  updatedAt: PublicDate;
  lastLoginAt: PublicDate;
};

export type PublicInviteDto = {
  _id: PublicId;
  codePreview: string | undefined;
  createdBy: PublicId;
  expiresAt: PublicDate;
  revokedAt: PublicDate;
  usedAt: PublicDate;
  usedBy: PublicId;
  createdAt: PublicDate;
};

function toPlainObject(entity: RuntimeDocument): Record<string, unknown> {
  return entity.toObject ? entity.toObject() : { ...entity };
}

export function toPublicUserDto(user: UserAuthRecord | null | undefined): PublicUserDto | null {
  if (!user) {
    return null;
  }

  const normalized = toPlainObject(user) as UserAuthRecord;
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
  const normalized = toPlainObject(invite) as InviteRuntimeRecord;
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
