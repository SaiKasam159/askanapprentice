'use client'

import { useState, useEffect } from 'react'

interface EnvVars {
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: string
  STRIPE_SECRET_KEY: string
}

export default function SetupPage() {
  const [vars, setVars] = useState<EnvVars>({
    NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: '',
    STRIPE_SECRET_KEY: '',
  })
  const [saved, setSaved] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    // Check which keys are already configured (via environment)
    const publicKey = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
    const secretKey = process.env.STRIPE_SECRET_KEY

    setVars({
      NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: publicKey ? '••••••••••••' : '',
      STRIPE_SECRET_KEY: secretKey ? '••••••••••••' : '',
    })
  }, [])

  const handleChange = (key: keyof EnvVars, value: string) => {
    setVars(prev => ({ ...prev, [key]: value }))
    setSaved(false)
  }

  const handleSave = async () => {
    try {
      setError('')
      const response = await fetch('/api/setup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(vars),
      })

      if (!response.ok) {
        throw new Error('Failed to save configuration')
      }

      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    } catch (err: any) {
      setError(err.message || 'Failed to save configuration')
    }
  }

  return (
    <div className="ac-container ac-section">
      <div className="ac-stack" style={{ maxWidth: '56rem', marginBottom: '48px' }}>
        <h1 className="ac-h1">Configuration</h1>
        <p className="ac-lede">Add your API keys to enable payments and other features.</p>
      </div>

      <div className="ac-card" style={{ maxWidth: '56rem' }}>
        <div className="ac-stack" style={{ '--gap': '32px' } as any}>
          {/* Stripe Publishable Key */}
          <div className="ac-stack" style={{ '--gap': '12px' } as any}>
            <div className="ac-field">
              <label className="ac-label" htmlFor="stripe-pub">Stripe Publishable Key</label>
              <p className="ac-hint ac-mt-1">Your public Stripe key (starts with pk_live or pk_test)</p>
              <input
                className="ac-input ac-mt-2"
                id="stripe-pub"
                type="password"
                value={vars.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY}
                onChange={(e) => handleChange('NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY', e.target.value)}
                placeholder="pk_live_..."
              />
            </div>
            <p className="ac-small ac-muted">Find this in your <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="ac-link">Stripe Dashboard</a> under API Keys.</p>
          </div>

          {/* Stripe Secret Key */}
          <div className="ac-stack" style={{ '--gap': '12px' } as any}>
            <div className="ac-field">
              <label className="ac-label" htmlFor="stripe-secret">Stripe Secret Key</label>
              <p className="ac-hint ac-mt-1">Your secret Stripe key (starts with sk_live or sk_test)</p>
              <input
                className="ac-input ac-mt-2"
                id="stripe-secret"
                type="password"
                value={vars.STRIPE_SECRET_KEY}
                onChange={(e) => handleChange('STRIPE_SECRET_KEY', e.target.value)}
                placeholder="sk_live_..."
              />
            </div>
            <p className="ac-small ac-muted">Keep this secret. Never share it or commit it to version control.</p>
          </div>

          {/* Info Note */}
          <div className="ac-note">
            <p className="ac-small"><strong>How to get your keys:</strong></p>
            <ol style={{ marginLeft: '20px', marginTop: '8px', fontSize: '.875rem', color: 'var(--ac-text-soft)', lineHeight: '1.6' }}>
              <li>Go to <a href="https://dashboard.stripe.com/apikeys" target="_blank" rel="noopener noreferrer" className="ac-link">Stripe Dashboard</a></li>
              <li>Click "Developers" → "API Keys"</li>
              <li>Copy your Publishable Key (pk_*) and Secret Key (sk_*)</li>
              <li>Paste them above and click Save</li>
            </ol>
          </div>

          {error && (
            <div style={{ padding: '12px 16px', borderLeft: '4px solid var(--ac-danger)', background: 'var(--ac-navy-800)', borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0' }}>
              <p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>{error}</p>
            </div>
          )}

          {saved && (
            <div style={{ padding: '12px 16px', borderLeft: '4px solid var(--ac-teal)', background: 'var(--ac-navy-800)', borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0' }}>
              <p className="ac-small" style={{ color: 'var(--ac-teal)', margin: 0 }}>✓ Configuration saved. Changes may take a moment to apply.</p>
            </div>
          )}

          <button onClick={handleSave} className="ac-btn ac-btn--lg">
            Save configuration
          </button>
        </div>
      </div>

      <div className="ac-mt-8" style={{ maxWidth: '56rem' }}>
        <h2 className="ac-h3">Environment variables reference</h2>
        <p className="ac-body ac-muted ac-mt-2">These values are stored in your .env.local file. For Vercel deployment, add them to your project settings.</p>

        <div className="ac-stack ac-mt-4" style={{ '--gap': '12px' } as any}>
          <div className="ac-card ac-card--sm">
            <p className="ac-overline">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</p>
            <p className="ac-small ac-muted ac-mt-1">Public Stripe key. This is safe to expose in the browser.</p>
          </div>
          <div className="ac-card ac-card--sm">
            <p className="ac-overline">STRIPE_SECRET_KEY</p>
            <p className="ac-small ac-muted ac-mt-1">Secret Stripe key. Keep this private and never commit to version control.</p>
          </div>
        </div>
      </div>

      <div className="ac-mt-8" style={{ maxWidth: '56rem' }}>
        <h2 className="ac-h3">Next steps</h2>
        <div className="ac-stack" style={{ '--gap': '12px' } as any}>
          <p className="ac-body">1. Get your Stripe keys from the dashboard above</p>
          <p className="ac-body">2. Enter them in this setup page</p>
          <p className="ac-body">3. Test payments on the <a href="/pricing" className="ac-link">pricing page</a></p>
          <p className="ac-body">4. When ready to go live, switch to live keys (pk_live_* and sk_live_*)</p>
        </div>
      </div>
    </div>
  )
}
