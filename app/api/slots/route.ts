import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { generateSlots } from '@/lib/slots'

const DURATIONS = new Set([30, 45])

/** Bookable slots for one mentor. Public: students browse this before signing in. */
export async function GET(req: NextRequest) {
  try {
    const mentorId = req.nextUrl.searchParams.get('mentorId')
    const duration = Number(req.nextUrl.searchParams.get('duration') ?? 30)

    if (!mentorId) return NextResponse.json({ error: 'Missing mentorId' }, { status: 400 })
    if (!DURATIONS.has(duration)) {
      return NextResponse.json({ error: 'Call must be 30 or 45 minutes' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    const { data: mentor } = await admin
      .from('apprentices')
      .select('id, timezone, verified, accepts_45min_calls')
      .eq('id', mentorId)
      .maybeSingle()

    if (!mentor || !mentor.verified) {
      return NextResponse.json({ error: 'Mentor not found' }, { status: 404 })
    }
    if (duration === 45 && !mentor.accepts_45min_calls) {
      return NextResponse.json({ error: 'This mentor does not offer 45-minute calls' }, { status: 400 })
    }

    const [{ data: windows, error: windowsError }, { data: booked }] = await Promise.all([
      admin.from('availability').select('day_of_week, start_minute, end_minute').eq('apprentice_id', mentorId),
      admin.from('bookings').select('scheduled_at, call_duration')
        .eq('apprentice_id', mentorId)
        .in('status', ['pending_payment', 'confirmed'])
        .gte('scheduled_at', new Date().toISOString()),
    ])

    // Without this, a broken query looks identical to a mentor who has simply
    // not set any availability.
    if (windowsError) {
      console.error('Availability lookup failed:', windowsError)
      return NextResponse.json(
        { error: `Could not load availability: ${windowsError.message}` },
        { status: 500 }
      )
    }

    const slots = generateSlots({
      windows: windows ?? [],
      timeZone: mentor.timezone ?? 'Europe/London',
      durationMinutes: duration,
      busy: (booked ?? []).map(b => ({ start: new Date(b.scheduled_at), minutes: b.call_duration })),
    })

    return NextResponse.json({
      timezone: mentor.timezone ?? 'Europe/London',
      slots: slots.map(s => s.toISOString()),
    })
  } catch (error) {
    console.error('Slots error:', error)
    return NextResponse.json({ error: 'Could not load availability' }, { status: 500 })
  }
}
