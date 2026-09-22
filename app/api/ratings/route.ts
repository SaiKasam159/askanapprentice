import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { bookingId, rating, feedback } = await req.json()

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Please choose a rating between 1 and 5' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    // Derive who the rating belongs to from the booking rather than trusting the client.
    const { data: booking } = await admin
      .from('bookings')
      .select('id, student_id, apprentice_id')
      .eq('id', bookingId)
      .maybeSingle()

    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    const { data, error } = await admin
      .from('ratings')
      .insert([{
        booking_id: booking.id,
        student_id: booking.student_id,
        apprentice_id: booking.apprentice_id,
        rating,
        feedback: feedback || null,
      }])
      .select()
      .single()

    if (error) {
      if (error.code === '23505') {
        return NextResponse.json({ error: 'You have already rated this call' }, { status: 409 })
      }
      throw error
    }

    return NextResponse.json({ rating: data })
  } catch (error) {
    console.error('Rating error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to save rating' },
      { status: 500 }
    )
  }
}

/** Returns the dashboard shape the mentor analytics page renders. */
export async function GET(req: NextRequest) {
  try {
    const apprenticeId = req.nextUrl.searchParams.get('mentorId')
    if (!apprenticeId) {
      return NextResponse.json({ error: 'Missing mentorId' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    const [{ data: ratings }, { data: bookings }] = await Promise.all([
      admin
        .from('ratings')
        .select('id, rating, feedback, created_at, students:student_id(name)')
        .eq('apprentice_id', apprenticeId)
        .order('created_at', { ascending: false }),
      admin
        .from('bookings')
        .select('id, status, scheduled_at')
        .eq('apprentice_id', apprenticeId),
    ])

    const rows = ratings ?? []
    const allBookings = bookings ?? []
    const now = Date.now()

    return NextResponse.json({
      totalBookings: allBookings.length,
      completedCalls: allBookings.filter(b => new Date(b.scheduled_at).getTime() <= now).length,
      upcomingCalls: allBookings.filter(b => new Date(b.scheduled_at).getTime() > now).length,
      totalRatings: rows.length,
      averageRating: rows.length ? rows.reduce((sum, r) => sum + r.rating, 0) / rows.length : 0,
      ratings: rows.map(r => ({
        id: r.id,
        rating: r.rating,
        feedback: r.feedback ?? '',
        createdAt: r.created_at,
        studentName: (r.students as { name?: string } | null)?.name ?? 'A student',
      })),
    })
  } catch (error) {
    console.error('Fetch ratings error:', error)
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
  }
}
