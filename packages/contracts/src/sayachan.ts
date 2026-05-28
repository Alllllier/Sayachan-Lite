import { z } from 'zod'

export const sayaDeskSayachanSurfaceValues = [
  'workspace-chat',
  'dashboard',
  'note-detail',
  'project-detail',
  'task-detail'
] as const

export const sayaDeskSayachanFocusTypeValues = ['note', 'project', 'task'] as const

export const sayaDeskSayachanFocusSchema = z.object({
  type: z.enum(sayaDeskSayachanFocusTypeValues),
  id: z.string().min(1)
}).strict()

export const sayaDeskSayachanOptionsSchema = z.object({
  debug: z.boolean().optional()
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

export const sayaDeskSayachanResponseSchema = z.object({
  reply: z.string().min(1),
  turnId: z.string().min(1).optional(),
  trace: sayaDeskSayachanTraceSchema.optional()
}).strict()

export type SayaDeskSayachanSurface = (typeof sayaDeskSayachanSurfaceValues)[number]
export type SayaDeskSayachanFocusType = (typeof sayaDeskSayachanFocusTypeValues)[number]
export type SayaDeskSayachanFocusDto = z.infer<typeof sayaDeskSayachanFocusSchema>
export type SayaDeskSayachanRequestDto = z.infer<typeof sayaDeskSayachanRequestSchema>
export type SayaDeskSayachanResponseDto = z.infer<typeof sayaDeskSayachanResponseSchema>
