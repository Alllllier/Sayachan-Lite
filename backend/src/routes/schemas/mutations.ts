import { z } from 'zod';

const PROJECT_STATUS_VALUES = ['pending', 'in_progress', 'completed', 'on_hold'] as const;
const TASK_CREATION_MODES = ['ai', 'manual'] as const;
const TASK_STATUSES = ['active', 'completed'] as const;

export type ProjectStatus = (typeof PROJECT_STATUS_VALUES)[number];
export type TaskCreationMode = (typeof TASK_CREATION_MODES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

const nonEmptyStringSchema = z.string().refine((value) => value.trim().length > 0);

export const noteCreateSchema = z.object({
  title: nonEmptyStringSchema,
  content: z.string().optional()
}).passthrough();

export type NoteCreateDto = z.infer<typeof noteCreateSchema>;

export const noteUpdateSchema = z.object({
  title: nonEmptyStringSchema.optional(),
  content: z.string().optional()
})
  .passthrough()
  .refine((body) => ['title', 'content'].some((field) => body[field] !== undefined));

export type NoteUpdateDto = z.infer<typeof noteUpdateSchema>;

export const projectCreateSchema = z.object({
  name: nonEmptyStringSchema,
  summary: nonEmptyStringSchema,
  status: z.enum(PROJECT_STATUS_VALUES).optional()
}).passthrough();

export type ProjectCreateDto = z.infer<typeof projectCreateSchema>;

export const projectUpdateSchema = z.object({
  name: nonEmptyStringSchema.optional(),
  summary: nonEmptyStringSchema.optional(),
  status: z.enum(PROJECT_STATUS_VALUES).optional(),
  currentFocusTaskId: z.union([z.string(), z.null()]).optional()
})
  .passthrough()
  .refine((body) => (
    ['name', 'summary', 'status', 'currentFocusTaskId'].some((field) => body[field] !== undefined)
  ));

export type ProjectUpdateDto = z.infer<typeof projectUpdateSchema>;

export const taskCreateSchema = z.object({
  title: nonEmptyStringSchema,
  creationMode: z.enum(TASK_CREATION_MODES).optional(),
  originModule: z.string().optional(),
  originId: z.union([z.string(), z.null()]).optional()
}).passthrough();

export type TaskCreateDto = z.infer<typeof taskCreateSchema>;

export const taskUpdateSchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  archived: z.boolean().optional(),
  completed: z.boolean().optional()
})
  .passthrough()
  .refine((body) => ['status', 'archived', 'completed'].some((field) => body[field] !== undefined));

export type TaskUpdateDto = z.infer<typeof taskUpdateSchema>;
