'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { apiFetch } from '@/lib/session-client'

interface Earning {
  id: string
  bookingId: string
  studentName: string
  callDuration: number
  amount: number
  status: 'due' | 'upcoming' | 'pending'
  createdAt: string
}

interface EarningsData {
  platformFeeRate: number
  totalEarned: number
  pendingPayout: number
  earnings: Earning[]
}

export default function MentorEarnings() {
  const router = useRouter()
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    apiFetch('/api/earnings')
      .then(setData)
      .catch(err => {
        if (/signed in/i.test(err.message)) router.push('/apprentice/login')
        else setError(err.message)
      })
      .finally(() => setLoading(false))
  }, [router])

  if (loading) {
    return (
      <div className="ac-container ac-section">
        <p className="ac-muted ac-center">Loading earnings...</p>
      </div>
    )
  }

  return (
    <div className="ac-container ac-section">
      <div className="ac-stack" style={{ maxWidth: '56rem', marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="ac-h1">Your Earnings</h1>
          <Link href="/apprentice/dashboard" className="ac-btn ac-btn--secondary ac-btn--sm">
            Back to Dashboard
          </Link>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderLeft: '4px solid var(--ac-danger)', background: 'var(--ac-navy-800)', borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0', marginBottom: '24px' }}>
          <p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>{error}</p>
        </div>
      )}

      {data && (
        <>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '48px' }}>
            <div className="ac-card ac-card--soft">
              <p className="ac-overline">Total earned</p>
              <p className="ac-h2" style={{ color: 'var(--ac-brass)', marginTop: '8px' }}>£{data.totalEarned.toFixed(2)}</p>
            </div>

            <div className="ac-card ac-card--soft">
              <p className="ac-overline">Pending payout</p>
              <p className="ac-h2" style={{ marginTop: '8px' }}>£{data.pendingPayout.toFixed(2)}</p>
              <p className="ac-small ac-muted" style={{ marginTop: '8px' }}>Includes calls not yet held</p>
            </div>

            <div className="ac-card ac-card--soft">
              <p className="ac-overline">Platform fee</p>
              <p className="ac-h2" style={{ marginTop: '8px' }}>{Math.round(data.platformFeeRate * 100)}%</p>
              <p className="ac-small ac-muted" style={{ marginTop: '8px' }}>You keep the rest of every paid call</p>
            </div>
          </div>

          <div className="ac-stack" style={{ maxWidth: '56rem' }}>
            <h2 className="ac-h2">Payment history</h2>
            {data.earnings.length > 0 ? (
              <div className="ac-stack" style={{ '--gap': '12px' } as any}>
                {data.earnings.map((earning) => (
                  <div key={earning.id} className="ac-card ac-card--soft">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <p className="ac-body" style={{ fontWeight: 500, margin: 0 }}>{earning.studentName}</p>
                        <p className="ac-small ac-muted" style={{ marginTop: '4px' }}>{earning.callDuration}-minute call</p>
                        <p className="ac-small ac-muted">{new Date(earning.createdAt).toLocaleDateString()}</p>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <p className="ac-body" style={{ fontWeight: 600, color: 'var(--ac-brass)', margin: 0 }}>£{earning.amount.toFixed(2)}</p>
                        <div style={{ marginTop: '8px' }}>
                          <span className={`ac-badge ac-badge--sm ${earning.status === 'due' ? 'ac-badge--solid' : 'ac-badge--brass'}`}>
                            {earning.status === 'due' ? 'Due to you'
                              : earning.status === 'upcoming' ? 'Call upcoming'
                              : 'Awaiting payment'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="ac-empty">
                <p className="ac-h3">No earnings yet</p>
                <p className="ac-body ac-muted">Only 45-minute calls are paid. Free intro calls do not appear here.</p>
              </div>
            )}
          </div>

          <div className="ac-note ac-mt-8">
            <p className="ac-small ac-mt-0">
              <strong>Getting paid:</strong> payouts are not automated yet. Anything marked "Due to you" is money we have collected for a call that has happened; contact us to arrange transfer.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
