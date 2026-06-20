import { z } from 'zod'

export const sayaDeskSayachanSurfaceValues = [
  'workspace-chat',
  'dashboard',
  'note-detail',
  'project-detail',
  'task-detail'
] as const

export const sayaDeskSayachanFocusTypeValues = ['note', 'project', 'task'] as const
export const sayaDeskHostToolCapabilityValues = [
  'saya_desk.search_product_context',
  'saya_desk.list_notes',
  'saya_desk.get_project_context',
  'saya_desk.list_project_tasks',
  'saya_desk.get_note_content'
] as const

export const sayaDeskSayachanFocusSchema = z.object({
  type: z.enum(sayaDeskSayachanFocusTypeValues),
  id: z.string().min(1)
}).strict()

export const sayaDeskSayachanOptionsSchema = z.object({
  debug: z.boolean().optional()
}).strict()

export const sayaDeskSayachanTurnActivityItemKindValues = [
  'assistant_progress',
  'tool_status',
  'capability_notice'
] as const

export const sayaDeskSayachanTurnActivityStatusValues = [
  'planned',
  'started',
  'completed',
  'skipped',
  'unavailable',
  'failed'
] as const

export const sayaDeskSayachanTurnActivityDisplayValues = [
  'collapse_item',
  'inline_during_turn'
] as const

export const sayaDeskSayachanTurnActivityItemSchema = z.object({
  itemId: z.string().min(1),
  kind: z.enum(sayaDeskSayachanTurnActivityItemKindValues),
  status: z.enum(sayaDeskSayachanTurnActivityStatusValues),
  text: z.string().min(1),
  display: z.enum(sayaDeskSayachanTurnActivityDisplayValues),
  canonicalMessage: z.literal(false),
  capability: z.string().min(1).nullable().optional(),
  sourceTrace: z.array(z.string()).optional()
}).strict()

export const sayaDeskSayachanTurnActivitySchema = z.object({
  defaultCollapsed: z.boolean(),
  items: z.array(sayaDeskSayachanTurnActivityItemSchema)
}).strict()

export const sayaDeskHostToolRiskValues = ['read_only', 'write', 'external_effect', 'unknown'] as const
export const sayaDeskHostToolExecutionStatusValues = ['completed', 'denied', 'failed', 'unavailable'] as const

export const sayaDeskHostToolCapabilityDeclarationSchema = z.object({
  name: z.enum(sayaDeskHostToolCapabilityValues),
  description: z.string().min(1),
  parameterSchema: z.record(z.string(), z.unknown()).default({}),
  resultSummary: z.string().min(1).optional()
}).strict()

export const sayaDeskHostCapabilityManifestSchema = z.object({
  packetType: z.literal('saya_desk_host_capability_manifest'),
  version: z.literal(1),
  status: z.enum(['declared_only', 'executable']),
  tools: z.array(sayaDeskHostToolCapabilityDeclarationSchema)
}).strict()

export const sayaDeskHostToolSourceReceiptSchema = z.object({
  type: z.enum(sayaDeskSayachanFocusTypeValues),
  title: z.string().min(1)
}).strict()

export const sayaDeskHostToolExecutionErrorSchema = z.object({
  code: z.string().min(1),
  message: z.string().min(1).optional()
}).strict()

export const sayaDeskHostToolExecutionRequestSchema = z.object({
  requestId: z.string().min(1),
  turnId: z.string().min(1),
  hostId: z.literal('saya-desk'),
  hostUserId: z.string().min(1),
  capability: z.enum(sayaDeskHostToolCapabilityValues),
  arguments: z.record(z.string(), z.unknown()).default({}),
  risk: z.enum(sayaDeskHostToolRiskValues).default('unknown'),
  requiresConfirmation: z.boolean().default(true),
  sourceTrace: z.array(z.string()).optional()
}).strict()

export const sayaDeskHostToolExecutionResultSchema = z.object({
  requestId: z.string().min(1),
  status: z.enum(sayaDeskHostToolExecutionStatusValues),
  capability: z.enum(sayaDeskHostToolCapabilityValues),
  result: z.unknown().optional(),
  resultSummary: z.string().min(1).optional(),
  sourceReceipts: z.array(sayaDeskHostToolSourceReceiptSchema).optional(),
  truncated: z.boolean().optional(),
  error: sayaDeskHostToolExecutionErrorSchema.optional(),
  sourceTrace: z.array(z.string()).optional()
}).strict()

