'use client'

import { useState } from 'react'
import Link from 'next/link'

type CallOption = {
  id: 'standard' | 'extended'
  name: string
  duration: number
  price: number
  firstPrice?: number
  description: string
  popular?: boolean
}

const callOptions: CallOption[] = [
  {
    id: 'standard',
    name: 'Deep Dive',
    duration: 30,
    price: 10,
    firstPrice: 0,
    description: 'Your application, interview prep, or any part of the process that matters. First call is free.',
    popular: true,
  },
  {
    id: 'extended',
    name: 'Extended Session',
    duration: 45,
    price: 15,
    firstPrice: 10,
    description: 'Deep dive plus follow-up. Covers multiple aspects of your journey.',
    popular: false,
  },
]

export default function PricingPage() {
  const [selectedOption, setSelectedOption] = useState<string>('standard')
  const [isFirstCall, setIsFirstCall] = useState(true)
  const selected = callOptions.find(opt => opt.id === selectedOption)
  const price = isFirstCall && selected?.firstPrice !== undefined ? selected.firstPrice : selected?.price || 0

  return (
    <div className="ac-container ac-section">
      <div className="ac-stack" style={{ maxWidth: '56rem', marginBottom: '48px' }}>
        <h1 className="ac-h1">Choose your call</h1>
        <p className="ac-lede">Pick the length that matches what you need to cover.</p>
      </div>

      <div className="ac-stack" style={{ '--gap': '16px', maxWidth: '56rem' } as any}>
        <div className="ac-card ac-card--sm" style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', flex: 1 }}>
            <input
              type="checkbox"
              checked={isFirstCall}
              onChange={(e) => setIsFirstCall(e.target.checked)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--ac-brass)', cursor: 'pointer' }}
            />
            <span className="ac-body">This is my first call</span>
          </label>
        </div>

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
              {isFirstCall && option.firstPrice !== undefined
                ? option.firstPrice === 0
                  ? 'Free'
                  : `£${option.firstPrice}`
                : `£${option.price}`}
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
            {isFirstCall && selected.firstPrice !== undefined && (
              <div className="ac-row ac-row--between" style={{ color: 'var(--ac-brass)' }}>
                <p className="ac-body">First call offer</p>
                <p className="ac-body" style={{ color: 'var(--ac-brass)' }}>-£{(selected.price - selected.firstPrice).toFixed(2)}</p>
              </div>
            )}
            <div className="ac-row ac-row--between">
              <p className="ac-body">Platform fee</p>
              <p className="ac-body">£{price.toFixed(2)}</p>
            </div>
            <div className="ac-divider--strong" style={{ margin: '12px 0' }}></div>
            <div className="ac-row ac-row--between">
              <p className="ac-h4">Total</p>
              <p className="ac-h4">£{price.toFixed(2)}</p>
            </div>
          </div>

          <Link
            href={price === 0 ? '/directory' : `/checkout?duration=${selected.duration}&price=${price}`}
            className="ac-btn ac-btn--block ac-btn--lg"
          >
            {price === 0 ? 'Get started' : 'Continue to payment'}
          </Link>

          {price > 0 && (
            <p className="ac-small ac-muted ac-center">
              Secure payment with Stripe. All payment goes to supporting the platform.
            </p>
          )}
        </div>
      )}

      <div className="ac-mt-8">
        <div className="ac-note">
          <p className="ac-small ac-mt-0"><strong>First call offers:</strong> 30-minute calls are free on your first booking. 45-minute calls are £10 on your first booking. After that, standard pricing applies.</p>
        </div>
      </div>
    </div>
  )
}
