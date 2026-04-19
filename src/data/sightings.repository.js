import { asc, eq, and } from 'drizzle-orm'
import { nowIso } from './db.js'
import { sightings, birds } from './schema.js'

export async function listSightingsByBird(db, birdId) {
  return db
    .select()
    .from(sightings)
    .where(eq(sightings.birdId, birdId))
    .orderBy(asc(sightings.id))
}

export async function getSightingById(db, id) {
  const [sighting] = await db
    .select()
    .from(sightings)
    .where(eq(sightings.id, id))
  return sighting || null
}

export async function createSighting(db, birdId, input) {
  const timestamp = nowIso()

  const [created] = await db
    .insert(sightings)
    .values({
      birdId: birdId,
      title: input.title.trim(),
      description: input.description?.trim() || '',
      status: input.status || 'planned',
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning()

  return created
}

export async function updateSighting(db, id, input) {
  const values = {
    updatedAt: nowIso(),
    ...('title' in input ? { title: input.title.trim() } : {}),
    ...('description' in input ? { description: input.description } : {}),
    ...('status' in input ? { status: input.status } : {}),
  }

  const [updated] = await db
    .update(sightings)
    .set(values)
    .where(eq(sightings.id, id))
    .returning()

  return updated || null
}

export async function deleteSighting(db, id) {
  const deleted = await db
    .delete(sightings)
    .where(eq(sightings.id, id))
    .returning({ id: sightings.id })

  return deleted.length > 0
}

export async function getSightingByIdForUser(db, id, userId) {
  const result = await db
    .select({ sighting: sightings })
    .from(sightings)
    .innerJoin(birds, eq(sightings.birdId, birds.id))
    .where(and(eq(sightings.id, id), eq(birds.userId, userId)))
  return result[0]?.sighting || null
}