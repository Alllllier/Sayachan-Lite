import { z } from 'zod';
import { projectStatusValues } from '@sayachan/contracts';

const TASK_CREATION_MODES = ['ai', 'manual'] as const;
const TASK_STATUSES = ['active', 'completed'] as const;

export type { ProjectStatus } from '@sayachan/contracts';
export type TaskCreationMode = (typeof TASK_CREATION_MODES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];

const nonEmptyStringSchema = z.string().refine((value) => value.trim().length > 0);

export const noteCreateSchema = z.object({
  title: nonEmptyStringSchema,
  content: z.string().optional()
});

export type NoteCreateDto = z.infer<typeof noteCreateSchema>;

export const noteUpdateSchema = z.object({
  title: nonEmptyStringSchema.optional(),
  content: z.string().optional()
})
  .refine((body) => body.title !== undefined || body.content !== undefined);

export type NoteUpdateDto = z.infer<typeof noteUpdateSchema>;

export const projectCreateSchema = z.object({
  name: nonEmptyStringSchema,
  summary: nonEmptyStringSchema,
  status: z.enum(projectStatusValues).optional()
});

export type ProjectCreateDto = z.infer<typeof projectCreateSchema>;

export const projectUpdateSchema = z.object({
  name: nonEmptyStringSchema.optional(),
  summary: nonEmptyStringSchema.optional(),
  status: z.enum(projectStatusValues).optional(),
  currentFocusTaskId: z.union([z.string(), z.null()]).optional()
})
  .refine((body) => (
    body.name !== undefined
    || body.summary !== undefined
    || body.status !== undefined
    || body.currentFocusTaskId !== undefined
  ));

export type ProjectUpdateDto = z.infer<typeof projectUpdateSchema>;

export const taskCreateSchema = z.object({
  title: nonEmptyStringSchema,
  creationMode: z.enum(TASK_CREATION_MODES).optional(),
  originModule: z.string().optional(),
  originId: z.union([z.string(), z.null()]).optional()
});

export type TaskCreateDto = z.infer<typeof taskCreateSchema>;

export const taskUpdateSchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  archived: z.boolean().optional(),
  completed: z.boolean().optional()
})
  .refine((body) => body.status !== undefined || body.archived !== undefined || body.completed !== undefined);

export type TaskUpdateDto = z.infer<typeof taskUpdateSchema>;
