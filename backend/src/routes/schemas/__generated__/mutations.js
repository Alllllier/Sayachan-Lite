"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.taskUpdateSchema = exports.taskCreateSchema = exports.projectUpdateSchema = exports.projectCreateSchema = exports.noteUpdateSchema = exports.noteCreateSchema = void 0;
const zod_1 = require("zod");
const PROJECT_STATUS_VALUES = ['pending', 'in_progress', 'completed', 'on_hold'];
const TASK_CREATION_MODES = ['ai', 'manual'];
const TASK_STATUSES = ['active', 'completed'];
const nonEmptyStringSchema = zod_1.z.string().refine((value) => value.trim().length > 0);
exports.noteCreateSchema = zod_1.z.object({
    title: nonEmptyStringSchema,
    content: zod_1.z.string().optional()
}).passthrough();
exports.noteUpdateSchema = zod_1.z.object({
    title: nonEmptyStringSchema.optional(),
    content: zod_1.z.string().optional()
})
    .passthrough()
    .refine((body) => ['title', 'content'].some((field) => body[field] !== undefined));
exports.projectCreateSchema = zod_1.z.object({
    name: nonEmptyStringSchema,
    summary: nonEmptyStringSchema,
    status: zod_1.z.enum(PROJECT_STATUS_VALUES).optional()
}).passthrough();
exports.projectUpdateSchema = zod_1.z.object({
    name: nonEmptyStringSchema.optional(),
    summary: nonEmptyStringSchema.optional(),
    status: zod_1.z.enum(PROJECT_STATUS_VALUES).optional(),
    currentFocusTaskId: zod_1.z.union([zod_1.z.string(), zod_1.z.null()]).optional()
})
    .passthrough()
    .refine((body) => (['name', 'summary', 'status', 'currentFocusTaskId'].some((field) => body[field] !== undefined)));
exports.taskCreateSchema = zod_1.z.object({
    title: nonEmptyStringSchema,
    creationMode: zod_1.z.enum(TASK_CREATION_MODES).optional(),
    originModule: zod_1.z.string().optional()
}).passthrough();
exports.taskUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(TASK_STATUSES).optional(),
    archived: zod_1.z.boolean().optional(),
    completed: zod_1.z.boolean().optional()
})
    .passthrough()
    .refine((body) => ['status', 'archived', 'completed'].some((field) => body[field] !== undefined));
