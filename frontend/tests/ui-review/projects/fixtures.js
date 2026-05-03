export const activeProjects = [
  {
    _id: 'project-pinned',
    name: 'Pinned launch project',
    summary: 'Pinned active project with enough summary text to verify wrapping, status display, current focus, and task preview layout.',
    status: 'in_progress',
    currentFocusTaskId: 'task-focus',
    isPinned: true,
    archived: false,
    updatedAt: '2026-05-03T10:00:00.000Z'
  },
  {
    _id: 'project-planning',
    name: 'Planning review project',
    summary: 'Secondary active project that keeps the default active view multi-card and exercises a quieter planning status.',
    status: 'pending',
    currentFocusTaskId: null,
    isPinned: false,
    archived: false,
    updatedAt: '2026-05-02T09:00:00.000Z'
  },
  {
    _id: 'project-paused',
    name: 'Paused cleanup project',
    summary: 'A paused project that gives the review surface another status badge and a short task list.',
    status: 'on_hold',
    currentFocusTaskId: null,
    isPinned: false,
    archived: false,
    updatedAt: '2026-05-01T08:00:00.000Z'
  }
]

export const archivedProjects = [
  {
    _id: 'project-archived',
    name: 'Archived migration project',
    summary: 'Archived project card should expose Restore and Delete only while still showing archived task preview content.',
    status: 'completed',
    currentFocusTaskId: null,
    isPinned: false,
    archived: true,
    updatedAt: '2026-04-28T08:00:00.000Z'
  }
]

export const projectTasks = {
  'project-pinned': [
    {
      _id: 'task-focus',
      title: 'Confirm launch checklist ownership and publish the next visible milestone',
      status: 'active',
      archived: false,
      projectId: 'project-pinned',
      updatedAt: '2026-05-03T10:01:00.000Z'
    },
    {
      _id: 'task-active-2',
      title: 'Review analytics dashboard notes before the project sync',
      status: 'active',
      archived: false,
      projectId: 'project-pinned',
      updatedAt: '2026-05-03T09:45:00.000Z'
    },
    {
      _id: 'task-active-3',
      title: 'Prepare stakeholder summary with risk and dependency callouts',
      status: 'active',
      archived: false,
      projectId: 'project-pinned',
      updatedAt: '2026-05-03T09:30:00.000Z'
    },
    {
      _id: 'task-active-4',
      title: 'Schedule final polish pass for the project browser baseline',
      status: 'active',
      archived: false,
      projectId: 'project-pinned',
      updatedAt: '2026-05-03T09:15:00.000Z'
    },
    {
      _id: 'task-completed-1',
      title: 'Completed dependency audit for the launch project',
      status: 'completed',
      archived: false,
      projectId: 'project-pinned',
      updatedAt: '2026-05-02T17:30:00.000Z'
    },
    {
      _id: 'task-completed-2',
      title: 'Completed copy review for the pinned project summary',
      status: 'completed',
      archived: false,
      projectId: 'project-pinned',
      updatedAt: '2026-05-02T16:30:00.000Z'
    },
    {
      _id: 'task-archived-1',
      title: 'Archived old launch checklist item',
      status: 'active',
      archived: true,
      projectId: 'project-pinned',
      updatedAt: '2026-04-30T12:00:00.000Z'
    },
    {
      _id: 'task-archived-2',
      title: 'Archived completed planning duplicate',
      status: 'completed',
      archived: true,
      projectId: 'project-pinned',
      updatedAt: '2026-04-29T12:00:00.000Z'
    },
    {
      _id: 'task-archived-3',
      title: 'Archived parking lot reminder',
      status: 'active',
      archived: true,
      projectId: 'project-pinned',
      updatedAt: '2026-04-28T12:00:00.000Z'
    },
    {
      _id: 'task-archived-4',
      title: 'Archived follow-up beyond collapsed preview',
      status: 'active',
      archived: true,
      projectId: 'project-pinned',
      updatedAt: '2026-04-27T12:00:00.000Z'
    }
  ],
  'project-planning': [
    {
      _id: 'task-planning-1',
      title: 'Draft planning project acceptance notes',
      status: 'active',
      archived: false,
      projectId: 'project-planning',
      updatedAt: '2026-05-02T09:30:00.000Z'
    }
  ],
  'project-paused': [
    {
      _id: 'task-paused-1',
      title: 'Hold cleanup project until design review finishes',
      status: 'active',
      archived: false,
      projectId: 'project-paused',
      updatedAt: '2026-05-01T08:30:00.000Z'
    }
  ],
  'project-archived': [
    {
      _id: 'task-archived-project-1',
      title: 'Archived project historical task',
      status: 'completed',
      archived: true,
      projectId: 'project-archived',
      updatedAt: '2026-04-28T09:00:00.000Z'
    }
  ]
}

export const projectAiSuggestions = [
  'Write the launch project risk note and link it to the current focus task.',
  'Create a concise stakeholder update from the remaining active tasks.'
]
