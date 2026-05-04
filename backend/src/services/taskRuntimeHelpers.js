function buildArchiveFilter(archived) {
  if (archived === 'true') {
    return { archived: true };
  }

  return { archived: { $ne: true } };
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

function projectTaskReadFilter(projectId) {
  return projectTaskRelationFilter(projectId);
}

function projectTaskCascadeFilter(projectId) {
  return projectTaskRelationFilter(projectId);
}

function isArchivedEntity(entity) {
  return entity?.archived === true;
}

function deriveTaskLifecycleStatus(task) {
  if (task?.status) {
    return task.status;
  }

  return task?.completed ? 'completed' : 'active';
}

function deriveProjectLifecycleStatus(project) {
  if (project?.status && project.status !== 'archived') {
    return project.status;
  }

  return 'pending';
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
    archived: isArchivedEntity(normalized)
  };
}

function isProjectOwnedTask(task) {
  return task?.originModule === 'project' && task?.originId;
}

async function clearFocusForTask(Project, taskId, reason) {
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

async function archiveTasks(Task, taskFilter) {
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

async function restoreTasks(Task, taskFilter) {
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

module.exports = {
  archiveTasks,
  buildArchiveFilter,
  clearFocusForTask,
  combineFilters,
  deriveProjectLifecycleStatus,
  deriveTaskLifecycleStatus,
  isArchivedEntity,
  isProjectOwnedTask,
  normalizeNote,
  normalizeProject,
  normalizeTask,
  projectTaskCascadeFilter,
  projectTaskReadFilter,
  projectTaskRelationFilter,
  restoreTasks
};
