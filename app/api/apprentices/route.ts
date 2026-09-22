import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  try {
    const id = req.nextUrl.searchParams.get('id')
    
    if (!id) {
      return NextResponse.json({ error: 'Missing id parameter' }, { status: 400 })
    }

    const { data, error } = await supabase
      .from('apprentices')
      .select('*')
      .eq('id', id)
      .eq('verified', true)
      .single()

    if (error) throw error
    return NextResponse.json({ mentor: data })
  } catch (error) {
    console.error('Fetch apprentice error:', error)
    return NextResponse.json({ error: 'Failed to fetch mentor' }, { status: 500 })
  }
}
