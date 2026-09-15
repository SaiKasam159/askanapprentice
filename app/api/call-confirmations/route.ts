import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { apprenticeId, studentId, studentConfirmed, apprenticeConfirmed } = body

    if (!apprenticeId) {
      return NextResponse.json(
        { error: 'Apprentice ID is required' },
        { status: 400 }
      )
    }

    // Check if there's an existing call confirmation record for this pair
    // For MVP, we'll create a new confirmation for each call
    // TODO: In future, track scheduled calls and match confirmations to them

    const { data: existingConfirmation, error: queryError } = await supabase
      .from('call_confirmations')
      .select('id, student_confirmed, apprentice_confirmed')
      .eq('apprentice_id', apprenticeId)
      .eq('student_id', studentId || 'null')
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    let confirmation

    if (!queryError && existingConfirmation) {
      // Update existing confirmation
      const { data: updated, error: updateError } = await supabase
        .from('call_confirmations')
        .update({
          student_confirmed: studentConfirmed !== undefined ? studentConfirmed : existingConfirmation.student_confirmed,
          apprentice_confirmed: apprenticeConfirmed !== undefined ? apprenticeConfirmed : existingConfirmation.apprentice_confirmed,
          completed_at: (studentConfirmed || apprenticeConfirmed) ? new Date().toISOString() : null,
        })
        .eq('id', existingConfirmation.id)
        .select()
        .single()

      if (updateError) {
        throw updateError
      }

      confirmation = updated
    } else {
      // Create new confirmation
      const { data: created, error: createError } = await supabase
        .from('call_confirmations')
        .insert({
          apprentice_id: apprenticeId,
          student_id: studentId || null,
          student_confirmed: studentConfirmed || false,
          apprentice_confirmed: apprenticeConfirmed || false,
          completed_at: (studentConfirmed || apprenticeConfirmed) ? new Date().toISOString() : null,
        })
        .select()
        .single()

      if (createError) {
        throw createError
      }

      confirmation = created
    }

    // Check if both have confirmed
    const bothConfirmed = confirmation.student_confirmed && confirmation.apprentice_confirmed

    return NextResponse.json({
      success: true,
      confirmationId: confirmation.id,
      bothConfirmed,
      message: bothConfirmed
        ? 'Call confirmed by both parties! You can now rate this call.'
        : 'Your confirmation has been recorded. Waiting for the apprentice to confirm.',
    })
  } catch (error) {
    console.error('Call confirmation error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const apprenticeId = req.nextUrl.searchParams.get('apprenticeId')
    const studentId = req.nextUrl.searchParams.get('studentId')

    if (!apprenticeId) {
      return NextResponse.json(
        { error: 'Apprentice ID is required' },
        { status: 400 }
      )
    }

    let query = supabase
      .from('call_confirmations')
      .select('*')
      .eq('apprentice_id', apprenticeId)

    if (studentId) {
      query = query.eq('student_id', studentId)
    }

    const { data: confirmations, error } = await query.order('created_at', { ascending: false })

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch confirmations' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      confirmations: confirmations || [],
    })
  } catch (error) {
    console.error('Get confirmations error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
