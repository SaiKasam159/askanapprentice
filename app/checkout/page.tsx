'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'
import { toast } from '@/lib/toast'

const stripePromise = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
  ? loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY)
  : null

const errorBox = {
  padding: '12px 16px',
  borderLeft: '4px solid var(--ac-danger)',
  background: 'var(--ac-navy-800)',
  borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0',
}

function PaymentForm({ bookingId, amount }: { bookingId: string; amount: number }) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!stripe || !elements) return

    setError('')
    setProcessing(true)

    const { error: stripeError } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required',
    })

    if (stripeError) {
      setError(stripeError.message ?? 'Payment failed')
      setProcessing(false)
      return
    }

    // The server re-checks with Stripe before marking the booking confirmed.
    const res = await fetch('/api/confirm-payment', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })

    if (!res.ok) {
      const data = await res.json()
      setError(data.error ?? 'Payment went through but the booking could not be confirmed. Contact support.')
      setProcessing(false)
      return
    }

    toast.success('Payment complete. Your call is booked.')
    router.push(`/booking-confirmation?bookingId=${bookingId}`)
  }

  return (
    <form onSubmit={handleSubmit} className="ac-card ac-mt-6">
      <div className="ac-stack" style={{ '--gap': '24px' } as any}>
        <PaymentElement />
        {error && <div style={errorBox}><p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>{error}</p></div>}
        <button type="submit" disabled={!stripe || processing} className="ac-btn ac-btn--block ac-btn--lg">
          {processing ? 'Processing…' : `Pay £${(amount / 100).toFixed(2)}`}
        </button>
        <Link href="/student/dashboard" className="ac-btn ac-btn--secondary ac-btn--block">Cancel</Link>
      </div>
    </form>
  )
}

export default function Checkout() {
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')

  const [clientSecret, setClientSecret] = useState('')
  const [amount, setAmount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!bookingId) {
      setError('No booking specified.')
      setLoading(false)
      return
    }

    fetch('/api/create-payment-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ bookingId }),
    })
      .then(async res => {
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Could not start payment')
        setClientSecret(data.clientSecret)
        setAmount(data.amount)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [bookingId])

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
        <h1 className="ac-h1">Complete payment</h1>
        <p className="ac-lede ac-mt-2">45-minute call{amount ? ` • £${(amount / 100).toFixed(2)}` : ''}</p>

        {loading && <p className="ac-muted ac-mt-6">Setting up secure payment…</p>}

        {!loading && error && (
          <div className="ac-card ac-mt-6">
            <div style={errorBox}><p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>{error}</p></div>
            <Link href="/directory" className="ac-btn ac-btn--secondary ac-btn--block ac-mt-4">Back to mentors</Link>
          </div>
        )}

        {!loading && !error && !stripePromise && (
          <div className="ac-card ac-mt-6">
            <div style={errorBox}>
              <p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>
                Payments are not configured. NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY is missing.
              </p>
            </div>
          </div>
        )}

        {!loading && !error && stripePromise && clientSecret && bookingId && (
          <Elements
            stripe={stripePromise}
            options={{ clientSecret, appearance: { theme: 'night', variables: { colorPrimary: '#E3B872' } } }}
          >
            <PaymentForm bookingId={bookingId} amount={amount} />
          </Elements>
        )}

        <div className="ac-note ac-mt-6">
          <p className="ac-small ac-mt-0">
            Payments are handled by Stripe. Your card details never reach ApprentaCall's servers.
          </p>
        </div>
      </div>
    </div>
  )
}
