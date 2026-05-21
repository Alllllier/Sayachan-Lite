import { z } from 'zod'

export const projectStatusValues = ['pending', 'in_progress', 'completed', 'on_hold'] as const
export const taskCreationModeValues = ['ai', 'manual'] as const
export const taskStatusValues = ['active', 'completed'] as const
export const memoryEntryTypeValues = ['preference', 'continuity_hint'] as const
export const memoryEntrySourceValues = ['manual'] as const

const nonEmptyStringSchema = z.string().refine(value => value.trim().length > 0)

export const noteCreateSchema = z.object({
  title: nonEmptyStringSchema,
  content: z.string().optional()
})

export const noteUpdateSchema = z.object({
  title: nonEmptyStringSchema.optional(),
  content: z.string().optional()
}).refine(body => body.title !== undefined || body.content !== undefined)

export const noteWriteSchema = z.object({
  title: z.string(),
  content: z.string()
})

export const noteResponseSchema = noteWriteSchema.extend({
  _id: z.string(),
  archived: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  updatedAt: z.string()
})

export const noteListResponseSchema = z.array(noteResponseSchema)

export const projectCreateSchema = z.object({
  name: nonEmptyStringSchema,
  summary: nonEmptyStringSchema,
  status: z.enum(projectStatusValues).optional()
})

export const projectUpdateSchema = z.object({
  name: nonEmptyStringSchema.optional(),
  summary: nonEmptyStringSchema.optional(),
  status: z.enum(projectStatusValues).optional(),
  currentFocusTaskId: z.union([z.string(), z.null()]).optional()
}).refine(body => (
  body.name !== undefined
  || body.summary !== undefined
  || body.status !== undefined
  || body.currentFocusTaskId !== undefined
))

export const projectWriteSchema = z.object({
  name: z.string(),
  summary: z.string(),
  status: z.enum(projectStatusValues),
  currentFocusTaskId: z.union([z.string(), z.null()]).optional()
})

export const projectResponseSchema = projectWriteSchema.extend({
  _id: z.string(),
  archived: z.boolean().optional(),
  isPinned: z.boolean().optional(),
  updatedAt: z.string()
})

export const projectListResponseSchema = z.array(projectResponseSchema)

export const taskCreateSchema = z.object({
  title: nonEmptyStringSchema,
  creationMode: z.enum(taskCreationModeValues).optional(),
  originModule: z.string().optional(),
  originId: z.union([z.string(), z.null()]).optional()
})

export const taskUpdateSchema = z.object({
  status: z.enum(taskStatusValues).optional(),
  archived: z.boolean().optional(),
  completed: z.boolean().optional()
}).refine(body => body.status !== undefined || body.archived !== undefined || body.completed !== undefined)

export const taskResponseSchema = z.object({
  _id: z.union([z.string(), z.number()]).optional(),
  title: z.string().optional(),
  status: z.enum(taskStatusValues).optional(),
  archived: z.boolean().optional(),
  completed: z.boolean().optional(),
  creationMode: z.string().optional(),
  originModule: z.string().optional(),
  originId: z.union([z.string(), z.null()]).optional()
})

export const taskListResponseSchema = z.array(taskResponseSchema)

export const memoryEntryCreateSchema = z.object({
  type: z.enum(memoryEntryTypeValues),
  content: nonEmptyStringSchema,
  active: z.boolean().optional()
})

export const memoryEntryUpdateSchema = z.object({
  type: z.enum(memoryEntryTypeValues).optional(),
  content: nonEmptyStringSchema.optional(),
  active: z.boolean().optional()
}).refine(body => body.type !== undefined || body.content !== undefined || body.active !== undefined)

export const memoryEntryResponseSchema = z.object({
  _id: z.string(),
  type: z.enum(memoryEntryTypeValues),
  content: z.string(),
  active: z.boolean(),
  source: z.enum(memoryEntrySourceValues),
  createdAt: z.string().optional(),
  updatedAt: z.string().optional()
})

export const memoryEntryListResponseSchema = z.array(memoryEntryResponseSchema)

export type ProjectStatus = z.infer<typeof projectWriteSchema>['status']
export type TaskCreationMode = (typeof taskCreationModeValues)[number]
export type TaskStatus = (typeof taskStatusValues)[number]
export type MemoryEntryType = (typeof memoryEntryTypeValues)[number]
export type MemoryEntrySource = (typeof memoryEntrySourceValues)[number]
export type NoteCreateDto = z.infer<typeof noteCreateSchema>
export type NoteUpdateDto = z.infer<typeof noteUpdateSchema>
export type NoteWriteDto = z.infer<typeof noteWriteSchema>
export type NoteDto = z.infer<typeof noteResponseSchema>
export type ProjectCreateDto = z.infer<typeof projectCreateSchema>
export type ProjectUpdateDto = z.infer<typeof projectUpdateSchema>
export type ProjectWriteDto = z.infer<typeof projectWriteSchema>
export type ProjectDto = z.infer<typeof projectResponseSchema>
export type TaskCreateDto = z.infer<typeof taskCreateSchema>
export type TaskUpdateDto = z.infer<typeof taskUpdateSchema>
export type TaskDto = z.infer<typeof taskResponseSchema>
export type MemoryEntryCreateDto = z.infer<typeof memoryEntryCreateSchema>
export type MemoryEntryUpdateDto = z.infer<typeof memoryEntryUpdateSchema>
export type MemoryEntryDto = z.infer<typeof memoryEntryResponseSchema>
