import { createHmac, timingSafeEqual } from 'node:crypto'

/**
 * Minimal signed sessions.
 *
 * Login previously handed the browser a bare profile UUID, which every page and
 * route then trusted. Anyone holding an id could read or edit that profile. A
 * token is now signed on login and verified on each request, so possessing an
 * id is no longer sufficient.
 *
 * This is server-signed and tamper-evident, but it is stored in localStorage
 * and so is readable by any script on the page. Moving to Supabase's own
 * session handling with httpOnly cookies remains the stronger option.
 */

const MAX_AGE_MS = 1000 * 60 * 60 * 24 * 30 // 30 days

export type Role = 'student' | 'apprentice'
export interface Session { userId: string; role: Role }

function secret(): string {
  const value = process.env.NEXTAUTH_SECRET
  if (!value) throw new Error('NEXTAUTH_SECRET is not set; sessions cannot be signed')
  return value
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('base64url')
}

export function createSessionToken(userId: string, role: Role): string {
  const payload = `${userId}.${role}.${Date.now()}`
  return `${Buffer.from(payload).toString('base64url')}.${sign(payload)}`
}

export function verifySessionToken(token: string | null | undefined): Session | null {
  if (!token) return null

  const [encoded, signature] = token.split('.')
  if (!encoded || !signature) return null

  let payload: string
  try {
    payload = Buffer.from(encoded, 'base64url').toString()
  } catch {
    return null
  }

  const expected = sign(payload)
  const a = Buffer.from(signature)
  const b = Buffer.from(expected)
  if (a.length !== b.length || !timingSafeEqual(a, b)) return null

  const [userId, role, issuedAt] = payload.split('.')
  if (role !== 'student' && role !== 'apprentice') return null
  if (Date.now() - Number(issuedAt) > MAX_AGE_MS) return null

  return { userId, role }
}

/** Reads and verifies the bearer token on a request. */
export function sessionFrom(req: Request): Session | null {
  return verifySessionToken(req.headers.get('authorization')?.replace(/^Bearer /, ''))
}
