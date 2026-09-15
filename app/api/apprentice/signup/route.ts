import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      firstName,
      email,
      sector,
      company,
      bio,
      calendlyLink,
    } = body

    // Validate required fields
    if (!firstName || !email || !sector || !calendlyLink) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Validate Calendly link
    if (!calendlyLink.includes('calendly.com')) {
      return NextResponse.json(
        { error: 'Invalid Calendly URL' },
        { status: 400 }
      )
    }

    // Check if apprentice already exists
    const { data: existingApprentice } = await supabase
      .from('apprentices')
      .select('id')
      .eq('email', email)
      .single()

    if (existingApprentice) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Create apprentice record (unverified initially)
    const { data: apprentice, error: apprenticeError } = await supabase
      .from('apprentices')
      .insert({
        first_name: firstName,
        email,
        sector,
        company: company || null,
        bio: bio || null,
        calendly_link: calendlyLink,
        verified: false, // Manual verification required
        average_rating: 0,
        response_rate: 0,
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

    // TODO: Send notification email to founder about new apprentice signup

    return NextResponse.json({
      success: true,
      apprenticeId: apprentice.id,
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
