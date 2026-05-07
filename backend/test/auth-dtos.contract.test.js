import test from 'node:test';
import assert from 'node:assert/strict';

import {
  toPublicInviteDto,
  toPublicUserDto
} from '../dist/services/responses/authResponses.js';

function createDoc(data) {
  return {
    ...data,
    toObject() {
      return { ...data };
    }
  };
}

test('public user DTO keeps the explicit auth response field set', () => {
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const updatedAt = new Date('2026-01-02T00:00:00.000Z');
  const lastLoginAt = new Date('2026-01-03T00:00:00.000Z');
  const user = createDoc({
    _id: 'user-1',
    email: 'tester@example.com',
    role: 'tester',
    disabled: 1,
    passwordHash: 'secret-hash',
    passwordSalt: 'secret-salt',
    createdAt,
    updatedAt,
    lastLoginAt,
    disabledAt: new Date('2026-01-04T00:00:00.000Z')
  });

  assert.deepEqual(toPublicUserDto(user), {
    _id: 'user-1',
    email: 'tester@example.com',
    role: 'tester',
    disabled: false,
    createdAt: createdAt.toISOString(),
    updatedAt: updatedAt.toISOString(),
    lastLoginAt: lastLoginAt.toISOString()
  });
});

test('public user DTO normalizes only true disabled values to true', () => {
  assert.equal(toPublicUserDto(createDoc({ disabled: true }))?.disabled, true);
  assert.equal(toPublicUserDto(createDoc({ disabled: false }))?.disabled, false);
  assert.equal(toPublicUserDto(createDoc({}))?.disabled, false);
  assert.equal(toPublicUserDto(null), null);
  assert.equal(toPublicUserDto(undefined), null);
});

test('public invite DTO keeps invite secret material out of the response field set', () => {
  const expiresAt = new Date('2026-02-01T00:00:00.000Z');
  const revokedAt = null;
  const usedAt = new Date('2026-02-02T00:00:00.000Z');
  const createdAt = new Date('2026-01-01T00:00:00.000Z');
  const invite = createDoc({
    _id: 'invite-1',
    codePreview: 'ABCD...WXYZ',
    codeHash: 'secret-hash',
    code: 'SECRET-CODE',
    createdBy: 'owner-1',
    expiresAt,
    revokedAt,
    usedAt,
    usedBy: 'tester-1',
    createdAt
  });

  assert.deepEqual(toPublicInviteDto(invite), {
    _id: 'invite-1',
    codePreview: 'ABCD...WXYZ',
    createdBy: 'owner-1',
    expiresAt: expiresAt.toISOString(),
    revokedAt,
    usedAt: usedAt.toISOString(),
    usedBy: 'tester-1',
    createdAt: createdAt.toISOString()
  });
});
