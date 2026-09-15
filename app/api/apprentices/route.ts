import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const sector = req.nextUrl.searchParams.get('sector')
    const page = req.nextUrl.searchParams.get('page') || '0'

    let query = supabase
      .from('apprentices')
      .select('id, first_name, sector, company, bio, average_rating, calendly_link')
      .eq('verified', true)

    // Filter by sector if provided
    if (sector && sector !== 'All') {
      query = query.eq('sector', sector)
    }

    // Add pagination (10 per page)
    const pageNum = parseInt(page) || 0
    const start = pageNum * 10
    const end = start + 9

    query = query.range(start, end)

    const { data: apprentices, error, count } = await query

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch apprentices' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      apprentices: apprentices || [],
      total: count || 0,
      page: pageNum,
    })
  } catch (error) {
    console.error('Get apprentices error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
