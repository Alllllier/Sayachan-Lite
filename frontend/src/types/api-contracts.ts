import {
  authLoginResponseSchema,
  chatResponseSchema,
  createdInviteSchema,
  noteListResponseSchema,
  noteResponseSchema,
  noteTaskDraftsResponseSchema,
  ownerSystemStatusSchema,
  publicInviteListSchema,
  publicInviteSchema,
  publicUserListSchema,
  publicUserSchema,
  projectListResponseSchema,
  projectNextActionsResponseSchema,
  projectResponseSchema,
  taskListResponseSchema,
  taskResponseSchema
} from '@sayachan/contracts'

type ApiSchema<T> = {
  safeParse(value: unknown): { success: true, data: T } | { success: false }
}

export function assertApiResponse<T>(
  value: unknown,
  schema: ApiSchema<T>,
  responseLabel: string
): T {
  const result = schema.safeParse(value)
  if (result.success) {
    return result.data
  }

  throw new Error(`Invalid ${responseLabel} response`)
}

export {
  authLoginResponseSchema,
  chatResponseSchema,
  createdInviteSchema,
  noteListResponseSchema,
  noteResponseSchema,
  noteTaskDraftsResponseSchema,
  ownerSystemStatusSchema,
  publicInviteListSchema,
  publicInviteSchema,
  publicUserListSchema,
  publicUserSchema,
  projectListResponseSchema,
  projectNextActionsResponseSchema,
  projectResponseSchema,
  taskListResponseSchema,
  taskResponseSchema
}
