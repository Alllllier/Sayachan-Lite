import { z } from 'zod'

export const projectStatusValues = ['pending', 'in_progress', 'completed', 'on_hold'] as const

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

export type ProjectStatus = z.infer<typeof projectWriteSchema>['status']
export type NoteWriteDto = z.infer<typeof noteWriteSchema>
export type NoteDto = z.infer<typeof noteResponseSchema>
export type ProjectWriteDto = z.infer<typeof projectWriteSchema>
export type ProjectDto = z.infer<typeof projectResponseSchema>
export type NoteTaskDraftsResponseDto = z.infer<typeof noteTaskDraftsResponseSchema>
export type ProjectNextActionsResponseDto = z.infer<typeof projectNextActionsResponseSchema>
