const Router = require('@koa/router');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const Project = require('../models/Project');
const Task = require('../models/Task');
const {
  archiveTasks,
  buildArchiveFilter,
  clearFocusForTask,
  combineFilters,
  deriveProjectLifecycleStatus,
  isProjectOwnedTask,
  normalizeNote,
  normalizeProject,
  normalizeTask,
  projectTaskCascadeFilter,
  projectTaskReadFilter,
  restoreTasks
} = require('./taskRuntimeHelpers');

const router = new Router();

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
    { archived: true },
    { new: true, runValidators: true }
  );

  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  const modifiedCount = await archiveTasks(Task, {
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
    { archived: false },
    { new: true, runValidators: true }
  );

  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  const modifiedCount = await restoreTasks(Task, {
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

  const modifiedCount = await archiveTasks(Task, {
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

  const modifiedCount = await restoreTasks(Task, {
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

  if (body.status !== undefined) {
    update.status = body.status;
    update.archived = body.archived === true ? true : false;
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

  const task = await Task.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  const normalizedTask = normalizeTask(task);
  ctx.body = normalizedTask;

  const isBecomingCompleted = normalizedTask.status === 'completed' && normalizedExistingTask.status !== 'completed';

  if (isBecomingCompleted && isProjectOwnedTask(normalizedTask)) {
    await clearFocusForTask(Project, normalizedTask._id, 'task completion');
  }

  const isBecomingArchived = normalizedTask.archived && !normalizedExistingTask.archived;
  if (isBecomingArchived) {
    await clearFocusForTask(Project, normalizedTask._id, 'task archive');
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
    await clearFocusForTask(Project, task._id, 'task delete');
  }
});

module.exports = router;
module.exports.__test__ = {
  archiveTasks: (taskFilter) => archiveTasks(Task, taskFilter),
  buildArchiveFilter,
  combineFilters,
  restoreTasks: (taskFilter) => restoreTasks(Task, taskFilter)
};
