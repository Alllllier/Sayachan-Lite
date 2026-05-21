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
