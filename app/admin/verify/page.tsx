'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''
)

interface UnverifiedApprentice {
  id: string
  name: string
  apprenticeship_name: string
  company: string
  sector: string
  linkedin_url: string
  calendly_url_30: string
  accepts_45min_calls: boolean
  calendly_url_45: string | null
  created_at: string
}

export default function AdminVerify() {
  const [password, setPassword] = useState('')
  const [authenticated, setAuthenticated] = useState(false)
  const [apprentices, setApprentices] = useState<UnverifiedApprentice[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [verifyingId, setVerifyingId] = useState<string | null>(null)

  const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || 'admin'

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (password === ADMIN_PASSWORD) {
      setAuthenticated(true)
      setError('')
      fetchApprentices()
    } else {
      setError('Invalid password')
    }
  }

  const fetchApprentices = async () => {
    try {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('apprentices')
        .select('*')
        .eq('verified', false)
        .order('created_at', { ascending: false })

      if (fetchError) throw fetchError
      setApprentices(data || [])
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load mentors')
    } finally {
      setLoading(false)
    }
  }

  const verifyApprentice = async (id: string) => {
    try {
      setVerifyingId(id)
      const { error: updateError } = await supabase
        .from('apprentices')
        .update({ verified: true })
        .eq('id', id)

      if (updateError) throw updateError

      setApprentices(prev => prev.filter(a => a.id !== id))
      setError('')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to verify mentor')
    } finally {
      setVerifyingId(null)
    }
  }

  if (!authenticated) {
    return (
      <div className="ac-container ac-section">
        <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
          <h1 className="ac-h1" style={{ marginBottom: '24px' }}>Admin Verification</h1>
          <form onSubmit={handleLogin} className="ac-card">
            <div className="ac-stack" style={{ '--gap': '24px' } as any}>
              <div className="ac-field">
                <label className="ac-label" htmlFor="password">Admin Password</label>
                <input
                  className="ac-input"
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter admin password"
                />
              </div>

              {error && (
                <div style={{ padding: '12px 16px', borderLeft: '4px solid var(--ac-danger)', background: 'var(--ac-navy-800)', borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0' }}>
                  <p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>{error}</p>
                </div>
              )}

              <button type="submit" className="ac-btn ac-btn--block ac-btn--lg">
                Log In
              </button>
            </div>
          </form>
        </div>
      </div>
    )
  }

  return (
    <div className="ac-container ac-section">
      <div className="ac-stack" style={{ maxWidth: '56rem', marginBottom: '48px' }}>
        <h1 className="ac-h1">Verify Mentors</h1>
        <p className="ac-lede">Review and approve pending mentor applications</p>
      </div>

      {loading ? (
        <div className="ac-center">
          <p className="ac-body ac-muted">Loading mentors...</p>
        </div>
      ) : apprentices.length === 0 ? (
        <div className="ac-empty" style={{ maxWidth: '56rem' }}>
          <p className="ac-h3">No pending mentors</p>
          <p className="ac-body ac-muted">All mentors have been verified!</p>
        </div>
      ) : (
        <div className="ac-stack" style={{ '--gap': '16px' } as any}>
          {apprentices.map((apprentice) => (
            <div key={apprentice.id} className="ac-card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{ flex: 1 }}>
                  <h3 className="ac-h3">{apprentice.name}</h3>
                  <p className="ac-body ac-muted ac-mt-1">{apprentice.apprenticeship_name} • {apprentice.company}</p>

                  <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                    <div>
                      <p className="ac-overline">Sector</p>
                      <p className="ac-small ac-mt-1">{apprentice.sector}</p>
                    </div>
                    <div>
                      <p className="ac-overline">Applied</p>
                      <p className="ac-small ac-mt-1">{new Date(apprentice.created_at).toLocaleDateString()}</p>
                    </div>
                    <div>
                      <p className="ac-overline">LinkedIn</p>
                      <a href={apprentice.linkedin_url} target="_blank" rel="noopener noreferrer" className="ac-link ac-small">
                        View profile
                      </a>
                    </div>
                    <div>
                      <p className="ac-overline">Call Options</p>
                      <p className="ac-small ac-mt-1">
                        30m {apprentice.accepts_45min_calls && '+ 45m'}
                      </p>
                    </div>
                  </div>

                  <div style={{ marginTop: '16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <div>
                      <p className="ac-overline ac-text-xs">30-min cal.com</p>
                      <a href={apprentice.calendly_url_30} target="_blank" rel="noopener noreferrer" className="ac-link ac-small">
                        {apprentice.calendly_url_30.split('/').pop()}
                      </a>
                    </div>
                    {apprentice.accepts_45min_calls && apprentice.calendly_url_45 && (
                      <div>
                        <p className="ac-overline ac-text-xs">45-min cal.com</p>
                        <a href={apprentice.calendly_url_45} target="_blank" rel="noopener noreferrer" className="ac-link ac-small">
                          {apprentice.calendly_url_45.split('/').pop()}
                        </a>
                      </div>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => verifyApprentice(apprentice.id)}
                  disabled={verifyingId === apprentice.id}
                  className="ac-btn ac-btn--primary"
                  style={{ flex: 'none', whiteSpace: 'nowrap' }}
                >
                  {verifyingId === apprentice.id ? 'Verifying...' : 'Verify'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {error && (
        <div style={{ padding: '12px 16px', borderLeft: '4px solid var(--ac-danger)', background: 'var(--ac-navy-800)', borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0', marginTop: '24px' }}>
          <p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>{error}</p>
        </div>
      )}

      <button
        onClick={() => {
          setAuthenticated(false)
          setPassword('')
        }}
        className="ac-btn ac-btn--secondary ac-mt-8"
      >
        Log Out
      </button>
    </div>
  )
}
