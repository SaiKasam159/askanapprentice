import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      email,
      password,
      linkedinUrl,
      sectors,
      ageVerified,
      guardianEmail,
    } = body

    // Validate required fields
    if (!name || !email || !password || !sectors || sectors.length === 0 || !ageVerified) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Create Supabase Auth user first
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${req.headers.get('origin')}/auth/callback`,
      },
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: authError?.message || 'Failed to create account' },
        { status: 400 }
      )
    }

    // Then create student record
    const studentData = {
      id: authData.user.id,
      name,
      email,
      linkedin_url: linkedinUrl || null,
      sectors,
      age_verified: ageVerified,
      guardian_email: guardianEmail || null,
      first_call_used: false,
      created_at: new Date().toISOString(),
    }

    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([studentData])
      .select()

    if (studentError) {
      console.error('Student insert error:', JSON.stringify(studentError))
      return NextResponse.json(
        { error: `Failed to create student profile: ${studentError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: student?.[0]?.id,
      message: 'Account created successfully',
    })
  } catch (error) {
    console.error('Signup catch error:', error)
    return NextResponse.json(
      { error: `Error: ${error instanceof Error ? error.message : String(error)}` },
      { status: 500 }
    )
  }
}