export const sayaDeskSayachanAssistantOutputKindValues = ['activity_text', 'final_text'] as const
export const sayaDeskSayachanTurnAdvanceStatusValues = [
  'completed',
  'needs_host_action',
  'blocked',
  'failed'
] as const

export const sayaDeskSayachanAssistantOutputItemSchema = z.object({
  outputId: z.string().min(1),
  kind: z.enum(sayaDeskSayachanAssistantOutputKindValues),
  text: z.string().min(1),
  sourceTrace: z.array(z.string()).default([])
}).strict()

export const sayaDeskSayachanToolProposalSchema = z.object({
  proposalId: z.string().min(1),
  providerCallId: z.string().min(1),
  providerToolName: z.string().min(1),
  capability: z.enum(sayaDeskHostToolCapabilityValues),
  arguments: z.record(z.string(), z.unknown()).default({}),
  sourceTrace: z.array(z.string()).default([])
}).strict()

export const sayaDeskSayachanCandidateObservedAffectSchema = z.object({
  valence: z.number().min(0).max(1),
  arousal: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1)
}).strict()

export const sayaDeskSayachanCandidateReflectionSchema = z.object({
  content: z.string().min(1),
  valence: z.number().min(0).max(1),
  arousal: z.number().min(0).max(1),
  confidence: z.number().min(0).max(1)
}).strict()

export const sayaDeskSayachanCandidateProposalKindValues = [
  'memory',
  'relationship_sediment',
  'character_state',
  'reflection_artifact'
] as const

export const sayaDeskSayachanCandidateProposalSchema = z.object({
  proposalId: z.string().min(1),
  kind: z.enum(sayaDeskSayachanCandidateProposalKindValues),
  memoryKind: z.enum([
    'user_fact',
    'user_preference',
    'interaction_preference',
    'important_event'
  ]).optional(),
  content: z.string().min(1),
  reason: z.string().min(1),
  confidence: z.number().min(0).max(1),
  userConfirmationRequired: z.boolean().default(true),
  observedAffect: sayaDeskSayachanCandidateObservedAffectSchema.nullable().optional(),
  reflection: sayaDeskSayachanCandidateReflectionSchema.nullable().optional(),
  sourceTrace: z.array(z.string()).default([])
}).strict()

export const sayaDeskSayachanMemorySourceRefSchema = z.object({
  sourceId: z.string().min(1),
  sourceType: z.enum([
    'turn',
    'advance',
    'host_tool_result',
    'host_context',
    'manual_review',
    'system_seed',
    'other'
  ]),
  summary: z.string().min(1).nullable().optional(),
  sourceTrace: z.array(z.string()).default([])
}).strict()

export const sayaDeskSayachanMemoryRecordSchema = z.object({
  memoryId: z.string().min(1),
  coreSubjectId: z.string().min(1),
  kind: z.enum([
    'user_fact',
    'user_preference',
    'interaction_preference',
    'important_event'
  ]),
  content: z.string().min(1),
  status: z.enum([
    'candidate',
    'active',
    'resolved',
    'superseded',
    'archived',
    'corrected',
    'deleted',
    'rejected'
  ]).default('active'),
  scope: z.enum(['core_subject', 'relationship', 'host', 'conversation']).default('core_subject'),
  sourceRefs: z.array(sayaDeskSayachanMemorySourceRefSchema).default([]),
  confidence: z.number().min(0).max(1).default(0.5),
  sensitivity: z.enum(['low', 'medium', 'high']).default('low'),
  reconciliationKey: z.string().min(1).nullable().optional(),
  expiresAt: z.string().min(1).nullable().optional(),
  resolvedAt: z.string().min(1).nullable().optional(),
  supersedes: z.array(z.string()).default([]),
  supersededBy: z.string().min(1).nullable().optional(),
  createdAt: z.string().min(1).nullable().optional(),
  updatedAt: z.string().min(1).nullable().optional()
}).strict()

