import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase'
import { sessionFrom } from '@/lib/session'
import { serverError } from '@/lib/errors'
import { sendCancellationEmails } from '@/lib/booking-emails'

/**
 * Either party may cancel. Paid calls are refunded in full whoever cancels and
 * however late: at £10 a call, arguing about it costs more than the refund.
 * Tighten here if that stops being true.
 */
const REFUND_IN_FULL = true

export async function POST(req: NextRequest) {
  try {
    const session = sessionFrom(req)
    if (!session) return NextResponse.json({ error: 'Not signed in' }, { status: 401 })

    const { bookingId, reason } = await req.json()
    if (!bookingId) return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })

    const admin = getSupabaseAdmin()
    const { data: booking, error } = await admin
      .from('bookings')
      .select('id, student_id, apprentice_id, status, price, scheduled_at, stripe_payment_intent_id')
      .eq('id', bookingId)
      .maybeSingle()

    if (error) return serverError('cancel lookup', error)
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

    // You can only cancel your own booking.
    const owns = session.role === 'student'
      ? booking.student_id === session.userId
      : booking.apprentice_id === session.userId
    if (!owns) return NextResponse.json({ error: 'That is not your booking' }, { status: 403 })

    if (booking.status === 'cancelled') {
      return NextResponse.json({ error: 'This booking is already cancelled' }, { status: 409 })
    }
    if (new Date(booking.scheduled_at).getTime() < Date.now()) {
      return NextResponse.json({ error: 'That call has already happened' }, { status: 409 })
    }

    // Refund before cancelling: if Stripe fails we want the booking left alone
    // rather than cancelled with the student's money still taken.
    let refundId: string | null = null
    const wasPaid = Number(booking.price) > 0 && booking.status === 'confirmed'

    if (wasPaid && REFUND_IN_FULL && booking.stripe_payment_intent_id) {
      if (!process.env.STRIPE_SECRET_KEY) {
        return NextResponse.json({ error: 'Refunds are unavailable right now' }, { status: 503 })
      }
      try {
        const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
        const refund = await stripe.refunds.create({
          payment_intent: booking.stripe_payment_intent_id,
        })
        refundId = refund.id
      } catch (err) {
        console.error('Refund failed for booking', booking.id, err)
        return NextResponse.json(
          { error: 'We could not process the refund, so the booking has been left in place. Please try again.' },
          { status: 502 }
        )
      }
    }

    const { data: updated, error: updateError } = await admin
      .from('bookings')
      .update({
        status: 'cancelled',
        cancelled_at: new Date().toISOString(),
        cancelled_by: session.role,
        cancel_reason: typeof reason === 'string' ? reason.slice(0, 500) : null,
        stripe_refund_id: refundId,
      })
      .eq('id', booking.id)
      .select()
      .single()

    if (updateError) return serverError('cancel update', updateError)

    await sendCancellationEmails(booking.id, session.role, Boolean(refundId))

    return NextResponse.json({ booking: updated, refunded: Boolean(refundId) })
  } catch (error) {
    return serverError('cancel booking', error)
  }
}
