import {
  noteListResponseSchema,
  noteResponseSchema,
  noteTaskDraftsResponseSchema,
  projectListResponseSchema,
  projectNextActionsResponseSchema,
  projectResponseSchema
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
  noteListResponseSchema,
  noteResponseSchema,
  noteTaskDraftsResponseSchema,
  projectListResponseSchema,
  projectNextActionsResponseSchema,
  projectResponseSchema
}
