import { z } from 'zod';

const optionalIdSchema = z.union([z.string(), z.null()]).optional();

export const aiResourcePayloadSchema = z.object({
  _id: optionalIdSchema,
  id: optionalIdSchema,
  title: z.string().optional(),
  content: z.string().optional(),
  name: z.string().optional(),
  summary: z.string().optional(),
  status: z.string().optional(),
  currentFocusTaskId: z.unknown().optional()
});

export type AiResourcePayloadDto = z.infer<typeof aiResourcePayloadSchema>;

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
