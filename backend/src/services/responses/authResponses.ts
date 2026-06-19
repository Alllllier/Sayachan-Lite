import {
  createdInviteSchema,
  publicInviteSchema,
  publicUserSchema,
  type CreatedInviteDto,
  type PublicInviteDto,
  type PublicUserDto
} from '@sayachan/contracts';
import type { ObjectId } from '../../domain/objectIds.js';

export type RuntimeDocument = object & {
  toObject?: () => Record<string, unknown>;
};

type AuthRole = 'owner' | 'tester';

export type UserAuthRecord = RuntimeDocument & {
  _id?: ObjectId | string;
  email?: string;
  role?: AuthRole;
  coreSubjectId?: string | null;
  disabled?: boolean | null;
  passwordHash?: string;
  passwordSalt?: string;
  createdAt?: Date;
  updatedAt?: Date;
  lastLoginAt?: Date | null;
};

export type InviteRuntimeRecord = RuntimeDocument & {
  _id?: ObjectId | string | null;
  codePreview?: string;
  createdBy?: ObjectId | string | null;
  expiresAt?: Date;
  revokedAt?: Date | null;
  usedAt?: Date | null;
  usedBy?: ObjectId | string | null;
  createdAt?: Date;
};

function toPlainObject(entity: RuntimeDocument): Record<string, unknown> {
  return entity.toObject ? entity.toObject() : { ...entity };
}

function hasToHexString(value: unknown): value is { toHexString: () => string } {
  return typeof value === 'object'
    && value !== null
    && 'toHexString' in value
    && typeof value.toHexString === 'function';
}

function publicString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }
  if (value === undefined) {
    return undefined;
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value === 'number' || typeof value === 'boolean' || typeof value === 'bigint') {
    return value.toString();
  }
  if (hasToHexString(value)) {
    return value.toHexString();
  }
  return undefined;
}

function publicIsoString(value: unknown): string | null | undefined {
  if (value === null) {
    return null;
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (typeof value === 'string') {
    return value;
  }
  return undefined;
}

export function toPublicUserDto(user: UserAuthRecord | null | undefined): PublicUserDto | null {
  if (!user) {
    return null;
  }

  const normalized = toPlainObject(user) as UserAuthRecord;
  return publicUserSchema.parse({
    _id: publicString(normalized._id),
    email: normalized.email,
    role: normalized.role,
    ...(publicString(normalized.coreSubjectId) !== undefined
      ? { coreSubjectId: publicString(normalized.coreSubjectId) }
      : {}),
    disabled: normalized.disabled === true,
    createdAt: publicIsoString(normalized.createdAt),
    updatedAt: publicIsoString(normalized.updatedAt),
    lastLoginAt: publicIsoString(normalized.lastLoginAt)
  });
}

export function toPublicInviteDto(invite: InviteRuntimeRecord): PublicInviteDto {
  const normalized = toPlainObject(invite) as InviteRuntimeRecord;
  return publicInviteSchema.parse({
    _id: publicString(normalized._id),
    codePreview: normalized.codePreview,
    createdBy: publicString(normalized.createdBy),
    expiresAt: publicIsoString(normalized.expiresAt),
    revokedAt: publicIsoString(normalized.revokedAt),
    usedAt: publicIsoString(normalized.usedAt),
    usedBy: publicString(normalized.usedBy),
    createdAt: publicIsoString(normalized.createdAt)
  });
}

export function toCreatedInviteDto(invite: PublicInviteDto, code: string): CreatedInviteDto {
  return createdInviteSchema.parse({
    ...invite,
    code
  });
}
