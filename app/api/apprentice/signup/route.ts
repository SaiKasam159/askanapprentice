import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      apprenticeshipName,
      company,
      sector,
      linkedinUrl,
      calendlyUrl30,
      accepts45MinCalls,
      calendlyUrl45,
    } = body

    // Validate required fields
    if (!name || !apprenticeshipName || !company || !sector || !linkedinUrl || !calendlyUrl30) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate URLs
    if (!linkedinUrl.includes('linkedin.com')) {
      return NextResponse.json(
        { error: 'Invalid LinkedIn URL' },
        { status: 400 }
      )
    }

    if (!calendlyUrl30.includes('cal.com')) {
      return NextResponse.json(
        { error: 'Invalid cal.com URL for 30-minute calls' },
        { status: 400 }
      )
    }

    if (accepts45MinCalls && !calendlyUrl45) {
      return NextResponse.json(
        { error: 'Cal.com URL for 45-minute calls is required' },
        { status: 400 }
      )
    }

    if (accepts45MinCalls && !calendlyUrl45.includes('cal.com')) {
      return NextResponse.json(
        { error: 'Invalid cal.com URL for 45-minute calls' },
        { status: 400 }
      )
    }

    // Create apprentice record (unverified initially)
    const { data: apprentice, error: apprenticeError } = await supabase
      .from('apprentices')
      .insert([
        {
          name,
          apprenticeship_name: apprenticeshipName,
          company,
          sector,
          linkedin_url: linkedinUrl,
          calendly_url_30: calendlyUrl30,
          accepts_45min_calls: accepts45MinCalls,
          calendly_url_45: accepts45MinCalls ? calendlyUrl45 : null,
          verified: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (apprenticeError) {
      console.error('Apprentice creation error:', apprenticeError)
      return NextResponse.json(
        { error: 'Failed to create apprentice account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: apprentice?.[0]?.id,
      message: 'Account created. Your profile will be reviewed before appearing in the directory.',
    })
  } catch (error) {
    console.error('Apprentice signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
