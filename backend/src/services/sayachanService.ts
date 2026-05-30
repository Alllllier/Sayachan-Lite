import {
  type SayaDeskHostToolExecutionRequestDto,
  type SayaDeskHostToolExecutionResultDto,
  type SayaDeskSayachanAdvanceTurnRequestDto,
  type SayaDeskSayachanFocusDto,
  type SayaDeskSayachanResponseDto,
  type SayaDeskSayachanStreamEventDto,
  type SayaDeskSayachanToolOutputDto,
  type SayaDeskSayachanToolProposalDto,
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
  postSayachanCoreTurnAdvance,
  postSayachanCoreTurnAdvanceStream,
  type SayachanCoreAdvanceTurnRequest,
  type SayachanCoreConversationMessage,
  type SayachanCoreTurnAdvanceResult,
  type SayachanCoreTurnAdvanceStreamEvent
} from './sayachanCoreClient.js';
import { executeHostTool } from './sayachanHostToolService.js';

type SayachanCoreTurnAdvanceRunner = typeof postSayachanCoreTurnAdvance;
type SayachanCoreTurnAdvanceStreamRunner = typeof postSayachanCoreTurnAdvanceStream;
type FocusSnapshotBuilder = (
  focus: SayaDeskSayachanFocusDto | null | undefined,
  userId: ObjectId | null | undefined
) => Promise<SayaDeskAuthorizedFocusSnapshot | null>;
type HostCapabilityManifestBuilder = () => SayaDeskHostCapabilityManifest;
type ChatPersistenceAvailabilityCheck = () => boolean;
type SayachanExecutionOptions = {
  userId?: ObjectId | null;
  userRole?: string | null;
};
type PreparedPersistentTurn = Awaited<ReturnType<typeof preparePersistentTextTurn>>;

const MAX_ADVANCE_ITERATIONS = 8;

let runCoreTurnAdvance: SayachanCoreTurnAdvanceRunner = postSayachanCoreTurnAdvance;
let runCoreTurnAdvanceStream: SayachanCoreTurnAdvanceStreamRunner = postSayachanCoreTurnAdvanceStream;
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

