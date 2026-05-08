#!/usr/bin/env node

import 'dotenv/config';
import mongoose from 'mongoose';

const LOCAL_MONGO_URI = 'mongodb://localhost:27017/personal-os-lite';

function usage() {
  return `Repair legacy project task originId values

Usage:
  npm run repair:project-task-origin-ids
  npm run repair:project-task-origin-ids -- --apply

Options:
  --apply  Write fixes to MongoDB. Omit for dry-run mode.
  --help   Show this help.

Scope:
  Converts tasks with originModule="project" and string originId into ObjectId originId.
  Skips tasks when the target project does not exist or belongs to a different user.
`;
}

function parseArgs(argv) {
  const args = { apply: false, help: false };

  for (const token of argv) {
    if (token === '--apply') {
      args.apply = true;
      continue;
    }
    if (token === '--help' || token === '-h') {
      args.help = true;
      continue;
    }
    throw new Error(`Unexpected argument: ${token}`);
  }

  return args;
}

function resolveMongoUri() {
  if (process.env.MONGO_URI) {
    return process.env.MONGO_URI;
  }

  if (process.env.NODE_ENV === 'production' || process.env.REQUIRE_MONGODB === 'true') {
    throw new Error('MONGO_URI is required when MongoDB is required.');
  }

  return LOCAL_MONGO_URI;
}

function isCanonicalObjectIdString(value) {
  return typeof value === 'string'
    && mongoose.Types.ObjectId.isValid(value)
    && new mongoose.Types.ObjectId(value).toHexString() === value.toLowerCase();
}

function idToString(value) {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  if (typeof value.toHexString === 'function') {
    return value.toHexString();
  }
  return String(value);
}

function sameUser(task, project) {
  const taskUserId = idToString(task.userId);
  const projectUserId = idToString(project.userId);

  return !taskUserId || !projectUserId || taskUserId === projectUserId;
}

function groupByProject(tasks, projectsById) {
  const rows = new Map();

  for (const task of tasks) {
    const projectId = task.originId;
    const project = projectsById.get(projectId);
    const name = project?.name || '(missing project)';
    const key = `${projectId}\t${name}`;
    const current = rows.get(key) || {
      projectId,
      name,
      count: 0
    };
    current.count += 1;
    rows.set(key, current);
  }

  return [...rows.values()].sort((a, b) => b.count - a.count || a.name.localeCompare(b.name));
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  if (args.help) {
    console.log(usage());
    return;
  }

  const mongoUri = resolveMongoUri();
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 10000 });

  try {
    const db = mongoose.connection.db;
    const tasks = db.collection('tasks');
    const projects = db.collection('projects');

    const candidates = await tasks.find({
      originModule: 'project',
      originId: { $type: 'string' }
    }, {
      projection: {
        title: 1,
        originId: 1,
        linkedProjectId: 1,
        userId: 1,
        archived: 1,
        status: 1
      },
      sort: { updatedAt: -1 }
    }).toArray();

    const validIdCandidates = candidates.filter(task => isCanonicalObjectIdString(task.originId));
    const invalidIdCandidates = candidates.filter(task => !isCanonicalObjectIdString(task.originId));
    const projectIds = [...new Set(validIdCandidates.map(task => task.originId))];
    const projectObjectIds = projectIds.map(id => new mongoose.Types.ObjectId(id));
    const existingProjects = projectObjectIds.length > 0
      ? await projects.find({ _id: { $in: projectObjectIds } }, { projection: { name: 1, userId: 1 } }).toArray()
      : [];
    const projectsById = new Map(existingProjects.map(project => [project._id.toHexString(), project]));

    const eligible = [];
    const missingProject = [];
    const userMismatch = [];

    for (const task of validIdCandidates) {
      const project = projectsById.get(task.originId);
      if (!project) {
        missingProject.push(task);
        continue;
      }
      if (!sameUser(task, project)) {
        userMismatch.push(task);
        continue;
      }
      eligible.push(task);
    }

    console.log('');
    console.log('Project task originId repair');
    console.log(args.apply ? 'Mode: apply' : 'Mode: dry-run');
    console.log('');
    console.log(`String project originId candidates: ${candidates.length}`);
    console.log(`Eligible to repair: ${eligible.length}`);
    console.log(`Skipped invalid originId strings: ${invalidIdCandidates.length}`);
    console.log(`Skipped missing projects: ${missingProject.length}`);
    console.log(`Skipped user mismatches: ${userMismatch.length}`);

    const grouped = groupByProject(eligible, projectsById);
    if (grouped.length > 0) {
      console.log('');
      console.log('Eligible tasks by project:');
      for (const row of grouped) {
        console.log(`- ${row.name} (${row.projectId}): ${row.count}`);
      }
    }

    if (missingProject.length > 0) {
      console.log('');
      console.log('Missing project examples:');
      for (const task of missingProject.slice(0, 10)) {
        console.log(`- ${task._id.toHexString()} originId=${task.originId} title=${task.title || '(untitled)'}`);
      }
    }

    if (!args.apply) {
      console.log('');
      console.log('Dry-run only. Re-run with -- --apply to write these fixes.');
      return;
    }

    if (eligible.length === 0) {
      console.log('');
      console.log('No eligible tasks to repair.');
      return;
    }

    const operations = eligible.map(task => ({
      updateOne: {
        filter: {
          _id: task._id,
          originModule: 'project',
          originId: task.originId
        },
        update: {
          $set: {
            originId: new mongoose.Types.ObjectId(task.originId)
          }
        }
      }
    }));

    const result = await tasks.bulkWrite(operations, { ordered: false });

    console.log('');
    console.log(`Matched: ${result.matchedCount}`);
    console.log(`Modified: ${result.modifiedCount}`);
    console.log('Repair complete.');
  } finally {
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error('');
  console.error(`Project task originId repair failed: ${error.message}`);
  console.error('');
  process.exitCode = 1;
});
