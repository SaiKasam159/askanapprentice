import { NextResponse } from 'next/server'

export async function GET() {
  const key = process.env.STRIPE_PUBLISHABLE_KEY

  if (!key) {
    return NextResponse.json(
      { error: 'Stripe publishable key not configured' },
      { status: 500 }
    )
  }

  return NextResponse.json({ publishableKey: key })
}
