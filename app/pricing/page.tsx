'use client'

import { useState } from 'react'
import Link from 'next/link'

type CallOption = {
  id: 'intro' | 'standard' | 'extended'
  name: string
  duration: number
  price: number
  description: string
  popular?: boolean
}

const callOptions: CallOption[] = [
  {
    id: 'intro',
    name: 'Quick Questions',
    duration: 15,
    price: 0,
    description: 'One or two specific questions about your target firm or the application process.',
    popular: false,
  },
  {
    id: 'standard',
    name: 'Deep Dive',
    duration: 30,
    price: 10,
    description: 'Your application, interview prep, or any part of the process that matters.',
    popular: true,
  },
  {
    id: 'extended',
    name: 'Extended Session',
    duration: 45,
    price: 15,
    description: 'Deep dive plus follow-up. Covers multiple aspects of your journey.',
    popular: false,
  },
]

export default function PricingPage() {
  const [selectedOption, setSelectedOption] = useState<string>('standard')
  const selected = callOptions.find(opt => opt.id === selectedOption)

  return (
    <div className="ac-container ac-section">
      <div className="ac-stack" style={{ maxWidth: '56rem', marginBottom: '48px' }}>
        <h1 className="ac-h1">Choose your call</h1>
        <p className="ac-lede">Pick the length that matches what you need to cover. First intro call is always free.</p>
      </div>

      <div className="ac-stack" style={{ '--gap': '12px', maxWidth: '56rem' } as any}>
        {callOptions.map((option) => (
          <button
            key={option.id}
            onClick={() => setSelectedOption(option.id)}
            className="ac-choice"
            aria-pressed={selectedOption === option.id}
          >
            <div>
              <div className="ac-choice__title">
                {option.name}
                {option.popular && <span className="ac-badge ac-badge--brass">Most popular</span>}
              </div>
              <div className="ac-choice__meta">
                {option.duration} min • {option.description}
              </div>
            </div>
            <div className="ac-choice__value">
              {option.price === 0 ? 'Free' : `£${option.price}`}
            </div>
          </button>
        ))}
      </div>

      {selected && (
        <div className="ac-card ac-mt-6 ac-stack" style={{ '--gap': '24px', maxWidth: '28rem' } as any}>
          <div className="ac-stack" style={{ '--gap': '8px' } as any}>
            <p className="ac-overline">Summary</p>
            <div className="ac-row ac-row--between">
              <p className="ac-body">{selected.name}</p>
              <p className="ac-body">{selected.duration} min</p>
            </div>
            <div className="ac-row ac-row--between">
              <p className="ac-body">Platform fee (100%)</p>
              <p className="ac-body">£{selected.price.toFixed(2)}</p>
            </div>
            <div className="ac-divider--strong" style={{ margin: '12px 0' }}></div>
            <div className="ac-row ac-row--between">
              <p className="ac-h4">Total</p>
              <p className="ac-h4">£{selected.price.toFixed(2)}</p>
            </div>
          </div>

          <Link
            href={selected.price === 0 ? '/directory' : `/checkout?duration=${selected.duration}&price=${selected.price}`}
            className="ac-btn ac-btn--block ac-btn--lg"
          >
            {selected.price === 0 ? 'Get started' : 'Continue to payment'}
          </Link>

          {selected.price > 0 && (
            <p className="ac-small ac-muted ac-center">
              Secure payment with Stripe. 100% of your payment goes to supporting the platform.
            </p>
          )}
        </div>
      )}

      <div className="ac-mt-8">
        <div className="ac-note">
          <p className="ac-small ac-mt-0"><strong>Free intros:</strong> One free 15-minute call per account. After that, paid calls support the platform. All apprentices receive their full mentoring time—mentors set their own rates.</p>
        </div>
      </div>
    </div>
  )
}
