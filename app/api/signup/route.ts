import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'
import { generateVerificationToken, sendVerificationEmail, sendGuardianConsentEmail } from '@/lib/email'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const {
      email,
      firstName,
      targetSector,
      targetCompany,
      ageVerified,
      guardianEmail,
    } = body

    // Validate required fields
    if (!email || !firstName || !targetSector || !ageVerified) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // If under 16, guardian email is required
    if (!ageVerified && !guardianEmail) {
      return NextResponse.json(
        { error: 'Guardian email required for users under 16' },
        { status: 400 }
      )
    }

    // Check if student already exists
    const { data: existingStudent } = await supabase
      .from('students')
      .select('id')
      .eq('email', email)
      .single()

    if (existingStudent) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Create student record
    const { data: student, error: studentError } = await supabase
      .from('students')
      .insert({
        email,
        first_name: firstName,
        target_sector: targetSector,
        target_company: targetCompany || null,
        age_verified: ageVerified,
        guardian_email: guardianEmail || null,
      })
      .select()
      .single()

    if (studentError) {
      return NextResponse.json(
        { error: 'Failed to create student account' },
        { status: 500 }
      )
    }

    // Generate verification token
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
      // Delete student if token creation fails
      await supabase.from('students').delete().eq('id', student.id)
      return NextResponse.json(
        { error: 'Failed to create verification token' },
        { status: 500 }
      )
    }

    // Send verification email
    await sendVerificationEmail(email, verificationToken, firstName)

    // If under 16, send guardian consent email
    if (guardianEmail) {
      const guardianToken = generateVerificationToken()
      const guardianExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days

      // Store guardian consent token
      const { error: guardianTokenError } = await supabase
        .from('guardian_consents')
        .insert({
          student_id: student.id,
          token: guardianToken,
          expires_at: guardianExpiresAt.toISOString(),
        })

      if (!guardianTokenError) {
        await sendGuardianConsentEmail(guardianEmail, firstName, email, guardianToken)
      }
    }

    return NextResponse.json({
      success: true,
      studentId: student.id,
      message: guardianEmail
        ? 'Account created. Check your email and your guardian\'s email for confirmation links.'
        : 'Account created. Check your email for confirmation link.',
    })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
