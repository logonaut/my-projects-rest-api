import { sql } from 'drizzle-orm'
import {
  check,
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
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

export const users = sqliteTable(
  'users',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    email: text('email').notNull().unique(),
    passwordHash: text('password_hash').notNull(),
    createdAt: text('created_at').notNull(),
    updatedAt: text('updated_at').notNull(),
  },
  (table) => [uniqueIndex('idx_users_email').on(table.email)],
)

export const sessions = sqliteTable(
  'sessions',
  {
    id: integer('id').primaryKey({ autoIncrement: true }),
    userId: integer('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    tokenHash: text('token_hash').notNull().unique(),
    expiresAt: text('expires_at').notNull(),
    createdAt: text('created_at').notNull(),
  },
  (table) => [
    uniqueIndex('idx_sessions_token_hash').on(table.tokenHash),
    index('idx_sessions_user_id').on(table.userId),
  ],
)