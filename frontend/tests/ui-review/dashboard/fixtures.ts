export const activeDashboardTasks = [
  {
    _id: 'dashboard-manual-task',
    title: 'Review dashboard saved-task browser baseline',
    creationMode: 'manual',
    originModule: 'dashboard',
    originId: null,
    archived: false,
    status: 'active',
    completed: false,
    updatedAt: '2026-05-04T09:00:00.000Z'
  },
  {
    _id: 'note-manual-task',
    title: 'Follow up on note-sourced task with a wrapping title for row density',
    creationMode: 'manual',
    originModule: 'note',
    originId: 'note-review',
    archived: false,
    status: 'active',
    completed: false,
    updatedAt: '2026-05-04T08:45:00.000Z'
  },
  {
    _id: 'project-manual-task',
    title: 'Confirm project task provenance styling',
    creationMode: 'manual',
    originModule: 'project',
    originId: 'project-review',
    archived: false,
    status: 'active',
    completed: false,
    updatedAt: '2026-05-04T08:30:00.000Z'
  },
  {
    _id: 'dashboard-ai-task',
    title: 'AI-created saved task without reintroducing assistant workflow',
    creationMode: 'ai',
    originModule: 'dashboard',
    originId: 'dashboard-review',
    archived: false,
    status: 'active',
    completed: false,
    updatedAt: '2026-05-04T08:15:00.000Z'
  },
  {
    _id: 'completed-active-task',
    title: 'Completed active row remains reactivatable',
    creationMode: 'manual',
    originModule: 'dashboard',
    originId: null,
    archived: false,
    status: 'completed',
    completed: true,
    updatedAt: '2026-05-04T08:00:00.000Z'
  },
  {
    _id: 'sixth-active-task',
    title: 'Sixth active task appears after expanding the saved-task list',
    creationMode: 'manual',
    originModule: 'note',
    originId: 'note-expanded',
    archived: false,
    status: 'active',
    completed: false,
    updatedAt: '2026-05-04T07:45:00.000Z'
  },
  {
    _id: 'seventh-active-task',
    title: 'Seventh active task confirms Show less returns to preview',
    creationMode: 'manual',
    originModule: 'project',
    originId: 'project-expanded',
    archived: false,
    status: 'active',
    completed: false,
    updatedAt: '2026-05-04T07:30:00.000Z'
  }
]

export const archivedDashboardTasks = [
  {
    _id: 'archived-dashboard-task',
    title: 'Archived dashboard task ready to restore',
    creationMode: 'manual',
    originModule: 'dashboard',
    originId: null,
    archived: true,
    status: 'active',
    completed: false,
    updatedAt: '2026-05-03T17:00:00.000Z'
  },
  {
    _id: 'archived-project-task',
    title: 'Archived project task with delete action visible',
    creationMode: 'manual',
    originModule: 'project',
    originId: 'project-archived',
    archived: true,
    status: 'active',
    completed: false,
    updatedAt: '2026-05-03T16:30:00.000Z'
  }
]
