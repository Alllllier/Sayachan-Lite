const Project = require('../models/Project');
const Task = require('../models/Task');
const {
  archiveTasks,
  buildArchiveFilter,
  combineFilters,
  deriveProjectLifecycleStatus,
  normalizeProject,
  projectTaskCascadeFilter,
  restoreTasks
} = require('./taskRuntimeHelpers');
const { ownedFilter, ownerFilter, requireUserId } = require('./ownership');

async function listProjects({ archived, userId } = {}) {
  const projects = await Project.find(combineFilters(buildArchiveFilter(archived), ownerFilter(userId)))
    .sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 });
  return projects.map(normalizeProject);
}

async function createProject(body, { userId } = {}) {
  const project = await Project.create({
    name: body.name,
    summary: body.summary,
    status: body.status || 'pending',
    archived: false,
    userId: requireUserId(userId)
  });

  return normalizeProject(project);
}

async function updateProject(id, body, { userId } = {}) {
  const update = { name: body.name, summary: body.summary, status: body.status };
  if (body.currentFocusTaskId !== undefined) {
    update.currentFocusTaskId = body.currentFocusTaskId || null;
  }

  const project = await Project.findOneAndUpdate(ownedFilter(id, userId), update, { new: true, runValidators: true });

  return normalizeProject(project);
}

async function deleteProject(id, { userId } = {}) {
  const project = await Project.findOneAndDelete(ownedFilter(id, userId));
  return Boolean(project);
}

async function pinProject(id, { userId } = {}) {
  const project = await Project.findOneAndUpdate(ownedFilter(id, userId), { isPinned: true, pinnedAt: new Date() }, { new: true, runValidators: true, timestamps: false });

  if (project) {
    console.log(`[Project Pin] "${project.name}" pinned`);
  }

  return normalizeProject(project);
}

async function unpinProject(id, { userId } = {}) {
  const project = await Project.findOneAndUpdate(ownedFilter(id, userId), { isPinned: false, pinnedAt: null }, { new: true, runValidators: true, timestamps: false });

  if (project) {
    console.log(`[Project Unpin] "${project.name}" unpinned`);
  }

  return normalizeProject(project);
}

async function archiveProject(id, { userId } = {}) {
  const project = await Project.findOneAndUpdate(ownedFilter(id, userId), { archived: true }, { new: true, runValidators: true });

  if (!project) {
    return null;
  }

  if (project.currentFocusTaskId) {
    await Project.findOneAndUpdate(ownedFilter(project._id, userId), { currentFocusTaskId: null });
    project.currentFocusTaskId = null;
    console.log(`[Project Archive Shadow] Project "${project.name}" currentFocusTaskId cleared on project archive`);
  }

  const modifiedCount = await archiveTasks(Task, {
    ...projectTaskCascadeFilter(id),
    ...ownerFilter(userId)
  });

  console.log(`[Project Archive] Project "${project.name}" archived, ${modifiedCount} tasks cascaded`);

  return normalizeProject(project);
}

async function restoreProject(id, { userId } = {}) {
  const existingProject = await Project.findOne(ownedFilter(id, userId));

  const project = await Project.findOneAndUpdate(ownedFilter(id, userId), { archived: false, status: deriveProjectLifecycleStatus(existingProject) }, { new: true, runValidators: true });

  if (!project) {
    return null;
  }

  const modifiedCount = await restoreTasks(Task, {
    ...projectTaskCascadeFilter(id),
    ...ownerFilter(userId)
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
