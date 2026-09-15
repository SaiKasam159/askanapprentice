import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateVerificationToken, sendGuardianConsentEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const { studentId } = await req.json()

    if (!studentId) {
      return NextResponse.json(
        { error: 'Student ID is required' },
        { status: 400 }
      )
    }

    // Get student
    const { data: student, error: fetchError } = await supabase
      .from('students')
      .select('id, first_name, email, guardian_email, guardian_consent')
      .eq('id', studentId)
      .single()

    if (fetchError || !student) {
      return NextResponse.json(
        { error: 'Student not found' },
        { status: 404 }
      )
    }

    if (!student.guardian_email) {
      return NextResponse.json(
        { error: 'No guardian email on file' },
        { status: 400 }
      )
    }

    if (student.guardian_consent) {
      return NextResponse.json({
        success: true,
        message: 'Guardian consent already provided',
      })
    }

    // Delete old consent tokens for this student
    await supabase
      .from('guardian_consents')
      .delete()
      .eq('student_id', student.id)

    // Generate new consent token
    const consentToken = generateVerificationToken()
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

    // Store consent token
    const { error: tokenError } = await supabase
      .from('guardian_consents')
      .insert({
        student_id: student.id,
        token: consentToken,
        expires_at: expiresAt.toISOString(),
      })

    if (tokenError) {
      return NextResponse.json(
        { error: 'Failed to generate consent token' },
        { status: 500 }
      )
    }

    // Send consent email
    await sendGuardianConsentEmail(
      student.guardian_email,
      student.first_name,
      student.email,
      consentToken
    )

    return NextResponse.json({
      success: true,
      message: 'Consent email resent',
    })
  } catch (error) {
    console.error('Resend guardian consent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
