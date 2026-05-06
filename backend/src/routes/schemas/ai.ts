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

export const aiChatSchema = z.object({
  messages: z.array(aiChatMessageSchema).optional(),
  context: z.union([z.record(z.string(), z.unknown()), z.null()]).optional(),
  runtimeControls: z.unknown().optional()
});

export type AiChatDto = z.infer<typeof aiChatSchema>;
