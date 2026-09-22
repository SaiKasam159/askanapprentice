'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

interface Rating {
  id: string
  studentName: string
  rating: number
  feedback: string
  createdAt: string
}

interface Analytics {
  totalBookings: number
  completedCalls: number
  upcomingCalls: number
  averageRating: number
  totalRatings: number
  ratings: Rating[]
}

export default function MentorAnalytics() {
  const router = useRouter()
  const [analytics, setAnalytics] = useState<Analytics | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        setLoading(true)
        const mentorId = localStorage.getItem('mentorId')
        if (!mentorId) {
          router.push('/apprentice/login')
          return
        }

        const response = await fetch(`/api/ratings?mentorId=${mentorId}`)
        if (!response.ok) throw new Error('Failed to fetch analytics')

        const data = await response.json()
        setAnalytics(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load analytics')
      } finally {
        setLoading(false)
      }
    }

    fetchAnalytics()
  }, [router])

  if (loading) {
    return (
      <div className="ac-container ac-section">
        <p className="ac-muted ac-center">Loading analytics...</p>
      </div>
    )
  }

  return (
    <div className="ac-container ac-section">
      <div className="ac-stack" style={{ maxWidth: '56rem', marginBottom: '48px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="ac-h1">Your Analytics</h1>
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

      <div className="ac-stack" style={{ '--gap': '16px', marginBottom: '48px' } as any}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
          <div className="ac-card ac-card--soft">
            <div style={{ textAlign: 'center' }}>
              <p className="ac-overline">Total bookings</p>
              <p className="ac-h2" style={{ color: 'var(--ac-brass)', marginTop: '8px' }}>{analytics?.totalBookings || 0}</p>
            </div>
          </div>

          <div className="ac-card ac-card--soft">
            <div style={{ textAlign: 'center' }}>
              <p className="ac-overline">Completed calls</p>
              <p className="ac-h2" style={{ color: 'var(--ac-teal)', marginTop: '8px' }}>{analytics?.completedCalls || 0}</p>
            </div>
          </div>

          <div className="ac-card ac-card--soft">
            <div style={{ textAlign: 'center' }}>
              <p className="ac-overline">Upcoming calls</p>
              <p className="ac-h2" style={{ marginTop: '8px' }}>{analytics?.upcomingCalls || 0}</p>
            </div>
          </div>

          <div className="ac-card ac-card--soft">
            <div style={{ textAlign: 'center' }}>
              <p className="ac-overline">Average rating</p>
              <div style={{ marginTop: '8px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}>
                <span className="ac-h2" style={{ margin: 0 }}>{analytics?.averageRating ? analytics.averageRating.toFixed(1) : '—'}</span>
                <span style={{ color: 'var(--ac-text-soft)' }}>/ 5</span>
              </div>
              <p className="ac-small ac-muted" style={{ marginTop: '4px' }}>{analytics?.totalRatings || 0} ratings</p>
            </div>
          </div>
        </div>
      </div>

      {analytics && analytics.ratings.length > 0 ? (
        <div className="ac-stack" style={{ maxWidth: '56rem' }}>
          <h2 className="ac-h2">Recent feedback</h2>
          <div className="ac-stack" style={{ '--gap': '12px' } as any}>
            {analytics.ratings.map((rating) => (
              <div key={rating.id} className="ac-card ac-card--soft">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <p className="ac-body" style={{ margin: 0, fontWeight: 500 }}>{rating.studentName}</p>
                      <div style={{ display: 'flex', gap: '2px' }}>
                        {[...Array(5)].map((_, i) => (
                          <span key={i} style={{ color: i < rating.rating ? 'var(--ac-brass)' : 'var(--ac-navy-700)' }}>★</span>
                        ))}
                      </div>
                    </div>
                    {rating.feedback && <p className="ac-body ac-muted">{rating.feedback}</p>}
                    <p className="ac-small ac-muted" style={{ marginTop: '8px' }}>{new Date(rating.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="ac-empty" style={{ maxWidth: '56rem' }}>
          <p className="ac-h3">No feedback yet</p>
          <p className="ac-body ac-muted">Once students complete calls with you, their feedback will appear here.</p>
        </div>
      )}
    </div>
  )
}
