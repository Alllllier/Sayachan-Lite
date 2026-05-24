declare module '@allier/sayachan-ai-core' {
  export type SayachanAiCoreChatMessage = {
    role?: 'user' | 'assistant';
    content?: unknown;
  };

  export type SayachanAiCoreChatContext = Record<string, unknown> | null | undefined;

  export type SayachanAiCoreChatOptions = {
    runtimeControls?: {
      provider?: 'mock' | 'openai' | 'kimi';
      providerState?: {
        strategy?: 'caller_managed' | 'previous_response';
        source?: 'auto' | 'env' | 'runtime_control';
        previousResponseId?: string;
        lastResponseId?: string;
        status?: 'active' | 'fallback' | 'unavailable';
      };
      toolExecutor?: (request: {
        name: string;
        arguments: Record<string, unknown>;
        callId?: string;
        round?: number;
        context?: Record<string, unknown>;
      }) => Promise<unknown>;
      tools?: {
        enabled?: boolean;
        maxToolCallsPerTurn?: number;
        maxToolRounds?: number;
        toolTimeoutMs?: number;
        maxToolResultChars?: number;
      };
      debugTrace?: boolean;
      memoryCandidate?: boolean | {
        enabled?: boolean;
      };
      responseStrategy?: {
        minConfidence?: number;
      };
      [key: string]: unknown;
    };
  };

  export type SayachanAiCoreDebugTrace = {
    mode?: {
      source: 'input' | 'runtime_control' | 'context' | 'model_intent' | 'default';
      requestedMode: string;
      selectedMode: 'chat/general' | 'guide/core_modules';
      fallbackApplied: boolean;
      confidence: number;
      reasonCodes: string[];
    };
    strategy?: {
      resolvedAction: 'direct_answer' | 'expansion_offer' | 'expand_from_offer';
      source: 'model_strategy' | 'not_attempted';
      status: string;
      confidence: number;
      reasonCodes: string[];
      expansionDecision?: {
        action: 'direct_answer' | 'expansion_offer';
        status?: string;
        confidence?: number;
        reasonCodes?: string[];
      };
      priorOfferDecision?: {
        action: 'none' | 'accept_prior_offer' | 'reject_prior_offer';
        status?: string;
        confidence?: number;
        reasonCodes?: string[];
      };
    };
    focus?: {
      consumed: boolean;
      type?: 'note' | 'project';
      title?: string;
      source?: string;
    };
    context?: {
      budget?: {
        maxContextTokens?: number;
        reservedOutputTokens?: number;
        safetyMarginTokens?: number;
        estimatedInputBudgetTokens?: number;
        estimatedUsedTokens?: number;
        strategy?: string;
        inputBudgetStatus?: string;
      };
      session?: {
        includedMessages?: number;
        totalMessages?: number;
        truncated?: boolean;
        estimatedTokens?: number;
      };
      productContext?: {
        status?: string;
        itemCount?: number;
        truncated?: boolean;
      };
      render?: {
        sectionCount?: number;
      };
    };
    providerUsage?: {
      status: 'available' | 'unavailable' | 'mock';
      provider?: string;
      model?: string;
      finishReason?: string;
      incomplete?: boolean;
      incompleteReason?: string;
      inputTokens?: number;
      outputTokens?: number;
      totalTokens?: number;
      cachedInputTokens?: number;
      reasoningTokens?: number;
      deterministicMock?: boolean;
    };
    memory?: {
      status: string;
      contract?: string;
      retrieval?: string;
      persistence?: string;
      itemCount?: number;
      typeCounts?: Record<string, number>;
      sourceCounts?: Record<string, number>;
      snapshotStatus?: string;
      usedAsContinuity?: boolean;
      untrustedReason?: string;
    };
    memoryCandidate?: {
      enabled: boolean;
      status: string;
      shouldSuggest: boolean;
      reasonCodes: string[];
      candidateType?: 'preference' | 'continuity_hint';
      confidence?: number;
      providerUsage?: {
        status: 'available' | 'unavailable' | 'mock';
        provider?: string;
        model?: string;
        finishReason?: string;
        incomplete?: boolean;
        incompleteReason?: string;
        inputTokens?: number;
        outputTokens?: number;
        totalTokens?: number;
        cachedInputTokens?: number;
        reasoningTokens?: number;
        deterministicMock?: boolean;
      };
      errorCode?: string;
    };
    governance?: {
      status: string;
      lanes?: {
        memory?: string;
        tools?: string;
        productContext?: string;
      };
      memoryStatus?: string;
      memoryCandidateStatus?: string;
      reasonCodes?: string[];
    };
    judgment?: Array<{
      phase: 'pre_turn' | 'post_turn';
      status: string;
      source: string;
      provider?: string;
      model?: string;
      profileStatus?: string;
      confidence?: number;
      reasonCodes: string[];
      judgments?: Record<string, {
        status?: string;
        source?: string;
        selectedMode?: 'chat/general' | 'guide/core_modules';
        resolvedAction?: string;
        expansionAction?: string;
        priorOfferAction?: string;
        targetShape?: string;
        basis?: string;
        needed?: boolean;
        fallbackApplied?: boolean;
        confidence?: number;
        reasonCodes?: string[];
        errorCode?: string;
      }>;
      errorCode?: string;
    }>;
    tools?: {
      limits?: {
        maxToolCallsPerTurn?: number;
        maxToolRounds?: number;
      };
      exposed?: string[];
      requested?: Array<{
        name: string;
        round?: number;
        allowed?: boolean;
        cursorPresent?: boolean;
      }>;
      executed?: Array<{
        name: string;
        status?: string;
        round?: number;
        outputTruncated?: boolean;
        sourceReceiptCount?: number;
        errorCode?: string;
        returnedChars?: number;
        contentChars?: number;
        hasMore?: boolean;
        nextCursorPresent?: boolean;
        range?: {
          startChar: number;
          endChar: number;
        };
      }>;
    };
    sourceReceipts?: Array<{
      type: 'project' | 'note' | 'task';
      title: string;
    }>;
  };

  export type SayachanAiCoreChatResult = {
    reply?: string;
    providerState?: {
      strategy?: 'caller_managed' | 'previous_response';
      source?: 'auto' | 'env' | 'runtime_control';
      previousResponseId?: string;
      lastResponseId?: string;
      status?: 'active' | 'fallback' | 'unavailable';
    };
    sourceReceipts?: Array<{
      type: 'project' | 'note' | 'task';
      title: string;
    }>;
    debugTrace?: SayachanAiCoreDebugTrace;
    memoryCandidate?: {
      type: 'preference' | 'continuity_hint';
      content: string;
      reason?: string;
      source: 'assistant_suggested_user_approved';
      confidence?: number;
    };
    responseStrategy?: {
      resolvedAction: 'direct_answer' | 'expansion_offer' | 'expand_from_offer';
      expansionDecision?: {
        action: 'direct_answer' | 'expansion_offer';
        status?: string;
        source?: 'model_strategy' | 'not_attempted';
        confidence?: number;
        reasonCodes?: string[];
      };
      source?: 'model_strategy' | 'not_attempted';
      status?: string;
      confidence?: number;
      reasonCodes?: string[];
    };
  };

  export type SayachanAiCoreChatStreamError = {
    code?: string;
    message?: string;
    provider?: string;
    status?: number;
  };

  export type SayachanAiCoreChatStreamEvent = {
    packetType?: 'chat_stream_event';
    version?: number;
    type: 'tool_call_started' | 'tool_call_completed' | 'tool_call_failed' | 'text_delta' | 'completed' | 'error';
    delta?: string;
    text?: string;
    toolName?: string;
    displayName?: string;
    callId?: string;
    status?: string;
    round?: number;
    output?: SayachanAiCoreChatResult;
    providerState?: {
      strategy?: 'caller_managed' | 'previous_response';
      source?: 'auto' | 'env' | 'runtime_control';
      previousResponseId?: string;
      lastResponseId?: string;
      status?: 'active' | 'fallback' | 'unavailable';
    };
    sourceReceipts?: SayachanAiCoreChatResult['sourceReceipts'];
    debugTrace?: SayachanAiCoreDebugTrace;
    memoryCandidate?: SayachanAiCoreChatResult['memoryCandidate'];
    finishReason?: string;
    incomplete?: boolean;
    incompleteReason?: string;
    error?: SayachanAiCoreChatStreamError;
  };

  export type SayachanAiCoreChat = (
    messages: SayachanAiCoreChatMessage[] | undefined,
    context: SayachanAiCoreChatContext,
    options?: SayachanAiCoreChatOptions
  ) => Promise<SayachanAiCoreChatResult>;

  export type SayachanAiCoreChatStream = (
    messages: SayachanAiCoreChatMessage[] | undefined,
    context: SayachanAiCoreChatContext,
    options?: SayachanAiCoreChatOptions
  ) => AsyncIterable<SayachanAiCoreChatStreamEvent>;

  const aiCore: {
    chat: SayachanAiCoreChat;
    chatStream: SayachanAiCoreChatStream;
  };

  export default aiCore;
}