async function buildAdvanceAuthorizedContext(
  request: SayaDeskSayachanRequestDto,
  options: SayachanExecutionOptions
): Promise<Record<string, unknown> | undefined> {
  const focusSnapshot = await focusSnapshotBuilder(request.focus, options.userId);
  return focusSnapshot ? { focus: focusSnapshot } : undefined;
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

function coreAdvanceStartRequest(
  request: SayaDeskSayachanRequestDto,
  preparedTurn: PreparedPersistentTurn,
  authorizedContext: Record<string, unknown> | undefined,
  options: SayachanExecutionOptions
): SayachanCoreAdvanceTurnRequest {
  const text = latestUserText(request, preparedTurn);
  if (!text) {
    throw new BadRequestError('Chat message is required', {
      code: 'MISSING_CHAT_MESSAGE',
      source: 'request.body.messages'
    });
  }

  return {
    host: {
      hostId: 'saya-desk',
      surface: request.surface,
      ...(options.userId ? { hostUserId: options.userId.toHexString() } : {}),
      authorizedContext: authorizedContext || {}
    },
    input: { text },
    conversation: {
      conversationId: request.conversationId || (preparedTurn ? recordId(preparedTurn.conversation) : undefined),
      recentMessages: messagesForCore(request, preparedTurn)
    },
    options: {
      debug: request.options?.debug === true && canReturnDebugTrace(options)
    },
    toolOutputs: [],
    hostToolManifest: hostCapabilityManifestBuilder()
  };
}

function activityStreamEvent(item: SayaDeskSayachanTurnActivityItemDto): SayaDeskSayachanStreamEventDto {
  return sayaDeskSayachanStreamEventSchema.parse({
    packetType: 'saya_desk_sayachan_stream_event',
    version: 1,
    type: item.kind,
    item
  });
}

function assistantDeltaStreamEvent(delta: string, text: string): SayaDeskSayachanStreamEventDto {
  return sayaDeskSayachanStreamEventSchema.parse({
    packetType: 'saya_desk_sayachan_stream_event',
    version: 1,
    type: 'assistant_delta',
    delta,
    text
  });
}

function completedStreamEvent(
  reply: string,
  coreResult: SayachanCoreTurnAdvanceResult,
  turnActivity?: SayaDeskSayachanTurnActivityDto
): SayaDeskSayachanStreamEventDto {
  return sayaDeskSayachanStreamEventSchema.parse({
    packetType: 'saya_desk_sayachan_stream_event',
    version: 1,
    type: 'completed',
    reply,
    turnId: coreResult.turnId,
    turnActivity,
    trace: projectAdvanceTrace(coreResult)
  });
}

function errorStreamEvent(code: string, message: string): SayaDeskSayachanStreamEventDto {
  return sayaDeskSayachanStreamEventSchema.parse({
    packetType: 'saya_desk_sayachan_stream_event',
    version: 1,
    type: 'error',
    error: { code, message }
  });
}

function projectAdvanceTrace(coreResult: SayachanCoreTurnAdvanceResult): SayaDeskSayachanResponseDto['trace'] {
  if (!coreResult.trace) {
    return undefined;
  }
  return {
    traceId: coreResult.trace.traceId,
    debugAvailable: coreResult.trace.debugAvailable
  };
}

function finalAdvanceText(coreResult: SayachanCoreTurnAdvanceResult): string {
  return coreResult.assistantOutput.find(output => output.kind === 'final_text')?.text
    || coreResult.assistantOutput.at(-1)?.text
    || '这次没有拿到可用回复。';
}

function activityStatusFromToolStatus(
  status: SayaDeskHostToolExecutionResultDto['status']
): SayaDeskSayachanTurnActivityItemDto['status'] {
  if (status === 'denied') {
    return 'skipped';
  }
  return status;
}

function toolActivityText(
  proposal: SayaDeskSayachanToolProposalDto,
  result: SayaDeskHostToolExecutionResultDto
): string {
  const label = proposal.label || proposal.capability;
  const title = result.sourceReceipts?.[0]?.title;
  return title ? `${label}：${title}` : label;
}

function advanceActivityItems(
  coreResult: SayachanCoreTurnAdvanceResult,
  nextIndex: () => number
): SayaDeskSayachanTurnActivityItemDto[] {
  return coreResult.assistantOutput
    .filter(output => output.kind === 'activity_text')
    .map(output => ({
      itemId: `${coreResult.turnId}:activity:${nextIndex()}`,
      kind: 'assistant_progress',
      status: 'planned',
      text: output.text,
      display: 'collapse_item',
      canonicalMessage: false,
      sourceTrace: output.sourceTrace
    }));
}

function toolStatusActivityItem(
  turnId: string,
  proposal: SayaDeskSayachanToolProposalDto,
  result: SayaDeskHostToolExecutionResultDto,
  nextIndex: () => number
): SayaDeskSayachanTurnActivityItemDto {
  return {
    itemId: `${turnId}:activity:${nextIndex()}`,
    kind: 'tool_status',
    status: activityStatusFromToolStatus(result.status),
    text: toolActivityText(proposal, result),
    display: 'collapse_item',
    canonicalMessage: false,
    capability: proposal.capability,
    sourceTrace: result.sourceTrace || proposal.sourceTrace
  };
}

function streamedActivityItem(
  itemId: string,
  text: string,
  sourceTrace?: string[]
): SayaDeskSayachanTurnActivityItemDto {
  return {
    itemId,
    kind: 'assistant_progress',
    status: 'planned',
    text: text || '...',
    display: 'collapse_item',
    canonicalMessage: false,
    sourceTrace: sourceTrace || ['sayachan_core_advance_stream']
  };
}

function deniedToolOutputForProposal(
  proposal: SayaDeskSayachanToolProposalDto,
  code: string,
  message: string
): SayaDeskSayachanToolOutputDto {
  return {
    proposalId: proposal.proposalId,
    providerCallId: proposal.providerCallId,
    capability: proposal.capability,
    status: 'denied',
    resultSummary: message,
    sourceReceipts: [],
    truncated: false,
    error: { code, message },
    sourceTrace: [
      'saya_desk_host_orchestrator',
      'host_tool_denied',
      ...proposal.sourceTrace
    ]
  };
}

function failedToolOutputForProposal(
  proposal: SayaDeskSayachanToolProposalDto,
  error: unknown
): SayaDeskSayachanToolOutputDto {
  const message = errorMessage(error);
  return {
    proposalId: proposal.proposalId,
    providerCallId: proposal.providerCallId,
    capability: proposal.capability,
    status: 'failed',
    resultSummary: 'Host tool execution failed.',
    sourceReceipts: [],
    truncated: false,
    error: {
      code: 'HOST_TOOL_EXECUTION_FAILED',
      message
    },
    sourceTrace: [
      'saya_desk_host_orchestrator',
      'host_tool_failed',
      ...proposal.sourceTrace
    ]
  };
}

function hostToolRequestForProposal(
  proposal: SayaDeskSayachanToolProposalDto,
  turnId: string,
  options: SayachanExecutionOptions
): SayaDeskHostToolExecutionRequestDto | null {
  if (!options.userId) {
    return null;
  }
  return {
    requestId: proposal.proposalId,
    turnId,
    hostId: 'saya-desk',
    hostUserId: options.userId.toHexString(),
    capability: proposal.capability,
    arguments: proposal.arguments,
    risk: 'read_only',
    requiresConfirmation: false,
    sourceTrace: [
      'saya_desk_host_orchestrator',
      ...proposal.sourceTrace
    ]
  };
}

function toolOutputFromExecutionResult(
  proposal: SayaDeskSayachanToolProposalDto,
  result: SayaDeskHostToolExecutionResultDto
): SayaDeskSayachanToolOutputDto {
  return {
    proposalId: proposal.proposalId,
    providerCallId: proposal.providerCallId,
    capability: result.capability,
    status: result.status,
    ...(result.result !== undefined ? { result: result.result } : {}),
    ...(result.resultSummary ? { resultSummary: result.resultSummary } : {}),
    sourceReceipts: result.sourceReceipts || [],
    truncated: result.truncated === true,
    ...(result.error ? { error: result.error } : {}),
    sourceTrace: result.sourceTrace || []
  };
}

function executionResultFromToolOutput(
  proposal: SayaDeskSayachanToolProposalDto,
  output: SayaDeskSayachanToolOutputDto
): SayaDeskHostToolExecutionResultDto {
  return {
    requestId: proposal.proposalId,
    capability: output.capability,
    status: output.status,
    ...(output.result !== undefined ? { result: output.result } : {}),
    ...(output.resultSummary ? { resultSummary: output.resultSummary } : {}),
    sourceReceipts: output.sourceReceipts,
    truncated: output.truncated,
    ...(output.error ? { error: output.error } : {}),
    sourceTrace: output.sourceTrace
  };
}

async function executeToolProposal(
  proposal: SayaDeskSayachanToolProposalDto,
  turnId: string,
  options: SayachanExecutionOptions
): Promise<{
  result: SayaDeskHostToolExecutionResultDto;
  output: SayaDeskSayachanToolOutputDto;
}> {
  const request = hostToolRequestForProposal(proposal, turnId, options);
  if (!request || !options.userId) {
    const output = deniedToolOutputForProposal(
      proposal,
      'HOST_TOOL_USER_MISSING',
      'Host user identity is not available for this tool request.'
    );
    return {
      result: executionResultFromToolOutput(proposal, output),
      output
    };
  }

  try {
    const result = await executeHostTool(request, { userId: options.userId });
    return {
      result,
      output: toolOutputFromExecutionResult(proposal, result)
    };
  } catch (error) {
    const output = failedToolOutputForProposal(proposal, error);
    return {
      result: executionResultFromToolOutput(proposal, output),
      output
    };
  }
}

async function runAdvanceLoop(
  startRequest: SayaDeskSayachanAdvanceTurnRequestDto,
  options: SayachanExecutionOptions
): Promise<{
  coreResult: SayachanCoreTurnAdvanceResult;
  turnActivity?: SayaDeskSayachanTurnActivityDto;
}> {
  let coreResult = await runCoreTurnAdvance(startRequest);
  const activityItems: SayaDeskSayachanTurnActivityItemDto[] = [];
  let activityIndex = 0;
  const nextActivityIndex = () => {
    activityIndex += 1;
    return activityIndex;
  };

  for (let iteration = 1; iteration <= MAX_ADVANCE_ITERATIONS; iteration += 1) {
    activityItems.push(...advanceActivityItems(coreResult, nextActivityIndex));

    if (coreResult.status === 'completed' || coreResult.status === 'blocked' || coreResult.status === 'failed') {
      return {
        coreResult,
        turnActivity: activityItems.length
          ? { defaultCollapsed: true, items: activityItems }
          : undefined
      };
    }

    if (!coreResult.turnCursor) {
      throw new Error('Sayachan Core requested host action without a turn cursor');
    }

    const toolOutputs: SayaDeskSayachanToolOutputDto[] = [];
    for (const proposal of coreResult.toolProposals) {
      const { result, output } = await executeToolProposal(proposal, coreResult.turnId, options);
      toolOutputs.push(output);
      activityItems.push(toolStatusActivityItem(coreResult.turnId, proposal, result, nextActivityIndex));
    }

    coreResult = await runCoreTurnAdvance({
      host: startRequest.host,
      conversation: startRequest.conversation,
      options: startRequest.options,
      turnCursor: coreResult.turnCursor,
      toolOutputs
    });
  }

  throw new Error(`Sayachan Core advance loop exceeded ${MAX_ADVANCE_ITERATIONS} iteration(s)`);
}

async function* streamAdvanceLoop(
  startRequest: SayaDeskSayachanAdvanceTurnRequestDto,
  options: SayachanExecutionOptions
): AsyncIterable<SayaDeskSayachanStreamEventDto> {
  const activityItems: SayaDeskSayachanTurnActivityItemDto[] = [];
  let activityIndex = 0;
  let streamedText = '';
  const nextActivityIndex = () => {
    activityIndex += 1;
    return activityIndex;
  };
  const currentTurnActivity = (): SayaDeskSayachanTurnActivityDto | undefined => (
    activityItems.length
      ? { defaultCollapsed: true, items: [...activityItems] }
      : undefined
  );

  let advanceRequest: SayaDeskSayachanAdvanceTurnRequestDto = startRequest;
  for (let iteration = 1; iteration <= MAX_ADVANCE_ITERATIONS; iteration += 1) {
    const shouldStreamFinalDeltas = Boolean(advanceRequest.turnCursor)
      || (advanceRequest.hostToolManifest?.tools.length || 0) === 0;
    const bufferedFinalDeltas: string[] = [];
    let coreResult: SayachanCoreTurnAdvanceResult | null = null;
    let toolCallStarted = false;
    let streamedActivityId: string | null = null;
    let streamedActivityText = '';
    let streamedActivitySourceTrace: string[] | undefined;

    const ensureStreamedActivity = (text: string): SayaDeskSayachanTurnActivityItemDto => {
      if (!streamedActivityId) {
        streamedActivityId = `stream-activity:${nextActivityIndex()}`;
      }
      streamedActivityText = text;
      const item = streamedActivityItem(
        streamedActivityId,
        streamedActivityText,
        streamedActivitySourceTrace
      );
      const existingIndex = activityItems.findIndex(current => current.itemId === item.itemId);
      if (existingIndex >= 0) {
        activityItems[existingIndex] = item;
      } else {
        activityItems.push(item);
      }
      return item;
    };

    for await (const event of runCoreTurnAdvanceStream(advanceRequest)) {
      if (event.type === 'tool_call_started') {
        toolCallStarted = true;
        if (bufferedFinalDeltas.length > 0) {
          const item = ensureStreamedActivity(bufferedFinalDeltas.join(''));
          yield activityStreamEvent(item);
          bufferedFinalDeltas.length = 0;
        }
        continue;
      }

      if (event.type === 'assistant_delta') {
        if (toolCallStarted) {
          const item = ensureStreamedActivity(streamedActivityText + event.delta);
          yield activityStreamEvent(item);
        } else if (shouldStreamFinalDeltas) {
          streamedText += event.delta;
          yield assistantDeltaStreamEvent(event.delta, streamedText);
        } else {
          bufferedFinalDeltas.push(event.delta);
        }
        continue;
      }

      if (event.type === 'completed') {
        coreResult = event.result;
        continue;
      }

      if (event.type === 'error') {
        throw new Error(event.error.message);
      }
    }

    if (!coreResult) {
      throw new Error('Sayachan Core advance stream ended before completion');
    }

    if (coreResult.status === 'needs_host_action' && bufferedFinalDeltas.length > 0) {
      const item = ensureStreamedActivity(bufferedFinalDeltas.join(''));
      yield activityStreamEvent(item);
      bufferedFinalDeltas.length = 0;
    } else if (bufferedFinalDeltas.length > 0) {
      for (const delta of bufferedFinalDeltas) {
        streamedText += delta;
        yield assistantDeltaStreamEvent(delta, streamedText);
      }
      bufferedFinalDeltas.length = 0;
    }

    for (const item of advanceActivityItems(coreResult, nextActivityIndex)) {
      if (streamedActivityId && item.kind === 'assistant_progress') {
        streamedActivitySourceTrace = item.sourceTrace;
        const updatedItem = streamedActivityItem(
          streamedActivityId,
          item.text,
          item.sourceTrace
        );
        const existingIndex = activityItems.findIndex(current => current.itemId === updatedItem.itemId);
        const existingItem = existingIndex >= 0 ? activityItems[existingIndex] : undefined;
        if (existingIndex >= 0) {
          activityItems[existingIndex] = updatedItem;
        } else {
          activityItems.push(updatedItem);
        }
        if (!existingItem || existingItem.text !== updatedItem.text) {
          yield activityStreamEvent(updatedItem);
        }
      } else {
        activityItems.push(item);
        yield activityStreamEvent(item);
      }
    }

    if (coreResult.status === 'completed' || coreResult.status === 'blocked' || coreResult.status === 'failed') {
      const reply = finalAdvanceText(coreResult);
      if (!streamedText && reply) {
        streamedText += reply;
        yield assistantDeltaStreamEvent(reply, streamedText);
      }
      yield completedStreamEvent(reply, coreResult, currentTurnActivity());
      return;
    }

    if (!coreResult.turnCursor) {
      throw new Error('Sayachan Core requested host action without a turn cursor');
    }

    const toolOutputs: SayaDeskSayachanToolOutputDto[] = [];
    for (const proposal of coreResult.toolProposals) {
      const { result, output } = await executeToolProposal(proposal, coreResult.turnId, options);
      toolOutputs.push(output);
      const item = toolStatusActivityItem(coreResult.turnId, proposal, result, nextActivityIndex);
      activityItems.push(item);
      yield activityStreamEvent(item);
    }

    advanceRequest = {
      host: startRequest.host,
      conversation: startRequest.conversation,
      options: startRequest.options,
      turnCursor: coreResult.turnCursor,
      toolOutputs
    };
  }

  throw new Error(`Sayachan Core advance loop exceeded ${MAX_ADVANCE_ITERATIONS} iteration(s)`);
}

async function persistAssistantText(
  preparedTurn: PreparedPersistentTurn,
  reply: string,
  options: SayachanExecutionOptions
): Promise<void> {
  if (!preparedTurn || !options.userId) {
    return;
  }

  try {
    await appendAssistantMessage(preparedTurn, reply, {}, { userId: options.userId });
  } catch (error) {
    console.error('[Sayachan Route] Chat persistence assistant append failed:', errorMessage(error));
  }
}

export async function chat(request: SayaDeskSayachanRequestDto, options: SayachanExecutionOptions = {}): Promise<SayaDeskSayachanResponseDto> {
  const preparedTurn = options.userId && chatPersistenceAvailabilityCheck()
    ? await preparePersistentTextTurn({ text: request.text }, { userId: options.userId })
    : null;
  const authorizedContext = await buildAdvanceAuthorizedContext(request, options);
  const turnRequest = coreAdvanceStartRequest(request, preparedTurn, authorizedContext, options);

  try {
    const { coreResult, turnActivity } = await runAdvanceLoop(turnRequest, options);
    const reply = finalAdvanceText(coreResult);
    const parsed = sayaDeskSayachanResponseSchema.parse({
      reply,
      turnId: coreResult.turnId,
      turnActivity,
      trace: projectAdvanceTrace(coreResult)
    });
    await persistAssistantText(preparedTurn, reply, options);
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

export async function* chatStream(request: SayaDeskSayachanRequestDto, options: SayachanExecutionOptions = {}): AsyncIterable<SayaDeskSayachanStreamEventDto> {
  const preparedTurn = options.userId && chatPersistenceAvailabilityCheck()
    ? await preparePersistentTextTurn({ text: request.text }, { userId: options.userId })
    : null;
  const authorizedContext = await buildAdvanceAuthorizedContext(request, options);
  const turnRequest = coreAdvanceStartRequest(request, preparedTurn, authorizedContext, options);

  try {
    for await (const event of streamAdvanceLoop(turnRequest, options)) {
      if (event.type === 'completed') {
        await persistAssistantText(preparedTurn, event.reply, options);
      }
      yield event;
    }
  } catch (error) {
    if (error instanceof BadRequestError) {
      throw error;
    }

    console.error('[Sayachan Route] Core stream failed:', errorMessage(error));
    yield errorStreamEvent('SAYACHAN_CORE_STREAM_FAILED', 'Sayachan Core stream failed');
  }
}

export const __test__ = {
  setCoreTurnAdvanceRunnerForTest(runner: SayachanCoreTurnAdvanceRunner) {
    const previous = runCoreTurnAdvance;
    runCoreTurnAdvance = runner;
    return () => {
      runCoreTurnAdvance = previous;
    };
  },
  setCoreTurnAdvanceStreamRunnerForTest(runner: SayachanCoreTurnAdvanceStreamRunner) {
    const previous = runCoreTurnAdvanceStream;
    runCoreTurnAdvanceStream = runner;
    return () => {
      runCoreTurnAdvanceStream = previous;
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
  }
};

export default {
  chat,
  chatStream,
  __test__
};
