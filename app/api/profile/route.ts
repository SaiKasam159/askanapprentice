import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sessionFrom } from '@/lib/session'

const TABLE = { student: 'students', apprentice: 'apprentices' } as const

// Only these may be written through this route. Anything else — verified,
// email, first_call_used — is not the account holder's to change.
const EDITABLE = {
  student: ['name', 'linkedin_url', 'sectors'],
  apprentice: [
    'name', 'apprenticeship_name', 'company', 'sector', 'linkedin_url',
    'calendly_url_30', 'calendly_url_45', 'accepts_45min_calls',
  ],
} as const

/** Returns the caller's own profile, including fields withheld from the public directory. */
export async function GET(req: NextRequest) {
  const session = sessionFrom(req)
  if (!session) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const { data, error } = await getSupabaseAdmin()
    .from(TABLE[session.role])
    .select('*')
    .eq('id', session.userId)
    .maybeSingle()

  if (error) {
    console.error('Profile read failed:', error)
    return NextResponse.json({ error: 'Could not load profile' }, { status: 500 })
  }
  if (!data) return NextResponse.json({ error: 'Profile not found' }, { status: 404 })

  return NextResponse.json({ profile: data })
}

export async function PATCH(req: NextRequest) {
  const session = sessionFrom(req)
  if (!session) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

  const body = await req.json()
  const allowed = EDITABLE[session.role] as readonly string[]
  const updates = Object.fromEntries(Object.entries(body).filter(([key]) => allowed.includes(key)))

  if (!Object.keys(updates).length) {
    return NextResponse.json({ error: 'No editable fields supplied' }, { status: 400 })
  }

  const { data, error } = await getSupabaseAdmin()
    .from(TABLE[session.role])
    .update(updates)
    .eq('id', session.userId)
    .select()
    .single()

  if (error) {
    console.error('Profile update failed:', error)
    return NextResponse.json({ error: `Could not save profile: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ profile: data })
}
