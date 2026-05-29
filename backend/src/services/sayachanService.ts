import {
  type SayaDeskSayachanFocusDto,
  type SayaDeskSayachanDebugTraceDto,
  type SayaDeskSayachanResponseDto,
  type SayaDeskSayachanStreamEventDto,
  type SayaDeskSayachanTurnActivityItemDto,
  type SayaDeskSayachanTurnActivityDto,
  type SayaDeskSayachanRequestDto,
  sayaDeskSayachanResponseSchema,
  sayaDeskSayachanStreamEventSchema
} from '@sayachan/contracts';
import mongoose from 'mongoose';
import { BadRequestError, HttpError } from '../http/httpErrors.js';
import { type ObjectId } from '../domain/objectIds.js';
import {
  appendAssistantMessage,
  preparePersistentTextTurn
} from './chatPersistenceService.js';
import {
  buildSayaDeskFocusSnapshot,
  buildSayaDeskHostCapabilityManifest,
  type SayaDeskAuthorizedFocusSnapshot,
  type SayaDeskHostCapabilityManifest
} from './sayachanHostContextService.js';
import {
  postSayachanCoreTurn,
  postSayachanCoreTurnStream,
  type SayachanCoreConversationMessage,
  type SayachanCoreTurnRequest,
  type SayachanCoreTurnResponse,
  type SayachanCoreTurnStreamEvent
} from './sayachanCoreClient.js';

type SayachanCoreTurnRunner = typeof postSayachanCoreTurn;
type SayachanCoreTurnStreamRunner = typeof postSayachanCoreTurnStream;
type SayachanCoreTurnActivityItem = NonNullable<NonNullable<SayachanCoreTurnResponse['turn_activity']>['items']>[number];
type FocusSnapshotBuilder = (
  focus: SayaDeskSayachanFocusDto | null | undefined,
  userId: ObjectId | null | undefined
) => Promise<SayaDeskAuthorizedFocusSnapshot | null>;
type HostCapabilityManifestBuilder = () => SayaDeskHostCapabilityManifest;
type ChatPersistenceAvailabilityCheck = () => boolean;
type UnknownRecord = Record<string, unknown>;
type SayachanExecutionOptions = {
  userId?: ObjectId | null;
  userRole?: string | null;
  hostToolSessionToken?: string | null;
};
type PreparedPersistentTurn = Awaited<ReturnType<typeof preparePersistentTextTurn>>;

let runCoreTurn: SayachanCoreTurnRunner = postSayachanCoreTurn;
let runCoreTurnStream: SayachanCoreTurnStreamRunner = postSayachanCoreTurnStream;
let focusSnapshotBuilder: FocusSnapshotBuilder = buildSayaDeskFocusSnapshot;
let hostCapabilityManifestBuilder: HostCapabilityManifestBuilder = buildSayaDeskHostCapabilityManifest;
let chatPersistenceAvailabilityCheck: ChatPersistenceAvailabilityCheck = defaultChatPersistenceAvailabilityCheck;

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}

function canReturnDebugTrace(options: SayachanExecutionOptions): boolean {
  return options.userRole === 'owner' || options.userRole === 'tester';
}

function defaultChatPersistenceAvailabilityCheck(): boolean {
  return Number(mongoose.connection.readyState) === 1;
}

function configuredHostToolEndpoint(): string {
  const explicit = process.env.SAYACHAN_HOST_TOOL_URL?.trim();
  if (explicit) {
    return explicit;
  }

  const defaultPort = process.env.PORT || '3001';
  const baseUrl = (
    process.env.SAYACHAN_BACKEND_INTERNAL_URL || `http://127.0.0.1:${defaultPort}`
  ).replace(/\/+$/, '');
  return `${baseUrl}/sayachan/tools/execute`;
}

async function buildAuthorizedContext(
  request: SayaDeskSayachanRequestDto,
  options: SayachanExecutionOptions
): Promise<Record<string, unknown> | undefined> {
  const focusSnapshot = await focusSnapshotBuilder(request.focus, options.userId);
  const authorizedContext: Record<string, unknown> = {
    host_capabilities: hostCapabilityManifestBuilder()
  };

  if (focusSnapshot) {
    authorizedContext.focus = focusSnapshot;
  }

  if (options.userId && options.hostToolSessionToken) {
    authorizedContext.host_tool_channel = {
      packetType: 'saya_desk_host_tool_channel',
      version: 1,
      endpoint: configuredHostToolEndpoint(),
      authorization: {
        type: 'bearer',
        token: options.hostToolSessionToken
      },
      source: 'saya_desk_route_session'
    };
  }

  return Object.keys(authorizedContext).length > 0 ? authorizedContext : undefined;
}

