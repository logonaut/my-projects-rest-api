// src/utils/validation.js

import { z } from 'zod'
import { ApiError } from './errors.js'
import { SIGHTING_STATUSES } from './constants.js'

const STATUS_MESSAGE = `Status must be one of: ${SIGHTING_STATUSES.join(', ')}`

// ── ID param ──────────────────────────────────────────────────────────────────

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

// ── Bird schemas ──────────────────────────────────────────────────────────────

export const birdCreateSchema = z.strictObject({
  common_name: z
    .string({ error: 'common_name must be a string.' })
    .trim()
    .min(1, { error: 'common_name cannot be empty.' }),
  scientific_name: z.string({ error: 'scientific_name must be a string.' }).trim().optional(),
  family: z.string({ error: 'family must be a string.' }).trim().optional(),
  description: z.string({ error: 'description must be a string.' }).trim().optional(),
})

export const birdPatchSchema = z
  .strictObject({
    common_name: z
      .string({ error: 'common_name must be a string.' })
      .trim()
      .min(1, { error: 'common_name cannot be empty.' })
      .optional(),
    scientific_name: z.string({ error: 'scientific_name must be a string.' }).trim().optional(),
    family: z.string({ error: 'family must be a string.' }).trim().optional(),
    description: z.string({ error: 'description must be a string.' }).trim().optional(),
  })
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['body'],
        message: 'Provide at least one field to update.',
      })
    }
  })

// ── Sighting schemas ──────────────────────────────────────────────────────────

const sightingCreateSchema = z.object({
  title: z
    .string({ error: 'Title is required.' })
    .trim()
    .min(1, { error: 'Title must be a non-empty string.' }),
  description: z.string({ error: 'Description must be a string.' }).optional(),
  status: z
    .string({ error: STATUS_MESSAGE })
    .refine((val) => SIGHTING_STATUSES.includes(val), { error: STATUS_MESSAGE })
    .optional(),
})

const sightingPatchSchema = z
  .object({
    title: z
      .string({ error: 'Title must be a non-empty string.' })
      .trim()
      .min(1, { error: 'Title must be a non-empty string.' })
      .optional(),
    description: z.string({ error: 'Description must be a string.' }).optional(),
    status: z
      .string({ error: STATUS_MESSAGE })
      .refine((val) => SIGHTING_STATUSES.includes(val), { error: STATUS_MESSAGE })
      .optional(),
  })
  .superRefine((value, ctx) => {
    if (Object.keys(value).length === 0) {
      ctx.addIssue({
        code: 'custom',
        path: ['body'],
        message: 'Provide at least one field to update.',
      })
    }
  })

// ── Zod issue mapper ──────────────────────────────────────────────────────────

export function mapZodIssuesToDetails(issues, fallbackField = 'body') {
  return issues
    .map((issue) => {
      if (issue.code === 'unrecognized_keys') {
        return issue.keys.map((key) => ({ field: key, message: 'Field is not allowed.' }))
      }
      if (issue.code === 'invalid_type' && issue.path.length === 0) {
        return { field: fallbackField, message: issue.message }
      }
      return { field: issue.path.join('.') || fallbackField, message: issue.message }
    })
    .flat()
}

// ── Validators ────────────────────────────────────────────────────────────────

function validateWithSchema(payload, schema) {
  const result = schema.safeParse(payload)
  if (result.success) return []
  return mapZodIssuesToDetails(result.error.issues)
}

export function validateSightingCreate(payload) {
  return validateWithSchema(payload, sightingCreateSchema)
}

export function validateSightingPatch(payload) {
  return validateWithSchema(payload, sightingPatchSchema)
}