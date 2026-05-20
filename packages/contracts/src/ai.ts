import { z } from 'zod'

export const chatPersonalityBaselineValues = ['warm', 'strict', 'haraguro'] as const
export const chatConvergenceModeValues = ['explore', 'guided', 'decisive'] as const
export const chatMessageRoleValues = ['user', 'assistant'] as const
export const chatProviderStateStrategyValues = ['caller_managed', 'previous_response'] as const
export const chatProviderStateSourceValues = ['auto', 'env', 'runtime_control'] as const
export const chatModeValues = ['chat/general', 'guide/core_modules'] as const
export const chatFocusTypeValues = ['note', 'project'] as const

export const aiResourceRequestSchema = z.object({
  _id: z.string().min(1)
}).strict()

export const chatMessageSchema = z.object({
  role: z.enum(chatMessageRoleValues).optional(),
  content: z.string().optional()
})

export const chatFocusSchema = z.object({
  type: z.enum(chatFocusTypeValues),
  id: z.string().min(1),
  title: z.string().min(1),
  summary: z.string().optional(),
  excerpt: z.string().optional(),
  status: z.string().optional(),
  currentFocusTaskTitle: z.string().optional(),
  source: z.literal('user_focus_button')
}).strict()

export const chatContextSchema = z.union([
  z.object({
    activeProjectsCount: z.number().optional(),
    activeTasksCount: z.number().optional(),
    pinnedProjectName: z.string().optional(),
    currentNextAction: z.string().optional(),
    mode: z.enum(chatModeValues).optional(),
    chatFocus: chatFocusSchema.optional()
  }).strict(),
  z.null()
])

export const chatRuntimeFutureSlotsSchema = z.object({
  warmth: z.number().min(0).max(10).optional(),
  reflectionDepth: z.null().optional(),
  convergenceMode: z.enum(chatConvergenceModeValues).optional(),
  thinking: z.null().optional(),
  debugContext: z.null().optional()
})

export const chatProviderStateSchema = z.object({
  strategy: z.enum(chatProviderStateStrategyValues).optional(),
  source: z.enum(chatProviderStateSourceValues).optional(),
  previousResponseId: z.string().min(1).optional(),
  lastResponseId: z.string().min(1).optional(),
  status: z.enum(['active', 'fallback', 'unavailable']).optional()
})

export const chatSourceReceiptSchema = z.object({
  type: z.enum(['project', 'note', 'task']),
  title: z.string().min(1)
}).strict()

export const chatDebugTraceRangeSchema = z.object({
  startChar: z.number(),
  endChar: z.number()
}).strict()

export const chatDebugTraceSchema = z.object({
  tools: z.object({
    limits: z.object({
      maxToolCallsPerTurn: z.number().optional(),
      maxToolRounds: z.number().optional()
    }).strict().optional(),
    exposed: z.array(z.string()).optional(),
    requested: z.array(z.object({
      name: z.string(),
      round: z.number().optional(),
      allowed: z.boolean().optional(),
      cursorPresent: z.boolean().optional()
    }).strict()).optional(),
    executed: z.array(z.object({
      name: z.string(),
      status: z.string().optional(),
      round: z.number().optional(),
      outputTruncated: z.boolean().optional(),
      sourceReceiptCount: z.number().optional(),
      errorCode: z.string().optional(),
      returnedChars: z.number().optional(),
      contentChars: z.number().optional(),
      hasMore: z.boolean().optional(),
      nextCursorPresent: z.boolean().optional(),
      range: chatDebugTraceRangeSchema.optional()
    }).strict()).optional()
  }).strict(),
  sourceReceipts: z.array(chatSourceReceiptSchema).optional()
}).strict()

export const chatRuntimeControlsSchema = z.object({
  personalityBaseline: z.enum(chatPersonalityBaselineValues).optional(),
  futureSlots: chatRuntimeFutureSlotsSchema.optional(),
  providerState: chatProviderStateSchema.optional(),
  debugTrace: z.boolean().optional()
})

export const chatRuntimePayloadSchema = chatRuntimeControlsSchema.extend({
  lastUserMessage: z.string()
})

export const aiChatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).optional(),
  context: z.union([chatContextSchema, z.record(z.string(), z.unknown())]).optional(),
  runtimeControls: chatRuntimePayloadSchema.partial().optional()
})

export const chatResponseSchema = z.object({
  reply: z.string().min(1),
  providerState: chatProviderStateSchema.optional(),
  sourceReceipts: z.array(chatSourceReceiptSchema).optional(),
  debugTrace: chatDebugTraceSchema.optional()
})

export type AiResourceRequestDto = z.infer<typeof aiResourceRequestSchema>
export type ChatPersonalityBaseline = (typeof chatPersonalityBaselineValues)[number]
export type ChatConvergenceMode = (typeof chatConvergenceModeValues)[number]
export type ChatMessageRole = (typeof chatMessageRoleValues)[number]
export type ChatModeDto = (typeof chatModeValues)[number]
export type ChatFocusDto = z.infer<typeof chatFocusSchema>
export type ChatProviderStateStrategy = (typeof chatProviderStateStrategyValues)[number]
export type ChatProviderStateSource = (typeof chatProviderStateSourceValues)[number]
export type ChatSourceReceiptDto = z.infer<typeof chatSourceReceiptSchema>
export type ChatDebugTraceDto = z.infer<typeof chatDebugTraceSchema>
export type ChatMessageDto = z.infer<typeof chatMessageSchema>
export type ChatContextDto = z.infer<typeof chatContextSchema>
export type ChatRuntimeControlsDto = z.infer<typeof chatRuntimeControlsSchema>
export type ChatRuntimePayloadDto = z.infer<typeof chatRuntimePayloadSchema>
export type AiChatRequestDto = z.infer<typeof aiChatRequestSchema>
export type ChatResponseDto = z.infer<typeof chatResponseSchema>