function latestUserText(request: SayaDeskSayachanRequestDto, preparedTurn: PreparedPersistentTurn): string {
  if (preparedTurn?.latestUserText) {
    return preparedTurn.latestUserText;
  }

  return request.text.trim();
}

function messagesForCore(
  request: SayaDeskSayachanRequestDto,
  preparedTurn: PreparedPersistentTurn
): SayachanCoreConversationMessage[] {
  if (!preparedTurn) {
    return [{ role: 'user', content: request.text.trim() }];
  }

  return preparedTurn.messages
    .filter((message): message is { role: 'user' | 'assistant'; content: string } => (
      (message.role === 'user' || message.role === 'assistant')
        && typeof message.content === 'string'
        && message.content.trim().length > 0
    ))
    .map((message) => ({ role: message.role, content: message.content }));
}

function recordId(value: unknown): string | undefined {
  if (!value || typeof value !== 'object' || !('_id' in value)) {
    return undefined;
  }
  const rawId = (value as { _id?: unknown })._id;
  if (typeof rawId === 'string') {
    return rawId;
  }
  if (rawId instanceof mongoose.Types.ObjectId) {
    return rawId.toHexString();
  }
  return undefined;
}

function coreRequest(
  request: SayaDeskSayachanRequestDto,
  preparedTurn: PreparedPersistentTurn,
  authorizedContext: Record<string, unknown> | undefined,
  options: SayachanExecutionOptions,
  stream = false
): SayachanCoreTurnRequest {
  const text = latestUserText(request, preparedTurn);
  if (!text) {
    throw new BadRequestError('Chat message is required', {
      code: 'MISSING_CHAT_MESSAGE',
      source: 'request.body.messages'
    });
  }

  return {
    host: {
      host_id: 'saya-desk',
      surface: request.surface,
      ...(options.userId ? { host_user_id: options.userId.toHexString() } : {}),
      ...(authorizedContext ? { authorized_context: authorizedContext } : {})
    },
    input: { text },
    conversation: {
      conversation_id: request.conversationId || (preparedTurn ? recordId(preparedTurn.conversation) : undefined),
      recent_messages: messagesForCore(request, preparedTurn)
    },
    options: {
      debug: request.options?.debug === true && canReturnDebugTrace(options),
      stream
    }
  };
}

function projectTurnActivityItem(item: SayachanCoreTurnActivityItem): SayaDeskSayachanTurnActivityItemDto {
  return {
    itemId: item.item_id,
    kind: item.kind,
    status: item.status,
    text: item.text,
    display: item.display,
    canonicalMessage: item.canonical_message,
    ...(item.capability ? { capability: item.capability } : {}),
    sourceTrace: item.source_trace
  };
}

function projectTurnActivity(coreResponse: SayachanCoreTurnResponse): SayaDeskSayachanTurnActivityDto | undefined {
  const activity = coreResponse.turn_activity;
  if (!activity || activity.items.length === 0) {
    return undefined;
  }

  return {
    defaultCollapsed: activity.default_collapsed,
    items: activity.items.map(projectTurnActivityItem)
  };
}

function asRecord(value: unknown): UnknownRecord | null {
  return value && typeof value === 'object' && !Array.isArray(value)
    ? value as UnknownRecord
    : null;
}

function debugString(value: unknown, fallback = ''): string {
  return typeof value === 'string' ? value : fallback;
}

function debugNullableString(value: unknown): string | null | undefined {
  if (value === null) return null;
  if (typeof value === 'string') return value;
  return undefined;
}

function debugNumber(value: unknown): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0;
}

function debugStringArray(value: unknown): string[] {
  return Array.isArray(value)
    ? value.filter((item): item is string => typeof item === 'string')
    : [];
}

function debugStatus(value: unknown): 'completed' | 'skipped' | 'failed' {
  return value === 'skipped' || value === 'failed' ? value : 'completed';
}

