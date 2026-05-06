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
  assert(
    backendScripts.start === 'npm run build:backend && node dist/server.js',
    'backend start script must build and run "node dist/server.js".'
  );
  assert(
    backendScripts.dev === 'npm run build:backend && node dist/server.js',
    'backend dev script must build and run "node dist/server.js".'
  );
  assert(
    backendPackage.dependencies?.['@allier/sayachan-ai-core'] === 'file:private_core/sayachan-ai-core',
    'backend must depend on @allier/sayachan-ai-core through the local private_core package boundary.'
  );

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

function assertPrivateCorePackageBoundary() {
  const bridgeSource = fs.readFileSync(path.join(srcRoot, 'ai', 'bridge.js'), 'utf8');

  assert(
    bridgeSource.includes("require('@allier/sayachan-ai-core')"),
    'backend AI bridge must import @allier/sayachan-ai-core by package name.'
  );
  assert(
    !bridgeSource.includes('private_core/sayachan-ai-core'),
    'backend AI bridge must not import private_core by relative source path.'
  );
}

function assertSchemaDistArtifactFromTypeScriptSource() {
  const schemaDistSource = fs.readFileSync(path.join(distRoot, 'routes', 'schemas', 'mutations.js'), 'utf8');

  assert(
    schemaDistSource.includes('require("zod")'),
    'dist schema mutation artifact must be emitted from mutations.ts and import zod directly.'
  );
  assert(
    !schemaDistSource.includes('./__generated__/mutations'),
    'dist schema mutation artifact must not be the source-runtime facade over __generated__.'
  );
}

function assertNotesDistArtifactFromTypeScriptSource() {
  const notesDistSource = fs.readFileSync(path.join(distRoot, 'routes', 'notesRoutes.js'), 'utf8');

  assert(
    !notesDistSource.includes('./__generated__/notesRoutes'),
    'dist Notes route artifact must not be the source-runtime facade over __generated__.'
  );
  assert(
    notesDistSource.includes("require('./schemas/mutations')") || notesDistSource.includes('require("./schemas/mutations")'),
    'dist Notes route artifact must be emitted from notesRoutes.ts and import the normal schema route path.'
  );
}

function assertProjectsDistArtifactFromTypeScriptSource() {
  const projectsDistSource = fs.readFileSync(path.join(distRoot, 'routes', 'projectsRoutes.js'), 'utf8');

  assert(
    projectsDistSource.includes("require('./schemas/mutations')") || projectsDistSource.includes('require("./schemas/mutations")'),
    'dist Projects route artifact must be emitted from projectsRoutes.ts and import the normal schema route path.'
  );
  assert(
    !projectsDistSource.includes('@ts-ignore dto-pilot'),
    'dist Projects route artifact must not be emitted from the old JS dto-pilot source.'
  );
}

function assertTasksDistArtifactFromTypeScriptSource() {
  const tasksDistSource = fs.readFileSync(path.join(distRoot, 'routes', 'tasksRoutes.js'), 'utf8');

  assert(
    tasksDistSource.includes("require('./schemas/mutations')") || tasksDistSource.includes('require("./schemas/mutations")'),
    'dist Tasks route artifact must be emitted from tasksRoutes.ts and import the normal schema route path.'
  );
  assert(
    !tasksDistSource.includes('__test__'),
    'dist Tasks route artifact must not expose route __test__ helpers.'
  );
  assert(
    !tasksDistSource.includes('@ts-ignore dto-pilot'),
    'dist Tasks route artifact must not be emitted from the old JS dto-pilot source.'
  );
}

function assertRequestBodyValidationDistArtifactFromTypeScriptSource() {
  const validationDistSource = fs.readFileSync(path.join(distRoot, 'middleware', 'requestBodyValidation.js'), 'utf8');

  assert(
    validationDistSource.includes('class BadRequestError'),
    'dist requestBodyValidation artifact must preserve BadRequestError.'
  );
  assert(
    validationDistSource.includes('function assertZodSchema'),
    'dist requestBodyValidation artifact must preserve assertZodSchema.'
  );
  assert(
    !validationDistSource.includes('@template'),
    'dist requestBodyValidation artifact must not be emitted from the old JSDoc JS source.'
  );
}

