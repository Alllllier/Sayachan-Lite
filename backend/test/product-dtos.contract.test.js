import test from 'node:test';
import assert from 'node:assert/strict';

import {
  toNoteDto,
  toProjectDto,
  toTaskDto
} from '../dist/services/responses/productResponses.js';

function createDoc(data) {
  return {
    ...data,
    toObject() {
      return { ...data };
    }
  };
}

function createTaskDoc(data = {}) {
  return createDoc({
    status: 'active',
    ...data
  });
}

function createProjectDoc(data = {}) {
  return createDoc({
    _id: 'project-1',
    name: 'Backend hardening',
    summary: 'Make current DTO behavior explicit',
    status: 'pending',
    updatedAt: new Date('2026-04-02T00:00:00.000Z'),
    ...data
  });
}

function createNoteDoc(data = {}) {
  return createDoc({
    _id: 'note-1',
    title: 'DTO notes',
    content: 'Characterize current note DTO spread behavior',
    updatedAt: new Date('2026-05-02T00:00:00.000Z'),
    ...data
  });
}

function assertOnlyKeys(actual, expectedKeys) {
  assert.deepEqual(Object.keys(actual).sort(), [...expectedKeys].sort());
}

function assertAbsent(actual, fields) {
  for (const field of fields) {
    assert.equal(Object.hasOwn(actual, field), false, `${field} should not be present`);
  }
}

const basePrivateFields = ['userId', '__v', 'createdAt', 'pinnedAt'];
const compatibilityFields = ['legacyId', 'legacyStatus', 'ownerId', 'source'];

test('task DTO returns only the approved public contract while preserving valid lifecycle fields', () => {
  const createdAt = new Date('2026-03-01T00:00:00.000Z');
  const updatedAt = new Date('2026-03-02T00:00:00.000Z');
  const task = createDoc({
    _id: 'task-1',
    title: 'Ship DTO contract tests',
    creationMode: 'manual',
    originId: 'project-1',
    originModule: 'project',
    userId: 'user-1',
    __v: 7,
    createdAt,
    updatedAt: updatedAt.toISOString(),
    pinnedAt: new Date('2026-03-03T00:00:00.000Z'),
    legacyId: 'legacy-task-1',
    legacyStatus: 'done',
    ownerId: 'owner-1',
    source: 'compat',
    archived: 1,
    completed: 1,
    status: 'active'
  });

  const dto = toTaskDto(task);

  assert.deepEqual(dto, {
    _id: 'task-1',
    title: 'Ship DTO contract tests',
    status: 'active',
    archived: false,
    completed: false,
    creationMode: 'manual',
    originId: 'project-1',
    originModule: 'project'
  });
  assertOnlyKeys(dto, [
    '_id',
    'title',
    'status',
    'archived',
    'completed',
    'creationMode',
    'originModule',
    'originId'
  ]);
  assertAbsent(dto, [...basePrivateFields, 'updatedAt', ...compatibilityFields]);
});

test('task DTO normalizes archived and completed only from strict true values', () => {
  assert.equal(toTaskDto(createTaskDoc({ archived: true, completed: true }))?.archived, true);
  assert.equal(toTaskDto(createTaskDoc({ archived: true, completed: true }))?.completed, true);
  assert.equal(toTaskDto(createTaskDoc({ archived: false, completed: false }))?.archived, false);
  assert.equal(toTaskDto(createTaskDoc({ archived: false, completed: false }))?.completed, false);
  assert.equal(toTaskDto(createTaskDoc({ archived: 'true', completed: 'true' }))?.archived, false);
  assert.equal(toTaskDto(createTaskDoc({ archived: 'true', completed: 'true' }))?.completed, false);
  assert.equal(toTaskDto(createTaskDoc({}))?.archived, false);
  assert.equal(toTaskDto(createTaskDoc({}))?.completed, false);
});

test('task DTO keeps valid lifecycle status and rejects invalid status', () => {
  assert.equal(toTaskDto(createTaskDoc({ status: 'completed', completed: false }))?.status, 'completed');
  assert.equal(toTaskDto(createTaskDoc({ status: 'active', completed: true }))?.status, 'active');
  assert.throws(() => toTaskDto(createTaskDoc({ status: 'in_progress' })), /Invalid task lifecycle status/);
  assert.throws(() => toTaskDto(createDoc({})), /Invalid task lifecycle status/);
  assert.equal(toTaskDto(null), null);
  assert.equal(toTaskDto(undefined), undefined);
});

