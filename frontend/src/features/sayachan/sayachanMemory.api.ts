import {
  sayaDeskSayachanListMemoryRecordsResultSchema
} from '@sayachan/contracts'
import type {
  SayaDeskSayachanListMemoryRecordsResultDto
} from '@sayachan/contracts'
import { apiFetch, API_BASE } from '../../services/apiClient'
import { parseApiJsonResponse } from '../../services/apiResponse'

export async function fetchSayachanMemoryRecords(): Promise<SayaDeskSayachanListMemoryRecordsResultDto> {
  const response = await apiFetch(`${API_BASE}/sayachan/memory/records`)
  return parseApiJsonResponse<SayaDeskSayachanListMemoryRecordsResultDto>(
    response,
    'Fetch Sayachan memory records failed',
    sayaDeskSayachanListMemoryRecordsResultSchema,
    'sayachan memory records'
  )
}
