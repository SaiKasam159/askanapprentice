import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateVerificationToken, sendVerificationEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    // Check if student exists
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('id, first_name, email_verified')
      .eq('email', email)
      .single()

    if (fetchError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    // If already verified, no need to resend
    if (student.email_verified) {
      return NextResponse.json({
        success: true,
        message: 'Email already verified',
      })
    }

    // Delete old verification tokens for this student
    await supabase
      .from('email_verifications')
      .delete()
      .eq('student_id', student.id)

    // Generate new verification token
    const verificationToken = generateVerificationToken()
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours

    // Store verification token
    const { error: tokenError } = await supabase
      .from('email_verifications')
      .insert({
        student_id: student.id,
        token: verificationToken,
        expires_at: expiresAt.toISOString(),
      })

    if (tokenError) {
      return NextResponse.json(
        { error: 'Failed to generate verification token' },
        { status: 500 }
      )
    }

    // Send verification email
    await sendVerificationEmail(email, verificationToken, student.first_name)

    return NextResponse.json({
      success: true,
      message: 'Confirmation email sent',
    })
  } catch (error) {
    console.error('Resend confirmation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
