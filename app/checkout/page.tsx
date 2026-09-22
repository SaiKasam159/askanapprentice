'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { toast } from '@/lib/toast'

export default function Checkout() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const bookingId = searchParams.get('bookingId')
  const mentorName = searchParams.get('mentorName')

  const [processing, setProcessing] = useState(false)
  const [error, setError] = useState('')

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setProcessing(true)

    try {
      if (!bookingId) throw new Error('Missing booking ID')
      toast.success('Payment processed! Your booking is confirmed.')
      router.push(`/booking-confirmation?bookingId=${bookingId}`)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Payment failed'
      setError(message)
      toast.error(message)
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
        <h1 className="ac-h1">Complete payment</h1>
        <p className="ac-lede ac-mt-2">45-minute call with {mentorName} • £10.00</p>

        <form onSubmit={handlePayment} className="ac-card ac-mt-6">
          <div className="ac-stack" style={{ '--gap': '24px' } as any}>
            <div className="ac-card ac-card--soft ac-card--sm">
              <div className="ac-kv">
                <dt>Call duration</dt><dd>45 minutes</dd>
                <dt>Price</dt><dd className="ac-num">£10.00</dd>
              </div>
            </div>

            <div className="ac-field">
              <label className="ac-label">Card details</label>
              <div className="ac-input" style={{ padding: '12px', textAlign: 'center', color: 'var(--ac-text-soft)' }}>
                Mock Stripe Element would go here
              </div>
              <p className="ac-hint ac-mt-1">Test card: 4242 4242 4242 4242</p>
            </div>

            {error && <div style={{ padding: '12px 16px', borderLeft: '4px solid var(--ac-danger)', background: 'var(--ac-navy-800)', borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0' }}><p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>{error}</p></div>}

            <button type="submit" disabled={processing} className="ac-btn ac-btn--block ac-btn--lg">{processing ? 'Processing...' : 'Pay £10.00'}</button>

            <Link href="/booking-confirmation" className="ac-btn ac-btn--secondary ac-btn--block">Cancel</Link>
          </div>
        </form>

        <div className="ac-note ac-mt-6">
          <p className="ac-small ac-mt-0">Your payment is secure and processed by Stripe. You'll receive a confirmation email immediately after payment.</p>
        </div>
      </div>
    </div>
  )
}
