import { Hono } from 'hono'
import { getDb } from '../data/db.js'
import {
  getSightingByIdForUser,
  updateSighting,
  deleteSighting,
} from '../data/sightings.repository.js'
import { parseJsonBody } from '../utils/body.js'
import { ApiError } from '../utils/errors.js'
import { sendResource } from '../utils/response.js'
import { parseIdParam, validateSightingPatch } from '../utils/validation.js'

const sightings = new Hono()

// GET /api/sightings/:id
sightings.get('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))
  const db = getDb(c.env.DB)
  const sighting = await getSightingByIdForUser(db, id, userId)

  if (!sighting) {
    throw new ApiError(404, 'NOT_FOUND', 'Sighting not found.')
  }

  return sendResource(c, sighting)
})

// PATCH /api/sightings/:id
sightings.patch('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))
  const payload = await parseJsonBody(c)
  const details = validateSightingPatch(payload)

  if (details.length > 0) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Some fields are invalid.', details)
  }

  const db = getDb(c.env.DB)
  const sighting = await getSightingByIdForUser(db, id, userId)
  if (!sighting) {
    throw new ApiError(404, 'NOT_FOUND', 'Sighting not found.')
  }

  const updated = await updateSighting(db, id, payload)

  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Sighting not found.')
  }

  return sendResource(c, updated)
})

// DELETE /api/sightings/:id
sightings.delete('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))
  const db = getDb(c.env.DB)
  const sighting = await getSightingByIdForUser(db, id, userId)
  if (!sighting) {
    throw new ApiError(404, 'NOT_FOUND', 'Sighting not found.')
  }
  await deleteSighting(db, id)

  return c.body(null, 204)
})

export default sightings