import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { name, email, password, linkedinUrl, sectors, ageVerified, guardianEmail } = await req.json()

    if (!name || !email || !password || !sectors?.length || !ageVerified) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    // email_confirm: true marks the address verified so the account can log in right away.
    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, user_type: 'student' },
    })

    if (authError || !authData.user) {
      const message = /already|registered|exists/i.test(authError?.message ?? '')
        ? 'An account with this email already exists. Try logging in instead.'
        : authError?.message || 'Failed to create account'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { data: student, error: studentError } = await admin
      .from('students')
      .insert([{
        id: authData.user.id,
        name,
        email,
        linkedin_url: linkedinUrl || null,
        sectors,
        age_verified: ageVerified,
        guardian_email: guardianEmail || null,
        first_call_used: false,
      }])
      .select()
      .single()

    if (studentError) {
      // Roll back the auth user, otherwise the email is permanently unusable.
      await admin.auth.admin.deleteUser(authData.user.id)
      console.error('Student profile insert failed:', studentError)
      return NextResponse.json(
        { error: `Could not create your profile: ${studentError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({ id: student.id, message: 'Account created successfully' })
  } catch (error) {
    console.error('Student signup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error during signup' },
      { status: 500 }
    )
  }
}
