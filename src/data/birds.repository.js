import { asc, eq } from 'drizzle-orm'
import { nowIso } from './db.js'
import { birds } from './schema.js'

export async function listBirds(db) {
  return db.select().from(birds).orderBy(asc(birds.id))
}

export async function getBirdById(db, id) {
  const [bird] = await db.select().from(birds).where(eq(birds.id, id))
  return bird || null
}

export async function createBird(db, input) {
  const timestamp = nowIso()

  const [created] = await db
    .insert(birds)
    .values({
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

export async function updateBird(db, id, input) {
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
    .where(eq(birds.id, id))
    .returning()

  return updated || null
}

export async function deleteBird(db, id) {
  const deleted = await db
    .delete(birds)
    .where(eq(birds.id, id))
    .returning({ id: birds.id })

  return deleted.length > 0
}