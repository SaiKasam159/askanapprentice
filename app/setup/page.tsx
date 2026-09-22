'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface Status {
  publishableKeyConfigured: boolean
  secretKeyConfigured: boolean
  mode: 'live' | 'test'
}

export default function SetupPage() {
  const [status, setStatus] = useState<Status | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    fetch('/api/setup')
      .then(res => res.json())
      .then(setStatus)
      .catch(() => setError('Could not read configuration status'))
  }, [])

  const Row = ({ label, ok }: { label: string; ok: boolean }) => (
    <div className="ac-row ac-row--between" style={{ padding: '12px 0', borderBottom: '1px solid var(--ac-line)' }}>
      <span className="ac-body">{label}</span>
      <span className={`ac-badge ${ok ? 'ac-badge--solid' : 'ac-badge--brass'}`}>
        {ok ? 'Configured' : 'Not set'}
      </span>
    </div>
  )

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
        <h1 className="ac-h1">Payment configuration</h1>
        <p className="ac-lede ac-mt-2">Read-only status. Keys are set in your deployment environment.</p>

        {error && <p className="ac-small ac-mt-6" style={{ color: 'var(--ac-danger)' }}>{error}</p>}

        {status && (
          <div className="ac-card ac-mt-6">
            <Row label="STRIPE_PUBLISHABLE_KEY" ok={status.publishableKeyConfigured} />
            <Row label="STRIPE_SECRET_KEY" ok={status.secretKeyConfigured} />
            <div className="ac-row ac-row--between" style={{ paddingTop: '12px' }}>
              <span className="ac-body">Mode</span>
              <span className="ac-badge ac-badge--brass">{status.mode}</span>
            </div>
          </div>
        )}

        <div className="ac-note ac-mt-6">
          <p className="ac-small ac-mt-0">
            Set both keys as environment variables — locally in <code>.env.local</code>, and in
            Vercel under Settings → Environment Variables. Redeploy after changing them.
            Never paste a secret key into a web form.
          </p>
        </div>

        <Link href="/" className="ac-btn ac-btn--secondary ac-mt-6">Back to home</Link>
      </div>
    </div>
  )
}
