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
  const rootPackage = readJson(path.join(repoRoot, 'package.json'));
  const backendTsconfig = readJson(path.join(backendRoot, 'tsconfig.json'));
  const backendScripts = backendPackage.scripts || {};
  const rootScripts = rootPackage.scripts || {};
  const backendDependencies = backendPackage.dependencies || {};
  const backendDevDependencies = backendPackage.devDependencies || {};
  const runtimeLoaderPackageNames = [
    'ts-node',
    'ts-node-dev',
    '@swc-node/register',
    'esbuild-register',
    '@babel/register'
  ];
  const runtimeLoaderScriptPattern = /\b(?:tsx|ts-node|ts-node-dev|babel-node|esbuild-register)\b|@swc-node\/register|@babel\/register|--loader\b/;

  assert(
    backendPackage.type === 'module',
    'backend/package.json must remain "type": "module".'
  );
  assert(
    backendPackage.main === 'dist/server.js',
    'backend package main must point at the compiled dist server entrypoint.'
  );
  assert(
    backendScripts['build:backend'] === 'node scripts/cleanBackendDist.cjs && tsc -p tsconfig.json',
    'backend build script must clean dist through the package-type-stable .cjs helper before tsc.'
  );
  assert(
    backendScripts.start === 'npm run build:backend && node dist/server.js',
    'backend start script must build and run "node dist/server.js".'
  );
  assert(
    backendScripts.dev === 'tsx watch src/server.ts',
    'backend dev script may use tsx watch for source-mode local development.'
  );
  assert(
    !Object.prototype.hasOwnProperty.call(backendScripts, 'dev:dist'),
    'backend dev:dist alias has been retired; use start for the dist-backed runtime path.'
  );
  assert(
    !Object.prototype.hasOwnProperty.call(backendScripts, 'smoke:backend-dist'),
    'backend smoke:backend-dist alias has been retired; use check:backend-dist-runtime.'
  );
  assert(
    backendScripts['check:backend-dist-runtime'] === 'npm run build:backend && node scripts/checkBackendDistBuild.cjs && node scripts/smokeBackendDistRuntime.cjs',
    'backend dist runtime check must run build, dist boundary guard, and dist smoke.'
  );
  assert(
    !Object.prototype.hasOwnProperty.call(backendScripts, 'check:backend-build'),
    'backend check:backend-build alias has been retired; use check:backend-dist-runtime.'
  );
  for (const [scriptName, scriptCommand] of Object.entries(backendScripts)) {
    if (scriptName === 'dev') {
      continue;
    }
    assert(
      !runtimeLoaderScriptPattern.test(scriptCommand),
      `backend script "${scriptName}" must not introduce a runtime TS loader: ${scriptCommand}`
    );
  }

  for (const packageName of runtimeLoaderPackageNames) {
    assert(
      !Object.prototype.hasOwnProperty.call({ ...backendDependencies, ...backendDevDependencies }, packageName),
      `backend package must not introduce runtime TS loader dependency: ${packageName}`
    );
  }
  assert(
    !Object.prototype.hasOwnProperty.call(backendDependencies, 'tsx') &&
      Object.prototype.hasOwnProperty.call(backendDevDependencies, 'tsx'),
    'tsx must remain a backend devDependency used only by the dev script.'
  );
  assert(
    backendDependencies['@allier/sayachan-ai-core'] === 'file:private_core/sayachan-ai-core',
    'backend must depend on @allier/sayachan-ai-core through the local private_core package boundary.'
  );

  assert(
    !/\bbuild:backend\b/.test(rootScripts.check || ''),
    'root npm run check must use the backend dist runtime gate instead of calling build:backend directly.'
  );
  assert(
    rootScripts['lint:backend'] === 'eslint backend/src backend/test backend/scripts',
    'root lint:backend must lint backend TS source plus remaining backend JS test/script surfaces.'
  );
  assert(
    backendTsconfig.compilerOptions?.module === 'NodeNext' &&
      backendTsconfig.compilerOptions?.moduleResolution === 'NodeNext',
    'backend tsconfig must emit and resolve as NodeNext.'
  );
  assert(
    backendTsconfig.compilerOptions?.rootDir === 'src' &&
      backendTsconfig.compilerOptions?.outDir === 'dist',
    'backend tsconfig must compile src into dist.'
  );
  assert(
    backendTsconfig.compilerOptions?.allowJs !== true,
    'backend tsconfig must not compile source JS after the backend source TS cutover.'
  );
  assert(
    Array.isArray(backendTsconfig.include) &&
      backendTsconfig.include.length === 1 &&
      backendTsconfig.include[0] === 'src/**/*.ts',
    'backend tsconfig include must target backend TS source files only.'
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
