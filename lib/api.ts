import { createHash } from 'node:crypto'
import { sql } from 'drizzle-orm'
import { ZodError } from 'zod'
import { db } from '@/lib/db'
import { apiLimits } from '@/lib/db/schema'
export class ApiError extends Error { constructor(message: string, public status = 400) { super(message) } }
export async function rateLimit(request: Request, scope: string, maximum = 15) {
  const ip = request.headers.get('x-vercel-forwarded-for')?.split(',')[0]?.trim() ?? (process.env.NODE_ENV === 'development' ? 'preview' : request.headers.get('x-real-ip') ?? 'shared')
  const id = `${scope}:${createHash('sha256').update(ip).digest('hex')}`
  const expires = new Date(Date.now() + 60000)
  const [row] = await db.insert(apiLimits).values({ id, count: 1, expiresAt: expires }).onConflictDoUpdate({ target: apiLimits.id, set: {
    count: sql`CASE WHEN ${apiLimits.expiresAt} < now() THEN 1 ELSE ${apiLimits.count} + 1 END`,
    expiresAt: sql`CASE WHEN ${apiLimits.expiresAt} < now() THEN ${expires.toISOString()}::timestamptz ELSE ${apiLimits.expiresAt} END`,
  }}).returning({ count: apiLimits.count })
  if (row.count > maximum) throw new ApiError('Request limit reached. Please wait one minute and try again.', 429)
}
export async function readBody(request: Request, maxBytes = 20000): Promise<unknown> {
  if(Number(request.headers.get('content-length') ?? 0) > maxBytes) throw new ApiError('Request is too large.', 413)
  const reader = request.body?.getReader()
  if(!reader) throw new ApiError('A JSON request body is required.')
  const chunks: Uint8Array[] = []; let total = 0
  while(true) { const {done, value} = await reader.read(); if(done) break; total += value.byteLength; if(total > maxBytes) { await reader.cancel(); throw new ApiError('Request is too large.', 413) } chunks.push(value) }
  try { return JSON.parse(Buffer.concat(chunks).toString('utf8')) } catch { throw new ApiError('Invalid JSON request.') }
}
export function apiError(error: unknown) {
  const status = error instanceof ApiError ? error.status : error instanceof ZodError ? 400 : 503
  const message = error instanceof ApiError ? error.message : error instanceof ZodError ? error.issues[0]?.message ?? 'Invalid input.' : 'The upstream service is unavailable. No result has been inferred. Please retry.'
  return Response.json({ error: message }, { status, headers: status === 429 ? { 'Retry-After': '60' } : undefined })
}
