import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'
import { getSupabaseAdmin } from '@/lib/supabase'

export async function POST(req: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe is not configured' }, { status: 500 })
    }

    const { bookingId } = await req.json()
    if (!bookingId) {
      return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
    }

    const admin = getSupabaseAdmin()
    const { data: booking, error } = await admin
      .from('bookings')
      .select('id, price, call_duration, status, stripe_payment_intent_id, apprentices:apprentice_id(name)')
      .eq('id', bookingId)
      .maybeSingle()

    if (error) {
      console.error('Booking lookup failed:', error)
      return NextResponse.json({ error: `Could not load booking: ${error.message}` }, { status: 500 })
    }
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }
    if (booking.status === 'confirmed' || booking.status === 'completed') {
      return NextResponse.json({ error: 'This booking is already paid for' }, { status: 409 })
    }
    // Amount comes from the stored booking, never from the request body.
    const amountPence = Math.round(Number(booking.price) * 100)
    if (!amountPence) {
      return NextResponse.json({ error: 'This booking does not require payment' }, { status: 400 })
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY)

    // Reuse the existing intent so a page refresh doesn't create duplicates.
    if (booking.stripe_payment_intent_id) {
      const existing = await stripe.paymentIntents.retrieve(booking.stripe_payment_intent_id)
      if (existing.status !== 'canceled' && existing.amount === amountPence) {
        return NextResponse.json({ clientSecret: existing.client_secret, amount: amountPence })
      }
    }

    const intent = await stripe.paymentIntents.create({
      amount: amountPence,
      currency: 'gbp',
      automatic_payment_methods: { enabled: true },
      metadata: { bookingId: booking.id, callDuration: String(booking.call_duration) },
    })

    await admin.from('bookings').update({ stripe_payment_intent_id: intent.id }).eq('id', booking.id)

    return NextResponse.json({ clientSecret: intent.client_secret, amount: amountPence })
  } catch (error) {
    console.error('Payment intent error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Payment setup failed' },
      { status: 500 }
    )
  }
}
