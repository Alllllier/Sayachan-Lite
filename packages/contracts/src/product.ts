import { z } from 'zod'

export const projectStatusValues = ['pending', 'in_progress', 'completed', 'on_hold'] as const
export const taskCreationModeValues = ['ai', 'manual'] as const
export const taskStatusValues = ['active', 'completed'] as const

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
  title: z.string(),
  creationMode: z.enum(taskCreationModeValues).optional(),
  originModule: z.string().optional(),
  originId: z.union([z.string(), z.null()]).optional()
})

export const taskUpdateSchema = z.object({
  status: z.enum(taskStatusValues).optional(),
  archived: z.boolean().optional(),
  completed: z.boolean().optional()
})

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
export type NoteWriteDto = z.infer<typeof noteWriteSchema>
export type NoteDto = z.infer<typeof noteResponseSchema>
export type ProjectWriteDto = z.infer<typeof projectWriteSchema>
export type ProjectDto = z.infer<typeof projectResponseSchema>
export type NoteTaskDraftsResponseDto = z.infer<typeof noteTaskDraftsResponseSchema>
export type ProjectNextActionsResponseDto = z.infer<typeof projectNextActionsResponseSchema>
export type TaskCreateDto = z.infer<typeof taskCreateSchema>
export type TaskUpdateDto = z.infer<typeof taskUpdateSchema>
export type TaskDto = z.infer<typeof taskResponseSchema>
