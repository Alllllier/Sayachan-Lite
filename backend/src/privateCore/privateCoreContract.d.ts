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
      [key: string]: unknown;
    };
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
    type: 'text_delta' | 'completed' | 'error';
    delta?: string;
    text?: string;
    output?: SayachanAiCoreChatResult;
    providerState?: {
      strategy?: 'caller_managed' | 'previous_response';
      source?: 'auto' | 'env' | 'runtime_control';
      previousResponseId?: string;
      lastResponseId?: string;
      status?: 'active' | 'fallback' | 'unavailable';
    };
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
