import { drizzle } from 'drizzle-orm/node-postgres'
import { Pool } from 'pg'
import * as schema from './schema'
const globalDb = globalThis as unknown as { classicalPool?: Pool }
const pool = globalDb.classicalPool ?? new Pool({ connectionString: process.env.DATABASE_URL, max: 5, connectionTimeoutMillis: 8000, idleTimeoutMillis: 15000 })
if (process.env.NODE_ENV !== 'production') globalDb.classicalPool = pool
export const db = drizzle(pool, { schema })
