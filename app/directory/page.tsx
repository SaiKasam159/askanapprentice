'use client'

import { useEffect, useState } from 'react'

interface Apprentice {
  id: string
  name: string
  apprenticeship_name: string
  company: string
  sector: string
  linkedin_url: string | null
  accepts_45min_calls: boolean
  verified: boolean
}

const SECTORS = [
  'Finance',
  'Law',
  'Engineering',
  'Tech',
  'Consulting',
  'Other',
]

export default function Directory() {
  const [apprentices, setApprentices] = useState<Apprentice[]>([])
  const [selectedSector, setSelectedSector] = useState<string>('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchApprentices = async () => {
      try {
        setLoading(true)
        const params = selectedSector ? `?sector=${encodeURIComponent(selectedSector)}` : ''
        const res = await fetch(`/api/apprentices${params}`)
        const data = await res.json()
        if (!res.ok) throw new Error(data.error ?? 'Failed to load mentors')
        setApprentices(data.mentors)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load mentors')
      } finally {
        setLoading(false)
      }
    }

    fetchApprentices()
  }, [selectedSector])

  return (
    <div className="ac-container ac-section">
      <div className="ac-stack" style={{ maxWidth: '56rem', marginBottom: '48px' }}>
        <h1 className="ac-h1">Browse mentors</h1>
        <p className="ac-lede">Talk to current apprentices in your target sector. All mentors are verified.</p>
      </div>

      <div className="ac-stack" style={{ '--gap': '24px', marginBottom: '48px' } as any}>
        <div>
          <p className="ac-overline">Filter by sector</p>
          <div className="ac-segmented ac-mt-3" role="group" aria-label="Filter mentors">
            <button
              onClick={() => setSelectedSector('')}
              aria-pressed={selectedSector === ''}
              className={selectedSector === '' ? 'is-active' : ''}
            >
              All sectors
            </button>
            {SECTORS.map(sector => (
              <button
                key={sector}
                onClick={() => setSelectedSector(sector)}
                aria-pressed={selectedSector === sector}
                className={selectedSector === sector ? 'is-active' : ''}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>
      </div>

      {error && (
        <div style={{ padding: '12px 16px', borderLeft: '4px solid var(--ac-danger)', background: 'var(--ac-navy-800)', borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0', marginBottom: '24px' }}>
          <p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>{error}</p>
        </div>
      )}

      {loading ? (
        <div className="ac-center">
          <p className="ac-body ac-muted">Loading mentors...</p>
        </div>
      ) : apprentices.length === 0 ? (
        <div className="ac-empty" style={{ maxWidth: '56rem' }}>
          <p className="ac-h3">No mentors in this sector yet</p>
          <p className="ac-body ac-muted">We're adding mentors regularly. Check back soon or browse other sectors.</p>
        </div>
      ) : (
        <div className="ac-stack" style={{ '--gap': '16px' } as any}>
          {apprentices.map((apprentice) => (
            <div
              key={apprentice.id}
              className="ac-card"
              style={{ cursor: 'default' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 className="ac-h3">{apprentice.name}</h3>
                  <p className="ac-body ac-muted ac-mt-1">{apprentice.apprenticeship_name} • {apprentice.company}</p>
                  <div style={{ marginTop: '12px', display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                    <span className="ac-badge ac-badge--solid">{apprentice.sector}</span>
                    {apprentice.linkedin_url && (
                      <a
                        href={apprentice.linkedin_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="ac-link"
                        style={{ fontSize: '0.875rem' }}
                      >
                        LinkedIn
                      </a>
                    )}
                  </div>
                </div>
                <div style={{ flex: 'none', display: 'flex', gap: '8px', flexDirection: 'column', minWidth: '140px' }}>
                  <a
                    href={`/mentor/${apprentice.id}`}
                    className="ac-btn ac-btn--secondary ac-btn--sm ac-btn--block"
                    style={{ whiteSpace: 'nowrap' }}
                  >
                    View profile
                  </a>
                  <a
                    href={`/booking?mentorId=${apprentice.id}`}
                    className="ac-btn ac-btn--primary ac-btn--block"
                    style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}
                  >
                    📅 Book 30 min
                  </a>
                  {apprentice.accepts_45min_calls && (
                    <a
                      href={`/booking?mentorId=${apprentice.id}`}
                      className="ac-btn ac-btn--secondary ac-btn--block"
                      style={{ whiteSpace: 'nowrap', fontSize: '0.875rem' }}
                    >
                      📅 Book 45 min
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="ac-mt-8" style={{ maxWidth: '56rem' }}>
        <div className="ac-note">
          <p className="ac-small ac-mt-0"><strong>How it works:</strong> Click "Book call" to schedule a 30-minute free call or 45-minute call (£10). First calls get special pricing. You'll be redirected to the mentor's calendar to pick a time that works.</p>
        </div>
      </div>
    </div>
  )
}