function assertTaskRuntimeHelpersDistArtifactFromTypeScriptSource() {
  const helpersDistSource = fs.readFileSync(path.join(distRoot, 'services', 'taskRuntimeHelpers.js'), 'utf8');

  assert(
    helpersDistSource.includes('function normalizeTask'),
    'dist taskRuntimeHelpers artifact must preserve normalizeTask.'
  );
  assert(
    helpersDistSource.includes('function clearFocusForTask'),
    'dist taskRuntimeHelpers artifact must preserve clearFocusForTask.'
  );
  assert(
    helpersDistSource.includes('function isObjectFilter'),
    'dist taskRuntimeHelpers artifact must be emitted from taskRuntimeHelpers.ts with the typed filter guard.'
  );
}

function assertOwnershipDistArtifactFromTypeScriptSource() {
  const ownershipDistSource = fs.readFileSync(path.join(distRoot, 'services', 'ownership.js'), 'utf8');

  assert(
    ownershipDistSource.includes('function requireUserId'),
    'dist ownership artifact must preserve requireUserId.'
  );
  assert(
    ownershipDistSource.includes('function ownedFilter'),
    'dist ownership artifact must preserve ownedFilter.'
  );
  assert(
    ownershipDistSource.includes('Authentication required'),
    'dist ownership artifact must preserve authentication error behavior.'
  );
}

function assertTasksServiceDistArtifactFromTypeScriptSource() {
  const tasksServiceDistSource = fs.readFileSync(path.join(distRoot, 'services', 'tasksService.js'), 'utf8');

  assert(
    tasksServiceDistSource.includes('function buildTaskUpdate'),
    'dist tasksService artifact must preserve buildTaskUpdate.'
  );
  assert(
    tasksServiceDistSource.includes('clearFocusForTask'),
    'dist tasksService artifact must preserve focus clearing behavior.'
  );
  assert(
    tasksServiceDistSource.includes('require("./ownership")') || tasksServiceDistSource.includes("require('./ownership')"),
    'dist tasksService artifact must keep the local ownership service boundary.'
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
  path.join('middleware', 'requestBodyValidation.js'),
  path.join('services', 'ownership.js'),
  path.join('services', 'tasksService.js'),
  path.join('services', 'taskRuntimeHelpers.js'),
  path.join('routes', 'index.js'),
  path.join('routes', 'ai.js'),
  path.join('routes', 'notesRoutes.js'),
  path.join('routes', 'projectsRoutes.js'),
  path.join('routes', 'tasksRoutes.js'),
  path.join('routes', 'schemas', 'mutations.js')
];

assertPackageRuntimeBoundary();
assertPrivateCorePackageBoundary();
assertCurrentSourceArtifactsWereEmitted();

for (const artifact of requiredRuntimeEntrypoints) {
  assertFile(artifact);
}

assertNotExists(path.join('dist', 'private_core'));
assertNotExists(path.join('dist', 'routes', '__generated__', 'notesRoutes.js'));
assertNotExists(path.join('dist', 'routes', '__generated__', 'notesRoutes.d.ts'));
assertNotExists(path.join('dist', 'routes', 'schemas', '__generated__', 'mutations.js'));
assertNotExists(path.join('dist', 'routes', 'schemas', '__generated__', 'mutations.d.ts'));
assertNoPathSegment(distRoot, 'private_core');
assertNoPathSegment(distRoot, '__route_sources__');
assertSchemaDistArtifactFromTypeScriptSource();
assertNotesDistArtifactFromTypeScriptSource();
assertProjectsDistArtifactFromTypeScriptSource();
assertTasksDistArtifactFromTypeScriptSource();
assertRequestBodyValidationDistArtifactFromTypeScriptSource();
assertOwnershipDistArtifactFromTypeScriptSource();
assertTasksServiceDistArtifactFromTypeScriptSource();
assertTaskRuntimeHelpersDistArtifactFromTypeScriptSource();

console.log('Backend dist build boundary check passed.');
