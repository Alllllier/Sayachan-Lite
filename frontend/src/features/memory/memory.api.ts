import {
  memoryEntryListResponseSchema,
  memoryEntryResponseSchema
} from '@sayachan/contracts'
import type {
  MemoryEntryCreateDto,
  MemoryEntryDto,
  MemoryEntryUpdateDto
} from '@sayachan/contracts'
import { apiFetch, API_BASE } from '../../services/apiClient'
import { parseApiJsonResponse } from '../../services/apiResponse'

export async function fetchMemoryEntries(): Promise<MemoryEntryDto[]> {
  const response = await apiFetch(`${API_BASE}/memory`)
  return parseApiJsonResponse<MemoryEntryDto[]>(response, 'Fetch memory failed', memoryEntryListResponseSchema, 'memory list')
}

export async function createMemoryEntry(entry: MemoryEntryCreateDto): Promise<MemoryEntryDto> {
  const response = await apiFetch(`${API_BASE}/memory`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  })
  return parseApiJsonResponse<MemoryEntryDto>(response, 'Create memory failed', memoryEntryResponseSchema, 'memory entry')
}

export async function updateMemoryEntry(entryId: string, entry: MemoryEntryUpdateDto): Promise<MemoryEntryDto> {
  const response = await apiFetch(`${API_BASE}/memory/${entryId}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(entry)
  })
  return parseApiJsonResponse<MemoryEntryDto>(response, 'Update memory failed', memoryEntryResponseSchema, 'memory entry')
}

export async function activateMemoryEntry(entryId: string): Promise<MemoryEntryDto> {
  const response = await apiFetch(`${API_BASE}/memory/${entryId}/activate`, { method: 'PUT' })
  return parseApiJsonResponse<MemoryEntryDto>(response, 'Activate memory failed', memoryEntryResponseSchema, 'memory entry')
}

export async function deactivateMemoryEntry(entryId: string): Promise<MemoryEntryDto> {
  const response = await apiFetch(`${API_BASE}/memory/${entryId}/deactivate`, { method: 'PUT' })
  return parseApiJsonResponse<MemoryEntryDto>(response, 'Deactivate memory failed', memoryEntryResponseSchema, 'memory entry')
}

export async function deleteMemoryEntry(entryId: string): Promise<void> {
  const response = await apiFetch(`${API_BASE}/memory/${entryId}`, { method: 'DELETE' })
  if (!response.ok) {
    throw new Error(`Delete memory failed: ${response.status}`)
  }
}
