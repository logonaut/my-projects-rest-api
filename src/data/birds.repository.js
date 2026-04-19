import { asc, eq, and } from 'drizzle-orm'
import { nowIso } from './db.js'
import { birds } from './schema.js'

export async function listBirds(db, userId) {
  return db
    .select()
    .from(birds)
    .where(eq(birds.userId, userId))
    .orderBy(asc(birds.id))
}

export async function getBirdById(db, id, userId) {
  const [bird] = await db
    .select()
    .from(birds)
    .where(and(eq(birds.id, id), eq(birds.userId, userId)))
  return bird || null
}

export async function createBird(db, userId, input) {
  const timestamp = nowIso()

  const [created] = await db
    .insert(birds)
    .values({
      userId,
      common_name: input.common_name,
      scientific_name: input.scientific_name ?? null,
      family: input.family ?? null,
      description: input.description ?? null,
      createdAt: timestamp,
      updatedAt: timestamp,
    })
    .returning()

  return created
}

export async function updateBird(db, id, userId, input) {
  const values = {
    updatedAt: nowIso(),
    ...('common_name' in input ? { common_name: input.common_name } : {}),
    ...('scientific_name' in input ? { scientific_name: input.scientific_name } : {}),
    ...('family' in input ? { family: input.family } : {}),
    ...('description' in input ? { description: input.description } : {}),
  }

  const [updated] = await db
    .update(birds)
    .set(values)
    .where(and(eq(birds.id, id), eq(birds.userId, userId)))
    .returning()

  return updated || null
}

export async function deleteBird(db, id, userId) {
  const deleted = await db
    .delete(birds)
    .where(and(eq(birds.id, id), eq(birds.userId, userId)))
    .returning({ id: birds.id })

  return deleted.length > 0
}