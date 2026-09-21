'use client'

import { useState, Suspense, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { loadStripe } from '@stripe/stripe-js'
import { CardElement, Elements, ElementsConsumer } from '@stripe/react-stripe-js'

let stripePromise: any = null

function useStripePromise() {
  const [promise, setPromise] = useState<any>(null)

  useEffect(() => {
    const fetchKey = async () => {
      try {
        const res = await fetch('/api/get-stripe-key')
        const data = await res.json()
        if (data.publishableKey) {
          setPromise(loadStripe(data.publishableKey))
        }
      } catch (err) {
        console.error('Failed to load Stripe key:', err)
      }
    }
    fetchKey()
  }, [])

  return promise
}

function CheckoutForm({ duration, price }: { duration: number; price: number }) {
  const [error, setError] = useState<string>('')
  const [processing, setProcessing] = useState(false)
  const [succeeded, setSucceeded] = useState(false)
  const [email, setEmail] = useState('')

  const handleSubmit = async (e: React.FormEvent, stripe: any, elements: any) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    if (!email) {
      setError('Please enter your email address')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const response = await fetch('/api/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: Math.round(price * 100),
          duration,
          email,
        }),
      })

      if (!response.ok) throw new Error('Payment request failed')

      const { clientSecret } = await response.json()

      const cardElement = elements.getElement(CardElement)
      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: cardElement,
          billing_details: { email },
        },
      })

      if (result.error) {
        setError(result.error.message)
      } else if (result.paymentIntent.status === 'succeeded') {
        setSucceeded(true)
      }
    } catch (err: any) {
      setError(err.message || 'Payment failed. Please try again.')
    } finally {
      setProcessing(false)
    }
  }

  if (succeeded) {
    return (
      <div className="ac-card ac-stack" style={{ '--gap': '24px', maxWidth: '28rem' } as any}>
        <div className="ac-stack" style={{ '--gap': '8px' } as any}>
          <p className="ac-overline ac-brass-text">✓ Payment successful</p>
          <h2 className="ac-h2">Ready to book</h2>
          <p className="ac-body ac-muted ac-mt-2">Confirmation email sent to {email}. Head to the directory to find and book a mentor.</p>
        </div>
        <Link href="/directory" className="ac-btn ac-btn--block ac-btn--lg">
          Browse mentors
        </Link>
      </div>
    )
  }

  return (
    <ElementsConsumer>
      {({ stripe, elements }) => (
        <form onSubmit={(e) => handleSubmit(e, stripe, elements)} className="ac-card ac-stack" style={{ '--gap': '24px', maxWidth: '28rem' } as any}>
          <div>
            <p className="ac-overline">Order</p>
            <div className="ac-row ac-row--between ac-mt-2">
              <p className="ac-body">{duration}-minute call</p>
              <p className="ac-body">£{price.toFixed(2)}</p>
            </div>
          </div>

          <div className="ac-field">
            <label className="ac-label" htmlFor="email">Email address</label>
            <input
              className="ac-input"
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              disabled={processing}
            />
          </div>

          <div className="ac-field">
            <label className="ac-label" htmlFor="card">Card details</label>
            <div className="ac-input" style={{ padding: '12px', height: 'auto', minHeight: '44px' }}>
              <CardElement
                options={{
                  style: {
                    base: {
                      fontSize: '16px',
                      color: '#edf3fa',
                      '::placeholder': { color: '#6e87a6' },
                    },
                  },
                }}
              />
            </div>
          </div>

          {error && <p className="ac-error">{error}</p>}

          <button
            type="submit"
            disabled={!stripe || processing}
            className="ac-btn ac-btn--block ac-btn--lg"
          >
            {processing ? 'Processing...' : `Pay £${price.toFixed(2)}`}
          </button>

          <p className="ac-small ac-muted ac-center">Secure payment with Stripe. No card details stored.</p>
        </form>
      )}
    </ElementsConsumer>
  )
}

function CheckoutContent() {
  const params = useSearchParams()
  const stripePromise = useStripePromise()
  const duration = params.get('duration') ? parseInt(params.get('duration')!) : 30
  const price = params.get('price') ? parseFloat(params.get('price')!) : 10

  if (!stripePromise) {
    return (
      <div className="ac-card ac-stack ac-mt-6" style={{ '--gap': '24px', maxWidth: '28rem' } as any}>
        <p className="ac-body ac-muted">Loading payment processor...</p>
      </div>
    )
  }

  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm duration={duration} price={price} />
    </Elements>
  )
}

export default function CheckoutPage() {
  return (
    <div className="ac-container ac-section">
      <h1 className="ac-h1 ac-mt-0">Complete payment</h1>
      <p className="ac-lede ac-mt-2">Enter your details to complete your booking.</p>
      <Suspense fallback={<div className="ac-mt-6">Loading...</div>}>
        <CheckoutContent />
      </Suspense>
    </div>
  )
}