function projectConfidenceSignal(value: unknown): SayaDeskSayachanDebugTraceDto['semantics']['taskShape'] {
  const raw = asRecord(value);
  return {
    value: debugString(raw?.value, 'unknown'),
    confidence: debugNumber(raw?.confidence),
    reason: debugString(raw?.reason)
  };
}

function projectBooleanSignal(value: unknown): SayaDeskSayachanDebugTraceDto['semantics']['vulnerabilitySignal'] {
  const raw = asRecord(value);
  return {
    active: raw?.active === true,
    confidence: debugNumber(raw?.confidence),
    reason: debugString(raw?.reason)
  };
}

function projectStateTriggers(value: unknown): SayaDeskSayachanDebugTraceDto['semantics']['stateTriggers'] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(item => {
    const raw = asRecord(item);
    return {
      name: debugString(raw?.name, 'unknown'),
      target: debugString(raw?.target, 'unknown'),
      confidence: debugNumber(raw?.confidence),
      reason: debugString(raw?.reason)
    };
  });
}

function projectSemantics(value: unknown): SayaDeskSayachanDebugTraceDto['semantics'] | null {
  const raw = asRecord(value);
  if (!raw) {
    return null;
  }

  return {
    taskShape: projectConfidenceSignal(raw.task_shape),
    productContextNeed: projectConfidenceSignal(raw.product_context_need),
    vulnerabilitySignal: projectBooleanSignal(raw.vulnerability_signal),
    repairNeed: projectBooleanSignal(raw.repair_need),
    faceSavingNeed: projectBooleanSignal(raw.face_saving_need),
    edgeSuitability: projectConfidenceSignal(raw.edge_suitability),
    stateTriggers: projectStateTriggers(raw.state_triggers)
  };
}

function projectTraceSignals(value: unknown): SayaDeskSayachanDebugTraceDto['judgmentSignals'] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(item => {
    const raw = asRecord(item);
    return {
      name: debugString(raw?.name, 'unknown'),
      value: debugString(raw?.value, 'unknown'),
      confidence: debugNumber(raw?.confidence),
      reason: debugString(raw?.reason)
    };
  });
}

function projectStageSummaries(value: unknown): SayaDeskSayachanDebugTraceDto['stageSummaries'] {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.map(item => {
    const raw = asRecord(item);
    return {
      stageName: debugString(raw?.stage_name, 'unknown'),
      status: debugStatus(raw?.status),
      notes: debugStringArray(raw?.notes),
      sourceTrace: debugStringArray(raw?.source_trace)
    };
  });
}

function projectResponsePlan(value: unknown): SayaDeskSayachanDebugTraceDto['responsePlan'] {
  const raw = asRecord(value);
  if (!raw) {
    return undefined;
  }

  return {
    selectedTurnShape: debugString(raw.selected_turn_shape, 'unknown'),
    interactionPosture: debugString(raw.interaction_posture, 'unknown'),
    contextUse: debugString(raw.context_use, 'unknown'),
    stateAttention: debugStringArray(raw.state_attention),
    voicePressure: debugString(raw.voice_pressure, 'unknown'),
    providerFocus: debugString(raw.provider_focus, 'unknown'),
    reasonCodes: debugStringArray(raw.reason_codes),
    sourceTrace: debugStringArray(raw.source_trace)
  };
}

function projectInternalCandidateSummary(value: unknown): SayaDeskSayachanDebugTraceDto['internalCandidateSummary'] {
  const raw = asRecord(value);
  return {
    statePatchCandidateCount: debugNumber(raw?.state_patch_candidate_count),
    memoryCandidateCount: debugNumber(raw?.memory_candidate_count),
    toolStepProposalCount: debugNumber(raw?.tool_step_proposal_count),
    agentStepCount: debugNumber(raw?.agent_step_count),
    toolIntentCandidateCount: debugNumber(raw?.tool_intent_candidate_count),
    hostToolResultCount: debugNumber(raw?.host_tool_result_count),
    toolResultCardCount: debugNumber(raw?.tool_result_card_count),
    turnActivityItemCount: debugNumber(raw?.turn_activity_item_count),
    statePatchTargets: debugStringArray(raw?.state_patch_targets),
    memoryCandidateKinds: debugStringArray(raw?.memory_candidate_kinds),
    toolStepProposalKinds: debugStringArray(raw?.tool_step_proposal_kinds),
    toolStepProposalStatuses: debugStringArray(raw?.tool_step_proposal_statuses),
    agentStepKinds: debugStringArray(raw?.agent_step_kinds),
    agentStepStatuses: debugStringArray(raw?.agent_step_statuses),
    toolIntentCapabilities: debugStringArray(raw?.tool_intent_capabilities),
    hostToolResultStatuses: debugStringArray(raw?.host_tool_result_statuses),
    toolResultCardStatuses: debugStringArray(raw?.tool_result_card_statuses),
    turnActivityKinds: debugStringArray(raw?.turn_activity_kinds)
  };
}

