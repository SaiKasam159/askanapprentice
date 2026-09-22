import { NextResponse } from 'next/server'

/**
 * Reports whether Stripe is configured. Returns booleans only — never the key
 * values, and deliberately accepts no input: keys belong in the deployment
 * environment, not in a form submission.
 */
export async function GET() {
  return NextResponse.json({
    publishableKeyConfigured: Boolean(process.env.STRIPE_PUBLISHABLE_KEY),
    secretKeyConfigured: Boolean(process.env.STRIPE_SECRET_KEY),
    mode: process.env.STRIPE_SECRET_KEY?.startsWith('sk_live_') ? 'live' : 'test',
  })
}
