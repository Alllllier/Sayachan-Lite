const Router = require('@koa/router');
const mongoose = require('mongoose');
const Note = require('../models/Note');
const Project = require('../models/Project');
const Task = require('../models/Task');

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
  const filter = archived === 'true'
    ? { status: 'archived' }
    : { status: { $ne: 'archived' } };
  // Priority Signal: pinned first (by pinnedAt), then recent content (by updatedAt)
  const notes = await Note.find(filter).sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 });
  ctx.body = notes;
});

// POST /notes
router.post('/notes', async (ctx) => {
  const body = ctx.request.body;
  const note = await Note.create({
    title: body.title,
    content: body.content || ''
  });
  ctx.status = 201;
  ctx.body = note;
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
    ctx.body = note;
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
  ctx.body = note;
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
  ctx.body = note;
});

// PUT /notes/:id/archive - Archive note and cascade to tasks
router.put('/notes/:id/archive', async (ctx) => {
  const id = ctx.params.id;

  // 1. Archive note
  const note = await Note.findByIdAndUpdate(
    id,
    { status: 'archived' },
    { new: true, runValidators: true }
  );

  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  // 2. Cascade: Archive all tasks originated from this note
  const result = await Task.updateMany(
    {
      originId: id,
      originModule: 'note',
      status: { $ne: 'archived' }
    },
    { status: 'archived' }
  );

  console.log(`[Note Archive] Note "${note.title}" archived, ${result.modifiedCount} tasks cascaded`);

  ctx.body = note;
});

// PUT /notes/:id/restore - Restore note and cascade to tasks
router.put('/notes/:id/restore', async (ctx) => {
  const id = ctx.params.id;

  // 1. Restore note to active status
  const note = await Note.findByIdAndUpdate(
    id,
    { status: 'active' },
    { new: true, runValidators: true }
  );

  if (!note) {
    ctx.status = 404;
    ctx.body = { error: 'Note not found' };
    return;
  }

  // 2. Cascade: Restore all tasks originated from this note
  const result = await Task.updateMany(
    {
      originId: id,
      originModule: 'note',
      status: 'archived'
    },
    { status: 'active' }
  );

  console.log(`[Note Restore] Note "${note.title}" restored, ${result.modifiedCount} tasks cascaded`);

  ctx.body = note;
});

// GET /projects
router.get('/projects', async (ctx) => {
  const { archived } = ctx.query;
  const filter = archived === 'true'
    ? { status: 'archived' }
    : { status: { $ne: 'archived' } };
  // Priority Signal: pinned first (by pinnedAt), then recent content (by updatedAt)
  const projects = await Project.find(filter).sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 });
  ctx.body = projects;
});

// POST /projects
router.post('/projects', async (ctx) => {
  const body = ctx.request.body;
  const project = await Project.create({
    name: body.name,
    summary: body.summary,
    status: body.status || 'pending'
  });
  ctx.status = 201;
  ctx.body = project;
});

// PUT /projects/:id
router.put('/projects/:id', async (ctx) => {
  const id = ctx.params.id;
  const body = ctx.request.body;
  const update = { name: body.name, summary: body.summary, status: body.status };
  // Phase 1 shadow writing: allow currentFocusTaskId to be set if provided
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
    ctx.body = project;
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
  ctx.body = project;
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
  ctx.body = project;
});

// PUT /projects/:id/archive - Archive project and cascade to tasks
router.put('/projects/:id/archive', async (ctx) => {
  const id = ctx.params.id;

  // 1. Archive project
  const project = await Project.findByIdAndUpdate(
    id,
    { status: 'archived' },
    { new: true, runValidators: true }
  );

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  // Phase 1.5: if project has a currentFocusTaskId, clear it
  if (project.currentFocusTaskId) {
    await Project.findByIdAndUpdate(project._id, {
      currentFocusTaskId: null
    });
    console.log(`[Project Archive Shadow] Project "${project.name}" currentFocusTaskId cleared on project archive`);
  }

  // 2. Cascade: Archive all related tasks
  const result = await Task.updateMany(
    {
      $or: [
        { linkedProjectId: id },
        { originId: id }
      ],
      status: { $ne: 'archived' }
    },
    { status: 'archived' }
  );

  console.log(`[Project Archive] Project "${project.name}" archived, ${result.modifiedCount} tasks cascaded`);

  ctx.body = project;
});

