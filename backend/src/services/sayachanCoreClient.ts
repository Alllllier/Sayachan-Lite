import {
  sayaDeskSayachanAdvanceTurnRequestSchema,
  sayaDeskSayachanTurnAdvanceResultSchema,
  type SayaDeskSayachanAdvanceTurnRequestDto,
  type SayaDeskSayachanTurnAdvanceResultDto
} from '@sayachan/contracts';
import { z } from 'zod';

const DEFAULT_CORE_URL = 'http://127.0.0.1:8765';
const DEFAULT_TIMEOUT_MS = 60000;

export type SayachanCoreConversationMessage = {
  role: 'user' | 'assistant';
  content: string;
};

export type SayachanCoreAdvanceTurnRequest = SayaDeskSayachanAdvanceTurnRequestDto;
export type SayachanCoreTurnAdvanceResult = SayaDeskSayachanTurnAdvanceResultDto;
const coreTurnAdvanceStreamEventSchema = z.discriminatedUnion('type', [
  z.object({
    packetType: z.literal('sayachan_turn_advance_stream_event').optional(),
    version: z.literal(1).optional(),
    type: z.literal('assistant_delta'),
    delta: z.string(),
    text: z.string()
  }).strict(),
  z.object({
    packetType: z.literal('sayachan_turn_advance_stream_event').optional(),
    version: z.literal(1).optional(),
    type: z.literal('tool_call_started'),
    itemId: z.string().min(1),
    outputIndex: z.number().int().nonnegative(),
    providerToolName: z.string().min(1).optional(),
    providerCallId: z.string().min(1).optional()
  }).strict(),
  z.object({
    packetType: z.literal('sayachan_turn_advance_stream_event').optional(),
    version: z.literal(1).optional(),
    type: z.literal('completed'),
    result: sayaDeskSayachanTurnAdvanceResultSchema
  }).strict(),
  z.object({
    packetType: z.literal('sayachan_turn_advance_stream_event').optional(),
    version: z.literal(1).optional(),
    type: z.literal('error'),
    error: z.object({
      code: z.string().min(1),
      message: z.string().min(1)
    }).strict()
  }).strict()
]);
export type SayachanCoreTurnAdvanceStreamEvent = z.infer<typeof coreTurnAdvanceStreamEventSchema>;
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

function parseSseBlock(block: string): SayachanCoreTurnAdvanceStreamEvent | null {
  const dataLines = block
    .split('\n')
    .filter(line => line.startsWith('data: '))
    .map(line => line.slice('data: '.length));

  if (dataLines.length === 0) {
    return null;
  }

  return coreTurnAdvanceStreamEventSchema.parse(JSON.parse(dataLines.join('\n')));
}

export async function* postSayachanCoreTurnAdvanceStream(
  request: SayachanCoreAdvanceTurnRequest
): AsyncIterable<SayachanCoreTurnAdvanceStreamEvent> {
  const normalizedRequest = sayaDeskSayachanAdvanceTurnRequestSchema.parse(request);
  const coreUrl = configuredCoreUrl();
  const response = await fetchWithTimeout(`${coreUrl}/v2/advance/stream`, {
    method: 'POST',
    headers: {
      Accept: 'text/event-stream',
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(normalizedRequest)
  }, configuredTimeoutMs());

  if (!response.ok) {
    throw new Error(`Sayachan Core advance stream request failed with status ${response.status}`);
  }

  if (!response.body) {
    throw new Error('Sayachan Core advance stream response did not include a readable body');
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
  sayaDeskSayachanTurnAdvanceResultSchema,
  coreTurnAdvanceStreamEventSchema
};

export default {
  postSayachanCoreTurnAdvance,
  postSayachanCoreTurnAdvanceStream,
  __test__
};
