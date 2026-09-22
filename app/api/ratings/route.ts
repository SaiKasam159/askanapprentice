import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { bookingId, rating, feedback } = body

    if (!bookingId || !rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Invalid input' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ratings')
      .insert([{
        booking_id: bookingId,
        rating,
        feedback: feedback || null,
        created_at: new Date().toISOString(),
      }])
      .select()

    if (error) throw error
    return NextResponse.json({ rating: data?.[0] })
  } catch (error) {
    console.error('Rating error:', error)
    return NextResponse.json({ error: 'Failed to save rating' }, { status: 500 })
  }
}

export async function GET(req: NextRequest) {
  try {
    const mentorId = req.nextUrl.searchParams.get('mentorId')
    if (!mentorId) {
      return NextResponse.json({ error: 'Missing mentorId' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('ratings')
      .select('*')
      .eq('mentor_id', mentorId)
      .order('created_at', { ascending: false })

    if (error) throw error
    const averageRating = data?.length ? data.reduce((sum, r) => sum + r.rating, 0) / data.length : 0
    
    return NextResponse.json({ ratings: data, average: averageRating, count: data?.length || 0 })
  } catch (error) {
    console.error('Fetch ratings error:', error)
    return NextResponse.json({ error: 'Failed to fetch ratings' }, { status: 500 })
  }
}