export const sayaDeskSayachanCoreSubjectSchema = z.object({
  coreSubjectId: z.string().min(1),
  subjectType: z.enum(['person', 'group', 'agent', 'other']).default('person')
}).strict()

export const sayaDeskSayachanCreateCoreSubjectRequestSchema = z.object({
  subjectType: z.enum(['person', 'group', 'agent', 'other']).default('person')
}).strict()

export const sayaDeskSayachanCreateCoreSubjectResultSchema = z.object({
  coreSubject: sayaDeskSayachanCoreSubjectSchema,
  sourceTrace: z.array(z.string()).default([])
}).strict()

export const sayaDeskSayachanAcceptMemoryCandidateRequestSchema = z.object({
  coreSubjectId: z.string().min(1),
  candidateProposal: sayaDeskSayachanCandidateProposalSchema,
  sourceRefs: z.array(sayaDeskSayachanMemorySourceRefSchema).default([]),
  scope: z.enum(['core_subject', 'relationship', 'host', 'conversation']).default('core_subject'),
  sensitivity: z.enum(['low', 'medium', 'high']).default('low'),
  reconciliationKey: z.string().min(1).nullable().optional(),
  expiresAt: z.string().min(1).nullable().optional()
}).strict()

export const sayaDeskSayachanAcceptMemoryCandidateResultSchema = z.object({
  status: z.literal('accepted'),
  memoryRecord: sayaDeskSayachanMemoryRecordSchema,
  sourceTrace: z.array(z.string()).default([])
}).strict()

export const sayaDeskSayachanToolOutputSchema = z.object({
  proposalId: z.string().min(1).optional(),
  providerCallId: z.string().min(1),
  capability: z.enum(sayaDeskHostToolCapabilityValues),
  status: z.enum(sayaDeskHostToolExecutionStatusValues),
  result: z.unknown().optional(),
  resultSummary: z.string().min(1).optional(),
  sourceReceipts: z.array(sayaDeskHostToolSourceReceiptSchema).default([]),
  truncated: z.boolean().default(false),
  error: sayaDeskHostToolExecutionErrorSchema.optional(),
  sourceTrace: z.array(z.string()).default([])
}).strict()

export const sayaDeskSayachanAdvanceConversationMessageSchema = z.object({
  role: z.enum(['user', 'assistant', 'system', 'tool']),
  content: z.string().min(1)
}).strict()

export const sayaDeskSayachanAdvanceConversationSchema = z.object({
  conversationId: z.string().min(1).nullable().optional(),
  sessionId: z.string().min(1).nullable().optional(),
  recentMessages: z.array(sayaDeskSayachanAdvanceConversationMessageSchema).default([])
}).strict()

export const sayaDeskSayachanAdvanceHostSchema = z.object({
  hostId: z.literal('saya-desk'),
  surface: z.enum(sayaDeskSayachanSurfaceValues).default('workspace-chat'),
  hostUserId: z.string().min(1).nullable().optional(),
  coreSubjectId: z.string().min(1).nullable().optional(),
  locale: z.string().min(1).nullable().optional(),
  timezone: z.string().min(1).nullable().optional(),
  authorizedContext: z.record(z.string(), z.unknown()).default({})
}).strict()

export const sayaDeskSayachanAdvanceTurnInputSchema = z.object({
  text: z.string().trim().min(1)
}).strict()

export const sayaDeskSayachanAdvanceTurnRequestSchema = z.object({
  host: sayaDeskSayachanAdvanceHostSchema,
  conversation: sayaDeskSayachanAdvanceConversationSchema.default({ recentMessages: [] }),
  options: sayaDeskSayachanOptionsSchema.default({}),
  input: sayaDeskSayachanAdvanceTurnInputSchema.optional(),
  turnCursor: z.string().min(1).optional(),
  toolOutputs: z.array(sayaDeskSayachanToolOutputSchema).default([]),
  hostToolManifest: sayaDeskHostCapabilityManifestSchema.optional()
}).strict().superRefine((value, ctx) => {
  const hasInput = value.input !== undefined
  const hasCursor = value.turnCursor !== undefined
  if (hasInput === hasCursor) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Advance turn request requires exactly one of input or turnCursor.',
      path: ['turnCursor']
    })
  }
  if (value.toolOutputs.length > 0 && !hasCursor) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'toolOutputs can only continue an existing turnCursor.',
      path: ['toolOutputs']
    })
  }
})

