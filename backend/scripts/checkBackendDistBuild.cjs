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

function moduleSpecifiers(specifier) {
  const specifiers = [specifier];
  if ((specifier.startsWith('./') || specifier.startsWith('../')) && !path.extname(specifier)) {
    specifiers.push(`${specifier}.js`);
  }
  return specifiers;
}

function sourceReferencesModule(source, specifier) {
  return moduleSpecifiers(specifier).some(candidate => (
    source.includes(`"${candidate}"`) || source.includes(`'${candidate}'`)
  ));
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
    'backend/package.json must remain "type": "module" after the backend ESM cutover.'
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
    backendScripts['dev:dist'] === 'npm run build:backend && node dist/server.js',
    'backend dev:dist script must preserve the dist-backed local runtime path.'
  );
  assert(
    backendPackage.main === 'dist/server.js',
    'backend package main must point at the compiled dist server entrypoint.'
  );
  assert(
    backendPackage.dependencies?.['@allier/sayachan-ai-core'] === 'file:private_core/sayachan-ai-core',
    'backend must depend on @allier/sayachan-ai-core through the local private_core package boundary.'
  );
  assert(
    backendScripts['smoke:backend-dist'] === 'npm run build:backend && node scripts/smokeBackendDistRuntime.cjs',
    'backend dist smoke script must use the package-type-stable .cjs helper.'
  );
  assert(
    backendScripts['check:backend-dist-runtime'] === 'npm run build:backend && node scripts/checkBackendDistBuild.cjs && node scripts/smokeBackendDistRuntime.cjs',
    'backend dist runtime check must use package-type-stable .cjs helpers.'
  );
  assert(
    backendScripts['check:backend-build'] === 'npm run build:backend && node scripts/checkBackendDistBuild.cjs && node scripts/smokeBackendDistRuntime.cjs',
    'backend dist build check must use package-type-stable .cjs helpers.'
  );
  assert(
    backendScripts['normalize:legacy-archived-tasks'] === 'npm run build:backend && node scripts/normalizeLegacyArchivedTasks.cjs',
    'legacy archived-task normalization must build backend dist before loading compiled models.'
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
    !/\bcheck:backend-build\b|\bbuild:backend\b/.test(rootScripts.check || ''),
    'root npm run check must not include the backend dist dry-run without a human gate.'
  );
  assert(
    rootScripts['lint:backend'] === 'eslint backend/src backend/test backend/scripts',
    'root lint:backend must lint backend TS source plus remaining backend JS test/script surfaces.'
  );
  assert(
    backendTsconfig.compilerOptions?.allowJs !== true,
    'backend tsconfig must not compile source JS after the backend source TS cutover.'
  );
  assert(
    Array.isArray(backendTsconfig.include) && backendTsconfig.include.length === 1 && backendTsconfig.include[0] === 'src/**/*.ts',
    'backend tsconfig include must target backend TS source files only.'
  );
}

function assertPrivateCorePackageBoundary() {
  const bridgeSource = fs.readFileSync(path.join(srcRoot, 'ai', 'bridge.ts'), 'utf8');

  assert(
    bridgeSource.includes('@allier/sayachan-ai-core'),
    'backend AI bridge must import @allier/sayachan-ai-core by package name.'
  );
  assert(
    !bridgeSource.includes('private_core/sayachan-ai-core'),
    'backend AI bridge must not import private_core by relative source path.'
  );
}

function assertAiBridgeDistArtifactFromTypeScriptSource() {
  const bridgeDistSource = fs.readFileSync(path.join(distRoot, 'ai', 'bridge.js'), 'utf8');

  assert(
    bridgeDistSource.includes('@allier/sayachan-ai-core'),
    'dist AI bridge artifact must import @allier/sayachan-ai-core by package name.'
  );
  assert(
    !bridgeDistSource.includes('private_core/sayachan-ai-core'),
    'dist AI bridge artifact must not import private_core by relative source path.'
  );
}

