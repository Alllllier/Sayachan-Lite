const fs = require('fs');
const path = require('path');

const backendRoot = path.resolve(__dirname, '..');
const repoRoot = path.resolve(backendRoot, '..');
const srcRoot = path.join(backendRoot, 'src');
const distRoot = path.join(backendRoot, 'dist');

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'));
}

function toPortablePath(filePath) {
  return filePath.split(path.sep).join('/');
}

function walkFiles(root) {
  if (!fs.existsSync(root)) {
    return [];
  }

  const files = [];
  const entries = fs.readdirSync(root, { withFileTypes: true });

  for (const entry of entries) {
    const entryPath = path.join(root, entry.name);

    if (entry.isDirectory()) {
      files.push(...walkFiles(entryPath));
      continue;
    }

    if (entry.isFile()) {
      files.push(entryPath);
    }
  }

  return files;
}

function assertFile(relativePath) {
  const filePath = path.join(distRoot, relativePath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing dist artifact: ${relativePath}`);
  }
}

function assertNotExists(relativePath) {
  const filePath = path.join(backendRoot, relativePath);
  if (fs.existsSync(filePath)) {
    throw new Error(`Unexpected backend build artifact: ${relativePath}`);
  }
}

function assertNoPathSegment(root, segment) {
  const matches = walkFiles(root)
    .map(filePath => path.relative(root, filePath))
    .filter(relativePath => relativePath.split(path.sep).includes(segment))
    .map(toPortablePath);

  assert(matches.length === 0, `Unexpected ${segment} artifact(s) under dist: ${matches.join(', ')}`);
}

function assertPackageRuntimeBoundary() {
  const backendPackage = readJson(path.join(backendRoot, 'package.json'));
  const rootPackage = readJson(path.join(repoRoot, 'package.json'));
  const backendScripts = backendPackage.scripts || {};
  const rootScripts = rootPackage.scripts || {};
  const backendDependencies = {
    ...backendPackage.dependencies,
    ...backendPackage.devDependencies
  };
  const runtimeLoaderPackageNames = [
    'tsx',
    'ts-node',
    'ts-node-dev',
    '@swc-node/register',
    'esbuild-register',
    '@babel/register'
  ];
  const runtimeLoaderScriptPattern = /\b(?:tsx|ts-node|ts-node-dev|babel-node|esbuild-register)\b|@swc-node\/register|@babel\/register|--loader\b/;

  assert(backendPackage.type === 'commonjs', 'backend/package.json must remain "type": "commonjs".');
  assert(backendScripts.start === 'node src/server.js', 'backend start script must remain "node src/server.js".');
  assert(backendScripts.dev === 'node src/server.js', 'backend dev script must remain "node src/server.js".');

  for (const [scriptName, scriptCommand] of Object.entries(backendScripts)) {
    assert(
      !runtimeLoaderScriptPattern.test(scriptCommand),
      `backend script "${scriptName}" must not introduce a runtime TS loader: ${scriptCommand}`
    );
  }

  for (const packageName of runtimeLoaderPackageNames) {
    assert(
      !Object.prototype.hasOwnProperty.call(backendDependencies, packageName),
      `backend package must not introduce runtime TS loader dependency: ${packageName}`
    );
  }

  assert(
    !/\bcheck:backend-build\b|\bbuild:backend\b/.test(rootScripts.check || ''),
    'root npm run check must not include the backend dist dry-run without a human gate.'
  );
}

function assertCurrentSourceArtifactsWereEmitted() {
  const sourceFiles = walkFiles(srcRoot)
    .filter(filePath => path.extname(filePath) === '.js')
    .map(filePath => path.relative(srcRoot, filePath));

  assert(sourceFiles.length > 0, 'No backend source JS files were found to verify.');

  for (const sourceFile of sourceFiles) {
    assertFile(sourceFile);
  }
}

const requiredRuntimeEntrypoints = [
  'server.js',
  path.join('routes', 'index.js'),
  path.join('routes', 'ai.js'),
  path.join('routes', 'notesRoutes.js'),
  path.join('routes', '__generated__', 'notesRoutes.js'),
  path.join('routes', 'schemas', 'mutations.js'),
  path.join('routes', 'schemas', '__generated__', 'mutations.js')
];

assertPackageRuntimeBoundary();
assertCurrentSourceArtifactsWereEmitted();

for (const artifact of requiredRuntimeEntrypoints) {
  assertFile(artifact);
}

assertNotExists(path.join('dist', 'private_core'));
assertNoPathSegment(distRoot, 'private_core');
assertNoPathSegment(distRoot, '__route_sources__');

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
