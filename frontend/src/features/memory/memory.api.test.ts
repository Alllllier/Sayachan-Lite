import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  activateMemoryEntry,
  createMemoryEntry,
  deactivateMemoryEntry,
  deleteMemoryEntry,
  fetchMemoryEntries,
  updateMemoryEntry
} from './memory.api.js'

function jsonResponse(body: unknown, ok = true, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status: ok ? status : status || 500,
    headers: { 'Content-Type': 'application/json' }
  })
}

function mockedFetch() {
  return vi.mocked(fetch)
}

const memoryDto = {
  _id: 'memory-1',
  type: 'preference',
  content: 'Use plain language first',
  active: true,
  source: 'manual',
  createdAt: '2026-05-21T00:00:00.000Z',
  updatedAt: '2026-05-21T00:00:00.000Z'
}

describe('memory api boundary', () => {
  beforeEach(() => {
    vi.stubGlobal('fetch', vi.fn())
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it('fetches memory entries from the owner/tester memory endpoint', async () => {
    mockedFetch().mockResolvedValueOnce(jsonResponse([memoryDto]))
    await expect(fetchMemoryEntries()).resolves.toEqual([memoryDto])
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/memory', { credentials: 'include' })
  })

  it('sends create and update payloads through memory endpoints', async () => {
    mockedFetch().mockResolvedValueOnce(jsonResponse(memoryDto, true, 201))
    await createMemoryEntry({
      type: 'preference',
      content: 'Use plain language first',
      source: 'assistant_suggested_user_approved'
    })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/memory', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'preference',
        content: 'Use plain language first',
        source: 'assistant_suggested_user_approved'
      })
    })

    mockedFetch().mockResolvedValueOnce(jsonResponse({ ...memoryDto, type: 'continuity_hint' }))
    await updateMemoryEntry('memory-1', { type: 'continuity_hint', content: 'Keep architecture tradeoffs visible' })
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/memory/memory-1', {
      method: 'PUT',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type: 'continuity_hint', content: 'Keep architecture tradeoffs visible' })
    })
  })

  it('routes memory activation and deletion through explicit endpoints', async () => {
    mockedFetch()
      .mockResolvedValueOnce(jsonResponse({ ...memoryDto, active: false }))
      .mockResolvedValueOnce(jsonResponse(memoryDto))
      .mockResolvedValueOnce({ ok: true } as Response)

    await deactivateMemoryEntry('memory-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/memory/memory-1/deactivate', { method: 'PUT', credentials: 'include' })

    await activateMemoryEntry('memory-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/memory/memory-1/activate', { method: 'PUT', credentials: 'include' })

    await deleteMemoryEntry('memory-1')
    expect(fetch).toHaveBeenLastCalledWith('http://localhost:3001/memory/memory-1', { method: 'DELETE', credentials: 'include' })
  })

  it('rejects malformed memory responses before settings consumes them', async () => {
    mockedFetch().mockResolvedValueOnce(jsonResponse([{ _id: 'memory-1', type: 'preference' }]))
    await expect(fetchMemoryEntries()).rejects.toThrow('Invalid memory list response')
  })
})
