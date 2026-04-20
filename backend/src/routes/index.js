const Router = require('@koa/router');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const Project = require('../models/Project');
const Task = require('../models/Task');

const router = new Router();

function buildArchiveFilter(archived) {
  if (archived === 'true') {
    return {
      $or: [
        { archived: true },
        { status: 'archived' }
      ]
    };
  }

  return {
    $and: [
      { archived: { $ne: true } },
      { status: { $ne: 'archived' } }
    ]
  };
}

function combineFilters(...filters) {
  const clauses = filters.filter((filter) => filter && Object.keys(filter).length > 0);

  if (clauses.length === 0) {
    return {};
  }

  if (clauses.length === 1) {
    return clauses[0];
  }

  return {
    $and: clauses
  };
}

function projectTaskRelationFilter(projectId) {
  return {
    originModule: 'project',
    originId: projectId
  };
}

function legacyLinkedProjectFilter(projectId) {
  return {
    linkedProjectId: projectId
  };
}

function projectTaskReadFilter(projectId) {
  return {
    $or: [
      projectTaskRelationFilter(projectId),
      legacyLinkedProjectFilter(projectId)
    ]
  };
}

function projectTaskCascadeFilter(projectId) {
  return {
    $or: [
      projectTaskRelationFilter(projectId),
      legacyLinkedProjectFilter(projectId),
      { originId: projectId }
    ]
  };
}

function isArchivedEntity(entity) {
  return entity?.archived === true || entity?.status === 'archived';
}

function isProjectOwnedTask(task) {
  return task?.originModule === 'project' && task?.originId;
}

async function clearFocusForTask(taskId, reason) {
  if (!taskId) {
    return false;
  }

  const project = await Project.findOne({ currentFocusTaskId: taskId });

  if (!project) {
    return false;
  }

  await Project.findByIdAndUpdate(project._id, {
    currentFocusTaskId: null
  });

  if (reason) {
    console.log(`[Focus Transition] Project "${project.name}" currentFocusTaskId cleared on ${reason}`);
  }

  return true;
}

function deriveTaskLifecycleStatus(task) {
  if (task?.status && task.status !== 'archived') {
    return task.status;
  }

  return task?.completed ? 'completed' : 'active';
}

function isRestoreIntent(body = {}) {
  return body.archived === false || body.status === 'active' || body.completed === false;
}

function deriveProjectLifecycleStatus(project) {
  if (project?.status && project.status !== 'archived') {
    return project.status;
  }

  return 'pending';
}

function deriveNoteLifecycleStatus(note) {
  if (note?.status && note.status !== 'archived') {
    return note.status;
  }

  return 'active';
}

function normalizeTask(task) {
  if (!task) {
    return task;
  }

  const normalized = task.toObject ? task.toObject() : { ...task };
  const status = deriveTaskLifecycleStatus(normalized);

  return {
    ...normalized,
    status,
    archived: isArchivedEntity(normalized),
    completed: normalized.completed === undefined ? status === 'completed' : normalized.completed
  };
}

function normalizeProject(project) {
  if (!project) {
    return project;
  }

  const normalized = project.toObject ? project.toObject() : { ...project };

  return {
    ...normalized,
    status: deriveProjectLifecycleStatus(normalized),
    archived: isArchivedEntity(normalized)
  };
}

function normalizeNote(note) {
  if (!note) {
    return note;
  }

  const normalized = note.toObject ? note.toObject() : { ...note };

  return {
    ...normalized,
    status: deriveNoteLifecycleStatus(normalized),
    archived: isArchivedEntity(normalized)
  };
}

async function archiveTasks(taskFilter) {
  const tasks = await Task.find(combineFilters(taskFilter, buildArchiveFilter('false')));

  if (tasks.length === 0) {
    return 0;
  }

  const result = await Task.bulkWrite(
    tasks.map((task) => ({
      updateOne: {
        filter: { _id: task._id },
        update: {
          archived: true,
          status: deriveTaskLifecycleStatus(task),
          completed: task.completed === true || deriveTaskLifecycleStatus(task) === 'completed'
        }
      }
    }))
  );

  return result.modifiedCount || 0;
}

async function restoreTasks(taskFilter) {
  const tasks = await Task.find(combineFilters(taskFilter, buildArchiveFilter('true')));

  if (tasks.length === 0) {
    return 0;
  }

  const result = await Task.bulkWrite(
    tasks.map((task) => {
      const status = deriveTaskLifecycleStatus(task);

      return {
        updateOne: {
          filter: { _id: task._id },
          update: {
            archived: false,
            status,
            completed: task.completed === true || status === 'completed'
          }
        }
      };
    })
  );

  return result.modifiedCount || 0;
}

// GET /health
router.get('/health', (ctx) => {
  ctx.body = {
    status: 'ok',
    service: 'backend',
    timestamp: new Date().toISOString(),
    db: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
});

// GET /notes
router.get('/notes', async (ctx) => {
  const { archived } = ctx.query;
  const notes = await Note.find(buildArchiveFilter(archived)).sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 });
  ctx.body = notes.map(normalizeNote);
});

