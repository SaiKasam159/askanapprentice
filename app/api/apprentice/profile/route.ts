import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    // TODO: Get apprentice ID from session/auth
    const apprenticeId = req.nextUrl.searchParams.get('id')

    if (!apprenticeId) {
      return NextResponse.json(
        { error: 'Apprentice ID is required' },
        { status: 400 }
      )
    }

    // Get apprentice profile
    const { data: apprentice, error: apprenticeError } = await supabase
      .from('apprentices')
      .select('*')
      .eq('id', apprenticeId)
      .single()

    if (apprenticeError || !apprentice) {
      return NextResponse.json(
        { error: 'Apprentice not found' },
        { status: 404 }
      )
    }

    // Get ratings
    const { data: ratings, error: ratingsError } = await supabase
      .from('ratings')
      .select('*')
      .eq('apprentice_id', apprenticeId)
      .order('created_at', { ascending: false })

    if (ratingsError) {
      return NextResponse.json(
        { error: 'Failed to fetch ratings' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      apprentice,
      ratings: ratings || [],
    })
  } catch (error) {
    console.error('Get apprentice profile error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
