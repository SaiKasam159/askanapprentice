import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

/**
 * Public mentor directory.
 *
 * The column list is explicit and deliberately excludes email and private
 * fields. Everything here is shown publicly in the directory.

 */
const PUBLIC_COLUMNS =
  'id, name, apprenticeship_name, company, sector, linkedin_url, verified, accepts_45min_calls'

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    const sector = req.nextUrl.searchParams.get('sector')
    const admin = getSupabaseAdmin()

    if (id) {
      const { data, error } = await admin
        .from('apprentices')
        .select(PUBLIC_COLUMNS)
        .eq('id', id)
        .eq('verified', true)
        .maybeSingle()

      if (error) throw error
      if (!data) return NextResponse.json({ error: 'Mentor not found' }, { status: 404 })
      return NextResponse.json({ mentor: data })
    }

    let query = admin.from('apprentices').select(PUBLIC_COLUMNS).eq('verified', true)
    if (sector) query = query.eq('sector', sector)

    const { data, error } = await query.order('created_at', { ascending: false })
    if (error) throw error

    return NextResponse.json({ mentors: data ?? [] })
  } catch (error) {
    console.error('Fetch apprentices error:', error)
    return NextResponse.json({ error: 'Failed to load mentors' }, { status: 500 })
  }
}
