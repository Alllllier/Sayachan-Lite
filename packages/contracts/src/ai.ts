import { z } from 'zod'
import {
  sayaDeskSayachanCandidateProposalSchema,
  sayaDeskSayachanTurnActivitySchema
} from './sayachan.js'

export const chatPersonalityBaselineValues = ['warm', 'strict', 'haraguro'] as const
export const chatConvergenceModeValues = ['explore', 'guided', 'decisive'] as const
export const chatMessageRoleValues = ['user', 'assistant'] as const
export const chatProviderStateStrategyValues = ['caller_managed', 'previous_response'] as const
export const chatProviderStateSourceValues = ['auto', 'env', 'runtime_control'] as const
export const chatModeValues = ['chat/general', 'guide/core_modules'] as const
export const chatModeDecisionSourceValues = ['input', 'runtime_control', 'context', 'model_intent', 'default'] as const
export const chatResponseStrategyResolvedActionValues = ['direct_answer', 'expansion_offer', 'expand_from_offer'] as const
export const chatExpansionDecisionActionValues = ['direct_answer', 'expansion_offer'] as const
export const chatResponseStrategySourceValues = ['model_strategy', 'not_attempted'] as const
export const chatFocusTypeValues = ['note', 'project'] as const
export const chatMemoryCandidateTypeValues = ['preference', 'continuity_hint'] as const
export const chatMemoryCandidateSourceValues = ['assistant_suggested_user_approved'] as const
export const chatCandidateProposalStatusValues = ['pending', 'dismissed', 'accepted'] as const

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

export const chatMessageFocusSnapshotSchema = z.object({
  type: z.enum(chatFocusTypeValues),
  title: z.string().min(1)
}).strict()

