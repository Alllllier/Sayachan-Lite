export const activeNotes = [
  {
    _id: 'note-pinned',
    title: 'Pinned planning note',
    content: 'This pinned note should stay at the top of the active review list.',
    isPinned: true,
    archived: false,
    updatedAt: '2026-05-03T09:00:00.000Z'
  },
  {
    _id: 'note-markdown',
    title: 'Markdown rendering review',
    content: [
      '# Markdown review',
      '',
      'This note has **bold emphasis**, *quiet emphasis*, and [a reference link](https://example.com).',
      '',
      '- first durable checklist item',
      '- second durable checklist item with a very long phrase that should wrap without breaking the card surface or pushing controls out of view',
      '',
      '```js',
      'const reviewState = "stable";',
      '```',
      '',
      'Long content paragraph. '.repeat(18)
    ].join('\n'),
    isPinned: false,
    archived: false,
    updatedAt: '2026-05-02T14:30:00.000Z'
  },
  {
    _id: 'note-drafts',
    title: 'AI draft source note',
    content: 'Turn this into task drafts with enough length to verify wrapping inside the revealed AI task panel.',
    isPinned: false,
    archived: false,
    updatedAt: '2026-05-01T11:15:00.000Z'
  }
]

export const archivedNotes = [
  {
    _id: 'note-archived',
    title: 'Archived review note',
    content: 'Archived notes should expose Restore and Delete actions only.',
    isPinned: false,
    archived: true,
    updatedAt: '2026-04-28T08:45:00.000Z'
  }
]

export const aiDrafts = [
  'Write the UI review report entry with exact mocked states and artifact paths so PMO can review without opening the backend.',
  'Check the long wrapping behavior in the AI draft panel and save this generated draft as a task from the note.'
]
