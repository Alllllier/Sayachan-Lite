export const ownerUser = {
  _id: 'owner-review-user',
  email: 'owner-review@example.com',
  role: 'owner',
  disabled: false,
  createdAt: '2026-05-04T08:00:00.000Z',
  updatedAt: '2026-05-04T08:00:00.000Z',
  lastLoginAt: '2026-05-04T10:00:00.000Z'
}

export const testerUser = {
  _id: 'tester-review-user',
  email: 'tester-review@example.com',
  role: 'tester',
  disabled: false,
  createdAt: '2026-05-04T08:30:00.000Z',
  updatedAt: '2026-05-04T08:30:00.000Z',
  lastLoginAt: '2026-05-04T10:15:00.000Z'
}

export const ownerInvites = [
  {
    _id: 'invite-active',
    codePreview: 'ABCD...WXYZ',
    createdBy: ownerUser._id,
    expiresAt: '2026-06-04T08:00:00.000Z',
    revokedAt: null,
    usedAt: null,
    usedBy: null,
    createdAt: '2026-05-04T08:00:00.000Z'
  },
  {
    _id: 'invite-used',
    codePreview: 'USED...DONE',
    createdBy: ownerUser._id,
    expiresAt: '2026-06-04T08:05:00.000Z',
    revokedAt: null,
    usedAt: '2026-05-04T09:00:00.000Z',
    usedBy: testerUser._id,
    createdAt: '2026-05-04T08:05:00.000Z'
  },
  {
    _id: 'invite-revoked',
    codePreview: 'STOP...CODE',
    createdBy: ownerUser._id,
    expiresAt: '2026-06-04T08:10:00.000Z',
    revokedAt: '2026-05-04T09:30:00.000Z',
    usedAt: null,
    usedBy: null,
    createdAt: '2026-05-04T08:10:00.000Z'
  }
]

export const ownerTesters = [
  testerUser,
  {
    _id: 'tester-disabled-review-user',
    email: 'disabled-tester-review@example.com',
    role: 'tester',
    disabled: true,
    createdAt: '2026-05-04T08:40:00.000Z',
    updatedAt: '2026-05-04T09:40:00.000Z',
    lastLoginAt: '2026-05-04T09:55:00.000Z'
  }
]

export const ownerSystemStatus = {
  userCount: 3,
  testerCount: 2,
  activeInviteCount: 1,
  activeSessionCount: 2,
  roles: ['owner', 'tester']
}
