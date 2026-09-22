'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'
import { apiFetch } from '@/lib/session-client'


const SECTORS = ['Finance', 'Law', 'Engineering', 'Tech', 'Consulting', 'Other']

interface StudentProfile {
  id: string
  name: string
  email: string
  sectors: string[]
  linkedin_url: string | null
}

export default function StudentSettings() {
  const router = useRouter()
  const [profile, setProfile] = useState<StudentProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    sectors: [] as string[],
    linkedin_url: '',
  })

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
        setFormData({
          name: data.name,
          sectors: data.sectors,
          linkedin_url: data.linkedin_url || '',
        })
      } catch (err) {
        console.error('Failed to load profile', err)
        router.push('/student/login')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleSectorChange = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    try {
      await apiFetch('/api/profile', { method: 'PATCH', body: JSON.stringify({
          name: formData.name,
          sectors: formData.sectors,
          linkedin_url: formData.linkedin_url || null,
        }) })
      toast.success('Profile updated!')
      router.push('/student/dashboard')
    } catch (err) {
      toast.error('Failed to update profile')
      console.error('Update error:', err)
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <div className="ac-container ac-section"><p className="ac-muted">Loading...</p></div>
  if (!profile) return null

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '36rem', margin: '0 auto' }}>
        <h1 className="ac-h1">Account settings</h1>
        <p className="ac-lede ac-mt-2">Update your profile information</p>

        <form onSubmit={handleSubmit} className="ac-card ac-mt-6">
          <div className="ac-stack" style={{ '--gap': '24px' } as any}>
            <div className="ac-field">
              <label className="ac-label" htmlFor="name">Name</label>
              <input className="ac-input" id="name" type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} disabled={saving} />
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="email">Email (cannot change)</label>
              <input className="ac-input" id="email" type="email" value={profile.email} disabled />
              <p className="ac-hint ac-mt-1">Contact support to change your email address</p>
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="linkedin">LinkedIn URL</label>
              <input className="ac-input" id="linkedin" type="url" value={formData.linkedin_url} onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))} placeholder="https://linkedin.com/in/yourprofile" disabled={saving} />
            </div>

            <div className="ac-field">
              <label className="ac-label">Sectors you're interested in</label>
              <div className="ac-stack ac-mt-3" style={{ '--gap': '8px' } as any}>
                {SECTORS.map(sector => (
                  <label key={sector} className="ac-check" style={{ cursor: 'pointer' }}>
                    <input type="checkbox" checked={formData.sectors.includes(sector)} onChange={() => handleSectorChange(sector)} disabled={saving} />
                    <span>{sector}</span>
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" disabled={saving} className="ac-btn ac-btn--block ac-btn--lg">{saving ? 'Saving...' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
