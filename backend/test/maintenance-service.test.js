import test from 'node:test';
import assert from 'node:assert/strict';

import Note from '../dist/models/Note.js';
import Project from '../dist/models/Project.js';
import maintenanceService from '../dist/services/maintenanceService.js';

function withPatchedMethods(patches, run) {
  const originals = patches.map(({ target, key }) => ({ target, key, value: target[key] }));

  for (const { target, key, value } of patches) {
    target[key] = value;
  }

  return Promise.resolve()
    .then(run)
    .finally(() => {
      for (const original of originals) {
        original.target[original.key] = original.value;
      }
    });
}

test('legacy product status cleanup clears note status and resets project status', async () => {
  const calls = [];

  await withPatchedMethods([
    {
      target: Note.collection,
      key: 'updateMany',
      value: async (filter, update) => {
        calls.push({ model: 'Note', filter, update });
        return { matchedCount: 3, modifiedCount: 2 };
      }
    },
    {
      target: Project.collection,
      key: 'updateMany',
      value: async (filter, update) => {
        calls.push({ model: 'Project', filter, update });
        return { matchedCount: 4, modifiedCount: 4 };
      }
    }
  ], async () => {
    const result = await maintenanceService.cleanLegacyProductStatus();

    assert.deepEqual(calls, [
      {
        model: 'Note',
        filter: { status: 'archived' },
        update: { $unset: { status: '' } }
      },
      {
        model: 'Project',
        filter: { status: 'archived' },
        update: { $set: { status: 'pending' } }
      }
    ]);
    assert.deepEqual(result, {
      packetType: 'legacy_product_status_cleanup',
      version: 1,
      notes: { matchedCount: 3, modifiedCount: 2 },
      projects: { matchedCount: 4, modifiedCount: 4 }
    });
  });
});