// POST /notes
router.post('/notes', async (ctx) => {
  const body = ctx.request.body;
  const note = await Note.create({
    title: body.title,
    content: body.content || '',
    status: 'active',
    archived: false
  });
  ctx.status = 201;
  ctx.body = normalizeNote(note);
});

// PUT /notes/:id
router.put('/notes/:id', async (ctx) => {
  const id = ctx.params.id;
  const body = ctx.request.body;
  const note = await Note.findByIdAndUpdate(
    id,
    { title: body.title, content: body.content },
    { new: true, runValidators: true }
  );
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
  } else {
    ctx.body = normalizeNote(note);
  }
});

// DELETE /notes/:id
router.delete('/notes/:id', async (ctx) => {
  const id = ctx.params.id;
  const note = await Note.findByIdAndDelete(id);
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
  } else {
    ctx.status = 204;
    ctx.body = null;
  }
});

// PUT /notes/:id/pin - Pin note (does not update content timestamp)
router.put('/notes/:id/pin', async (ctx) => {
  const id = ctx.params.id;
  const note = await Note.findByIdAndUpdate(
    id,
    { isPinned: true, pinnedAt: new Date() },
    { new: true, runValidators: true, timestamps: false }
  );
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }
  console.log(`[Note Pin] "${note.title}" pinned`);
  ctx.body = normalizeNote(note);
});

// PUT /notes/:id/unpin - Unpin note (does not update content timestamp)
router.put('/notes/:id/unpin', async (ctx) => {
  const id = ctx.params.id;
  const note = await Note.findByIdAndUpdate(
    id,
    { isPinned: false, pinnedAt: null },
    { new: true, runValidators: true, timestamps: false }
  );
  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }
  console.log(`[Note Unpin] "${note.title}" unpinned`);
  ctx.body = normalizeNote(note);
});

// PUT /notes/:id/archive - Archive note and cascade to tasks
router.put('/notes/:id/archive', async (ctx) => {
  const id = ctx.params.id;

  const note = await Note.findByIdAndUpdate(
    id,
    { archived: true, status: 'active' },
    { new: true, runValidators: true }
  );

  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  const modifiedCount = await archiveTasks({
    originId: id,
    originModule: 'note'
  });

  console.log(`[Note Archive] Note "${note.title}" archived, ${modifiedCount} tasks cascaded`);

  ctx.body = normalizeNote(note);
});

// PUT /notes/:id/restore - Restore note and cascade to tasks
router.put('/notes/:id/restore', async (ctx) => {
  const id = ctx.params.id;

  const note = await Note.findByIdAndUpdate(
    id,
    { archived: false, status: 'active' },
    { new: true, runValidators: true }
  );

  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  const modifiedCount = await restoreTasks({
    originId: id,
    originModule: 'note'
  });

  console.log(`[Note Restore] Note "${note.title}" restored, ${modifiedCount} tasks cascaded`);

  ctx.body = normalizeNote(note);
});

// GET /projects
router.get('/projects', async (ctx) => {
  const { archived } = ctx.query;
  const projects = await Project.find(buildArchiveFilter(archived)).sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 });
  ctx.body = projects.map(normalizeProject);
});

// POST /projects
router.post('/projects', async (ctx) => {
  const body = ctx.request.body;
  const project = await Project.create({
    name: body.name,
    summary: body.summary,
    status: body.status || 'pending',
    archived: false
  });
  ctx.status = 201;
  ctx.body = normalizeProject(project);
});

// PUT /projects/:id
router.put('/projects/:id', async (ctx) => {
  const id = ctx.params.id;
  const body = ctx.request.body;
  const update = { name: body.name, summary: body.summary, status: body.status };
  if (body.currentFocusTaskId !== undefined) {
    update.currentFocusTaskId = body.currentFocusTaskId || null;
  }
  const project = await Project.findByIdAndUpdate(
    id,
    update,
    { new: true, runValidators: true }
  );
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
  } else {
    ctx.body = normalizeProject(project);
  }
});

// DELETE /projects/:id
router.delete('/projects/:id', async (ctx) => {
  const id = ctx.params.id;
  const project = await Project.findByIdAndDelete(id);
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
  } else {
    ctx.status = 204;
    ctx.body = null;
  }
});

// PUT /projects/:id/pin - Pin project (does not update content timestamp)
router.put('/projects/:id/pin', async (ctx) => {
  const id = ctx.params.id;
  const project = await Project.findByIdAndUpdate(
    id,
    { isPinned: true, pinnedAt: new Date() },
    { new: true, runValidators: true, timestamps: false }
  );
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }
  console.log(`[Project Pin] "${project.name}" pinned`);
  ctx.body = normalizeProject(project);
});

