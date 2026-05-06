const fs = require('fs');
const path = require('path');

const distRoot = path.resolve(__dirname, '..', 'dist');

fs.rmSync(distRoot, { recursive: true, force: true });
