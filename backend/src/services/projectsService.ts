import type {
  ProjectCreateDto,
  ProjectUpdateDto
} from '../routes/schemas/mutations.js';
import type { ObjectId } from '../middleware/objectIdParsing.js';
import {
  buildArchiveFilter,
  combineFilters,
  projectTaskRelationFilter
} from '../domain/tasks/queryFilters.js';
import {
  archiveTasks,
  restoreTasks
} from '../domain/tasks/cascade.js';
import {
  deriveProjectLifecycleStatus,
  toProjectDto
} from '../domain/dtos/productDtos.js';
import {
  ownedFilter,
  ownerFilter,
  requireUserId
} from '../domain/ownership.js';
import Project from '../models/Project.js';
import Task from '../models/Task.js';

type ServiceOptions = {
  userId: ObjectId;
};

type ListProjectsOptions = ServiceOptions & {
  archived?: unknown;
};

type ProjectUpdate = {
  name?: string;
  summary?: string;
  status?: ProjectUpdateDto['status'];
  currentFocusTaskId?: ObjectId | null;
};

type ProjectUpdateInput = Omit<ProjectUpdateDto, 'currentFocusTaskId'> & {
  currentFocusTaskId?: ObjectId | null;
};

type QueryFilter = Record<string, unknown>;

export async function listProjects({ archived, userId }: ListProjectsOptions) {
  const projects = await Project.find(combineFilters(buildArchiveFilter(archived), ownerFilter(userId)))
    .sort({ isPinned: -1, pinnedAt: -1, updatedAt: -1 });
  return projects.map(toProjectDto);
}

export async function createProject(body: ProjectCreateDto, { userId }: ServiceOptions) {
  const project = await Project.create({
    name: body.name,
    summary: body.summary,
    status: body.status || 'pending',
    archived: false,
    userId: requireUserId(userId)
  });

  return toProjectDto(project);
}

export function buildProjectUpdate(body: ProjectUpdateInput): ProjectUpdate {
  const update: ProjectUpdate = {};
  if (typeof body.name === 'string') {
    update.name = body.name;
  }
  if (typeof body.summary === 'string') {
    update.summary = body.summary;
  }
  if (body.status === 'pending' || body.status === 'in_progress' || body.status === 'completed' || body.status === 'on_hold') {
    update.status = body.status;
  }
  if (body.currentFocusTaskId !== undefined) {
    update.currentFocusTaskId = body.currentFocusTaskId || null;
  }
  return update;
}

export function changedOnlyFilter(filter: QueryFilter, update: ProjectUpdate): QueryFilter {
  return {
    ...filter,
    $or: Object.entries(update).map(([field, value]) => ({ [field]: { $ne: value } }))
  };
}

export async function updateProject(id: ObjectId, body: ProjectUpdateInput, { userId }: ServiceOptions) {
  const filter = ownedFilter(id, userId);
  const update = buildProjectUpdate(body);

  const project = await Project.findOneAndUpdate(changedOnlyFilter(filter, update), update, { new: true, runValidators: true });

  return toProjectDto(project || await Project.findOne(filter));
}

export async function deleteProject(id: ObjectId, { userId }: ServiceOptions) {
  const project = await Project.findOneAndDelete(ownedFilter(id, userId));
  return Boolean(project);
}

export async function pinProject(id: ObjectId, { userId }: ServiceOptions) {
  const project = await Project.findOneAndUpdate(ownedFilter(id, userId), { isPinned: true, pinnedAt: new Date() }, { new: true, runValidators: true, timestamps: false });

  if (project) {
    console.log(`[Project Pin] "${project.name}" pinned`);
  }

  return toProjectDto(project);
}

export async function unpinProject(id: ObjectId, { userId }: ServiceOptions) {
  const project = await Project.findOneAndUpdate(ownedFilter(id, userId), { isPinned: false, pinnedAt: null }, { new: true, runValidators: true, timestamps: false });

  if (project) {
    console.log(`[Project Unpin] "${project.name}" unpinned`);
  }

  return toProjectDto(project);
}

export async function archiveProject(id: ObjectId, { userId }: ServiceOptions) {
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
    ...projectTaskRelationFilter(id),
    ...ownerFilter(userId)
  });

  console.log(`[Project Archive] Project "${project.name}" archived, ${modifiedCount} tasks cascaded`);

  return toProjectDto(project);
}

export async function restoreProject(id: ObjectId, { userId }: ServiceOptions) {
  const existingProject = await Project.findOne(ownedFilter(id, userId));

  const project = await Project.findOneAndUpdate(ownedFilter(id, userId), { archived: false, status: deriveProjectLifecycleStatus(existingProject) }, { new: true, runValidators: true });

  if (!project) {
    return null;
  }

  const modifiedCount = await restoreTasks(Task, {
    ...projectTaskRelationFilter(id),
    ...ownerFilter(userId)
  });

  console.log(`[Project Restore] Project "${project.name}" restored, ${modifiedCount} tasks cascaded`);

  return toProjectDto(project);
}

export default {
  archiveProject,
  createProject,
  deleteProject,
  listProjects,
  pinProject,
  restoreProject,
  unpinProject,
  updateProject
};
