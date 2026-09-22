'use client'

import { useEffect, useState } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'

interface Mentor {
  id: string
  name: string
  apprenticeship_name: string
  company: string
  sector: string
  linkedin_url: string
  verified: boolean
  accepts_45min_calls: boolean
  average_rating?: number
  total_ratings?: number
}

const LinkedInMark = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" style={{ flex: 'none' }}>
    <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.03-3.04-1.85-3.04-1.86 0-2.14 1.45-2.14 2.94v5.67H9.35V9h3.41v1.56h.05a3.74 3.74 0 0 1 3.37-1.85c3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.07 2.07 0 1 1 0-4.13 2.07 2.07 0 0 1 0 4.13zM7.12 20.45H3.56V9h3.56v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
  </svg>
)

export default function MentorProfile() {
  const params = useParams()
  const mentorId = params?.id as string

  const [mentor, setMentor] = useState<Mentor | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchMentor = async () => {
      try {
        if (!mentorId) {
          setError('Mentor ID not found')
          setLoading(false)
          return
        }

        const res = await fetch(`/api/apprentices?id=${mentorId}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to load mentor profile')
        setMentor(data.mentor)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mentor profile')
      } finally {
        setLoading(false)
      }
    }

    fetchMentor()
  }, [mentorId])

  if (loading) {
    return (
      <div className="ac-container ac-section">
        <p className="ac-muted ac-center">Loading mentor profile...</p>
      </div>
    )
  }

  if (error || !mentor) {
    return (
      <div className="ac-container ac-section">
        <div className="ac-center">
          <p className="ac-muted">{error || 'Mentor not found'}</p>
          <Link href="/directory" className="ac-btn ac-mt-4">Back to directory</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="ac-container ac-section">
      <Link href="/directory" className="ac-link" style={{ marginBottom: '16px', display: 'inline-block' }}>← Back to mentors</Link>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: '32px', alignItems: 'start', maxWidth: '56rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            <h1 className="ac-h1" style={{ margin: 0 }}>{mentor.name}</h1>
            <span className="ac-badge ac-badge--solid">{mentor.sector}</span>
            {mentor.verified && <span className="ac-verified">✓ Verified</span>}
          </div>
          <p className="ac-lede ac-mt-2">{mentor.apprenticeship_name} at {mentor.company}</p>

          {mentor.linkedin_url && (
            <a
              href={mentor.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="ac-btn ac-btn--secondary ac-mt-4"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', color: '#0A66C2' }}
            >
              <LinkedInMark />
              View {mentor.name.split(' ')[0]}'s LinkedIn
            </a>
          )}

          {mentor.average_rating && (
            <div style={{ marginTop: '24px' }}>
              <p className="ac-overline">Student rating</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                <div style={{ display: 'flex', gap: '2px' }}>
                  {[...Array(5)].map((_, i) => (
                    <span key={i} style={{ color: i < Math.round(mentor.average_rating!) ? 'var(--ac-brass)' : 'var(--ac-navy-700)' }}>★</span>
                  ))}
                </div>
                <p className="ac-small ac-muted" style={{ margin: 0 }}>
                  {mentor.average_rating.toFixed(1)}/5 ({mentor.total_ratings} reviews)
                </p>
              </div>
            </div>
          )}

          <div style={{ marginTop: '32px' }}>
            <h2 className="ac-h3">About this mentor</h2>
            <p className="ac-body ac-muted ac-mt-3">
              {mentor.name} is a verified mentor currently working as {mentor.apprenticeship_name} at {mentor.company}.
              They specialize in {mentor.sector.toLowerCase()} and are available for mentoring calls.
            </p>
          </div>
        </div>

        <div style={{ position: 'sticky', top: '24px' }}>
          <div className="ac-card">
            <h3 className="ac-h3" style={{ marginTop: 0 }}>Book a call</h3>
            <div className="ac-stack ac-mt-4" style={{ '--gap': '12px' } as any}>
              <div className="ac-card ac-card--soft">
                <p className="ac-overline">30-minute intro</p>
                <p className="ac-h2" style={{ marginTop: '8px', marginBottom: 0 }}>Free</p>
              </div>

              <a href={`/booking?mentorId=${mentor.id}`} className="ac-btn ac-btn--block">
                Schedule 30 min
              </a>

              {mentor.accepts_45min_calls && (
                <>
                  <div className="ac-card ac-card--soft">
                    <p className="ac-overline">45-minute call</p>
                    <p className="ac-h2" style={{ marginTop: '8px', marginBottom: 0 }}>£10</p>
                  </div>

                  <a href={`/booking?mentorId=${mentor.id}`} className="ac-btn ac-btn--secondary ac-btn--block">
                    Schedule 45 min
                  </a>
                </>
              )}

              <p className="ac-small ac-muted ac-center" style={{ marginTop: '12px' }}>
                Secure booking with confirmation email
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