export const sayaDeskSayachanTurnAdvanceResultSchema = z.object({
  turnId: z.string().min(1),
  advanceId: z.string().min(1),
  turnCursor: z.string().min(1).nullable().optional(),
  status: z.enum(sayaDeskSayachanTurnAdvanceStatusValues),
  assistantOutput: z.array(sayaDeskSayachanAssistantOutputItemSchema).default([]),
  toolProposals: z.array(sayaDeskSayachanToolProposalSchema).default([]),
  candidateProposals: z.array(sayaDeskSayachanCandidateProposalSchema).default([]),
  turnActivity: sayaDeskSayachanTurnActivitySchema.optional(),
  trace: z.object({
    traceId: z.string().min(1),
    debugAvailable: z.boolean().optional()
  }).strict().optional(),
  debugTrace: z.record(z.string(), z.unknown()).optional()
}).strict().superRefine((value, ctx) => {
  if (value.status === 'needs_host_action' && value.toolProposals.length === 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'needs_host_action requires at least one tool proposal.',
      path: ['toolProposals']
    })
  }
})

export const sayaDeskSayachanRequestSchema = z.object({
  text: z.string().trim().min(1),
  surface: z.enum(sayaDeskSayachanSurfaceValues).default('workspace-chat'),
  focus: sayaDeskSayachanFocusSchema.nullable().optional(),
  conversationId: z.string().min(1).optional(),
  options: sayaDeskSayachanOptionsSchema.optional()
}).strict()

export const sayaDeskSayachanTraceSchema = z.object({
  traceId: z.string().min(1),
  debugAvailable: z.boolean().optional()
}).strict()

const sayaDeskSayachanStandingPreferencesDebugSchema = z.object({
  status: z.string().min(1).optional(),
  persistence: z.string().min(1).optional(),
  surfaced_count: z.number().optional(),
  content: z.string().nullable().optional(),
  source_memory_count: z.number().optional(),
  source_trace: z.array(z.string()).optional()
}).passthrough()

export const sayaDeskSayachanDebugTraceSchema = z.object({
  runtime: z.string().min(1),
  provider: z.string().min(1).optional(),
  provider_model: z.string().min(1).optional(),
  provider_response_id: z.string().nullable().optional(),
  advance_kind: z.string().min(1).optional(),
  participation_profile: z.record(z.string(), z.unknown()).optional(),
  state_snapshot: z.object({
    standing_preferences: sayaDeskSayachanStandingPreferencesDebugSchema.optional()
  }).passthrough().optional(),
  stage_summaries: z.array(z.object({
    stage_name: z.string().min(1),
    status: z.enum(['completed', 'skipped', 'failed']),
    notes: z.array(z.string()),
    source_trace: z.array(z.string())
  }).strict()).optional(),
  source_trace: z.array(z.string()).optional()
}).passthrough()

export const sayaDeskSayachanResponseSchema = z.object({
  reply: z.string().min(1),
  messageId: z.string().min(1).optional(),
  turnId: z.string().min(1).optional(),
  candidateProposals: z.array(sayaDeskSayachanCandidateProposalSchema).optional(),
  turnActivity: sayaDeskSayachanTurnActivitySchema.optional(),
  trace: sayaDeskSayachanTraceSchema.optional(),
  debugTrace: sayaDeskSayachanDebugTraceSchema.optional()
}).strict()