// PUT /projects/:id/restore - Restore project and cascade to tasks
router.put('/projects/:id/restore', async (ctx) => {
  const id = ctx.params.id;

  // 1. Restore project to pending status
  const project = await Project.findByIdAndUpdate(
    id,
    { status: 'pending' },
    { new: true, runValidators: true }
  );

  if (!project) {
    ctx.status = 404;
    ctx.body = { error: 'Project not found' };
    return;
  }

  // 2. Cascade: Restore all related tasks to active
  const result = await Task.updateMany(
    {
      $or: [
        { linkedProjectId: id },
        { originId: id }
      ],
      status: 'archived'
    },
    { status: 'active' }
  );

  console.log(`[Project Restore] Project "${project.name}" restored, ${result.modifiedCount} tasks cascaded`);

  ctx.body = project;
});

// GET /tasks
router.get('/tasks', async (ctx) => {
  const { projectId, archived } = ctx.query;
  const filter = {};
  // Toggle archived visibility: default exclude archived, ?archived=true to include only archived
  if (archived === 'true') {
    filter.status = 'archived';
  } else {
    filter.status = { $ne: 'archived' };
  }
  if (projectId) {
    // Canonical: only query by linkedProjectId
    filter.linkedProjectId = projectId;
  }
  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  ctx.body = tasks;
});

// POST /tasks
router.post('/tasks', async (ctx) => {
  const body = ctx.request.body;

  // Canonical Task Contract: only new semantic fields
  const taskData = {
    title: body.title,
    creationMode: body.creationMode || 'manual',
    originModule: body.originModule || '',
    originId: body.originId || null,
    originLabel: body.originLabel || '',
    linkedProjectId: body.linkedProjectId || null,
    linkedProjectName: body.linkedProjectName || ''
  };

  const task = await Task.create(taskData);
  ctx.status = 201;
  ctx.body = task;
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

  if (body.status !== undefined) {
    update.status = body.status;
  }
  if (body.completed !== undefined) {
    update.completed = body.completed;
    update.status = body.completed ? 'completed' : 'active';
  }

  const task = await Task.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  ctx.body = task;

  // Focus transition: when a task from project focus is completed, clear currentFocusTaskId
  const isBecomingCompleted = (body.completed === true || body.status === 'completed') &&
    (existingTask.completed !== true && existingTask.status !== 'completed');

  // Canonical: Check if this is a project-linked task using new fields only
  const projectId = task.linkedProjectId;
  const isProjectTask = projectId && task.originId &&
    ['project', 'project_focus', 'project_suggestion'].includes(task.originModule);

  if (isBecomingCompleted && isProjectTask) {
    // Find project by exact ID match (no title/nextAction fuzzy matching)
    const project = await Project.findById(projectId);
    if (project) {
      // Phase 4A: legacy nextAction/focusHistory writing stopped.
      // Only canonical shadow writing remains.
      if (project.currentFocusTaskId && String(project.currentFocusTaskId) === String(task._id)) {
        await Project.findByIdAndUpdate(project._id, {
          currentFocusTaskId: null
        });
        console.log(`[Focus Transition Shadow] Project "${project.name}" currentFocusTaskId cleared on task completion`);
      }
    }
  }

  // Phase 1.5: if task is archived and it is a project's currentFocusTaskId, clear the reference
  const isBecomingArchived = body.status === 'archived' && existingTask.status !== 'archived';
  if (isBecomingArchived && task.linkedProjectId) {
    const project = await Project.findById(task.linkedProjectId);
    if (project && project.currentFocusTaskId && String(project.currentFocusTaskId) === String(task._id)) {
      await Project.findByIdAndUpdate(project._id, {
        currentFocusTaskId: null
      });
      console.log(`[Focus Archive Shadow] Project "${project.name}" currentFocusTaskId cleared because focus task was archived`);
    }
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

    // Phase 1.5: if deleted task was a project's currentFocusTaskId, clear the reference
    if (task.linkedProjectId) {
      const project = await Project.findById(task.linkedProjectId);
      if (project && project.currentFocusTaskId && String(project.currentFocusTaskId) === String(task._id)) {
        await Project.findByIdAndUpdate(project._id, {
          currentFocusTaskId: null
        });
        console.log(`[Focus Delete Shadow] Project "${project.name}" currentFocusTaskId cleared because focus task was deleted`);
      }
    }
  }
});

module.exports = router;
