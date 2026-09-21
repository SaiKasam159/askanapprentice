import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const { name, linkedinUrl, sectors, guardianEmail } = await request.json()

    if (!name || !sectors || sectors.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const { data, error } = await supabase
      .from('students')
      .insert([
        {
          name,
          linkedin_url: linkedinUrl || null,
          sectors,
          guardian_email: guardianEmail || null,
          first_call_used: false,
          created_at: new Date().toISOString(),
        },
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: error.message || 'Failed to create account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: data?.[0]?.id,
      message: 'Student account created successfully',
    })
  } catch (err: any) {
    console.error('Signup error:', err)
    return NextResponse.json(
      { error: err.message || 'Signup failed' },
      { status: 500 }
    )
  }
}
