import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

// Price in GBP. Never taken from the client: a browser could otherwise ask to pay 1p.
const CALL_PRICES: Record<number, number> = { 30: 0, 45: 10 }

export async function POST(req: NextRequest) {
  try {
    const { studentId, mentorId, callDuration, scheduledTime } = await req.json()

    if (!studentId || !mentorId || !callDuration || !scheduledTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const price = CALL_PRICES[Number(callDuration)]
    if (price === undefined) {
      return NextResponse.json({ error: 'Call must be 30 or 45 minutes' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    const { data, error } = await admin
      .from('bookings')
      .insert([{
        student_id: studentId,
        apprentice_id: mentorId,
        call_duration: Number(callDuration),
        price,
        scheduled_at: scheduledTime,
        status: price > 0 ? 'pending_payment' : 'confirmed',
      }])
      .select()
      .single()

    if (error) {
      console.error('Booking insert failed:', error)
      return NextResponse.json({ error: `Could not create booking: ${error.message}` }, { status: 500 })
    }

    return NextResponse.json({ booking: data, requiresPayment: price > 0 })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const studentId = req.nextUrl.searchParams.get('studentId')
    const bookingId = req.nextUrl.searchParams.get('bookingId')

    if (!studentId && !bookingId) {
      return NextResponse.json({ error: 'Provide studentId or bookingId' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    const query = admin
      .from('bookings')
      .select('*, apprentices:apprentice_id(name, company, sector)')

    if (bookingId) {
      const { data, error } = await query.eq('id', bookingId).maybeSingle()
      if (error) throw error
      if (!data) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
      return NextResponse.json({ booking: data })
    }

    const { data, error } = await query.eq('student_id', studentId).order('scheduled_at', { ascending: true })
    if (error) throw error
    return NextResponse.json({ bookings: data ?? [] })
  } catch (error) {
    console.error('Fetch bookings error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
