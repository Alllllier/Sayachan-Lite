import { describe, expect, it } from 'vitest'

import { buildTaskPayload, normalizeSavedTask } from './task.rules.js'

describe('task rules', () => {
  it('builds canonical task payloads with semantic fields only', () => {
    const payload = buildTaskPayload('Write docs', 'ai', 'note', 'note-1')

    expect(payload).toEqual({
      title: 'Write docs',
      creationMode: 'ai',
      originModule: 'note',
      originId: 'note-1'
    })
  })

  it('normalizes saved tasks to active and incomplete when backend omits fields', () => {
    const normalized = normalizeSavedTask({ _id: 'task-1', title: 'Draft task' })

    expect(normalized).toMatchObject({
      _id: 'task-1',
      title: 'Draft task',
      status: 'active',
      archived: false,
      completed: false
    })
  })

  it('derives completed truth from completed status when backend omits completed flag', () => {
    const normalized = normalizeSavedTask({
      _id: 'task-1',
      title: 'Finished task',
      status: 'completed'
    })

    expect(normalized).toMatchObject({
      _id: 'task-1',
      title: 'Finished task',
      status: 'completed',
      archived: false,
      completed: true
    })
  })
})
