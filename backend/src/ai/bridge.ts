// Public AI bridge: re-export from the private AI core package boundary.
type ChatMessage = {
  role?: unknown;
  content?: unknown;
};

type ChatContext = Record<string, unknown> | null | undefined;

type ChatOptions = {
  runtimeControls?: unknown;
};

type ChatResult = {
  reply?: string;
};

type Chat = (
  messages: ChatMessage[] | unknown,
  context: ChatContext,
  options?: ChatOptions
) => Promise<ChatResult>;

const { chat } = require('@allier/sayachan-ai-core') as { chat: Chat };

export = { chat };
