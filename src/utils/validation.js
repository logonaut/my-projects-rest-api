import { z } from 'zod'
import { ApiError } from './errors.js'

const idParamSchema = z
  .string({ error: 'ID must be a string.' })
  .regex(/^\d+$/, { error: 'ID must be a numeric string.' })
  .transform(Number)
  .refine((n) => Number.isSafeInteger(n) && n > 0, {
    error: 'ID must be a positive integer.',
  })

export function parseIdParam(rawValue, fieldName = 'id') {
  const result = idParamSchema.safeParse(rawValue)
  if (!result.success) {
    const details = mapZodIssuesToDetails(result.error.issues, fieldName)
    throw new ApiError(400, 'INVALID_ID', 'Invalid ID parameter.', details)
  }
  return result.data
}