export const chatContextSchema = z.union([
  z.object({
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

export const chatMemoryCandidateSchema = z.object({
  type: z.enum(chatMemoryCandidateTypeValues),
  content: z.string().min(1),
  reason: z.string().min(1).optional(),
  source: z.enum(chatMemoryCandidateSourceValues),
  confidence: z.number().min(0).max(1).optional()
}).strict()

export const chatCandidateProposalSchema = sayaDeskSayachanCandidateProposalSchema.extend({
  status: z.enum(chatCandidateProposalStatusValues).default('pending'),
  decidedAt: z.string().optional()
}).strict()

export const chatCandidateProposalStatusUpdateSchema = z.object({
  status: z.enum(['dismissed', 'accepted'])
}).strict()

export const chatResponseStrategySchema = z.object({
  resolvedAction: z.enum(chatResponseStrategyResolvedActionValues),
  expansionDecision: z.object({
    action: z.enum(chatExpansionDecisionActionValues),
    status: z.string().optional(),
    source: z.enum(chatResponseStrategySourceValues).optional(),
    confidence: z.number().min(0).max(1).optional(),
    reasonCodes: z.array(z.string()).optional()
  }).strict().optional(),
  source: z.enum(chatResponseStrategySourceValues).optional(),
  status: z.string().optional(),
  confidence: z.number().min(0).max(1).optional(),
  reasonCodes: z.array(z.string()).optional()
}).strict()

export const chatMessageSchema = z.object({
  _id: z.string().min(1).optional(),
  role: z.enum(chatMessageRoleValues).optional(),
  content: z.string().optional(),
  focusSnapshot: chatMessageFocusSnapshotSchema.optional(),
  sourceReceipts: z.array(chatSourceReceiptSchema).optional(),
  memoryCandidate: chatMemoryCandidateSchema.optional(),
  candidateProposals: z.array(chatCandidateProposalSchema).optional(),
  turnActivity: sayaDeskSayachanTurnActivitySchema.optional(),
  createdAt: z.string().optional()
})

export const chatDebugTraceRangeSchema = z.object({
  startChar: z.number(),
  endChar: z.number()
}).strict()

export const chatDebugModeTraceSchema = z.object({
  source: z.enum(chatModeDecisionSourceValues),
  requestedMode: z.string().min(1),
  selectedMode: z.enum(chatModeValues),
  fallbackApplied: z.boolean(),
  confidence: z.number(),
  reasonCodes: z.array(z.string())
}).strict()

export const chatDebugFocusTraceSchema = z.object({
  consumed: z.boolean(),
  type: z.enum(chatFocusTypeValues).optional(),
  title: z.string().min(1).optional(),
  source: z.string().optional()
}).strict()

export const chatDebugStrategyTraceSchema = z.object({
  resolvedAction: z.enum(chatResponseStrategyResolvedActionValues),
  source: z.enum(chatResponseStrategySourceValues),
  status: z.string(),
  confidence: z.number(),
  reasonCodes: z.array(z.string()),
  expansionDecision: z.object({
    action: z.enum(chatExpansionDecisionActionValues),
    status: z.string().optional(),
    confidence: z.number().optional(),
    reasonCodes: z.array(z.string()).optional()
  }).strict().optional(),
  priorOfferDecision: z.object({
    action: z.enum(['none', 'accept_prior_offer', 'reject_prior_offer']),
    status: z.string().optional(),
    confidence: z.number().optional(),
    reasonCodes: z.array(z.string()).optional()
  }).strict().optional(),
}).strict()

export const chatDebugContextTraceSchema = z.object({
  budget: z.object({
    maxContextTokens: z.number().optional(),
    reservedOutputTokens: z.number().optional(),
    safetyMarginTokens: z.number().optional(),
    estimatedInputBudgetTokens: z.number().optional(),
    estimatedUsedTokens: z.number().optional(),
    strategy: z.string().optional(),
    inputBudgetStatus: z.string().optional()
  }).strict().optional(),
  session: z.object({
    includedMessages: z.number().optional(),
    totalMessages: z.number().optional(),
    truncated: z.boolean().optional(),
    estimatedTokens: z.number().optional()
  }).strict().optional(),
  productContext: z.object({
    status: z.string().optional(),
    itemCount: z.number().optional(),
    truncated: z.boolean().optional()
  }).strict().optional(),
  render: z.object({
    sectionCount: z.number().optional()
  }).strict().optional()
}).strict()

export const chatDebugProviderUsageTraceSchema = z.object({
  status: z.enum(['available', 'unavailable', 'mock']),
  provider: z.string().optional(),
  model: z.string().optional(),
  finishReason: z.string().optional(),
  incomplete: z.boolean().optional(),
  incompleteReason: z.string().optional(),
  inputTokens: z.number().optional(),
  outputTokens: z.number().optional(),
  totalTokens: z.number().optional(),
  cachedInputTokens: z.number().optional(),
  reasoningTokens: z.number().optional(),
  deterministicMock: z.boolean().optional()
}).strict()

export const chatDebugMemoryTraceSchema = z.object({
  status: z.string(),
  contract: z.string().optional(),
  retrieval: z.string().optional(),
  persistence: z.string().optional(),
  itemCount: z.number().optional(),
  typeCounts: z.record(z.string(), z.number()).optional(),
  sourceCounts: z.record(z.string(), z.number()).optional(),
  snapshotStatus: z.string().optional(),
  usedAsContinuity: z.boolean().optional(),
  untrustedReason: z.string().optional()
}).strict()

export const chatDebugMemoryCandidateTraceSchema = z.object({
  enabled: z.boolean(),
  status: z.string(),
  shouldSuggest: z.boolean(),
  reasonCodes: z.array(z.string()),
  candidateType: z.enum(chatMemoryCandidateTypeValues).optional(),
  confidence: z.number().optional(),
  providerUsage: chatDebugProviderUsageTraceSchema.optional(),
  errorCode: z.string().optional()
}).strict()

export const chatDebugGovernanceTraceSchema = z.object({
  status: z.string(),
  lanes: z.object({
    memory: z.string().optional(),
    tools: z.string().optional(),
    productContext: z.string().optional()
  }).strict().optional(),
  memoryStatus: z.string().optional(),
  memoryCandidateStatus: z.string().optional(),
  reasonCodes: z.array(z.string()).optional()
}).strict()

export const chatDebugJudgmentSummarySchema = z.object({
  status: z.string().optional(),
  source: z.string().optional(),
  selectedMode: z.enum(chatModeValues).optional(),
  resolvedAction: z.string().optional(),
  expansionAction: z.string().optional(),
  priorOfferAction: z.string().optional(),
  vulnerability: z.string().optional(),
  repair: z.string().optional(),
  selectedMove: z.string().optional(),
  targetShape: z.string().optional(),
  basis: z.string().optional(),
  needed: z.boolean().optional(),
  fallbackApplied: z.boolean().optional(),
  confidence: z.number().optional(),
  reasonCodes: z.array(z.string()).optional(),
  errorCode: z.string().optional()
}).strict()

export const chatDebugJudgmentTraceSchema = z.object({
  phase: z.enum(['pre_turn', 'post_turn']),
  status: z.string(),
  source: z.string(),
  provider: z.string().optional(),
  model: z.string().optional(),
  profileStatus: z.string().optional(),
  confidence: z.number().optional(),
  reasonCodes: z.array(z.string()),
  judgments: z.record(z.string(), chatDebugJudgmentSummarySchema).optional(),
  errorCode: z.string().optional()
}).strict()

export const chatDebugTraceSchema = z.object({
  mode: chatDebugModeTraceSchema.optional(),
  strategy: chatDebugStrategyTraceSchema.optional(),
  focus: chatDebugFocusTraceSchema.optional(),
  context: chatDebugContextTraceSchema.optional(),
  providerUsage: chatDebugProviderUsageTraceSchema.optional(),
  memory: chatDebugMemoryTraceSchema.optional(),
  memoryCandidate: chatDebugMemoryCandidateTraceSchema.optional(),
  governance: chatDebugGovernanceTraceSchema.optional(),
  judgment: z.array(chatDebugJudgmentTraceSchema).optional(),
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
  debugTrace: z.boolean().optional(),
  memoryCandidate: z.boolean().optional()
})

export const chatRuntimePayloadSchema = chatRuntimeControlsSchema.extend({
  lastUserMessage: z.string()
})

export const aiChatRequestSchema = z.object({
  messages: z.array(chatMessageSchema).optional(),
  context: chatContextSchema.optional(),
  runtimeControls: chatRuntimePayloadSchema.partial().optional()
})

export const chatResponseSchema = z.object({
  reply: z.string().min(1),
  providerState: chatProviderStateSchema.optional(),
  sourceReceipts: z.array(chatSourceReceiptSchema).optional(),
  debugTrace: chatDebugTraceSchema.optional(),
  memoryCandidate: chatMemoryCandidateSchema.optional(),
  responseStrategy: chatResponseStrategySchema.optional()
})

export const chatConversationSchema = z.object({
  _id: z.string().min(1),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
}).strict()

export const chatSessionResponseSchema = z.object({
  conversation: chatConversationSchema.optional(),
  messages: z.array(chatMessageSchema),
  providerState: chatProviderStateSchema.optional()
}).strict()

export type ChatPersonalityBaseline = (typeof chatPersonalityBaselineValues)[number]
export type ChatConvergenceMode = (typeof chatConvergenceModeValues)[number]
export type ChatMessageRole = (typeof chatMessageRoleValues)[number]
export type ChatModeDto = (typeof chatModeValues)[number]
export type ChatModeDecisionSource = (typeof chatModeDecisionSourceValues)[number]
export type ChatResponseStrategyResolvedAction = (typeof chatResponseStrategyResolvedActionValues)[number]
export type ChatExpansionDecisionAction = (typeof chatExpansionDecisionActionValues)[number]
export type ChatFocusDto = z.infer<typeof chatFocusSchema>
export type ChatMessageFocusSnapshotDto = z.infer<typeof chatMessageFocusSnapshotSchema>
export type ChatMemoryCandidateDto = z.infer<typeof chatMemoryCandidateSchema>
export type ChatCandidateProposalStatus = (typeof chatCandidateProposalStatusValues)[number]
export type ChatCandidateProposalDto = z.infer<typeof chatCandidateProposalSchema>
export type ChatCandidateProposalStatusUpdateDto = z.infer<typeof chatCandidateProposalStatusUpdateSchema>
export type ChatResponseStrategyDto = z.infer<typeof chatResponseStrategySchema>
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
export type ChatConversationDto = z.infer<typeof chatConversationSchema>
export type ChatSessionResponseDto = z.infer<typeof chatSessionResponseSchema>
