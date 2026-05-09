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

export async function parseApiJsonResponse<T>(
  response: Response,
  errorMessage: string,
  schema: ApiSchema<T>,
  responseLabel: string
): Promise<T> {
  if (!response.ok) {
    throw new Error(errorMessage)
  }

  return assertApiResponse(await response.json() as unknown, schema, responseLabel)
}

export async function parseOptionalApiJsonResponse<T>(
  response: Response,
  errorMessage: string,
  schema: ApiSchema<T>,
  responseLabel: string
): Promise<T | null | undefined> {
  if (!response.ok) {
    throw new Error(errorMessage)
  }

  const payload = await response.json() as unknown
  if (payload === null || payload === undefined) {
    return payload
  }

  return assertApiResponse(payload, schema, responseLabel)
}
