import { Hono } from 'hono'
import { getDb } from '../data/db.js'
import {
  listBirds,
  getBirdById,
  createBird,
  updateBird,
  deleteBird,
} from '../data/birds.repository.js'
import { createSighting, listSightingsByBird } from '../data/sightings.repository.js'
import { ApiError } from '../utils/errors.js'
import { sendResource, sendCollection } from '../utils/response.js'
import { parseJsonBody } from '../utils/body.js'
import {
  parseIdParam,
  birdCreateSchema,
  birdPatchSchema,
  mapZodIssuesToDetails,
  validateSightingCreate,
} from '../utils/validation.js'

const birds = new Hono()

birds.get('/', async (c) => {
  const userId = c.get('user').sub
  const db = getDb(c.env.DB)
  const data = await listBirds(db, userId)
  return sendCollection(c, data)
})

birds.get('/:id/sightings', async (c) => {
  const userId = c.get('user').sub
  const birdId = parseIdParam(c.req.param('id'), 'birdId')
  const db = getDb(c.env.DB)
  const bird = await getBirdById(db, birdId, userId)
  if (!bird) throw new ApiError(404, 'NOT_FOUND', 'Bird not found.')
  const data = await listSightingsByBird(db, birdId)
  return sendCollection(c, data)
})

birds.post('/:id/sightings', async (c) => {
  const userId = c.get('user').sub
  const birdId = parseIdParam(c.req.param('id'), 'birdId')
  const db = getDb(c.env.DB)
  const bird = await getBirdById(db, birdId, userId)
  if (!bird) throw new ApiError(404, 'NOT_FOUND', 'Bird not found.')
  const payload = await parseJsonBody(c)
  const details = validateSightingCreate(payload)
  if (details.length > 0) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Some fields are invalid.', details)
  }
  const sighting = await createSighting(db, birdId, payload)
  c.header('Location', `/api/sightings/${sighting.id}`)
  return sendResource(c, sighting, 201)
})

birds.get('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))
  const db = getDb(c.env.DB)
  const bird = await getBirdById(db, id, userId)
  if (!bird) throw new ApiError(404, 'NOT_FOUND', 'Bird not found.')
  return sendResource(c, bird)
})

birds.post('/', async (c) => {
  const userId = c.get('user').sub
  const body = await parseJsonBody(c)
  const result = birdCreateSchema.safeParse(body)
  if (!result.success) {
    const details = mapZodIssuesToDetails(result.error.issues)
    throw new ApiError(422, 'VALIDATION_ERROR', 'Invalid bird data.', details)
  }
  const db = getDb(c.env.DB)
  const bird = await createBird(db, userId, result.data)
  c.header('Location', `/api/birds/${bird.id}`)
  return sendResource(c, bird, 201)
})

birds.patch('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))
  const db = getDb(c.env.DB)
  const existing = await getBirdById(db, id, userId)
  if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Bird not found.')
  const body = await parseJsonBody(c)
  const result = birdPatchSchema.safeParse(body)
  if (!result.success) {
    const details = mapZodIssuesToDetails(result.error.issues)
    throw new ApiError(422, 'VALIDATION_ERROR', 'Invalid bird data.', details)
  }
  const updated = await updateBird(db, id, userId, result.data)
  return sendResource(c, updated)
})

birds.delete('/:id', async (c) => {
  const userId = c.get('user').sub
  const id = parseIdParam(c.req.param('id'))
  const db = getDb(c.env.DB)
  const deleted = await deleteBird(db, id, userId)
  if (!deleted) throw new ApiError(404, 'NOT_FOUND', 'Bird not found.')
  return c.body(null, 204)
})

export default birds