function assertAiRoutesDistArtifactFromTypeScriptSource() {
  const aiRoutesDistSource = fs.readFileSync(path.join(distRoot, 'routes', 'ai.js'), 'utf8');

  assert(
    aiRoutesDistSource.includes('/ai/chat'),
    'dist AI route artifact must preserve the public chat route.'
  );
  assert(
    aiRoutesDistSource.includes('/ai/notes/tasks'),
    'dist AI route artifact must preserve note task generation route.'
  );
  assert(
    aiRoutesDistSource.includes('__test__'),
    'dist AI route artifact must preserve route-local test helpers.'
  );
  assert(
    sourceReferencesModule(aiRoutesDistSource, './schemas/ai'),
    'dist AI route artifact must use the AI request schema boundary.'
  );
  assert(
    sourceReferencesModule(aiRoutesDistSource, '../services/aiService'),
    'dist AI route artifact must use the AI service boundary.'
  );
}

function assertSchemaDistArtifactFromTypeScriptSource() {
  const schemaDistSource = fs.readFileSync(path.join(distRoot, 'routes', 'schemas', 'mutations.js'), 'utf8');

  assert(
    sourceReferencesModule(schemaDistSource, 'zod'),
    'dist schema mutation artifact must be emitted from mutations.ts and import zod directly.'
  );
  assert(
    !schemaDistSource.includes('./__generated__/mutations'),
    'dist schema mutation artifact must not be the source-runtime facade over __generated__.'
  );
}

function assertAuthSchemaDistArtifactFromTypeScriptSource() {
  const authSchemaDistSource = fs.readFileSync(path.join(distRoot, 'routes', 'schemas', 'auth.js'), 'utf8');

  assert(
    authSchemaDistSource.includes('authCredentialsSchema'),
    'dist auth schema artifact must preserve authCredentialsSchema.'
  );
  assert(
    authSchemaDistSource.includes('registerTesterSchema'),
    'dist auth schema artifact must preserve registerTesterSchema.'
  );
  assert(
    sourceReferencesModule(authSchemaDistSource, 'zod'),
    'dist auth schema artifact must import zod directly.'
  );
}

function assertAiSchemaDistArtifactFromTypeScriptSource() {
  const aiSchemaDistSource = fs.readFileSync(path.join(distRoot, 'routes', 'schemas', 'ai.js'), 'utf8');

  assert(
    aiSchemaDistSource.includes('aiResourcePayloadSchema'),
    'dist AI schema artifact must preserve aiResourcePayloadSchema.'
  );
  assert(
    aiSchemaDistSource.includes('aiChatSchema'),
    'dist AI schema artifact must preserve aiChatSchema.'
  );
  assert(
    sourceReferencesModule(aiSchemaDistSource, 'zod'),
    'dist AI schema artifact must import zod directly.'
  );
}

function assertNotesDistArtifactFromTypeScriptSource() {
  const notesDistSource = fs.readFileSync(path.join(distRoot, 'routes', 'notesRoutes.js'), 'utf8');

  assert(
    !notesDistSource.includes('./__generated__/notesRoutes'),
    'dist Notes route artifact must not be the source-runtime facade over __generated__.'
  );
  assert(
    sourceReferencesModule(notesDistSource, './schemas/mutations'),
    'dist Notes route artifact must be emitted from notesRoutes.ts and import the normal schema route path.'
  );
}

