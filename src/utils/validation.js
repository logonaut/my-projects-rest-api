import { z } from 'zod'
import { ApiError } from './errors.js'

const idParamSchema = z
  .string()
  .regex(/^\d+$/, { error: 'ID must be a positive integer.' })
  .transform((value) => Number(value))
  .refine((value) => Number.isSafeInteger(value) && value > 0, {
    error: 'ID must be a positive integer.',
  })

export function parseIdParam(rawValue, fieldName = 'id') {
  const result = idParamSchema.safeParse(rawValue)

  if (!result.success) {
    throw new ApiError(400, 'BAD_REQUEST', 'Malformed request.', [
      {
        field: fieldName,
        issue:
          result.error.issues[0]?.message || 'ID must be a positive integer.',
      },
    ])
  }

  return result.data
}