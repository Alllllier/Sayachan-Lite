export const cockpitProjects = [
  {
    _id: 'chat-pinned-project',
    name: 'Pinned chat review project',
    description: 'Project used only to hydrate Chat UI review context.',
    isPinned: true,
    archived: false,
    currentFocusTaskId: 'chat-focus-task',
    updatedAt: '2026-05-04T09:00:00.000Z'
  },
  {
    _id: 'chat-secondary-project',
    name: 'Secondary active project',
    description: 'Adds count coverage for cockpit context.',
    isPinned: false,
    archived: false,
    currentFocusTaskId: null,
    updatedAt: '2026-05-04T08:45:00.000Z'
  },
  {
    _id: 'chat-archived-project',
    name: 'Archived chat project',
    description: 'Excluded from active cockpit counts.',
    isPinned: false,
    archived: true,
    currentFocusTaskId: null,
    updatedAt: '2026-05-03T17:30:00.000Z'
  }
]

export const cockpitTasks = [
  {
    _id: 'chat-focus-task',
    title: 'Confirm mocked chat hydration context',
    archived: false,
    status: 'active',
    completed: false,
    updatedAt: '2026-05-04T09:05:00.000Z'
  },
  {
    _id: 'chat-active-task',
    title: 'Keep chat review browser-only',
    archived: false,
    status: 'active',
    completed: false,
    updatedAt: '2026-05-04T08:50:00.000Z'
  },
  {
    _id: 'chat-completed-task',
    title: 'Completed task excluded from active count',
    archived: false,
    status: 'completed',
    completed: true,
    updatedAt: '2026-05-04T08:30:00.000Z'
  },
  {
    _id: 'chat-archived-task',
    title: 'Archived task excluded from active count',
    archived: true,
    status: 'active',
    completed: false,
    updatedAt: '2026-05-03T17:00:00.000Z'
  }
]

export const assistantMarkdownReply = [
  '### Mocked focus pass',
  '',
  'Keep the reply **structured** and safe.',
  '',
  '- Preserve user intent',
  '- Render markdown visibly'
].join('\n')