function projectDebugTrace(coreResponse: SayachanCoreTurnResponse): SayaDeskSayachanDebugTraceDto | undefined {
  const raw = asRecord(coreResponse.debug);
  if (!raw) {
    return undefined;
  }

  const semantics = projectSemantics(raw.semantics);
  if (!semantics) {
    return undefined;
  }

  return {
    runtime: debugString(raw.runtime, 'unknown'),
    provider: debugString(raw.provider, 'unknown'),
    providerModel: debugString(raw.provider_model, 'unknown'),
    providerResponseId: debugNullableString(raw.provider_response_id),
    semantics,
    judgmentSignals: projectTraceSignals(raw.judgment_signals),
    stageSummaries: projectStageSummaries(raw.stage_summaries),
    resolverNotes: debugStringArray(raw.resolver_notes),
    responsePlan: projectResponsePlan(raw.response_plan),
    sourceTrace: debugStringArray(raw.source_trace),
    internalCandidateSummary: projectInternalCandidateSummary(raw.internal_candidate_summary)
  };
}

async function persistAssistantReply(
  preparedTurn: PreparedPersistentTurn,
  coreResponse: SayachanCoreTurnResponse,
  options: SayachanExecutionOptions
): Promise<void> {
  if (!preparedTurn || !options.userId) {
    return;
  }

  try {
    await appendAssistantMessage(preparedTurn, coreResponse.response.content, {}, { userId: options.userId });
  } catch (error) {
    console.error('[Sayachan Route] Chat persistence assistant append failed:', errorMessage(error));
  }
}

export async function chat(request: SayaDeskSayachanRequestDto, options: SayachanExecutionOptions = {}): Promise<SayaDeskSayachanResponseDto> {
  const preparedTurn = options.userId && chatPersistenceAvailabilityCheck()
    ? await preparePersistentTextTurn({ text: request.text }, { userId: options.userId })
    : null;
  const authorizedContext = await buildAuthorizedContext(request, options);
  const turnRequest = coreRequest(request, preparedTurn, authorizedContext, options);

  try {
    const coreResponse = await runCoreTurn(turnRequest);
    const parsed = sayaDeskSayachanResponseSchema.parse({
      reply: coreResponse.response.content,
      turnId: coreResponse.turn_id,
      turnActivity: projectTurnActivity(coreResponse),
      trace: {
        traceId: coreResponse.trace.trace_id,
        debugAvailable: coreResponse.trace.debug_available
      },
      debugTrace: projectDebugTrace(coreResponse)
    });
    await persistAssistantReply(preparedTurn, coreResponse, options);
    return parsed;
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }

    console.error('[Sayachan Route] Core turn failed:', errorMessage(error));
    throw new HttpError(502, 'Sayachan Core request failed', {
      code: 'SAYACHAN_CORE_REQUEST_FAILED'
    });
  }
}

function coreCompletedEventResponse(event: Extract<SayachanCoreTurnStreamEvent, { type: 'completed' }>): SayachanCoreTurnResponse {
  return {
    turn_id: event.turn_id,
    response: event.response,
    turn_activity: event.turn_activity,
    trace: event.trace,
    debug: event.debug
  };
}

