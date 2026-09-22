import { NextRequest, NextResponse } from 'next/server'
import { getSupabase, getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { email, password, userType } = await req.json()

    if (!email || !password || !userType) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    // Fresh client per request: a shared one would leak session state between users.
    const { data: authData, error: authError } = await getSupabase().auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })
    }

    const admin = getSupabaseAdmin()
    const table = userType === 'student' ? 'students' : 'apprentices'

    let { data: profile } = await admin.from(table).select('*').eq('id', authData.user.id).maybeSingle()
    if (!profile) {
      // Accounts created before auth ids were linked are matched on email instead.
      const { data: byEmail } = await admin.from(table).select('*').eq('email', email).maybeSingle()
      profile = byEmail
    }

    if (!profile) {
      const otherTable = userType === 'student' ? 'apprentices' : 'students'
      const { data: wrongRole } = await admin.from(otherTable).select('id').eq('email', email).maybeSingle()
      return NextResponse.json(
        {
          error: wrongRole
            ? `This email is registered as a ${userType === 'student' ? 'mentor' : 'student'}. Use the other login page.`
            : 'No profile found for this account.',
        },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        userType,
        profileId: profile.id,
      },
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json({ error: 'An error occurred during login' }, { status: 500 })
  }
}
