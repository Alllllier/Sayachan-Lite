import test from 'node:test';
import assert from 'node:assert/strict';
import mongoose from 'mongoose';

import {
  connectDB,
  resolveMongoUri,
  shouldRequireDatabase
} from '../dist/database.js';

const LOCAL_MONGO_URI = 'mongodb://localhost:27017/sayaDesk';

function withPatchedConnect(connect, run) {
  const originalConnect = mongoose.connect;
  mongoose.connect = connect;

  return Promise.resolve()
    .then(run)
    .finally(() => {
      mongoose.connect = originalConnect;
    });
}

test('database startup policy keeps local development non-blocking by default', () => {
  assert.equal(shouldRequireDatabase({}), false);
  assert.equal(resolveMongoUri({}), LOCAL_MONGO_URI);
});

test('database startup policy requires MONGO_URI in production or explicit required mode', () => {
  assert.equal(shouldRequireDatabase({ NODE_ENV: 'production' }), true);
  assert.equal(shouldRequireDatabase({ REQUIRE_MONGODB: 'true' }), true);
  assert.throws(
    () => resolveMongoUri({ NODE_ENV: 'production' }),
    /MONGO_URI is required/
  );
});

test('connectDB fails startup when required MongoDB cannot connect', async () => {
  const originalEnv = { ...process.env };

  await withPatchedConnect(async () => {
    throw new Error('synthetic connection failure');
  }, async () => {
    try {
      process.env = {
        ...originalEnv,
        MONGO_URI: 'mongodb://example.invalid/sayachan',
        REQUIRE_MONGODB: 'true'
      };

      await assert.rejects(
        () => connectDB(),
        /MongoDB connection failed: synthetic connection failure/
      );
    } finally {
      process.env = originalEnv;
    }
  });
});

test('connectDB allows local startup to continue when MongoDB is optional', async () => {
  const originalEnv = { ...process.env };
  const originalWarn = console.warn;
  const warnings = [];

  await withPatchedConnect(async () => {
    throw new Error('synthetic optional failure');
  }, async () => {
    try {
      process.env = {
        ...originalEnv,
        NODE_ENV: 'development',
        REQUIRE_MONGODB: 'false'
      };
      delete process.env.MONGO_URI;
      console.warn = (...args) => warnings.push(args.join(' '));

      await assert.doesNotReject(() => connectDB());
      assert.ok(warnings.some((warning) => warning.includes('service will continue running')));
    } finally {
      console.warn = originalWarn;
      process.env = originalEnv;
    }
  });
});
