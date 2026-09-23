import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseAdmin } from '@/lib/supabase'
import { createSessionToken } from '@/lib/session'
import { serverError } from '@/lib/errors'

export async function POST(req: NextRequest) {
  try {
    const {
      name, email, password, apprenticeshipName, company, sector,
      linkedinUrl, accepts45MinCalls,
    } = await req.json()

    if (!name || !email || !password || !apprenticeshipName || !company || !sector) {
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

    // Fail before creating anything if sessions cannot be signed: otherwise the
    // account exists, the request errors, and the retry hits "already exists".
    createSessionToken('preflight', 'apprentice')

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
        accepts_45min_calls: !!accepts45MinCalls,
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
    return serverError('mentor signup', error)
  }
}
