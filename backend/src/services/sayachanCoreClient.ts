import {
  sayaDeskSayachanAdvanceTurnRequestSchema,
  sayaDeskSayachanTurnAdvanceResultSchema,
  type SayaDeskSayachanAdvanceTurnRequestDto,
  type SayaDeskSayachanTurnAdvanceResultDto
} from '@sayachan/contracts';

const DEFAULT_CORE_URL = 'http://127.0.0.1:8765';
const DEFAULT_TIMEOUT_MS = 60000;

export type SayachanCoreConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type SayachanCoreAdvanceTurnRequest = SayaDeskSayachanAdvanceTurnRequestDto;
export type SayachanCoreTurnAdvanceResult = SayaDeskSayachanTurnAdvanceResultDto;
type CoreFetchInit = NonNullable<Parameters<typeof fetch>[1]>;

function configuredCoreUrl(): string {
  return (process.env.SAYACHAN_CORE_URL || DEFAULT_CORE_URL).replace(/\/+$/, '');
}

function configuredTimeoutMs(): number {
  const value = Number(process.env.SAYACHAN_CORE_TIMEOUT_MS);
  if (!Number.isFinite(value) || value <= 0) {
    return DEFAULT_TIMEOUT_MS;
  }
  return Math.floor(value);
}

async function fetchWithTimeout(url: string, init: CoreFetchInit, timeoutMs: number): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), timeoutMs);

  try {
    return await fetch(url, {
      ...init,
      signal: controller.signal
    });
  } finally {
    clearTimeout(timeout);
  }
}

export async function postSayachanCoreTurnAdvance(
  request: SayachanCoreAdvanceTurnRequest
): Promise<SayachanCoreTurnAdvanceResult> {
  const normalizedRequest = sayaDeskSayachanAdvanceTurnRequestSchema.parse(request);
  const coreUrl = configuredCoreUrl();
  const response = await fetchWithTimeout(`${coreUrl}/v2/advance`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(normalizedRequest)
  }, configuredTimeoutMs());

  if (!response.ok) {
    throw new Error(`Sayachan Core advance request failed with status ${response.status}`);
  }

  const parsed = sayaDeskSayachanTurnAdvanceResultSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error('Sayachan Core returned an invalid turn advance result');
  }

  return parsed.data;
}

export const __test__ = {
  configuredCoreUrl,
  configuredTimeoutMs,
  sayaDeskSayachanTurnAdvanceResultSchema
};

export default {
  postSayachanCoreTurnAdvance,
  __test__
};
