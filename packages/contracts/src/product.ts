import { z } from 'zod'

export const projectStatusValues = ['pending', 'in_progress', 'completed', 'on_hold'] as const
export const taskCreationModeValues = ['ai', 'manual'] as const
export const taskStatusValues = ['active', 'completed'] as const

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

export const noteTaskDraftsResponseSchema = z.object({
  drafts: z.array(z.string())
})

export const projectNextActionsResponseSchema = z.object({
  suggestions: z.array(z.string())
})

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

export type ProjectStatus = z.infer<typeof projectWriteSchema>['status']
export type TaskCreationMode = (typeof taskCreationModeValues)[number]
export type TaskStatus = (typeof taskStatusValues)[number]
export type NoteCreateDto = z.infer<typeof noteCreateSchema>
export type NoteUpdateDto = z.infer<typeof noteUpdateSchema>
export type NoteWriteDto = z.infer<typeof noteWriteSchema>
export type NoteDto = z.infer<typeof noteResponseSchema>
export type ProjectCreateDto = z.infer<typeof projectCreateSchema>
export type ProjectUpdateDto = z.infer<typeof projectUpdateSchema>
export type ProjectWriteDto = z.infer<typeof projectWriteSchema>
export type ProjectDto = z.infer<typeof projectResponseSchema>
export type NoteTaskDraftsResponseDto = z.infer<typeof noteTaskDraftsResponseSchema>
export type ProjectNextActionsResponseDto = z.infer<typeof projectNextActionsResponseSchema>
export type TaskCreateDto = z.infer<typeof taskCreateSchema>
export type TaskUpdateDto = z.infer<typeof taskUpdateSchema>
export type TaskDto = z.infer<typeof taskResponseSchema>
