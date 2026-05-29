import { z } from 'zod';

const DEFAULT_CORE_URL = 'http://127.0.0.1:8765';
const DEFAULT_TIMEOUT_MS = 60000;

const coreMessageSchema = z.object({
  role: z.enum(['assistant']),
  content: z.string()
}).strict();

const coreTraceSchema = z.object({
  trace_id: z.string(),
  debug_available: z.boolean().optional()
}).strict();

const coreTurnActivityItemSchema = z.object({
  item_id: z.string(),
  kind: z.enum([
    'assistant_progress',
    'tool_status',
    'capability_notice'
  ]),
  status: z.enum([
    'planned',
    'started',
    'completed',
    'skipped',
    'unavailable',
    'failed'
  ]),
  text: z.string(),
  display: z.enum(['collapse_item', 'inline_during_turn']),
  canonical_message: z.literal(false),
  capability: z.string().nullable().optional(),
  source_trace: z.array(z.string())
}).strict();

const coreTurnActivitySchema = z.object({
  default_collapsed: z.boolean(),
  items: z.array(coreTurnActivityItemSchema)
}).strict();

const coreTurnResponseSchema = z.object({
  turn_id: z.string(),
  response: coreMessageSchema,
  turn_activity: coreTurnActivitySchema.nullable().optional(),
  trace: coreTraceSchema,
  debug: z.unknown().optional().nullable()
}).strict();

const coreTurnStreamEventSchema = z.discriminatedUnion('type', [
  z.object({
    packetType: z.literal('sayachan_turn_stream_event').optional(),
    version: z.literal(1).optional(),
    type: z.enum([
      'assistant_progress',
      'tool_status',
      'capability_notice'
    ]),
    item: coreTurnActivityItemSchema
  }).strict(),
  z.object({
    packetType: z.literal('sayachan_turn_stream_event').optional(),
    version: z.literal(1).optional(),
    type: z.literal('assistant_delta'),
    delta: z.string(),
    text: z.string()
  }).strict(),
  z.object({
    packetType: z.literal('sayachan_turn_stream_event').optional(),
    version: z.literal(1).optional(),
    type: z.literal('completed'),
    turn_id: z.string(),
    response: coreMessageSchema,
    turn_activity: coreTurnActivitySchema.nullable().optional(),
    trace: coreTraceSchema,
    debug: z.unknown().optional().nullable()
  }).strict(),
  z.object({
    packetType: z.literal('sayachan_turn_stream_event').optional(),
    version: z.literal(1).optional(),
    type: z.literal('error'),
    error: z.object({
      code: z.string().optional(),
      message: z.string().optional(),
      path: z.array(z.union([z.string(), z.number()])).optional()
    }).strict()
  }).strict()
]);

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
    stream?: boolean;
  };
};

export type SayachanCoreTurnResponse = z.infer<typeof coreTurnResponseSchema>;
export type SayachanCoreTurnStreamEvent = z.infer<typeof coreTurnStreamEventSchema>;
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

function parseSseBlock(block: string): SayachanCoreTurnStreamEvent | null {
  const dataLines = block
    .split('\n')
    .filter(line => line.startsWith('data: '))
    .map(line => line.slice('data: '.length));

  if (dataLines.length === 0) {
    return null;
  }

  return coreTurnStreamEventSchema.parse(JSON.parse(dataLines.join('\n')));
}

export async function* postSayachanCoreTurnStream(
  request: SayachanCoreTurnRequest
): AsyncIterable<SayachanCoreTurnStreamEvent> {
  const coreUrl = configuredCoreUrl();
  const response = await fetchWithTimeout(`${coreUrl}/v1/turns/stream`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(request)
  }, configuredTimeoutMs());

  if (!response.ok) {
    throw new Error(`Sayachan Core stream request failed with status ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Sayachan Core stream response did not include a readable body');
  }

  const streamBody = response.body as ReadableStream<Uint8Array>;
  const reader = streamBody.getReader();
  const decoder = new TextDecoder();
  let buffer = '';

  while (true) {
    const chunk = await reader.read();
    const done = chunk.done;
    const value = chunk.value;
    buffer += decoder.decode(value, { stream: !done });
    const blocks = buffer.split('\n\n');
    buffer = blocks.pop() || '';

    for (const block of blocks) {
      const event = parseSseBlock(block.trim());
      if (event) {
        yield event;
      }
    }

    if (done) {
      break;
    }
  }
}

export const __test__ = {
  configuredCoreUrl,
  configuredTimeoutMs,
  coreTurnResponseSchema,
  coreTurnStreamEventSchema
};

export default {
  postSayachanCoreTurn,
  postSayachanCoreTurnStream,
  __test__
};
