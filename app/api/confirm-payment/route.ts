import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase'

/** Confirms with Stripe that a booking was actually paid before marking it confirmed. */
export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    const { bookingId } = await req.json()
    if (!bookingId) return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })

    const admin = getSupabaseAdmin()
    const { data: booking, error: lookupError } = await admin
      .from('bookings')
      .select('id, status, stripe_payment_intent_id')
      .eq('id', bookingId)
      .maybeSingle()

    if (lookupError) {
      console.error('Booking lookup failed:', lookupError)
      return NextResponse.json({ error: `Could not load booking: ${lookupError.message}` }, { status: 500 })
    }
    if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    if (booking.status === 'confirmed') return NextResponse.json({ booking })
    if (!booking.stripe_payment_intent_id) {
      return NextResponse.json({ error: 'No payment was started for this booking' }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)
    const intent = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id)

    // Trust Stripe, not the browser.
    if (intent.status !== 'succeeded') {
      return NextResponse.json({ error: `Payment not complete (${intent.status})` }, { status: 402 })
    }

    const { data: updated, error } = await admin
      .from('bookings')
      .update({ status: 'confirmed', paid_at: new Date().toISOString() })
      .eq('id', booking.id)
      .select()
      .single()

    if (error) throw error
    return NextResponse.json({ booking: updated })
  } catch (error) {
    console.error('Confirm payment error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Could not confirm payment' },
      { status: 500 }
    )
  }
}
