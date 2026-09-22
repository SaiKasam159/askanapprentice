'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface ApprenticeProfile {
  id: string
  name: string
  apprenticeship_name: string
  company: string
  sector: string
  linkedin_url: string
  calendly_url_30: string
  accepts_45min_calls: boolean
  calendly_url_45: string | null
  verified: boolean
  created_at: string
}

export default function ApprenticeProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState<ApprenticeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apprenticeId = localStorage.getItem('apprenticeId')
        if (!apprenticeId) {
          router.push('/apprentice/signup')
          return
        }

        const { data, error: fetchError } = await supabase
          .from('apprentices')
          .select('*')
          .eq('id', apprenticeId)
          .single()

        if (fetchError) throw fetchError
        setProfile(data)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  if (loading) {
    return (
      <div className="ac-container ac-section">
        <div className="ac-center">
          <p className="ac-body ac-muted">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (error || !profile) {
    return (
      <div className="ac-container ac-section">
        <div className="ac-center">
          <p className="ac-body ac-muted">{error || 'Profile not found'}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="ac-container ac-section">
      <div className="ac-stack" style={{ maxWidth: '56rem', marginBottom: '48px' }}>
        <h1 className="ac-h1">Your mentor profile</h1>
        <p className="ac-lede">This is how students will see your profile</p>
      </div>

      {!profile.verified && (
        <div style={{ padding: '16px', background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', borderRadius: 'var(--ac-radius-control)', marginBottom: '24px' }}>
          <p className="ac-small" style={{ margin: 0, color: 'var(--ac-warning-text)' }}>
            <strong>Pending verification:</strong> Your profile is being reviewed and will appear in the directory once approved.
          </p>
        </div>
      )}

      <div className="ac-card" style={{ maxWidth: '56rem' }}>
        <div className="ac-stack" style={{ '--gap': '32px' } as any}>
          <div className="ac-stack" style={{ '--gap': '16px' } as any}>
            <div>
              <p className="ac-overline">Name</p>
              <p className="ac-body ac-mt-1">{profile.name}</p>
            </div>

            <div>
              <p className="ac-overline">Current role</p>
              <p className="ac-body ac-mt-1">{profile.apprenticeship_name} at {profile.company}</p>
            </div>

            <div>
              <p className="ac-overline">Sector</p>
              <p className="ac-body ac-mt-1">{profile.sector}</p>
            </div>

            <div>
              <p className="ac-overline">LinkedIn</p>
              <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="ac-link">
                {profile.linkedin_url}
              </a>
            </div>
          </div>

          <div style={{ borderTop: '1px solid var(--ac-border)' }} />

          <div className="ac-stack" style={{ '--gap': '16px' } as any}>
            <div>
              <p className="ac-overline">Call options</p>
              <div className="ac-stack ac-mt-3" style={{ '--gap': '12px' } as any}>
                <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                  <span style={{ padding: '4px 8px', background: 'var(--ac-primary)', color: 'white', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                    Available
                  </span>
                  <span className="ac-small">30-minute calls (free)</span>
                </div>
                {profile.accepts_45min_calls && (
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{ padding: '4px 8px', background: 'var(--ac-primary)', color: 'white', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>
                      Available
                    </span>
                    <span className="ac-small">45-minute calls (£10)</span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <p className="ac-overline">Booking links</p>
              <div className="ac-stack ac-mt-3" style={{ '--gap': '12px' } as any}>
                <div>
                  <p className="ac-small" style={{ margin: '0 0 4px 0', fontWeight: '500' }}>30-minute calls</p>
                  <a href={profile.calendly_url_30} target="_blank" rel="noopener noreferrer" className="ac-link">
                    {profile.calendly_url_30}
                  </a>
                </div>
                {profile.accepts_45min_calls && profile.calendly_url_45 && (
                  <div>
                    <p className="ac-small" style={{ margin: '0 0 4px 0', fontWeight: '500' }}>45-minute calls</p>
                    <a href={profile.calendly_url_45} target="_blank" rel="noopener noreferrer" className="ac-link">
                      {profile.calendly_url_45}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="ac-mt-8">
        <button
          onClick={() => {
            localStorage.removeItem('apprenticeId')
            router.push('/apprentice/signup')
          }}
          className="ac-btn ac-btn--secondary"
        >
          Log out
        </button>
      </div>
    </div>
  )
}
