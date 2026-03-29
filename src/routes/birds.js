import { Hono } from 'hono'
import {
  getAllBirds,
  getBirdById,
  createBird,
  updateBird,
  deleteBird,
  listSightingsByBird,
  createSighting,
} from '../data/store.js'
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

birds.get('/', (c) => {
  return sendCollection(c, getAllBirds())
})

birds.get('/:id/sightings', (c) => {
  const birdId = parseIdParam(c.req.param('id'), 'birdId')
  const bird = getBirdById(birdId)
  if (!bird) throw new ApiError(404, 'NOT_FOUND', 'Bird not found.')
  const data = listSightingsByBird(birdId)
  return sendCollection(c, data)
})

birds.post('/:id/sightings', async (c) => {
  const birdId = parseIdParam(c.req.param('id'), 'birdId')
  const bird = getBirdById(birdId)
  if (!bird) throw new ApiError(404, 'NOT_FOUND', 'Bird not found.')
  const payload = await parseJsonBody(c)
  const details = validateSightingCreate(payload)
  if (details.length > 0) {
    throw new ApiError(422, 'VALIDATION_ERROR', 'Some fields are invalid.', details)
  }
  const sighting = createSighting(birdId, payload)
  c.header('Location', `/api/sightings/${sighting.id}`)
  return sendResource(c, sighting, 201)
})

birds.get('/:id', (c) => {
  const id = parseIdParam(c.req.param('id'))
  const bird = getBirdById(id)
  if (!bird) throw new ApiError(404, 'NOT_FOUND', 'Bird not found.')
  return sendResource(c, bird)
})

birds.post('/', async (c) => {
  const body = await parseJsonBody(c)
  const result = birdCreateSchema.safeParse(body)
  if (!result.success) {
    const details = mapZodIssuesToDetails(result.error.issues)
    throw new ApiError(422, 'VALIDATION_ERROR', 'Invalid bird data.', details)
  }
  const bird = createBird(result.data)
  c.header('Location', `/api/birds/${bird.id}`)
  return sendResource(c, bird, 201)
})

birds.patch('/:id', async (c) => {
  const id = parseIdParam(c.req.param('id'))
  const existing = getBirdById(id)
  if (!existing) throw new ApiError(404, 'NOT_FOUND', 'Bird not found.')
  const body = await parseJsonBody(c)
  const result = birdPatchSchema.safeParse(body)
  if (!result.success) {
    const details = mapZodIssuesToDetails(result.error.issues)
    throw new ApiError(422, 'VALIDATION_ERROR', 'Invalid bird data.', details)
  }
  const updated = updateBird(id, result.data)
  return sendResource(c, updated)
})

birds.delete('/:id', (c) => {
  const id = parseIdParam(c.req.param('id'))
  const deleted = deleteBird(id)
  if (!deleted) throw new ApiError(404, 'NOT_FOUND', 'Bird not found.')
  return c.body(null, 204)
})

export default birds