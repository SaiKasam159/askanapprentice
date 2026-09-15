import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Verification token is required' },
        { status: 400 }
      )
    }

    // Check if token exists and hasn't expired
    const { data: verification, error: fetchError } = await supabase
      .from('email_verifications')
      .select('student_id, expires_at')
      .eq('token', token)
      .single()

    if (fetchError || !verification) {
      return NextResponse.json(
        { error: 'Invalid or expired verification token' },
        { status: 400 }
      )
    }

    // Check if token has expired (assuming 24-hour expiration)
    const expiresAt = new Date(verification.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Verification token has expired' },
        { status: 400 }
      )
    }

    // Mark student as verified
    const { error: updateError } = await supabase
      .from('students')
      .update({ email_verified: true })
      .eq('id', verification.student_id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to verify email' },
        { status: 500 }
      )
    }

    // Delete the verification token
    await supabase
      .from('email_verifications')
      .delete()
      .eq('token', token)

    return NextResponse.json({
      success: true,
      message: 'Email verified successfully',
    })
  } catch (error) {
    console.error('Verify email error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
