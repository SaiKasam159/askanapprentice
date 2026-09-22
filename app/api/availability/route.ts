import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sessionFrom } from '@/lib/session'

interface WindowInput { day_of_week: number; start_minute: number; end_minute: number }

function valid(w: WindowInput): boolean {
  return (
    Number.isInteger(w.day_of_week) && w.day_of_week >= 0 && w.day_of_week <= 6 &&
    Number.isInteger(w.start_minute) && Number.isInteger(w.end_minute) &&
    w.start_minute >= 0 && w.end_minute <= 1440 && w.end_minute > w.start_minute
  )
}

/** The signed-in mentor's own weekly windows. */
export async function GET(req: NextRequest) {
  const session = sessionFrom(req)
  if (!session || session.role !== 'apprentice') {
    return NextResponse.json({ error: 'Not signed in as a mentor' }, { status: 401 })
  }

  const admin = getSupabaseAdmin()
  const [{ data: windows, error }, { data: profile }] = await Promise.all([
    admin.from('availability').select('*').eq('apprentice_id', session.userId)
      .order('day_of_week').order('start_minute'),
    admin.from('apprentices').select('timezone').eq('id', session.userId).maybeSingle(),
  ])

  if (error) {
    console.error('Availability read failed:', error)
    return NextResponse.json({ error: `Could not load availability: ${error.message}` }, { status: 500 })
  }

  return NextResponse.json({ windows: windows ?? [], timezone: profile?.timezone ?? 'Europe/London' })
}

/** Replaces the whole week in one call, which keeps the editor simple. */
export async function PUT(req: NextRequest) {
  const session = sessionFrom(req)
  if (!session || session.role !== 'apprentice') {
    return NextResponse.json({ error: 'Not signed in as a mentor' }, { status: 401 })
  }

  const { windows, timezone } = await req.json()
  if (!Array.isArray(windows) || !windows.every(valid)) {
    return NextResponse.json({ error: 'One or more availability windows are invalid' }, { status: 400 })
  }

  const admin = getSupabaseAdmin()

  if (timezone) {
    // Reject anything Intl does not recognise before storing it.
    try {
      new Intl.DateTimeFormat('en-US', { timeZone: timezone })
    } catch {
      return NextResponse.json({ error: `Unknown timezone: ${timezone}` }, { status: 400 })
    }
    await admin.from('apprentices').update({ timezone }).eq('id', session.userId)
  }

  const { error: clearError } = await admin.from('availability').delete().eq('apprentice_id', session.userId)
  if (clearError) {
    console.error('Availability clear failed:', clearError)
    return NextResponse.json({ error: `Could not save availability: ${clearError.message}` }, { status: 500 })
  }

  if (windows.length) {
    const rows = windows.map((w: WindowInput) => ({ ...w, apprentice_id: session.userId }))
    const { error } = await admin.from('availability').insert(rows)
    if (error) {
      console.error('Availability insert failed:', error)
      return NextResponse.json({ error: `Could not save availability: ${error.message}` }, { status: 500 })
    }
  }

  return NextResponse.json({ ok: true, count: windows.length })
}
