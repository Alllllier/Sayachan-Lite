const { z } = require('zod');

const PROJECT_STATUS_VALUES = ['pending', 'in_progress', 'completed', 'on_hold'];
const TASK_CREATION_MODES = ['ai', 'manual'];
const TASK_STATUSES = ['active', 'completed'];

const nonEmptyStringSchema = z.string().refine((value) => value.trim().length > 0);

const noteCreateSchema = z.object({
  title: nonEmptyStringSchema,
  content: z.string().optional()
}).passthrough();

const noteUpdateSchema = z.object({
  title: nonEmptyStringSchema.optional(),
  content: z.string().optional()
})
  .passthrough()
  .refine((body) => ['title', 'content'].some((field) => body[field] !== undefined));

const projectCreateSchema = z.object({
  name: nonEmptyStringSchema,
  summary: nonEmptyStringSchema,
  status: z.enum(PROJECT_STATUS_VALUES).optional()
}).passthrough();

const projectUpdateSchema = z.object({
  name: nonEmptyStringSchema.optional(),
  summary: nonEmptyStringSchema.optional(),
  status: z.enum(PROJECT_STATUS_VALUES).optional(),
  currentFocusTaskId: z.union([z.string(), z.null()]).optional()
})
  .passthrough()
  .refine((body) => ['name', 'summary', 'status', 'currentFocusTaskId'].some((field) => body[field] !== undefined));

const taskCreateSchema = z.object({
  title: nonEmptyStringSchema,
  creationMode: z.enum(TASK_CREATION_MODES).optional(),
  originModule: z.string().optional()
}).passthrough();

const taskUpdateSchema = z.object({
  status: z.enum(TASK_STATUSES).optional(),
  archived: z.boolean().optional(),
  completed: z.boolean().optional()
})
  .passthrough()
  .refine((body) => ['status', 'archived', 'completed'].some((field) => body[field] !== undefined));

module.exports = {
  noteCreateSchema,
  noteUpdateSchema,
  projectCreateSchema,
  projectUpdateSchema,
  taskCreateSchema,
  taskUpdateSchema
};
