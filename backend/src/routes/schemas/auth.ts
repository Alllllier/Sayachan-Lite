import { z } from 'zod';

const nonEmptyStringSchema = z.string().refine((value) => value.trim().length > 0);

export const authCredentialsSchema = z.object({
  email: nonEmptyStringSchema,
  password: z.string().min(8)
});

export type AuthCredentialsDto = z.infer<typeof authCredentialsSchema>;

export const registerTesterSchema = authCredentialsSchema.extend({
  inviteCode: nonEmptyStringSchema
});

export type RegisterTesterDto = z.infer<typeof registerTesterSchema>;
