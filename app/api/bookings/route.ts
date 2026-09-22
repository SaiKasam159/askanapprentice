import { NextRequest, NextResponse } from 'next/server'
import { randomUUID } from 'node:crypto'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sessionFrom } from '@/lib/session'
import { generateSlots } from '@/lib/slots'
import { sendConfirmationFor } from '@/lib/booking-emails'

// Price in GBP. Never taken from the client: a browser could otherwise ask to pay 1p.
const CALL_PRICES: Record<number, number> = { 30: 0, 45: 10 }

export async function POST(req: NextRequest) {
  try {
    // The student comes from the signed token, not the request body, so a
    // caller cannot create bookings in someone else's name.
    const session = sessionFrom(req)
    if (!session || session.role !== 'student') {
      return NextResponse.json({ error: 'Sign in as a student to book a call' }, { status: 401 })
    }

    const { mentorId, callDuration, scheduledTime, studentTimezone } = await req.json()
    if (!mentorId || !callDuration || !scheduledTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const duration = Number(callDuration)
    const price = CALL_PRICES[duration]
    if (price === undefined) {
      return NextResponse.json({ error: 'Call must be 30 or 45 minutes' }, { status: 400 })
    }

    const requested = new Date(scheduledTime)
    if (Number.isNaN(requested.getTime())) {
      return NextResponse.json({ error: 'Invalid time' }, { status: 400 })
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

    // Re-derive the offered slots and confirm the requested one is among them.
    // Without this a caller could book any time at all, including times the
    // mentor never offered.
    const [{ data: windows }, { data: booked }] = await Promise.all([
      admin.from('availability').select('day_of_week, start_minute, end_minute').eq('apprentice_id', mentorId),
      admin.from('bookings').select('scheduled_at, call_duration')
        .eq('apprentice_id', mentorId)
        .in('status', ['pending_payment', 'confirmed'])
        .gte('scheduled_at', new Date().toISOString()),
    ])

    const offered = generateSlots({
      windows: windows ?? [],
      timeZone: mentor.timezone ?? 'Europe/London',
      durationMinutes: duration,
      busy: (booked ?? []).map(b => ({ start: new Date(b.scheduled_at), minutes: b.call_duration })),
    })

    if (!offered.some(slot => slot.getTime() === requested.getTime())) {
      return NextResponse.json(
        { error: 'That time is no longer available. Please pick another slot.' },
        { status: 409 }
      )
    }

    const { data, error } = await admin
      .from('bookings')
      .insert([{
        student_id: session.userId,
        apprentice_id: mentorId,
        call_duration: duration,
        price,
        scheduled_at: requested.toISOString(),
        status: price > 0 ? 'pending_payment' : 'confirmed',
        meeting_url: `https://meet.jit.si/apprentacall-${randomUUID()}`,
        student_timezone: typeof studentTimezone === 'string' ? studentTimezone : null,
      }])
      .select()
      .single()

    if (error) {
      // Raised by the partial unique index when someone takes the slot first.
      if (error.code === '23505') {
        return NextResponse.json(
          { error: 'Someone just booked that slot. Please pick another.' },
          { status: 409 }
        )
      }
      console.error('Booking insert failed:', error)
      return NextResponse.json({ error: `Could not create booking: ${error.message}` }, { status: 500 })
    }

    // Paid bookings are not confirmed yet, so they are emailed after payment.
    if (price === 0) await sendConfirmationFor(data.id)

    return NextResponse.json({ booking: data, requiresPayment: price > 0 })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const bookingId = req.nextUrl.searchParams.get('bookingId')
    const admin = getSupabaseAdmin()

    const query = admin
      .from('bookings')
      .select('*, apprentices:apprentice_id(name, company, sector), students:student_id(name, email)')

    if (bookingId) {
      const { data, error } = await query.eq('id', bookingId).maybeSingle()
      if (error) throw error
      if (!data) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      return NextResponse.json({ booking: data })
    }

    // Listing is always scoped to the signed-in account, so a caller cannot
    // read another person's bookings by passing their id.
    const session = sessionFrom(req)
    if (!session) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const column = session.role === 'student' ? 'student_id' : 'apprentice_id'
    const { data, error } = await query.eq(column, session.userId).order('scheduled_at', { ascending: true })
    if (error) throw error
    return NextResponse.json({ bookings: data ?? [] })
  } catch (error) {
    console.error('Fetch bookings error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
