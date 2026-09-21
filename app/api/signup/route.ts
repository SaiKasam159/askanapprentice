import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      name,
      email,
      linkedinUrl,
      sectors,
      ageVerified,
      guardianEmail,
    } = body

    // Validate required fields
    if (!name || !email || !sectors || sectors.length === 0 || !ageVerified) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    console.log('Supabase URL:', process.env.NEXT_PUBLIC_SUPABASE_URL ? 'Set' : 'NOT SET')
    console.log('Supabase Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Set' : 'NOT SET')

    // Create student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert([
        {
          name,
          email,
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
      console.error('Full Supabase error:', JSON.stringify(studentError))
      return NextResponse.json(
        { error: `Supabase error: ${studentError.message}` },
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