test('project DTO returns only the approved public contract while preserving valid status', () => {
  const createdAt = new Date('2026-04-01T00:00:00.000Z');
  const updatedAt = new Date('2026-04-02T00:00:00.000Z');
  const project = createDoc({
    _id: 'project-1',
    name: 'Backend hardening',
    summary: 'Make current DTO behavior explicit',
    currentFocusTaskId: 'task-1',
    isPinned: true,
    userId: 'user-1',
    __v: 3,
    createdAt,
    updatedAt: updatedAt.toISOString(),
    pinnedAt: new Date('2026-04-03T00:00:00.000Z'),
    legacyId: 'legacy-project-1',
    legacyStatus: 'paused',
    ownerId: 'owner-1',
    source: 'compat',
    archived: 'true',
    status: 'on_hold'
  });

  const dto = toProjectDto(project);

  assert.deepEqual(dto, {
    _id: 'project-1',
    name: 'Backend hardening',
    summary: 'Make current DTO behavior explicit',
    currentFocusTaskId: 'task-1',
    isPinned: true,
    updatedAt: updatedAt.toISOString(),
    archived: false,
    status: 'on_hold'
  });
  assertOnlyKeys(dto, [
    '_id',
    'name',
    'summary',
    'status',
    'archived',
    'isPinned',
    'updatedAt',
    'currentFocusTaskId'
  ]);
  assertAbsent(dto, [...basePrivateFields, ...compatibilityFields]);
});

test('project DTO normalizes archived only from strict true and keeps valid statuses', () => {
  assert.equal(toProjectDto(createProjectDoc({ archived: true }))?.archived, true);
  assert.equal(toProjectDto(createProjectDoc({ archived: false }))?.archived, false);
  assert.equal(toProjectDto(createProjectDoc({ archived: 1 }))?.archived, false);
  assert.equal(toProjectDto(createProjectDoc({}))?.archived, false);

  for (const status of ['pending', 'in_progress', 'completed', 'on_hold']) {
    assert.equal(toProjectDto(createProjectDoc({ status }))?.status, status);
  }

  assert.throws(() => toProjectDto(createProjectDoc({ status: 'active' })), /Invalid project lifecycle status/);
  assert.throws(() => toProjectDto(createProjectDoc({ status: undefined })), /Invalid project lifecycle status/);
  assert.equal(toProjectDto(null), null);
  assert.equal(toProjectDto(undefined), undefined);
});

test('note DTO returns only the approved public contract while normalizing archived', () => {
  const createdAt = new Date('2026-05-01T00:00:00.000Z');
  const updatedAt = new Date('2026-05-02T00:00:00.000Z');
  const note = createDoc({
    _id: 'note-1',
    title: 'DTO notes',
    content: 'Characterize current note DTO spread behavior',
    originId: 'task-1',
    originModule: 'task',
    isPinned: true,
    userId: 'user-1',
    __v: 5,
    createdAt,
    updatedAt: updatedAt.toISOString(),
    pinnedAt: new Date('2026-05-03T00:00:00.000Z'),
    legacyId: 'legacy-note-1',
    legacyStatus: 'draft',
    ownerId: 'owner-1',
    source: 'compat',
    archived: 1
  });

  const dto = toNoteDto(note);

  assert.deepEqual(dto, {
    _id: 'note-1',
    title: 'DTO notes',
    content: 'Characterize current note DTO spread behavior',
    archived: false,
    isPinned: true,
    updatedAt: updatedAt.toISOString(),
  });
  assertOnlyKeys(dto, [
    '_id',
    'title',
    'content',
    'archived',
    'isPinned',
    'updatedAt'
  ]);
  assertAbsent(dto, [...basePrivateFields, 'originId', 'originModule', ...compatibilityFields]);
});

test('note DTO normalizes archived only from strict true values', () => {
  assert.equal(toNoteDto(createNoteDoc({ archived: true }))?.archived, true);
  assert.equal(toNoteDto(createNoteDoc({ archived: false }))?.archived, false);
  assert.equal(toNoteDto(createNoteDoc({ archived: 'true' }))?.archived, false);
  assert.equal(toNoteDto(createNoteDoc({}))?.archived, false);
  assert.equal(toNoteDto(null), null);
  assert.equal(toNoteDto(undefined), undefined);
});
