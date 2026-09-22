'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { toast } from '@/lib/toast'
import { apiFetch } from '@/lib/session-client'
import { SessionExpired } from '@/app/components/SessionExpired'


interface StudentProfile {
  id: string
  name: string
  email: string
  linkedin_url: string | null
  sectors: string[]
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

export default function StudentProfile() {
  const router = useRouter()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState<Partial<StudentProfile>>({})

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const studentId = localStorage.getItem('studentId')
        if (!studentId) {
          router.push('/student/login')
          return
        }

        const { profile: data } = await apiFetch('/api/profile')
        setProfile(data)
        setFormData(data)
      } catch (err) {
        toast.error('Failed to load profile')
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
      const studentId = localStorage.getItem('studentId')
      if (!studentId) throw new Error('Not logged in')

      await apiFetch('/api/profile', { method: 'PATCH', body: JSON.stringify({
          name: formData.name,
          sectors: formData.sectors,
          linkedin_url: formData.linkedin_url || null,
        }) })

      setProfile(formData as StudentProfile)
      setEditing(false)
      toast.success('Profile updated!')
    } catch (err) {
      toast.error(err instanceof Error ? err.message : 'Failed to save profile')
    } finally {
      setSaving(false)
    }
  }

  const toggleSector = (sector: string) => {
    const sectors = formData.sectors || []
    if (sectors.includes(sector)) {
      setFormData({
        ...formData,
        sectors: sectors.filter(s => s !== sector),
      })
    } else {
      setFormData({
        ...formData,
        sectors: [...sectors, sector],
      })
    }
  }

  if (loading) {
    return (
      <div className="ac-container ac-section">
        <p className="ac-muted ac-center">Loading profile...</p>
      </div>
    )
  }

  if (!profile) {
    return (
      <SessionExpired role="student" />
    )
  }

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '42rem', margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px' }}>
          <h1 className="ac-h1">Your Profile</h1>
          <Link href="/student/dashboard" className="ac-btn ac-btn--secondary ac-btn--sm">Back</Link>
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="ac-card">
            <div className="ac-stack" style={{ '--gap': '24px' } as any}>
              <div className="ac-field">
                <label className="ac-label" htmlFor="name">Full name</label>
                <input
                  className="ac-input"
                  id="name"
                  type="text"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  disabled={saving}
                />
              </div>

              <div className="ac-field">
                <label className="ac-label">Email address</label>
                <div className="ac-input" style={{ background: 'var(--ac-navy-700)', color: 'var(--ac-text-soft)' }}>
                  {profile.email}
                </div>
                <p className="ac-hint ac-mt-1">Email cannot be changed</p>
              </div>

              <div className="ac-field">
                <label className="ac-label" htmlFor="linkedin">LinkedIn URL</label>
                <input
                  className="ac-input"
                  id="linkedin"
                  type="url"
                  value={formData.linkedin_url || ''}
                  onChange={(e) => setFormData({ ...formData, linkedin_url: e.target.value })}
                  placeholder="https://linkedin.com/in/yourprofile"
                  disabled={saving}
                />
                <p className="ac-hint ac-mt-1">Optional. Helps mentors know who they're speaking to.</p>
              </div>

              <div className="ac-field">
                <label className="ac-label">Target sectors</label>
                <div className="ac-stack ac-mt-3" style={{ '--gap': '8px' } as any}>
                  {SECTORS.map(sector => (
                    <label key={sector} className="ac-check">
                      <input
                        type="checkbox"
                        checked={(formData.sectors || []).includes(sector)}
                        onChange={() => toggleSector(sector)}
                        disabled={saving}
                      />
                      <span>{sector}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <button type="submit" disabled={saving} className="ac-btn ac-btn--block">
                  {saving ? 'Saving...' : 'Save changes'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setEditing(false)
                    setFormData(profile)
                  }}
                  disabled={saving}
                  className="ac-btn ac-btn--secondary ac-btn--block"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        ) : (
          <div className="ac-card">
            <div className="ac-stack" style={{ '--gap': '24px' } as any}>
              <div>
                <p className="ac-overline">Full name</p>
                <p className="ac-h3" style={{ marginTop: '8px' }}>{profile.name}</p>
              </div>

              <div>
                <p className="ac-overline">Email address</p>
                <p className="ac-h3" style={{ marginTop: '8px' }}>{profile.email}</p>
              </div>

              <div>
                <p className="ac-overline">LinkedIn</p>
                {profile.linkedin_url
                  ? <a href={profile.linkedin_url} target="_blank" rel="noopener noreferrer" className="ac-link">{profile.linkedin_url}</a>
                  : <p className="ac-body ac-muted" style={{ marginTop: '8px' }}>Not added</p>}
              </div>

              <div>
                <p className="ac-overline">Target sectors</p>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '12px' }}>
                  {profile.sectors.length > 0 ? (
                    profile.sectors.map(sector => (
                      <span key={sector} className="ac-badge ac-badge--solid">{sector}</span>
                    ))
                  ) : (
                    <p className="ac-body ac-muted">No sectors selected</p>
                  )}
                </div>
              </div>

              <button
                onClick={() => setEditing(true)}
                className="ac-btn ac-btn--block"
              >
                Edit profile
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
