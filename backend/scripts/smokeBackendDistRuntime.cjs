const path = require('path');
const { pathToFileURL } = require('url');

const backendRoot = path.resolve(__dirname, '..');
const distRoot = path.join(backendRoot, 'dist');

async function importDist(relativePath) {
  return import(pathToFileURL(path.join(distRoot, relativePath)).href);
}

async function main() {
  await importDist('routes/index.js');
  const { createApp } = await importDist('server.js');

  createApp({
    corsOrigins: ['http://localhost:5173'],
    trustProxy: false
  });

  setImmediate(() => {
    console.log('Backend dist runtime smoke passed.');
  });
}

main().catch((error) => {
  console.error('Backend dist runtime smoke failed:', error);
  process.exitCode = 1;
});
