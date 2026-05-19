import { z } from 'zod'

export const chatPersonalityBaselineValues = ['warm', 'strict', 'haraguro'] as const
export const chatConvergenceModeValues = ['explore', 'guided', 'decisive'] as const
export const chatMessageRoleValues = ['user', 'assistant'] as const
export const chatProviderStateStrategyValues = ['caller_managed', 'previous_response'] as const
export const chatProviderStateSourceValues = ['auto', 'env', 'runtime_control'] as const

export const aiResourceRequestSchema = z.object({
  _id: z.string().min(1)
}).strict()

export const chatMessageSchema = z.object({
  role: z.enum(chatMessageRoleValues).optional(),
  content: z.string().optional()
})

export const chatContextSchema = z.union([
  z.object({
    activeProjectsCount: z.number(),
    activeTasksCount: z.number(),
    pinnedProjectName: z.string(),
    currentNextAction: z.string()
  }),
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

export const chatRuntimeControlsSchema = z.object({
  personalityBaseline: z.enum(chatPersonalityBaselineValues).optional(),
  futureSlots: chatRuntimeFutureSlotsSchema.optional(),
  providerState: chatProviderStateSchema.optional()
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
  providerState: chatProviderStateSchema.optional()
})

export type AiResourceRequestDto = z.infer<typeof aiResourceRequestSchema>
export type ChatPersonalityBaseline = (typeof chatPersonalityBaselineValues)[number]
export type ChatConvergenceMode = (typeof chatConvergenceModeValues)[number]
export type ChatMessageRole = (typeof chatMessageRoleValues)[number]
export type ChatProviderStateStrategy = (typeof chatProviderStateStrategyValues)[number]
export type ChatProviderStateSource = (typeof chatProviderStateSourceValues)[number]
export type ChatMessageDto = z.infer<typeof chatMessageSchema>
export type ChatContextDto = z.infer<typeof chatContextSchema>
export type ChatRuntimeControlsDto = z.infer<typeof chatRuntimeControlsSchema>
export type ChatRuntimePayloadDto = z.infer<typeof chatRuntimePayloadSchema>
export type AiChatRequestDto = z.infer<typeof aiChatRequestSchema>
export type ChatResponseDto = z.infer<typeof chatResponseSchema>
