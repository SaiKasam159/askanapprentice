import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const { token } = await req.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Consent token is required' },
        { status: 400 }
      )
    }

    // Check if token exists and hasn't expired
    const { data: consent, error: fetchError } = await supabase
      .from('guardian_consents')
      .select('student_id, expires_at')
      .eq('token', token)
      .single()

    if (fetchError || !consent) {
      return NextResponse.json(
        { error: 'Invalid or expired consent token' },
        { status: 400 }
      )
    }

    // Check if token has expired (assuming 7-day expiration)
    const expiresAt = new Date(consent.expires_at)
    if (expiresAt < new Date()) {
      return NextResponse.json(
        { error: 'Consent token has expired' },
        { status: 400 }
      )
    }

    // Update student with guardian consent
    const { error: updateError } = await supabase
      .from('students')
      .update({
        guardian_consent: true,
        guardian_consent_date: new Date().toISOString(),
      })
      .eq('id', consent.student_id)

    if (updateError) {
      return NextResponse.json(
        { error: 'Failed to record consent' },
        { status: 500 }
      )
    }

    // Delete the consent token
    await supabase
      .from('guardian_consents')
      .delete()
      .eq('token', token)

    return NextResponse.json({
      success: true,
      message: 'Guardian consent recorded successfully',
    })
  } catch (error) {
    console.error('Verify guardian consent error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
