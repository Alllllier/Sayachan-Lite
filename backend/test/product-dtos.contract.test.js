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

test('task DTO preserves spread-compatible product fields while normalizing lifecycle fields', () => {
  const createdAt = new Date('2026-03-01T00:00:00.000Z');
  const updatedAt = new Date('2026-03-02T00:00:00.000Z');
  const task = createDoc({
    _id: 'task-1',
    title: 'Ship DTO contract tests',
    originId: 'project-1',
    originModule: 'project',
    userId: 'user-1',
    createdAt,
    updatedAt,
    archived: 1,
    completed: 1,
    status: 'done'
  });

  assert.deepEqual(toTaskDto(task), {
    _id: 'task-1',
    title: 'Ship DTO contract tests',
    originId: 'project-1',
    originModule: 'project',
    userId: 'user-1',
    createdAt,
    updatedAt,
    archived: false,
    completed: false,
    status: 'active'
  });
});

test('task DTO normalizes archived and completed only from strict true values', () => {
  assert.equal(toTaskDto(createDoc({ archived: true, completed: true }))?.archived, true);
  assert.equal(toTaskDto(createDoc({ archived: true, completed: true }))?.completed, true);
  assert.equal(toTaskDto(createDoc({ archived: false, completed: false }))?.archived, false);
  assert.equal(toTaskDto(createDoc({ archived: false, completed: false }))?.completed, false);
  assert.equal(toTaskDto(createDoc({ archived: 'true', completed: 'true' }))?.archived, false);
  assert.equal(toTaskDto(createDoc({ archived: 'true', completed: 'true' }))?.completed, false);
  assert.equal(toTaskDto(createDoc({}))?.archived, false);
  assert.equal(toTaskDto(createDoc({}))?.completed, false);
});

test('task DTO status falls back to active unless the current status is completed', () => {
  assert.equal(toTaskDto(createDoc({ status: 'completed', completed: false }))?.status, 'completed');
  assert.equal(toTaskDto(createDoc({ status: 'active', completed: true }))?.status, 'active');
  assert.equal(toTaskDto(createDoc({ status: 'in_progress' }))?.status, 'active');
  assert.equal(toTaskDto(createDoc({}))?.status, 'active');
  assert.equal(toTaskDto(null), null);
  assert.equal(toTaskDto(undefined), undefined);
});

test('project DTO preserves spread-compatible product fields while normalizing archived and status', () => {
  const createdAt = new Date('2026-04-01T00:00:00.000Z');
  const updatedAt = new Date('2026-04-02T00:00:00.000Z');
  const project = createDoc({
    _id: 'project-1',
    name: 'Backend hardening',
    summary: 'Make current DTO behavior explicit',
    currentFocusTaskId: 'task-1',
    userId: 'user-1',
    createdAt,
    updatedAt,
    archived: 'true',
    status: 'paused'
  });

  assert.deepEqual(toProjectDto(project), {
    _id: 'project-1',
    name: 'Backend hardening',
    summary: 'Make current DTO behavior explicit',
    currentFocusTaskId: 'task-1',
    userId: 'user-1',
    createdAt,
    updatedAt,
    archived: false,
    status: 'pending'
  });
});

test('project DTO normalizes archived only from strict true and keeps valid statuses', () => {
  assert.equal(toProjectDto(createDoc({ archived: true }))?.archived, true);
  assert.equal(toProjectDto(createDoc({ archived: false }))?.archived, false);
  assert.equal(toProjectDto(createDoc({ archived: 1 }))?.archived, false);
  assert.equal(toProjectDto(createDoc({}))?.archived, false);

  for (const status of ['pending', 'in_progress', 'completed', 'on_hold']) {
    assert.equal(toProjectDto(createDoc({ status }))?.status, status);
  }

  assert.equal(toProjectDto(createDoc({ status: 'active' }))?.status, 'pending');
  assert.equal(toProjectDto(createDoc({}))?.status, 'pending');
  assert.equal(toProjectDto(null), null);
  assert.equal(toProjectDto(undefined), undefined);
});

test('note DTO preserves spread-compatible product fields while normalizing archived', () => {
  const createdAt = new Date('2026-05-01T00:00:00.000Z');
  const updatedAt = new Date('2026-05-02T00:00:00.000Z');
  const note = createDoc({
    _id: 'note-1',
    title: 'DTO notes',
    content: 'Characterize current note DTO spread behavior',
    originId: 'task-1',
    originModule: 'task',
    userId: 'user-1',
    createdAt,
    updatedAt,
    archived: 1
  });

  assert.deepEqual(toNoteDto(note), {
    _id: 'note-1',
    title: 'DTO notes',
    content: 'Characterize current note DTO spread behavior',
    originId: 'task-1',
    originModule: 'task',
    userId: 'user-1',
    createdAt,
    updatedAt,
    archived: false
  });
});

test('note DTO normalizes archived only from strict true values', () => {
  assert.equal(toNoteDto(createDoc({ archived: true }))?.archived, true);
  assert.equal(toNoteDto(createDoc({ archived: false }))?.archived, false);
  assert.equal(toNoteDto(createDoc({ archived: 'true' }))?.archived, false);
  assert.equal(toNoteDto(createDoc({}))?.archived, false);
  assert.equal(toNoteDto(null), null);
  assert.equal(toNoteDto(undefined), undefined);
});
