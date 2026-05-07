import { z } from 'zod'

export const authRoleValues = ['owner', 'tester'] as const
const nonEmptyStringSchema = z.string().refine(value => value.trim().length > 0)

export const authCredentialsSchema = z.object({
  email: nonEmptyStringSchema,
  password: z.string().min(8)
})

export const registerTesterSchema = authCredentialsSchema.extend({
  inviteCode: nonEmptyStringSchema
})

export const publicUserSchema = z.object({
  _id: z.string().nullable().optional(),
  email: z.string().optional(),
  role: z.enum(authRoleValues).optional(),
  disabled: z.boolean().optional(),
  createdAt: z.string().nullable().optional(),
  updatedAt: z.string().nullable().optional(),
  lastLoginAt: z.string().nullable().optional()
})

export const publicInviteSchema = z.object({
  _id: z.string().nullable().optional(),
  codePreview: z.string().optional(),
  createdBy: z.string().nullable().optional(),
  expiresAt: z.string().nullable().optional(),
  revokedAt: z.string().nullable().optional(),
  usedAt: z.string().nullable().optional(),
  usedBy: z.string().nullable().optional(),
  createdAt: z.string().nullable().optional()
})

export const createdInviteSchema = publicInviteSchema.extend({
  code: z.string().optional()
})

export const authLoginResponseSchema = z.object({
  sessionToken: z.string().optional(),
  user: publicUserSchema.nullable().optional(),
  error: z.string().optional()
})

export const ownerSystemStatusSchema = z.object({
  userCount: z.number(),
  testerCount: z.number(),
  activeInviteCount: z.number(),
  activeSessionCount: z.number(),
  roles: z.array(z.enum(authRoleValues))
})

export const publicUserListSchema = z.array(publicUserSchema)
export const publicInviteListSchema = z.array(publicInviteSchema)

export type AuthRole = (typeof authRoleValues)[number]
export type AuthCredentialsDto = z.infer<typeof authCredentialsSchema>
export type RegisterTesterDto = z.infer<typeof registerTesterSchema>
export type PublicUserDto = z.infer<typeof publicUserSchema>
export type PublicInviteDto = z.infer<typeof publicInviteSchema>
export type CreatedInviteDto = z.infer<typeof createdInviteSchema>
export type AuthLoginResponseDto = z.infer<typeof authLoginResponseSchema>
export type OwnerSystemStatusDto = z.infer<typeof ownerSystemStatusSchema>
