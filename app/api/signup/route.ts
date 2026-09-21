import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      linkedinUrl,
      sectors,
      ageVerified,
      guardianEmail,
    } = body

    // Validate required fields
    if (!name || !sectors || sectors.length === 0 || !ageVerified) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // If under 16, guardian email is required
    if (!ageVerified && !guardianEmail) {
      return NextResponse.json(
        { error: 'Guardian email required for users under 16' },
        { status: 400 }
      )
    }

    // Create student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([
        {
          name,
          linkedin_url: linkedinUrl || null,
          sectors,
          age_verified: ageVerified,
          guardian_email: guardianEmail || null,
          first_call_used: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (studentError) {
      console.error('Student creation error:', studentError)
      return NextResponse.json(
        { error: studentError.message || 'Failed to create student account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: student?.[0]?.id,
      message: 'Account created successfully',
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
