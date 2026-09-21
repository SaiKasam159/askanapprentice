'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface Apprentice {
  id: string
  name: string
  apprenticeship_name: string
  sector: string
  linkedin_url: string
  calcom_url: string
  verified: boolean
}

const SECTORS = [
  'Finance',
  'Law',
  'Engineering',
  'Technology',
  'Consulting',
  'Healthcare',
  'Manufacturing',
  'Media',
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
        let query = supabase
          .from('apprentices')
          .select('*')
          .eq('verified', true)

        if (selectedSector) {
          query = query.eq('sector', selectedSector)
        }

        const { data, error: fetchError } = await query

        if (fetchError) throw fetchError
        setApprentices(data || [])
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
                  <p className="ac-body ac-muted ac-mt-1">{apprentice.apprenticeship_name}</p>
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
                <div style={{ flex: 'none' }}>
                  <a
                    href={apprentice.calcom_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ac-btn ac-btn--secondary"
                  >
                    Book call
                  </a>
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
