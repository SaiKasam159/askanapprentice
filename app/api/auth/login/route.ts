import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { email, password, userType } = body

    if (!email || !password || !userType) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Supabase Auth - Sign in user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (authError || !authData.user) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      )
    }

    // Fetch user profile based on userType (student or apprentice)
    const tableName = userType === 'student' ? 'students' : 'apprentices'
    const { data: userProfile, error: profileError } = await supabase
      .from(tableName)
      .select('*')
      .eq('email', email)
      .single()

    if (profileError) {
      return NextResponse.json(
        { error: 'User profile not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      user: {
        id: authData.user.id,
        email: authData.user.email,
        userType,
        profileId: userProfile.id,
      },
      session: authData.session,
    })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    )
  }
}