export const sayaDeskSayachanStreamEventSchema = z.discriminatedUnion('type', [
  z.object({
    packetType: z.literal('saya_desk_sayachan_stream_event').default('saya_desk_sayachan_stream_event'),
    version: z.literal(1).default(1),
    type: z.enum(sayaDeskSayachanTurnActivityItemKindValues),
    item: sayaDeskSayachanTurnActivityItemSchema
  }).strict(),
  z.object({
    packetType: z.literal('saya_desk_sayachan_stream_event').default('saya_desk_sayachan_stream_event'),
    version: z.literal(1).default(1),
    type: z.literal('assistant_delta'),
    delta: z.string(),
    text: z.string()
  }).strict(),
  z.object({
    packetType: z.literal('saya_desk_sayachan_stream_event').default('saya_desk_sayachan_stream_event'),
    version: z.literal(1).default(1),
    type: z.literal('completed'),
    reply: z.string().min(1),
    messageId: z.string().min(1).optional(),
    turnId: z.string().min(1).optional(),
    candidateProposals: z.array(sayaDeskSayachanCandidateProposalSchema).optional(),
    turnActivity: sayaDeskSayachanTurnActivitySchema.optional(),
    trace: sayaDeskSayachanTraceSchema.optional(),
    debugTrace: sayaDeskSayachanDebugTraceSchema.optional()
  }).strict(),
  z.object({
    packetType: z.literal('saya_desk_sayachan_stream_event').default('saya_desk_sayachan_stream_event'),
    version: z.literal(1).default(1),
    type: z.literal('error'),
    error: z.object({
      code: z.string().min(1).optional(),
      message: z.string().min(1).optional()
    }).strict().optional()
  }).strict()
])

export type SayaDeskSayachanSurface = (typeof sayaDeskSayachanSurfaceValues)[number]
export type SayaDeskSayachanFocusType = (typeof sayaDeskSayachanFocusTypeValues)[number]
export type SayaDeskHostToolCapability = (typeof sayaDeskHostToolCapabilityValues)[number]
export type SayaDeskSayachanFocusDto = z.infer<typeof sayaDeskSayachanFocusSchema>
export type SayaDeskSayachanTurnActivityItemDto = z.infer<typeof sayaDeskSayachanTurnActivityItemSchema>
export type SayaDeskSayachanTurnActivityDto = z.infer<typeof sayaDeskSayachanTurnActivitySchema>
export type SayaDeskSayachanDebugTraceDto = z.infer<typeof sayaDeskSayachanDebugTraceSchema>
export type SayaDeskSayachanStreamEventDto = z.infer<typeof sayaDeskSayachanStreamEventSchema>
export type SayaDeskHostToolCapabilityDeclarationDto = z.infer<typeof sayaDeskHostToolCapabilityDeclarationSchema>
export type SayaDeskHostCapabilityManifestDto = z.infer<typeof sayaDeskHostCapabilityManifestSchema>
export type SayaDeskHostToolExecutionRequestDto = z.infer<typeof sayaDeskHostToolExecutionRequestSchema>
export type SayaDeskHostToolExecutionResultDto = z.infer<typeof sayaDeskHostToolExecutionResultSchema>
export type SayaDeskSayachanAssistantOutputItemDto = z.infer<typeof sayaDeskSayachanAssistantOutputItemSchema>
export type SayaDeskSayachanToolProposalDto = z.infer<typeof sayaDeskSayachanToolProposalSchema>
export type SayaDeskSayachanCandidateProposalDto = z.infer<typeof sayaDeskSayachanCandidateProposalSchema>
export type SayaDeskSayachanAcceptMemoryCandidateRequestDto = z.infer<typeof sayaDeskSayachanAcceptMemoryCandidateRequestSchema>
export type SayaDeskSayachanAcceptMemoryCandidateResultDto = z.infer<typeof sayaDeskSayachanAcceptMemoryCandidateResultSchema>
export type SayaDeskSayachanCreateCoreSubjectRequestDto = z.infer<typeof sayaDeskSayachanCreateCoreSubjectRequestSchema>
export type SayaDeskSayachanCreateCoreSubjectResultDto = z.infer<typeof sayaDeskSayachanCreateCoreSubjectResultSchema>
export type SayaDeskSayachanToolOutputDto = z.infer<typeof sayaDeskSayachanToolOutputSchema>
export type SayaDeskSayachanAdvanceTurnRequestDto = z.infer<typeof sayaDeskSayachanAdvanceTurnRequestSchema>
export type SayaDeskSayachanTurnAdvanceResultDto = z.infer<typeof sayaDeskSayachanTurnAdvanceResultSchema>
export type SayaDeskSayachanRequestDto = z.infer<typeof sayaDeskSayachanRequestSchema>
export type SayaDeskSayachanResponseDto = z.infer<typeof sayaDeskSayachanResponseSchema>
