import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      apprenticeshipName,
      sector,
      linkedinUrl,
      calcomUrl,
    } = body

    // Validate required fields
    if (!name || !apprenticeshipName || !sector || !linkedinUrl || !calcomUrl) {
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

    if (!calcomUrl.includes('cal.com')) {
      return NextResponse.json(
        { error: 'Invalid Cal.com URL' },
        { status: 400 }
      )
    }

    // Create apprentice record (unverified initially)
    const { data: apprentice, error: apprenticeError } = await supabase
      .from('apprentices')
      .insert({
        name,
        apprenticeship_name: apprenticeshipName,
        sector,
        linkedin_url: linkedinUrl,
        calcom_url: calcomUrl,
        verified: false,
        created_at: new Date(),
      })
      .select()
      .single()

    if (apprenticeError) {
      console.error('Apprentice creation error:', apprenticeError)
      return NextResponse.json(
        { error: 'Failed to create apprentice account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: apprentice.id,
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
