const Project = require('../models/Project');
const Task = require('../models/Task');
const {
  archiveTasks,
  buildArchiveFilter,
  deriveProjectLifecycleStatus,
  normalizeProject,
  projectTaskCascadeFilter,
  restoreTasks
} = require('./taskRuntimeHelpers');

async function listProjects({ archived } = {}) {
  const projects = await Project.find(buildArchiveFilter(archived)).sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 });
  return projects.map(normalizeProject);
}

async function createProject(body) {
  const project = await Project.create({
    name: body.name,
    summary: body.summary,
    status: body.status || 'pending',
    archived: false
  });

  return normalizeProject(project);
}

async function updateProject(id, body) {
  const update = { name: body.name, summary: body.summary, status: body.status };
  if (body.currentFocusTaskId !== undefined) {
    update.currentFocusTaskId = body.currentFocusTaskId || null;
  }

  const project = await Project.findByIdAndUpdate(
    id,
    update,
    { new: true, runValidators: true }
  );

  return normalizeProject(project);
}

async function deleteProject(id) {
  const project = await Project.findByIdAndDelete(id);
  return Boolean(project);
}

async function pinProject(id) {
  const project = await Project.findByIdAndUpdate(
    id,
    { isPinned: true, pinnedAt: new Date() },
    { new: true, runValidators: true, timestamps: false }
  );

  if (project) {
    console.log(`[Project Pin] "${project.name}" pinned`);
  }

  return normalizeProject(project);
}

async function unpinProject(id) {
  const project = await Project.findByIdAndUpdate(
    id,
    { isPinned: false, pinnedAt: null },
    { new: true, runValidators: true, timestamps: false }
  );

  if (project) {
    console.log(`[Project Unpin] "${project.name}" unpinned`);
  }

  return normalizeProject(project);
}

async function archiveProject(id) {
  const project = await Project.findByIdAndUpdate(
    id,
    { archived: true },
    { new: true, runValidators: true }
  );

  if (!project) {
    return null;
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

  return normalizeProject(project);
}

async function restoreProject(id) {
  const existingProject = await Project.findById(id);

  const project = await Project.findByIdAndUpdate(
    id,
    { archived: false, status: deriveProjectLifecycleStatus(existingProject) },
    { new: true, runValidators: true }
  );

  if (!project) {
    return null;
  }

  const modifiedCount = await restoreTasks(Task, {
    ...projectTaskCascadeFilter(id)
  });

  console.log(`[Project Restore] Project "${project.name}" restored, ${modifiedCount} tasks cascaded`);

  return normalizeProject(project);
}

module.exports = {
  archiveProject,
  createProject,
  deleteProject,
  listProjects,
  pinProject,
  restoreProject,
  unpinProject,
  updateProject
};
