import { z } from 'zod';
declare const PROJECT_STATUS_VALUES: readonly ["pending", "in_progress", "completed", "on_hold"];
declare const TASK_CREATION_MODES: readonly ["ai", "manual"];
declare const TASK_STATUSES: readonly ["active", "completed"];
export type ProjectStatus = (typeof PROJECT_STATUS_VALUES)[number];
export type TaskCreationMode = (typeof TASK_CREATION_MODES)[number];
export type TaskStatus = (typeof TASK_STATUSES)[number];
export declare const noteCreateSchema: z.ZodObject<{
    title: z.ZodString;
    content: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export type NoteCreateDto = z.infer<typeof noteCreateSchema>;
export declare const noteUpdateSchema: z.ZodObject<{
    title: z.ZodOptional<z.ZodString>;
    content: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export type NoteUpdateDto = z.infer<typeof noteUpdateSchema>;
export declare const projectCreateSchema: z.ZodObject<{
    name: z.ZodString;
    summary: z.ZodString;
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        in_progress: "in_progress";
        completed: "completed";
        on_hold: "on_hold";
    }>>;
}, z.core.$loose>;
export type ProjectCreateDto = z.infer<typeof projectCreateSchema>;
export declare const projectUpdateSchema: z.ZodObject<{
    name: z.ZodOptional<z.ZodString>;
    summary: z.ZodOptional<z.ZodString>;
    status: z.ZodOptional<z.ZodEnum<{
        pending: "pending";
        in_progress: "in_progress";
        completed: "completed";
        on_hold: "on_hold";
    }>>;
    currentFocusTaskId: z.ZodOptional<z.ZodUnion<readonly [z.ZodString, z.ZodNull]>>;
}, z.core.$loose>;
export type ProjectUpdateDto = z.infer<typeof projectUpdateSchema>;
export declare const taskCreateSchema: z.ZodObject<{
    title: z.ZodString;
    creationMode: z.ZodOptional<z.ZodEnum<{
        ai: "ai";
        manual: "manual";
    }>>;
    originModule: z.ZodOptional<z.ZodString>;
}, z.core.$loose>;
export type TaskCreateDto = z.infer<typeof taskCreateSchema>;
export declare const taskUpdateSchema: z.ZodObject<{
    status: z.ZodOptional<z.ZodEnum<{
        completed: "completed";
        active: "active";
    }>>;
    archived: z.ZodOptional<z.ZodBoolean>;
    completed: z.ZodOptional<z.ZodBoolean>;
}, z.core.$loose>;
export type TaskUpdateDto = z.infer<typeof taskUpdateSchema>;
export {};
