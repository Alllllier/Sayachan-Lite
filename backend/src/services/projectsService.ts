import type {
  ProjectCreateDto,
  ProjectUpdateDto
} from '../routes/schemas/mutations';
import {
  archiveTasks,
  buildArchiveFilter,
  combineFilters,
  deriveProjectLifecycleStatus,
  normalizeProject,
  projectTaskCascadeFilter,
  restoreTasks
} from './taskRuntimeHelpers';
import {
  ownedFilter,
  ownerFilter,
  requireUserId
} from './ownership';
import ProjectModel = require('../models/Project');
import TaskModel = require('../models/Task');

const Project = ProjectModel as any;
const Task = TaskModel as any;

type ServiceOptions = {
  userId?: unknown;
};

type ListProjectsOptions = ServiceOptions & {
  archived?: unknown;
};

type ProjectUpdate = {
  name?: string;
  summary?: string;
  status?: ProjectUpdateDto['status'];
  currentFocusTaskId?: unknown;
};

type QueryFilter = Record<string, unknown>;

async function listProjects({ archived, userId }: ListProjectsOptions = {}) {
  const projects = await Project.find(combineFilters(buildArchiveFilter(archived), ownerFilter(userId)))
    .sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 });
  return projects.map(normalizeProject);
}

async function createProject(body: ProjectCreateDto, { userId }: ServiceOptions = {}) {
  const project = await Project.create({
    name: body.name,
    summary: body.summary,
    status: body.status || 'pending',
    archived: false,
    userId: requireUserId(userId)
  });

  return normalizeProject(project);
}

function buildProjectUpdate(body: ProjectUpdateDto): ProjectUpdate {
  const update: ProjectUpdate = {};
  if (body.name !== undefined) {
    update.name = body.name;
  }
  if (body.summary !== undefined) {
    update.summary = body.summary;
  }
  if (body.status !== undefined) {
    update.status = body.status;
  }
  if (body.currentFocusTaskId !== undefined) {
    update.currentFocusTaskId = body.currentFocusTaskId || null;
  }
  return update;
}

function changedOnlyFilter(filter: QueryFilter, update: ProjectUpdate): QueryFilter {
  return {
    ...filter,
    $or: Object.entries(update).map(([field, value]) => ({ [field]: { $ne: value } }))
  };
}

async function updateProject(id: unknown, body: ProjectUpdateDto, { userId }: ServiceOptions = {}) {
  const filter = ownedFilter(id, userId);
  const update = buildProjectUpdate(body);

  const project = await Project.findOneAndUpdate(changedOnlyFilter(filter, update), update, { new: true, runValidators: true });

  return normalizeProject(project || await Project.findOne(filter));
}

async function deleteProject(id: unknown, { userId }: ServiceOptions = {}) {
  const project = await Project.findOneAndDelete(ownedFilter(id, userId));
  return Boolean(project);
}

async function pinProject(id: unknown, { userId }: ServiceOptions = {}) {
  const project = await Project.findOneAndUpdate(ownedFilter(id, userId), { isPinned: true, pinnedAt: new Date() }, { new: true, runValidators: true, timestamps: false });

  if (project) {
    console.log(`[Project Pin] "${project.name}" pinned`);
  }

  return normalizeProject(project);
}

async function unpinProject(id: unknown, { userId }: ServiceOptions = {}) {
  const project = await Project.findOneAndUpdate(ownedFilter(id, userId), { isPinned: false, pinnedAt: null }, { new: true, runValidators: true, timestamps: false });

  if (project) {
    console.log(`[Project Unpin] "${project.name}" unpinned`);
  }

  return normalizeProject(project);
}

async function archiveProject(id: unknown, { userId }: ServiceOptions = {}) {
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

async function restoreProject(id: unknown, { userId }: ServiceOptions = {}) {
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

export = {
  archiveProject,
  createProject,
  deleteProject,
  listProjects,
  pinProject,
  restoreProject,
  unpinProject,
  updateProject
};
