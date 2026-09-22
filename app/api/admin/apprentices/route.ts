import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/** Mentor verification queue. Guarded by the shared admin password. */
function authorised(req: NextRequest): boolean {
  const expected = process.env.ADMIN_PASSWORD
  if (!expected) return false
  const supplied = req.headers.get('x-admin-password')
  return Boolean(supplied) && supplied === expected
}

export async function GET(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })

  const { data, error } = await getSupabaseAdmin()
    .from('apprentices')
    .select('*')
    .eq('verified', false)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Admin list failed:', error)
    return NextResponse.json({ error: 'Could not load pending mentors' }, { status: 500 })
  }
  return NextResponse.json({ apprentices: data ?? [] })
}

export async function PATCH(req: NextRequest) {
  if (!authorised(req)) return NextResponse.json({ error: 'Not authorised' }, { status: 401 })

  const { id, verified } = await req.json()
  if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

  const { error } = await getSupabaseAdmin()
    .from('apprentices')
    .update({ verified: Boolean(verified) })
    .eq('id', id)

  if (error) {
    console.error('Admin verify failed:', error)
    return NextResponse.json({ error: `Could not update mentor: ${error.message}` }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}
