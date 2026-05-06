const dotenv = require('dotenv');
dotenv.config();

const path = require('path');
const { pathToFileURL } = require('url');
const mongoose = require('mongoose');

async function importDistDefault(relativePath) {
  const moduleNamespace = await import(pathToFileURL(path.resolve(__dirname, '..', 'dist', relativePath)).href);
  return moduleNamespace.default || moduleNamespace;
}

async function main() {
  const mongoUri = process.env.MONGO_URI || 'mongodb://localhost:27017/personal-os-lite';
  const Task = await importDistDefault('models/Task.js');

  await mongoose.connect(mongoUri);

  try {
    const result = await Task.updateMany(
      { status: 'archived' },
      {
        $set: {
          archived: false,
          status: 'active',
          completed: false
        }
      }
    );

    console.log(`[Legacy Task Cleanup] matched=${result.matchedCount || 0} modified=${result.modifiedCount || 0}`);
    console.log('[Legacy Task Cleanup] normalized status=\'archived\' rows to archived=false, status=active, completed=false');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error('[Legacy Task Cleanup] failed:', error);
  process.exitCode = 1;
});
