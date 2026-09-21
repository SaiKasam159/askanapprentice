import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

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
          linkedin_url: linkedinUrl,
          sectors: sectors,
          guardian_email: guardianEmail || null,
          created_at: new Date(),
        },
      ])
      .select()

    if (error) {
      console.error('Supabase error:', error)
      return NextResponse.json(
        { error: 'Failed to create account' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      id: data?.[0]?.id,
      message: 'Student account created',
    })
  } catch (err: any) {
    console.error('Signup error:', err)
    return NextResponse.json(
      { error: err.message || 'Signup failed' },
      { status: 500 }
    )
  }
}
