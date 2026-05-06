const path = require('path');
const { pathToFileURL } = require('url');

const backendRoot = path.resolve(__dirname, '..');
const distRoot = path.join(backendRoot, 'dist');

const mongoose = require('mongoose');
mongoose.connect = async () => mongoose;

const Koa = require('koa');
Koa.prototype.listen = function listen(_port, callback) {
  if (typeof callback === 'function') {
    callback();
  }

  return {
    close() {}
  };
};

async function importDist(relativePath) {
  await import(pathToFileURL(path.join(distRoot, relativePath)).href);
}

async function main() {
  await importDist('routes/index.js');
  await importDist('routes/ai.js');
  await importDist('server.js');

  setImmediate(() => {
    console.log('Backend dist runtime smoke passed.');
  });
}

main().catch((error) => {
  console.error('Backend dist runtime smoke failed:', error);
  process.exitCode = 1;
});
