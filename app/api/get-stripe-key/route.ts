import { NextResponse } from 'next/server'

/**
 * Serves the Stripe publishable key at runtime.
 *
 * The key is safe to expose — Stripe designs publishable keys for the browser.
 * It is served from here rather than inlined via a NEXT_PUBLIC_ variable so the
 * value is read from the deployment environment at request time instead of
 * being baked into the client bundle at build time.
 */
export async function GET() {
  const publishableKey = process.env.STRIPE_PUBLISHABLE_KEY

  if (!publishableKey) {
    return NextResponse.json(
      { error: 'STRIPE_PUBLISHABLE_KEY is not set on the server' },
      { status: 500 }
    )
  }

  // A bare "pk_test_" prefix is the placeholder shipped in .env.example, and
  // passing it to Stripe.js fails with a much less obvious message than this.
  if (!publishableKey.startsWith('pk_') || publishableKey.length < 20) {
    return NextResponse.json(
      { error: 'STRIPE_PUBLISHABLE_KEY is set to a placeholder, not a real key' },
      { status: 500 }
    )
  }

  return NextResponse.json({ publishableKey })
}
