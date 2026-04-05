import { sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
} from 'drizzle-orm/sqlite-core'

export const birds = sqliteTable('birds', {
  id: integer('id').primaryKey({ autoIncrement: true }),
  common_name: text('common_name').notNull(),
  scientific_name: text('scientific_name'),
  family: text('family'),
  description: text('description'),
  createdAt: text('created_at').notNull(),
  updatedAt: text('updated_at').notNull(),
})

export const sightings = sqliteTable(
  'sightings',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    birdId: integer('bird_id')
      .notNull()
      .references(() => birds.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull().default(''),
    status: text('status').notNull().default('planned'),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [
    check(
      'sightings_status_check',
      sql`${table.status} IN ('planned', 'in-field', 'logged')`,
    ),
    index('idx_sightings_bird_id').on(table.birdId),
  ],
)