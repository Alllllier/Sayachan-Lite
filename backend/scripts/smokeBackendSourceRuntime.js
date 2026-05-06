const path = require('path');

const backendRoot = path.resolve(__dirname, '..');
const srcRoot = path.join(backendRoot, 'src');

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

require(path.join(srcRoot, 'routes'));
require(path.join(srcRoot, 'routes', 'ai'));
require(path.join(srcRoot, 'server'));

setImmediate(() => {
  console.log('Backend source runtime smoke passed.');
});
