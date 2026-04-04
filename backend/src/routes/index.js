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
  const notes = await Note.find().sort({ createdAt: -1 });
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

// GET /projects
router.get('/projects', async (ctx) => {
  const projects = await Project.find().sort({ createdAt: -1 });
  ctx.body = projects;
});

// POST /projects
router.post('/projects', async (ctx) => {
  const body = ctx.request.body;
  const project = await Project.create({
    name: body.name,
    summary: body.summary,
    status: body.status || 'pending',
    nextAction: body.nextAction || ''
  });
  ctx.status = 201;
  ctx.body = project;
});

// PUT /projects/:id
router.put('/projects/:id', async (ctx) => {
  const id = ctx.params.id;
  const body = ctx.request.body;
  const project = await Project.findByIdAndUpdate(
    id,
    { name: body.name, summary: body.summary, status: body.status, nextAction: body.nextAction },
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

// GET /tasks
router.get('/tasks', async (ctx) => {
  const { projectId } = ctx.query;
  const filter = { status: { $ne: 'archived' } };
  if (projectId) {
    // Support querying by both new linkedProjectId and legacy projectId
    filter.$or = [
      { linkedProjectId: projectId },
      { projectId: projectId }
    ];
  }
  const tasks = await Task.find(filter).sort({ createdAt: -1 });
  ctx.body = tasks;
});

// POST /tasks
router.post('/tasks', async (ctx) => {
  const body = ctx.request.body;

  // Only write new semantic fields for new tasks
  // Legacy fields (source, sourceDetail, projectId, projectName) are kept for backward compatibility
  // but new writes should only use new semantic fields
  const taskData = {
    title: body.title,
    // New semantic fields only
    creationMode: body.creationMode || 'manual',
    originModule: body.originModule || '',
    originId: body.originId || null,
    originLabel: body.originLabel || '',
    // Accept linkedProjectId directly, or fallback to legacy projectId if provided by old clients
    linkedProjectId: body.linkedProjectId || body.projectId || null,
    linkedProjectName: body.linkedProjectName || body.projectName || ''
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

  // Focus transition: when a task from project focus is completed
  // Migrate it from Current Focus to Last Completed and append to focusHistory
  const isBecomingCompleted = (body.completed === true || body.status === 'completed') &&
    (existingTask.completed !== true && existingTask.status !== 'completed');

  // Check if this is a project-linked task (has linkedProjectId or legacy projectId)
  const projectId = task.linkedProjectId || task.projectId;
  const isProjectTask = projectId &&
    ((task.creationMode === 'ai' && task.originModule === 'project' && task.originId) ||
     (task.source === 'project' && task.sourceDetail === 'focus'));

  if (isBecomingCompleted && isProjectTask) {
    // Find project by exact ID match (no title/nextAction fuzzy matching)
    const project = await Project.findById(projectId);
    if (project) {
      const historyEntry = project.nextAction;
      await Project.findByIdAndUpdate(project._id, {
        lastCompletedAction: project.nextAction,
        nextAction: '',
        $push: { focusHistory: historyEntry }
      });
      console.log(`[Focus Transition] Project "${project.name}" focus completed: "${task.title}", added to history`);
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
  }
});

module.exports = router;
