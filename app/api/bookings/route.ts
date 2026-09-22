import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { studentId, mentorId, callDuration, scheduledTime, isPaid } = body

    if (!studentId || !mentorId || !callDuration || !scheduledTime) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('bookings')
      .insert([{
        student_id: studentId,
        mentor_id: mentorId,
        call_duration: callDuration,
        scheduled_time: scheduledTime,
        is_paid: isPaid || false,
        status: 'confirmed',
        created_at: new Date().toISOString(),
      }])
      .select()

    if (error) throw error

    return NextResponse.json({ booking: data?.[0] })
  } catch (error) {
    console.error('Booking error:', error)
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const studentId = req.nextUrl.searchParams.get('studentId')
    if (!studentId) {
      return NextResponse.json({ error: 'Missing studentId' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('bookings')
      .select('*, mentors:mentor_id(name, company, sector)')
      .eq('student_id', studentId)
      .order('scheduled_time', { ascending: true })

    if (error) throw error
    return NextResponse.json({ bookings: data || [] })
  } catch (error) {
    console.error('Fetch bookings error:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}
