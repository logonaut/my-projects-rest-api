// src/routes/sightings.js
import { Hono } from 'hono'
import {
  getSightingById,
  updateSighting,
  deleteSighting,
} from '../data/store.js'
import { parseJsonBody } from '../utils/body.js'
import { ApiError } from '../utils/errors.js'
import { sendResource } from '../utils/response.js'
import { parseIdParam, validateSightingPatch } from '../utils/validation.js'

const sightings = new Hono()

// GET /api/sightings/:id
sightings.get('/:id', (c) => {
  const id = parseIdParam(c.req.param('id'))

  const sighting = getSightingById(id)

  if (!sighting) {
    throw new ApiError(404, 'NOT_FOUND', 'Sighting not found.')
  }

  return sendResource(c, sighting)
})

// PATCH /api/sightings/:id
sightings.patch('/:id', async (c) => {
  const id = parseIdParam(c.req.param('id'))
  const payload = await parseJsonBody(c)
  const details = validateSightingPatch(payload)

  if (details.length > 0) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Some fields are invalid.', details)
  }

  const updated = updateSighting(id, payload)

  if (!updated) {
    throw new ApiError(404, 'NOT_FOUND', 'Sighting not found.')
  }

  return sendResource(c, updated)
})

// DELETE /api/sightings/:id
sightings.delete('/:id', (c) => {
  const id = parseIdParam(c.req.param('id'))
  const deleted = deleteSighting(id)

  if (!deleted) {
    throw new ApiError(404, 'NOT_FOUND', 'Sighting not found.')
  }

  return c.body(null, 204)
})

export default sightings