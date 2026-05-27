import { z } from 'zod';

const DEFAULT_CORE_URL = 'http://127.0.0.1:8765';
const DEFAULT_TIMEOUT_MS = 15000;

const coreMessageSchema = z.object({
  role: z.enum(['assistant']),
  content: z.string()
}).strict();

const coreTraceSchema = z.object({
  trace_id: z.string(),
  debug_available: z.boolean().optional()
}).strict();

const coreTurnResponseSchema = z.object({
  turn_id: z.string(),
  response: coreMessageSchema,
  trace: coreTraceSchema,
  debug: z.unknown().optional().nullable()
}).strict();

export type SayachanCoreConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type SayachanCoreTurnRequest = {
  host: {
    host_id: 'saya-desk';
    surface: string;
    host_user_id?: string;
    locale?: string;
    timezone?: string;
    authorized_context?: Record<string, unknown>;
  };
  input: {
    text: string;
  };
  conversation?: {
    conversation_id?: string;
    recent_messages?: SayachanCoreConversationMessage[];
  };
  options?: {
    debug?: boolean;
    stream?: false;
  };
};

export type SayachanCoreTurnResponse = z.infer<typeof coreTurnResponseSchema>;

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

async function fetchWithTimeout(url: string, init: RequestInit, timeoutMs: number): Promise<Response> {
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

export async function postSayachanCoreTurn(
  request: SayachanCoreTurnRequest
): Promise<SayachanCoreTurnResponse> {
  const coreUrl = configuredCoreUrl();
  const response = await fetchWithTimeout(`${coreUrl}/v1/turns`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(request)
  }, configuredTimeoutMs());

  if (!response.ok) {
    throw new Error(`Sayachan Core request failed with status ${response.status}`);
  }

  const parsed = coreTurnResponseSchema.safeParse(await response.json());
  if (!parsed.success) {
    throw new Error('Sayachan Core returned an invalid turn response');
  }

  return parsed.data;
}

export const __test__ = {
  configuredCoreUrl,
  configuredTimeoutMs,
  coreTurnResponseSchema
};

export default {
  postSayachanCoreTurn,
  __test__
};