function assertProjectsDistArtifactFromTypeScriptSource() {
  const projectsDistSource = fs.readFileSync(path.join(distRoot, 'routes', 'projectsRoutes.js'), 'utf8');

  assert(
    sourceReferencesModule(projectsDistSource, './schemas/mutations'),
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
    sourceReferencesModule(tasksDistSource, './schemas/mutations'),
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

function assertHealthRoutesDistArtifactFromTypeScriptSource() {
  const healthDistSource = fs.readFileSync(path.join(distRoot, 'routes', 'healthRoutes.js'), 'utf8');

  assert(
    healthDistSource.includes('/health'),
    'dist Health route artifact must preserve the /health route.'
  );
  assert(
    healthDistSource.includes('service: "backend"') || healthDistSource.includes("service: 'backend'"),
    'dist Health route artifact must preserve the backend service payload.'
  );
  assert(
    healthDistSource.includes('readyState === 1'),
    'dist Health route artifact must preserve the mongoose connection health check.'
  );
}

function assertRouteIndexDistArtifactFromTypeScriptSource() {
  const routeIndexDistSource = fs.readFileSync(path.join(distRoot, 'routes', 'index.js'), 'utf8');

  for (const routeModule of ['./authRoutes', './healthRoutes', './notesRoutes', './projectsRoutes', './tasksRoutes']) {
    assert(
      sourceReferencesModule(routeIndexDistSource, routeModule),
      `dist route index artifact must register ${routeModule}.`
    );
  }
}

function assertAuthMiddlewareDistArtifactFromTypeScriptSource() {
  const authMiddlewareDistSource = fs.readFileSync(path.join(distRoot, 'middleware', 'auth.js'), 'utf8');

  assert(
    authMiddlewareDistSource.includes('function authMiddleware'),
    'dist auth middleware artifact must preserve authMiddleware.'
  );
  assert(
    authMiddlewareDistSource.includes('/auth/login'),
    'dist auth middleware artifact must preserve public auth route gating.'
  );
  assert(
    authMiddlewareDistSource.includes('Owner access required'),
    'dist auth middleware artifact must preserve owner access errors.'
  );
}

function assertAuthRoutesDistArtifactFromTypeScriptSource() {
  const authRoutesDistSource = fs.readFileSync(path.join(distRoot, 'routes', 'authRoutes.js'), 'utf8');

  assert(
    authRoutesDistSource.includes('/auth/bootstrap-owner'),
    'dist authRoutes artifact must preserve owner bootstrap route.'
  );
  assert(
    authRoutesDistSource.includes('/owner/invites/:id/revoke'),
    'dist authRoutes artifact must preserve owner invite revoke route.'
  );
  assert(
    sourceReferencesModule(authRoutesDistSource, '../middleware/auth'),
    'dist authRoutes artifact must use the compiled auth middleware boundary.'
  );
  assert(
    sourceReferencesModule(authRoutesDistSource, './schemas/auth'),
    'dist authRoutes artifact must use the auth request schema boundary.'
  );
}

function assertDatabaseDistArtifactFromTypeScriptSource() {
  const databaseDistSource = fs.readFileSync(path.join(distRoot, 'database.js'), 'utf8');

  assert(
    databaseDistSource.includes('async function connectDB'),
    'dist database artifact must preserve connectDB.'
  );
  assert(
    databaseDistSource.includes('MongoDB connection failed (service will continue running)'),
    'dist database artifact must preserve non-blocking startup warning behavior.'
  );
}

function assertServerDistArtifactFromTypeScriptSource() {
  const serverDistSource = fs.readFileSync(path.join(distRoot, 'server.js'), 'utf8');

  assert(
    sourceReferencesModule(serverDistSource, './database'),
    'dist server artifact must import the compiled database module.'
  );
  assert(
    serverDistSource.includes('errorBoundary'),
    'dist server artifact must preserve error boundary registration.'
  );
  assert(
    serverDistSource.includes('Health check available at http://localhost:'),
    'dist server artifact must preserve health startup log.'
  );
}

function assertRequestBodyValidationDistArtifactFromTypeScriptSource() {
  const validationDistSource = fs.readFileSync(path.join(distRoot, 'middleware', 'requestBodyValidation.js'), 'utf8');

  assert(
    validationDistSource.includes('assertZodSchema'),
    'dist requestBodyValidation artifact must preserve assertZodSchema.'
  );
  assert(
    !validationDistSource.includes('BadRequestError:'),
    'dist requestBodyValidation artifact must not re-export BadRequestError.'
  );
  assert(
    !validationDistSource.includes('@template'),
    'dist requestBodyValidation artifact must not be emitted from the old JSDoc JS source.'
  );
}

function assertHttpErrorsDistArtifactFromTypeScriptSource() {
  const httpErrorsDistSource = fs.readFileSync(path.join(distRoot, 'errors', 'httpErrors.js'), 'utf8');

  for (const errorName of ['HttpError', 'BadRequestError', 'UnauthorizedError', 'ForbiddenError', 'NotFoundError', 'ConflictError']) {
    assert(
      httpErrorsDistSource.includes(errorName),
      `dist HTTP errors artifact must preserve ${errorName}.`
    );
  }

  assert(
    httpErrorsDistSource.includes('function isHttpError'),
    'dist HTTP errors artifact must preserve isHttpError.'
  );
}

function assertCurrentUserDistArtifactFromTypeScriptSource() {
  const currentUserDistSource = fs.readFileSync(path.join(distRoot, 'middleware', 'currentUser.js'), 'utf8');

  assert(
    currentUserDistSource.includes('function resolveCurrentUserId'),
    'dist currentUser artifact must preserve resolveCurrentUserId.'
  );
  assert(
    currentUserDistSource.includes('Authentication required'),
    'dist currentUser artifact must preserve authentication error payload.'
  );
}

function assertObjectIdDistArtifactFromTypeScriptSource() {
  const objectIdDistSource = fs.readFileSync(path.join(distRoot, 'middleware', 'objectIdParsing.js'), 'utf8');

  assert(
    objectIdDistSource.includes('function toObjectId'),
    'dist objectIdParsing middleware artifact must preserve toObjectId.'
  );
  assert(
    objectIdDistSource.includes('INVALID_OBJECT_ID'),
    'dist objectIdParsing middleware artifact must preserve stable invalid object id error code.'
  );
  assert(
    objectIdDistSource.includes('function parseParamObjectId'),
    'dist objectIdParsing middleware artifact must preserve parseParamObjectId.'
  );
}

function assertErrorBoundaryDistArtifactFromTypeScriptSource() {
  const errorBoundaryDistSource = fs.readFileSync(path.join(distRoot, 'middleware', 'errorBoundary.js'), 'utf8');

  assert(
    errorBoundaryDistSource.includes('function errorBoundary'),
    'dist errorBoundary artifact must preserve errorBoundary.'
  );
  assert(
    errorBoundaryDistSource.includes('Internal server error'),
    'dist errorBoundary artifact must preserve stable 500 payload.'
  );
}

function assertProductResponsesDistArtifactFromTypeScriptSource() {
  const responseDistSource = fs.readFileSync(path.join(distRoot, 'services', 'responses', 'productResponses.js'), 'utf8');

  assert(
    responseDistSource.includes('function toTaskDto'),
    'dist productResponses artifact must preserve toTaskDto.'
  );
  assert(
    responseDistSource.includes('function toProjectDto'),
    'dist productResponses artifact must preserve toProjectDto.'
  );
  assert(
    responseDistSource.includes('function toNoteDto'),
    'dist productResponses artifact must preserve toNoteDto.'
  );
}

function assertAuthDtosDistArtifactFromTypeScriptSource() {
  const authDtosDistSource = fs.readFileSync(path.join(distRoot, 'domain', 'dtos', 'authDtos.js'), 'utf8');

  assert(
    authDtosDistSource.includes('function toPublicUserDto'),
    'dist authDtos artifact must preserve toPublicUserDto.'
  );
  assert(
    authDtosDistSource.includes('function toPublicInviteDto'),
    'dist authDtos artifact must preserve toPublicInviteDto.'
  );
}

function assertTaskCascadeDistArtifactFromTypeScriptSource() {
  const cascadeDistSource = fs.readFileSync(path.join(distRoot, 'domain', 'tasks', 'cascade.js'), 'utf8');

  assert(
    cascadeDistSource.includes('function clearFocusForTask'),
    'dist task cascade artifact must preserve clearFocusForTask.'
  );
}

function assertTaskQueryFiltersDistArtifactFromTypeScriptSource() {
  const queryFiltersDistSource = fs.readFileSync(path.join(distRoot, 'domain', 'tasks', 'queryFilters.js'), 'utf8');

  assert(
    queryFiltersDistSource.includes('function buildArchiveFilter'),
    'dist task query filters artifact must preserve buildArchiveFilter.'
  );
  assert(
    queryFiltersDistSource.includes('function isObjectFilter'),
    'dist task query filters artifact must preserve the typed filter guard.'
  );
}

function assertOwnershipDistArtifactFromTypeScriptSource() {
  const ownershipDistSource = fs.readFileSync(path.join(distRoot, 'domain', 'ownership.js'), 'utf8');

  assert(
    ownershipDistSource.includes('function requireUserId'),
    'dist ownership artifact must preserve requireUserId.'
  );
  assert(
    ownershipDistSource.includes('function ownedFilter'),
    'dist ownership artifact must preserve ownedFilter.'
  );
  assert(
    ownershipDistSource.includes('UnauthorizedError'),
    'dist ownership artifact must preserve authentication error behavior through the HTTP error boundary.'
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
    sourceReferencesModule(tasksServiceDistSource, '../domain/ownership'),
    'dist tasksService artifact must use the domain ownership boundary.'
  );
}

function assertProjectsServiceDistArtifactFromTypeScriptSource() {
  const projectsServiceDistSource = fs.readFileSync(path.join(distRoot, 'services', 'projectsService.js'), 'utf8');

  assert(
    projectsServiceDistSource.includes('function changedOnlyFilter'),
    'dist projectsService artifact must preserve changedOnlyFilter.'
  );
  assert(
    projectsServiceDistSource.includes('deriveProjectLifecycleStatus'),
    'dist projectsService artifact must preserve project lifecycle restoration behavior.'
  );
  assert(
    projectsServiceDistSource.includes('Project Archive Shadow'),
    'dist projectsService artifact must preserve focus clearing log behavior.'
  );
}

function assertNotesServiceDistArtifactFromTypeScriptSource() {
  const notesServiceDistSource = fs.readFileSync(path.join(distRoot, 'services', 'notesService.js'), 'utf8');

  assert(
    notesServiceDistSource.includes('function changedOnlyFilter'),
    'dist notesService artifact must preserve changedOnlyFilter.'
  );
  assert(
    notesServiceDistSource.includes('Note Archive'),
    'dist notesService artifact must preserve archive cascade behavior.'
  );
  assert(
    notesServiceDistSource.includes('originModule: "note"') || notesServiceDistSource.includes("originModule: 'note'"),
    'dist notesService artifact must preserve note-origin cascade scope.'
  );
}

function assertAuthServiceDistArtifactFromTypeScriptSource() {
  const authServiceDistSource = fs.readFileSync(path.join(distRoot, 'services', 'authService.js'), 'utf8');

  assert(
    authServiceDistSource.includes('function hashPassword'),
    'dist authService artifact must preserve password hashing.'
  );
  assert(
    authServiceDistSource.includes('function assignLegacyDataToOwner'),
    'dist authService artifact must preserve owner bootstrap legacy assignment.'
  );
  assert(
    authServiceDistSource.includes('__test__'),
    'dist authService artifact must preserve service-level test helpers.'
  );
}

function assertAiServiceDistArtifactFromTypeScriptSource() {
  const aiServiceDistSource = fs.readFileSync(path.join(distRoot, 'services', 'aiService.js'), 'utf8');

  assert(
    aiServiceDistSource.includes('function generateNoteTaskDrafts'),
    'dist aiService artifact must preserve note task draft generation.'
  );
  assert(
    aiServiceDistSource.includes('function suggestProjectNextActions'),
    'dist aiService artifact must preserve project next-action generation.'
  );
  assert(
    aiServiceDistSource.includes('function chat'),
    'dist aiService artifact must preserve chat orchestration.'
  );
  assert(
    sourceReferencesModule(aiServiceDistSource, '../ai/bridge'),
    'dist aiService artifact must use the public AI bridge boundary.'
  );
}

function assertProductModelDistArtifactsFromTypeScriptSource() {
  const noteModelDistSource = fs.readFileSync(path.join(distRoot, 'models', 'Note.js'), 'utf8');
  const projectModelDistSource = fs.readFileSync(path.join(distRoot, 'models', 'Project.js'), 'utf8');
  const taskModelDistSource = fs.readFileSync(path.join(distRoot, 'models', 'Task.js'), 'utf8');

  assert(
    noteModelDistSource.includes("mongoose.model('Note'") || noteModelDistSource.includes('mongoose.model("Note"'),
    'dist Note model artifact must preserve the Note model name.'
  );
  assert(
    projectModelDistSource.includes("mongoose.model('Project'") || projectModelDistSource.includes('mongoose.model("Project"'),
    'dist Project model artifact must preserve the Project model name.'
  );
  assert(
    taskModelDistSource.includes("mongoose.model('Task'") || taskModelDistSource.includes('mongoose.model("Task"'),
    'dist Task model artifact must preserve the Task model name.'
  );
}

function assertAuthModelDistArtifactsFromTypeScriptSource() {
  const userModelDistSource = fs.readFileSync(path.join(distRoot, 'models', 'User.js'), 'utf8');
  const inviteModelDistSource = fs.readFileSync(path.join(distRoot, 'models', 'Invite.js'), 'utf8');
  const sessionModelDistSource = fs.readFileSync(path.join(distRoot, 'models', 'Session.js'), 'utf8');

  assert(
    userModelDistSource.includes("mongoose.model('User'") || userModelDistSource.includes('mongoose.model("User"'),
    'dist User model artifact must preserve the User model name.'
  );
  assert(
    inviteModelDistSource.includes("mongoose.model('Invite'") || inviteModelDistSource.includes('mongoose.model("Invite"'),
    'dist Invite model artifact must preserve the Invite model name.'
  );
  assert(
    sessionModelDistSource.includes("mongoose.model('Session'") || sessionModelDistSource.includes('mongoose.model("Session"'),
    'dist Session model artifact must preserve the Session model name.'
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

const requiredRuntimeEntrypoints = [
  'database.js',
  'server.js',
  path.join('errors', 'httpErrors.js'),
  path.join('ai', 'bridge.js'),
  path.join('middleware', 'auth.js'),
  path.join('middleware', 'currentUser.js'),
  path.join('middleware', 'errorBoundary.js'),
  path.join('middleware', 'objectIdParsing.js'),
  path.join('middleware', 'requestBodyValidation.js'),
  path.join('domain', 'dtos', 'authDtos.js'),
  path.join('domain', 'ownership.js'),
  path.join('domain', 'tasks', 'cascade.js'),
  path.join('domain', 'tasks', 'queryFilters.js'),
  path.join('models', 'Invite.js'),
  path.join('models', 'Note.js'),
  path.join('models', 'Project.js'),
  path.join('models', 'Session.js'),
  path.join('models', 'Task.js'),
  path.join('models', 'User.js'),
  path.join('services', 'aiService.js'),
  path.join('services', 'authService.js'),
  path.join('services', 'notesService.js'),
  path.join('services', 'projectsService.js'),
  path.join('services', 'responses', 'productResponses.js'),
  path.join('services', 'tasksService.js'),
  path.join('routes', 'index.js'),
  path.join('routes', 'ai.js'),
  path.join('routes', 'authRoutes.js'),
  path.join('routes', 'healthRoutes.js'),
  path.join('routes', 'notesRoutes.js'),
  path.join('routes', 'projectsRoutes.js'),
  path.join('routes', 'tasksRoutes.js'),
  path.join('routes', 'schemas', 'ai.js'),
  path.join('routes', 'schemas', 'auth.js'),
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
assertAuthSchemaDistArtifactFromTypeScriptSource();
assertAiSchemaDistArtifactFromTypeScriptSource();
assertAiBridgeDistArtifactFromTypeScriptSource();
assertAiRoutesDistArtifactFromTypeScriptSource();
assertNotesDistArtifactFromTypeScriptSource();
assertProjectsDistArtifactFromTypeScriptSource();
assertTasksDistArtifactFromTypeScriptSource();
assertHealthRoutesDistArtifactFromTypeScriptSource();
assertRouteIndexDistArtifactFromTypeScriptSource();
assertAuthMiddlewareDistArtifactFromTypeScriptSource();
assertAuthRoutesDistArtifactFromTypeScriptSource();
assertDatabaseDistArtifactFromTypeScriptSource();
assertServerDistArtifactFromTypeScriptSource();
assertHttpErrorsDistArtifactFromTypeScriptSource();
assertObjectIdDistArtifactFromTypeScriptSource();
assertCurrentUserDistArtifactFromTypeScriptSource();
assertErrorBoundaryDistArtifactFromTypeScriptSource();
assertRequestBodyValidationDistArtifactFromTypeScriptSource();
assertAiServiceDistArtifactFromTypeScriptSource();
assertAuthServiceDistArtifactFromTypeScriptSource();
assertAuthModelDistArtifactsFromTypeScriptSource();
assertProductModelDistArtifactsFromTypeScriptSource();
assertNotesServiceDistArtifactFromTypeScriptSource();
assertOwnershipDistArtifactFromTypeScriptSource();
assertProjectsServiceDistArtifactFromTypeScriptSource();
assertTasksServiceDistArtifactFromTypeScriptSource();
assertProductResponsesDistArtifactFromTypeScriptSource();
assertAuthDtosDistArtifactFromTypeScriptSource();
assertTaskCascadeDistArtifactFromTypeScriptSource();
assertTaskQueryFiltersDistArtifactFromTypeScriptSource();

console.log('Backend dist build boundary check passed.');
