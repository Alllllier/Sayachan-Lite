const fs = require('fs');
const path = require('path');

const backendRoot = path.resolve(__dirname, '..');
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
    throw new Error(`Missing dist artifact: ${toPortablePath(relativePath)}`);
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
  const backendDependencies = backendPackage.dependencies || {};

  assert(
    backendPackage.type === 'module',
    'backend/package.json must remain "type": "module".'
  );
  assert(
    backendPackage.main === 'dist/server.js',
    'backend package main must point at the compiled dist server entrypoint.'
  );
  assert(
    backendDependencies['@allier/sayachan-ai-core'] === 'file:private_core/sayachan-ai-core',
    'backend must depend on @allier/sayachan-ai-core through the local private_core package boundary.'
  );
}

function assertCurrentSourceArtifactsWereEmitted() {
  const sourceFiles = walkFiles(srcRoot)
    .filter(filePath => filePath.endsWith('.ts') && !filePath.endsWith('.d.ts'))
    .map(filePath => path.relative(srcRoot, filePath).replace(/\.ts$/, '.js'));

  for (const sourceFile of sourceFiles) {
    assertFile(sourceFile);
  }
}

function assertPrivateCorePackageBoundary() {
  const bridgeSource = fs.readFileSync(path.join(srcRoot, 'privateCore', 'bridge.ts'), 'utf8');
  const bridgeDistSource = fs.readFileSync(path.join(distRoot, 'privateCore', 'bridge.js'), 'utf8');

  for (const [label, source] of [
    ['backend private core bridge source', bridgeSource],
    ['dist private core bridge artifact', bridgeDistSource]
  ]) {
    assert(
      source.includes('@allier/sayachan-ai-core'),
      `${label} must import @allier/sayachan-ai-core by package name.`
    );
    assert(
      !source.includes('private_core/sayachan-ai-core'),
      `${label} must not import private_core by relative source path.`
    );
  }

  assertNoPathSegment(distRoot, 'private_core');
}

assertPackageRuntimeBoundary();
assertCurrentSourceArtifactsWereEmitted();
assertPrivateCorePackageBoundary();

console.log('Backend dist build boundary check passed.');
