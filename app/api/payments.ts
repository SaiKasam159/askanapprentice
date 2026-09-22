import { NextRequest, NextResponse } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { bookingId, amount } = body

    if (!bookingId || !amount || amount < 10) {
      return NextResponse.json({ error: 'Invalid amount' }, { status: 400 })
    }

    return NextResponse.json({
      clientSecret: `pi_mock_${bookingId}`,
      amount,
      status: 'requires_payment_method'
    })
  } catch (error) {
    return NextResponse.json({ error: 'Failed to process' }, { status: 500 })
  }
}
