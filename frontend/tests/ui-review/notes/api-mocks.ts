import { activeNotes, aiDrafts, archivedNotes } from './fixtures.js'
import type { Page } from '@playwright/test'

type ReviewNote = {
  _id: string
  title: string
  content: string
  isPinned: boolean
  archived: boolean
  updatedAt: string
}

function json(data: unknown, status = 200) {
  return {
    status,
    contentType: 'application/json',
    body: JSON.stringify(data)
  }
}

function sortNotes(notes: ReviewNote[]): ReviewNote[] {
  return notes.sort((a, b) => {
    if (a.isPinned !== b.isPinned) return b.isPinned ? 1 : -1
    return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
  })
}

function createNotesStore(): Map<string, ReviewNote> {
  return new Map([
    ...activeNotes.map(note => [note._id, { ...note }] as const),
    ...archivedNotes.map(note => [note._id, { ...note }] as const)
  ])
}

export async function installNotesReviewApiMocks(page: Page): Promise<void> {
  const notesById = createNotesStore()

  await page.route('http://localhost:3001/**', async route => {
    const request = route.request()
    const url = new URL(request.url())
    const method = request.method()
    const pathname = url.pathname

    if (method === 'GET' && pathname === '/auth/me') {
      await route.fulfill(json({ _id: 'review-tester', email: 'review-tester@example.com', role: 'tester' }))
      return
    }

    if (method === 'GET' && pathname === '/projects') {
      await route.fulfill(json([]))
      return
    }

    if (method === 'GET' && pathname === '/tasks') {
      await route.fulfill(json([]))
      return
    }

    if (method === 'POST' && pathname === '/tasks') {
      const task = request.postDataJSON() as Record<string, string | null>
      await route.fulfill(json({
        _id: 'task-from-note-draft',
        title: task.title,
        creationMode: task.creationMode,
        originModule: task.originModule,
        originId: task.originId,
        archived: false,
        status: 'active',
        completed: false,
        updatedAt: '2026-05-03T09:10:00.000Z'
      }, 201))
      return
    }

    if (method === 'GET' && pathname === '/notes') {
      const archived = url.searchParams.get('archived') === 'true'
      const notes = sortNotes(
        [...notesById.values()].filter(note => Boolean(note.archived) === archived)
      )
      await route.fulfill(json(notes))
      return
    }

    if (method === 'POST' && pathname === '/notes') {
      const note = request.postDataJSON() as Pick<ReviewNote, 'title' | 'content'>
      const saved = {
        _id: 'note-created',
        title: note.title,
        content: note.content,
        isPinned: false,
        archived: false,
        updatedAt: '2026-05-03T09:05:00.000Z'
      }
      notesById.set(saved._id, saved)
      await route.fulfill(json(saved, 201))
      return
    }

    if (method === 'POST' && pathname === '/ai/notes/tasks') {
      await route.fulfill(json({ drafts: aiDrafts }))
      return
    }

    const noteMatch = pathname.match(/^\/notes\/([^/]+)(?:\/(archive|restore|pin|unpin))?$/)
    if (!noteMatch) {
      await route.fulfill(json({ error: `unmocked ${method} ${pathname}` }, 500))
      return
    }

    const [, noteId, action] = noteMatch
    const note = notesById.get(noteId)
    if (!note) {
      await route.fulfill(json({ error: 'not found' }, 404))
      return
    }

    if (method === 'PUT' && !action) {
      const updates = request.postDataJSON() as Pick<ReviewNote, 'title' | 'content'>
      const updated = {
        ...note,
        title: updates.title,
        content: updates.content,
        updatedAt: '2026-05-03T09:06:00.000Z'
      }
      notesById.set(noteId, updated)
      await route.fulfill(json(updated))
      return
    }

    if (method === 'DELETE' && !action) {
      notesById.delete(noteId)
      await route.fulfill(json({ ok: true }))
      return
    }

    if (method === 'PUT' && action) {
      const updated = {
        ...note,
        archived: action === 'archive' ? true : action === 'restore' ? false : note.archived,
        isPinned: action === 'pin' ? true : action === 'unpin' ? false : note.isPinned,
        updatedAt: '2026-05-03T09:07:00.000Z'
      }
      notesById.set(noteId, updated)
      await route.fulfill(json(updated))
      return
    }

    await route.fulfill(json({ error: `unmocked ${method} ${pathname}` }, 500))
  })
}
