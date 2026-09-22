'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Earning {
  id: string
  bookingId: string
  studentName: string
  callDuration: number
  amount: number
  status: 'paid' | 'pending' | 'processing'
  createdAt: string
  paidAt?: string
}

interface EarningsData {
  totalEarned: number
  pendingPayout: number
  lastPayout?: string
  earnings: Earning[]
}

export default function MentorEarnings() {
  const router = useRouter()
  const [data, setData] = useState<EarningsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const mentorId = localStorage.getItem('mentorId')
        if (!mentorId) {
          router.push('/apprentice/login')
          return
        }

        // Mock data for now - replace with real API call
        setData({
          totalEarned: 125.50,
          pendingPayout: 45.00,
          lastPayout: '2026-09-15',
          earnings: [
            {
              id: '1',
              bookingId: 'b1',
              studentName: 'Alice Johnson',
              callDuration: 45,
              amount: 10.00,
              status: 'paid',
              createdAt: '2026-09-10',
              paidAt: '2026-09-15',
            },
            {
              id: '2',
              bookingId: 'b2',
              studentName: 'Bob Smith',
              callDuration: 45,
              amount: 10.00,
              status: 'pending',
              createdAt: '2026-09-18',
            },
          ],
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load earnings')
      } finally {
        setLoading(false)
      }
    }

    fetchEarnings()
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
              <p className="ac-small ac-muted" style={{ marginTop: '8px' }}>Paid monthly on the 15th</p>
            </div>

            {data.lastPayout && (
              <div className="ac-card ac-card--soft">
                <p className="ac-overline">Last payout</p>
                <p className="ac-h2" style={{ marginTop: '8px' }}>{new Date(data.lastPayout).toLocaleDateString()}</p>
              </div>
            )}
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
                          <span className={`ac-badge ac-badge--sm ${earning.status === 'paid' ? 'ac-badge--solid' : 'ac-badge--brass'}`}>
                            {earning.status === 'paid' ? 'Paid' : earning.status === 'processing' ? 'Processing' : 'Pending'}
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
                <p className="ac-body ac-muted">Complete calls to start earning. Payments are processed monthly.</p>
              </div>
            )}
          </div>

          <div className="ac-note ac-mt-8">
            <p className="ac-small ac-mt-0">
              <strong>Payment method:</strong> Earnings are paid to your connected bank account on the 15th of each month. Make sure your payment details are up to date in your settings.
            </p>
          </div>
        </>
      )}
    </div>
  )
}
