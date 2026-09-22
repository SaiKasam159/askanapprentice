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
          <h1 className="ac-h1">{mentor.name}</h1>
          <p className="ac-lede ac-mt-2">{mentor.apprenticeship_name} at {mentor.company}</p>

          <div style={{ marginTop: '24px', display: 'flex', gap: '12px', alignItems: 'center' }}>
            <span className="ac-badge ac-badge--solid">{mentor.sector}</span>
            {mentor.verified && <span className="ac-verified">✓ Verified</span>}
          </div>

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

            {mentor.linkedin_url && (
              <div style={{ marginTop: '16px' }}>
                <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer" className="ac-link">
                  View LinkedIn profile
                </a>
              </div>
            )}
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
