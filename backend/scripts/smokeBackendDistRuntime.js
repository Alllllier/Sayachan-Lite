const path = require('path');

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

require(path.join(distRoot, 'routes'));
require(path.join(distRoot, 'routes', 'ai'));
require(path.join(distRoot, 'server'));

setImmediate(() => {
  console.log('Backend dist runtime smoke passed.');
});