function projectStreamEvent(event: SayachanCoreTurnStreamEvent): SayaDeskSayachanStreamEventDto {
  if (event.type === 'assistant_progress' || event.type === 'tool_status' || event.type === 'capability_notice') {
    return sayaDeskSayachanStreamEventSchema.parse({
      packetType: 'saya_desk_sayachan_stream_event',
      version: 1,
      type: event.type,
      item: projectTurnActivityItem(event.item)
    });
  }

  if (event.type === 'assistant_delta') {
    return sayaDeskSayachanStreamEventSchema.parse({
      packetType: 'saya_desk_sayachan_stream_event',
      version: 1,
      type: 'assistant_delta',
      delta: event.delta,
      text: event.text
    });
  }

  if (event.type === 'completed') {
    const coreResponse = coreCompletedEventResponse(event);
    return sayaDeskSayachanStreamEventSchema.parse({
      packetType: 'saya_desk_sayachan_stream_event',
      version: 1,
      type: 'completed',
      reply: coreResponse.response.content,
      turnId: coreResponse.turn_id,
      turnActivity: projectTurnActivity(coreResponse),
      trace: {
        traceId: coreResponse.trace.trace_id,
        debugAvailable: coreResponse.trace.debug_available
      },
      debugTrace: projectDebugTrace(coreResponse)
    });
  }

  if (event.type === 'error') {
    return sayaDeskSayachanStreamEventSchema.parse({
      packetType: 'saya_desk_sayachan_stream_event',
      version: 1,
      type: 'error',
      error: {
        code: event.error.code || 'SAYACHAN_CORE_STREAM_ERROR',
        message: event.error.message || 'Sayachan Core stream failed'
      }
    });
  }

  return sayaDeskSayachanStreamEventSchema.parse({
    packetType: 'saya_desk_sayachan_stream_event',
    version: 1,
    type: 'error',
    error: {
      code: 'SAYACHAN_CORE_STREAM_ERROR',
      message: 'Sayachan Core stream failed'
    }
  });
}

export async function* chatStream(request: SayaDeskSayachanRequestDto, options: SayachanExecutionOptions = {}): AsyncIterable<SayaDeskSayachanStreamEventDto> {
  const preparedTurn = options.userId && chatPersistenceAvailabilityCheck()
    ? await preparePersistentTextTurn({ text: request.text }, { userId: options.userId })
    : null;
  const authorizedContext = await buildAuthorizedContext(request, options);
  const turnRequest = coreRequest(request, preparedTurn, authorizedContext, options, true);

  try {
    for await (const event of runCoreTurnStream(turnRequest)) {
      const projected = projectStreamEvent(event);
      if (projected.type === 'completed') {
        await persistAssistantReply(preparedTurn, coreCompletedEventResponse(event as Extract<SayachanCoreTurnStreamEvent, { type: 'completed' }>), options);
      }
      yield projected;
    }
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }

    console.error('[Sayachan Route] Core stream failed:', errorMessage(error));
    yield sayaDeskSayachanStreamEventSchema.parse({
      packetType: 'saya_desk_sayachan_stream_event',
      version: 1,
      type: 'error',
      error: {
        code: 'SAYACHAN_CORE_STREAM_FAILED',
        message: 'Sayachan Core stream failed'
      }
    });
  }
}

export const __test__ = {
  setCoreTurnRunnerForTest(runner: SayachanCoreTurnRunner) {
    const previous = runCoreTurn;
    runCoreTurn = runner;
    return () => {
      runCoreTurn = previous;
    };
  },
  setCoreTurnStreamRunnerForTest(runner: SayachanCoreTurnStreamRunner) {
    const previous = runCoreTurnStream;
    runCoreTurnStream = runner;
    return () => {
      runCoreTurnStream = previous;
    };
  },
  setFocusSnapshotBuilderForTest(builder: FocusSnapshotBuilder) {
    const previous = focusSnapshotBuilder;
    focusSnapshotBuilder = builder;
    return () => {
      focusSnapshotBuilder = previous;
    };
  },
  setHostCapabilityManifestBuilderForTest(builder: HostCapabilityManifestBuilder) {
    const previous = hostCapabilityManifestBuilder;
    hostCapabilityManifestBuilder = builder;
    return () => {
      hostCapabilityManifestBuilder = previous;
    };
  },
  setChatPersistenceAvailabilityCheckForTest(check: ChatPersistenceAvailabilityCheck) {
    const previous = chatPersistenceAvailabilityCheck;
    chatPersistenceAvailabilityCheck = check;
    return () => {
      chatPersistenceAvailabilityCheck = previous;
    };
  },
  configuredHostToolEndpoint
};

export default {
  chat,
  chatStream,
  __test__
};
