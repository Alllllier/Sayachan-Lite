const { spawnSync } = require('child_process');
const fs = require('fs');
const os = require('os');
const path = require('path');

const backendRoot = path.resolve(__dirname, '..');
const generatedDir = path.join(backendRoot, 'src', 'routes', 'schemas', '__generated__');
const expectedFiles = ['mutations.js', 'mutations.d.ts'];
const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'sayachan-schema-island-'));

function relativeToBackend(filePath) {
  return path.relative(backendRoot, filePath).split(path.sep).join('/');
}

function cleanupTempDir() {
  fs.rmSync(tempDir, { recursive: true, force: true });
}

try {
  const result = spawnSync(
    process.execPath,
    [require.resolve('typescript/bin/tsc'), '-p', 'tsconfig.schema-island.json', '--outDir', tempDir],
    {
      cwd: backendRoot,
      encoding: 'utf8'
    }
  );

  if (result.status !== 0) {
    if (result.stdout) {
      process.stdout.write(result.stdout);
    }
    if (result.stderr) {
      process.stderr.write(result.stderr);
    }
    process.exit(result.status || 1);
  }

  const staleFiles = expectedFiles.filter((fileName) => {
    const generatedFile = path.join(generatedDir, fileName);
    const freshFile = path.join(tempDir, fileName);

    return fs.readFileSync(generatedFile, 'utf8') !== fs.readFileSync(freshFile, 'utf8');
  });

  if (staleFiles.length > 0) {
    console.error('Schema-island generated artifacts are stale.');
    console.error('Run: npm --prefix backend run build:schema-island');
    console.error('Out-of-sync files:');
    for (const fileName of staleFiles) {
      console.error(`- ${relativeToBackend(path.join(generatedDir, fileName))}`);
    }
    process.exit(1);
  }

  console.log('Schema-island generated artifacts are in sync.');
} finally {
  cleanupTempDir();
}
