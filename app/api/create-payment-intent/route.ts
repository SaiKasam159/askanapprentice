import { NextRequest, NextResponse } from 'next/server'

const stripe = require('stripe')

export async function POST(request: NextRequest) {
  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: 'Stripe secret key not configured' },
        { status: 500 }
      )
    }

    const stripeClient = stripe(process.env.STRIPE_SECRET_KEY)
    const { amount, duration, email } = await request.json()

    if (!amount || !duration || !email) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const paymentIntent = await stripeClient.paymentIntents.create({
      amount: Math.round(amount),
      currency: 'gbp',
      metadata: {
        duration,
        email,
      },
    })

    return NextResponse.json({ clientSecret: paymentIntent.client_secret })
  } catch (error: any) {
    console.error('Payment error:', error)
    return NextResponse.json(
      { error: error.message || 'Payment processing failed' },
      { status: 500 }
    )
  }
}
