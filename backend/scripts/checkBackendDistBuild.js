const fs = require('fs');
const path = require('path');

const backendRoot = path.resolve(__dirname, '..');
const distRoot = path.join(backendRoot, 'dist');

function assertFile(relativePath) {
  const filePath = path.join(distRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing dist artifact: ${relativePath}`);
  }
}

assertFile('server.js');
assertFile(path.join('routes', 'index.js'));
assertFile(path.join('routes', 'schemas', 'mutations.js'));
assertFile(path.join('routes', 'notesRoutes.js'));

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

require(path.join(distRoot, 'routes'));
require(path.join(distRoot, 'routes', 'ai'));
require(path.join(distRoot, 'server'));

setImmediate(() => {
  console.log('Backend dist build smoke passed.');
});
