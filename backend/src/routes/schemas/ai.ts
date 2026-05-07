import { z } from 'zod';

const aiResourceIdSchema = z.object({
  _id: z.string().min(1)
}).strict();

export const aiNoteTaskRequestSchema = aiResourceIdSchema;
export const aiProjectNextActionRequestSchema = aiResourceIdSchema;

export type AiNoteTaskRequestDto = z.infer<typeof aiNoteTaskRequestSchema>;
export type AiProjectNextActionRequestDto = z.infer<typeof aiProjectNextActionRequestSchema>;

const aiChatMessageSchema = z.object({
  role: z.string().optional(),
  content: z.unknown().optional()
});

const runtimeFutureSlotsSchema = z.object({
  warmth: z.number().min(0).max(10).optional(),
  reflectionDepth: z.null().optional(),
  convergenceMode: z.enum(['explore', 'guided', 'decisive']).optional(),
  thinking: z.null().optional(),
  debugContext: z.null().optional()
});

const runtimeControlsSchema = z.object({
  personalityBaseline: z.enum(['warm', 'strict', 'haraguro']).optional(),
  futureSlots: runtimeFutureSlotsSchema.optional(),
  lastUserMessage: z.string().optional()
});

export const aiChatSchema = z.object({
  messages: z.array(aiChatMessageSchema).optional(),
  context: z.union([z.record(z.string(), z.unknown()), z.null()]).optional(),
  runtimeControls: runtimeControlsSchema.optional()
});

export type AiChatDto = z.infer<typeof aiChatSchema>;