// PUT /projects/:id/unpin - Unpin project (does not update content timestamp)
router.put('/projects/:id/unpin', async (ctx) => {
  const id = ctx.params.id;
  const project = await Project.findByIdAndUpdate(
    id,
    { isPinned: false, pinnedAt: null },
    { new: true, runValidators: true, timestamps: false }
  );
  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }
  console.log(`[Project Unpin] "${project.name}" unpinned`);
  ctx.body = normalizeProject(project);
});

// PUT /projects/:id/archive - Archive project and cascade to tasks
router.put('/projects/:id/archive', async (ctx) => {
  const id = ctx.params.id;

  const project = await Project.findByIdAndUpdate(
    id,
    { archived: true },
    { new: true, runValidators: true }
  );

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  if (project.currentFocusTaskId) {
    await Project.findByIdAndUpdate(project._id, {
      currentFocusTaskId: null
    });
    project.currentFocusTaskId = null;
    console.log(`[Project Archive Shadow] Project "${project.name}" currentFocusTaskId cleared on project archive`);
  }

  const modifiedCount = await archiveTasks({
    ...projectTaskCascadeFilter(id)
  });

  console.log(`[Project Archive] Project "${project.name}" archived, ${modifiedCount} tasks cascaded`);

  ctx.body = normalizeProject(project);
});

// PUT /projects/:id/restore - Restore project and cascade to tasks
router.put('/projects/:id/restore', async (ctx) => {
  const id = ctx.params.id;

  const existingProject = await Project.findById(id);

  const project = await Project.findByIdAndUpdate(
    id,
    { archived: false, status: deriveProjectLifecycleStatus(existingProject) },
    { new: true, runValidators: true }
  );

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  const modifiedCount = await restoreTasks({
    ...projectTaskCascadeFilter(id)
  });

  console.log(`[Project Restore] Project "${project.name}" restored, ${modifiedCount} tasks cascaded`);

  ctx.body = normalizeProject(project);
});

// GET /tasks
router.get('/tasks', async (ctx) => {
  const { projectId, archived } = ctx.query;
  const filter = projectId
    ? combineFilters(buildArchiveFilter(archived), projectTaskReadFilter(projectId))
    : buildArchiveFilter(archived);
  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  ctx.body = tasks.map(normalizeTask);
});

// POST /tasks
router.post('/tasks', async (ctx) => {
  const body = ctx.request.body;
  const taskData = {
    title: body.title,
    creationMode: body.creationMode || 'manual',
    originModule: body.originModule || '',
    originId: body.originId || null,
    status: 'active',
    archived: false,
    completed: false
  };

  const task = await Task.create(taskData);
  ctx.status = 201;
  ctx.body = normalizeTask(task);
});

// PUT /tasks/:id
router.put('/tasks/:id', async (ctx) => {
  const id = ctx.params.id;
  const body = ctx.request.body;
  const update = {};

  const existingTask = await Task.findById(id);
  if (!existingTask) {
    ctx.status = 404;
    ctx.body = { error: 'Task not found' };
    return;
  }

  const normalizedExistingTask = normalizeTask(existingTask);
  const restoringLegacyArchivedTask = isRestoreIntent(body) && existingTask.status === 'archived';

  if (body.status !== undefined) {
    if (body.status === 'archived') {
      update.archived = true;
      update.status = normalizedExistingTask.status;
      update.completed = normalizedExistingTask.status === 'completed';
    } else {
      update.status = body.status;
      update.archived = body.archived === true ? true : false;
    }
  }
  if (body.archived !== undefined) {
    update.archived = Boolean(body.archived);
  }
  if (body.completed !== undefined) {
    update.completed = body.completed;
    update.status = body.completed ? 'completed' : 'active';
    if (update.archived === undefined) {
      update.archived = false;
    }
  }

  if (restoringLegacyArchivedTask) {
    update.archived = false;
    update.status = 'active';
    update.completed = false;
  }

  const task = await Task.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  const normalizedTask = normalizeTask(task);
  ctx.body = normalizedTask;

  const isBecomingCompleted = normalizedTask.status === 'completed' && normalizedExistingTask.status !== 'completed';

  if (isBecomingCompleted && isProjectOwnedTask(normalizedTask)) {
    await clearFocusForTask(normalizedTask._id, 'task completion');
  }

  const isBecomingArchived = normalizedTask.archived && !normalizedExistingTask.archived;
  if (isBecomingArchived) {
    await clearFocusForTask(normalizedTask._id, 'task archive');
  }
});

// DELETE /tasks/:id
router.delete('/tasks/:id', async (ctx) => {
  const id = ctx.params.id;
  const task = await Task.findByIdAndDelete(id);
  if (!task) {
    ctx.status = 404;
    ctx.body = { error: 'Task not found' };
  } else {
    ctx.status = 204;
    ctx.body = null;
    await clearFocusForTask(task._id, 'task delete');
  }
});

module.exports = router;
module.exports.__test__ = {
  archiveTasks,
  buildArchiveFilter,
  combineFilters,
  restoreTasks
};
