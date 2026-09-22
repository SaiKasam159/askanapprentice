import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createSessionToken } from '@/lib/session'

export async function POST(req: NextRequest) {
  try {
    const {
      name, email, password, apprenticeshipName, company, sector,
      linkedinUrl, calendlyUrl30, accepts45MinCalls, calendlyUrl45,
    } = await req.json()

    if (!name || !email || !password || !apprenticeshipName || !company || !sector || !calendlyUrl30) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }
    if (!email.includes('@')) {
      return NextResponse.json({ error: 'Please enter a valid email address' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Password must be at least 8 characters' }, { status: 400 })
    }
    // LinkedIn is optional, but must be valid when supplied.
    if (linkedinUrl && !linkedinUrl.includes('linkedin.com')) {
      return NextResponse.json({ error: 'Please enter a valid LinkedIn URL' }, { status: 400 })
    }
    if (!calendlyUrl30.includes('cal.com')) {
      return NextResponse.json({ error: 'Please enter a valid cal.com URL for 30-minute calls' }, { status: 400 })
    }
    if (accepts45MinCalls && !calendlyUrl45?.includes('cal.com')) {
      return NextResponse.json({ error: 'Please enter a valid cal.com URL for 45-minute calls' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()

    const { data: authData, error: authError } = await admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { name, user_type: 'apprentice' },
    })

    if (authError || !authData.user) {
      const message = /already|registered|exists/i.test(authError?.message ?? '')
        ? 'An account with this email already exists. Try logging in instead.'
        : authError?.message || 'Failed to create account'
      return NextResponse.json({ error: message }, { status: 400 })
    }

    const { data: apprentice, error: apprenticeError } = await admin
      .from('apprentices')
      .insert([{
        id: authData.user.id,
        name,
        email,
        apprenticeship_name: apprenticeshipName,
        company,
        sector,
        linkedin_url: linkedinUrl || null,
        calendly_url_30: calendlyUrl30,
        accepts_45min_calls: !!accepts45MinCalls,
        calendly_url_45: accepts45MinCalls ? calendlyUrl45 : null,
        verified: false,
      }])
      .select()
      .single()

    if (apprenticeError) {
      await admin.auth.admin.deleteUser(authData.user.id)
      console.error('Apprentice profile insert failed:', apprenticeError)
      return NextResponse.json(
        { error: `Could not create your profile: ${apprenticeError.message}` },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: apprentice.id,
      token: createSessionToken(apprentice.id, 'apprentice'),
      message: 'Account created. Your profile will be reviewed before appearing in the directory.',
    })
  } catch (error) {
    console.error('Apprentice signup error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unexpected error during signup' },
      { status: 500 }
    )
  }
}
