'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from '@/lib/toast'
import { apiFetch } from '@/lib/session-client'


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

const SECTORS = [
  'Finance',
  'Law',
  'Engineering',
  'Tech',
  'Consulting',
  'Healthcare',
  'Marketing',
  'Other',
]

export default function ApprenticeProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState<ApprenticeProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<ApprenticeProfile>>({})

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apprenticeId = localStorage.getItem('apprenticeId')
        if (!apprenticeId) {
          router.push('/apprentice/signup')
          return
        }

        const { profile: data } = await apiFetch('/api/profile')
        setProfile(data)
        setFormData(data)
        setError('')
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load profile')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const apprenticeId = localStorage.getItem('apprenticeId')
      if (!apprenticeId) throw new Error('Not logged in')

      await apiFetch('/api/profile', { method: 'PATCH', body: JSON.stringify({
          name: formData.name,
          apprenticeship_name: formData.apprenticeship_name,
          company: formData.company,
          sector: formData.sector,
          linkedin_url: formData.linkedin_url,
          calendly_url_30: formData.calendly_url_30,
          calendly_url_45: formData.calendly_url_45,
          accepts_45min_calls: formData.accepts_45min_calls,
        }) })

      setProfile(formData as ApprenticeProfile)
      setEditing(false)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

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
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div>
            <h1 className="ac-h1">Your mentor profile</h1>
            <p className="ac-lede">This is how students will see your profile</p>
          </div>
          <Link href="/apprentice/dashboard" className="ac-btn ac-btn--secondary ac-btn--sm">Back</Link>
        </div>
      </div>

      {!profile.verified && (
        <div style={{ padding: '16px', background: 'rgba(255, 193, 7, 0.1)', border: '1px solid rgba(255, 193, 7, 0.3)', borderRadius: 'var(--ac-radius-control)', marginBottom: '24px' }}>
          <p className="ac-small" style={{ margin: 0, color: 'var(--ac-warning-text)' }}>
            <strong>Pending verification:</strong> Your profile is being reviewed and will appear in the directory once approved.
          </p>
        </div>
      )}

      {editing ? (
        <form onSubmit={handleSave} className="ac-card" style={{ maxWidth: '56rem' }}>
          <div className="ac-stack" style={{ '--gap': '24px' } as any}>
            <div className="ac-field">
              <label className="ac-label" htmlFor="name">Full name</label>
              <input className="ac-input" id="name" type="text" value={formData.name || ''} onChange={(e) => setFormData({ ...formData, name: e.target.value })} disabled={saving} />
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="apprenticeship">Apprenticeship name</label>
              <input className="ac-input" id="apprenticeship" type="text" value={formData.apprenticeship_name || ''} onChange={(e) => setFormData({ ...formData, apprenticeship_name: e.target.value })} disabled={saving} />
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="company">Company</label>
              <input className="ac-input" id="company" type="text" value={formData.company || ''} onChange={(e) => setFormData({ ...formData, company: e.target.value })} disabled={saving} />
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="sector">Sector</label>
              <select className="ac-input" id="sector" value={formData.sector || ''} onChange={(e) => setFormData({ ...formData, sector: e.target.value })} disabled={saving}>
                <option value="">Select a sector</option>
                {SECTORS.map(s => (<option key={s} value={s}>{s}</option>))}
              </select>
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="linkedin">LinkedIn URL</label>
              <input className="ac-input" id="linkedin" type="url" value={formData.linkedin_url || ''} onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })} placeholder="https://linkedin.com/in/yourprofile" disabled={saving} />
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="cal30">Cal.com link (30 min)</label>
              <input className="ac-input" id="cal30" type="url" value={formData.calendly_url_30 || ''} onChange={(e) => setFormData({ ...formData, calendly_url_30: e.target.value })} disabled={saving} />
            </div>

            <div className="ac-field">
              <label className="ac-check">
                <input type="checkbox" checked={formData.accepts_45min_calls || false} onChange={(e) => setFormData({ ...formData, accepts_45min_calls: e.target.checked })} disabled={saving} />
                <span>Offer 45-minute paid calls</span>
              </label>
            </div>

            {formData.accepts_45min_calls && (
              <div className="ac-field">
                <label className="ac-label" htmlFor="cal45">Cal.com link (45 min)</label>
                <input className="ac-input" id="cal45" type="url" value={formData.calendly_url_45 || ''} onChange={(e) => setFormData({ ...formData, calendly_url_45: e.target.value })} disabled={saving} />
              </div>
            )}

            <div style={{ display: 'flex', gap: '12px' }}>
              <button type="submit" disabled={saving} className="ac-btn ac-btn--block">{saving ? 'Saving...' : 'Save changes'}</button>
              <button type="button" onClick={() => { setEditing(false); setFormData(profile || {}); }} disabled={saving} className="ac-btn ac-btn--secondary ac-btn--block">Cancel</button>
            </div>
          </div>
        </form>
      ) : (
        <div className="ac-card" style={{ maxWidth: '56rem' }}>
          <div className="ac-stack" style={{ '--gap': '32px' } as any}>
            <div className="ac-stack" style={{ '--gap': '16px' } as any}>
              <div><p className="ac-overline">Name</p><p className="ac-body ac-mt-1">{profile.name}</p></div>
              <div><p className="ac-overline">Current role</p><p className="ac-body ac-mt-1">{profile.apprenticeship_name} at {profile.company}</p></div>
              <div><p className="ac-overline">Sector</p><p className="ac-body ac-mt-1">{profile.sector}</p></div>
              <div><p className="ac-overline">LinkedIn</p><a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="ac-link">{profile.linkedin_url}</a></div>
            </div>

            <div style={{ borderTop: '1px solid var(--ac-border)' }} />

            <div className="ac-stack" style={{ '--gap': '16px' } as any}>
              <div>
                <p className="ac-overline">Call options</p>
                <div className="ac-stack ac-mt-3" style={{ '--gap': '12px' } as any}>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ padding: '4px 8px', background: 'var(--ac-primary)', color: 'white', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>Available</span><span className="ac-small">30-minute calls (free)</span></div>
                  {profile.accepts_45min_calls && (<div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span style={{ padding: '4px 8px', background: 'var(--ac-primary)', color: 'white', borderRadius: '4px', fontSize: '0.75rem', fontWeight: '600' }}>Available</span><span className="ac-small">45-minute calls (£10)</span></div>)}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button onClick={() => setEditing(true)} className="ac-btn ac-btn--block">Edit profile</button>
              <button onClick={() => { localStorage.clear(); router.push('/'); }} className="ac-btn ac-btn--secondary ac-btn--block">Log out</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
