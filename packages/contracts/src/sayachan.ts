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
export const sayaDeskHostToolExecutionValues = [
  'future_tool_lane',
  'host_gateway_route',
  'host_tool_channel'
] as const
export const sayaDeskHostToolExecutionStatusValues = ['completed', 'denied', 'failed', 'unavailable'] as const

export const sayaDeskHostToolCapabilityDeclarationSchema = z.object({
  name: z.enum(sayaDeskHostToolCapabilityValues),
  label: z.string().min(1),
  description: z.string().min(1),
  parameterSchema: z.record(z.string(), z.unknown()).default({}),
  resultSummary: z.string().min(1).optional(),
  risk: z.enum(sayaDeskHostToolRiskValues),
  requiresConfirmation: z.boolean(),
  execution: z.enum(sayaDeskHostToolExecutionValues)
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

export const sayaDeskSayachanConfidenceSignalSchema = z.object({
  value: z.string().min(1),
  confidence: z.number(),
  reason: z.string()
}).strict()

export const sayaDeskSayachanBooleanSignalSchema = z.object({
  active: z.boolean(),
  confidence: z.number(),
  reason: z.string()
}).strict()

export const sayaDeskSayachanStateTriggerSchema = z.object({
  name: z.string().min(1),
  target: z.string().min(1),
  confidence: z.number(),
  reason: z.string()
}).strict()

export const sayaDeskSayachanSemanticsTraceSchema = z.object({
  taskShape: sayaDeskSayachanConfidenceSignalSchema,
  productContextNeed: sayaDeskSayachanConfidenceSignalSchema,
  vulnerabilitySignal: sayaDeskSayachanBooleanSignalSchema,
  repairNeed: sayaDeskSayachanBooleanSignalSchema,
  faceSavingNeed: sayaDeskSayachanBooleanSignalSchema,
  edgeSuitability: sayaDeskSayachanConfidenceSignalSchema,
  stateTriggers: z.array(sayaDeskSayachanStateTriggerSchema).optional()
}).strict()

export const sayaDeskSayachanTraceSignalSchema = z.object({
  name: z.string().min(1),
  value: z.string().min(1),
  confidence: z.number(),
  reason: z.string()
}).strict()

export const sayaDeskSayachanStageSummarySchema = z.object({
  stageName: z.string().min(1),
  status: z.enum(['completed', 'skipped', 'failed']),
  notes: z.array(z.string()),
  sourceTrace: z.array(z.string())
}).strict()

export const sayaDeskSayachanResponsePlanTraceSchema = z.object({
  selectedTurnShape: z.string().min(1),
  interactionPosture: z.string().min(1),
  contextUse: z.string().min(1),
  stateAttention: z.array(z.string()),
  voicePressure: z.string().min(1),
  providerFocus: z.string().min(1),
  reasonCodes: z.array(z.string()),
  sourceTrace: z.array(z.string())
}).strict()

export const sayaDeskSayachanInternalCandidateSummarySchema = z.object({
  statePatchCandidateCount: z.number(),
  memoryCandidateCount: z.number(),
  toolStepProposalCount: z.number(),
  agentStepCount: z.number(),
  toolIntentCandidateCount: z.number(),
  hostToolResultCount: z.number(),
  toolResultCardCount: z.number(),
  turnActivityItemCount: z.number(),
  statePatchTargets: z.array(z.string()),
  memoryCandidateKinds: z.array(z.string()),
  toolStepProposalKinds: z.array(z.string()),
  toolStepProposalStatuses: z.array(z.string()),
  agentStepKinds: z.array(z.string()),
  agentStepStatuses: z.array(z.string()),
  toolIntentCapabilities: z.array(z.string()),
  hostToolResultStatuses: z.array(z.string()),
  toolResultCardStatuses: z.array(z.string()),
  turnActivityKinds: z.array(z.string())
}).strict()

export const sayaDeskSayachanDebugTraceSchema = z.object({
  runtime: z.string().min(1),
  provider: z.string().min(1),
  providerModel: z.string().min(1),
  providerResponseId: z.string().nullable().optional(),
  semantics: sayaDeskSayachanSemanticsTraceSchema,
  judgmentSignals: z.array(sayaDeskSayachanTraceSignalSchema),
  stageSummaries: z.array(sayaDeskSayachanStageSummarySchema),
  resolverNotes: z.array(z.string()),
  responsePlan: sayaDeskSayachanResponsePlanTraceSchema.nullable().optional(),
  sourceTrace: z.array(z.string()),
  internalCandidateSummary: sayaDeskSayachanInternalCandidateSummarySchema
}).strict()

export const sayaDeskSayachanResponseSchema = z.object({
  reply: z.string().min(1),
  turnId: z.string().min(1).optional(),
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
    turnId: z.string().min(1).optional(),
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
export type SayaDeskSayachanRequestDto = z.infer<typeof sayaDeskSayachanRequestSchema>
export type SayaDeskSayachanResponseDto = z.infer<typeof sayaDeskSayachanResponseSchema>
