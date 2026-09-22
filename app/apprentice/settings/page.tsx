'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { toast } from '@/lib/toast'
import { apiFetch } from '@/lib/session-client'


const SECTORS = ['Finance', 'Law', 'Engineering', 'Tech', 'Consulting', 'Other']

interface MentorProfile {
  id: string
  name: string
  email: string
  company: string
  sector: string
  linkedin_url: string | null
  calendly_url_30: string
  accepts_45min_calls: boolean
  calendly_url_45: string | null
}

export default function MentorSettings() {
  const router = useRouter()
  const [profile, setProfile] = useState<MentorProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    company: '',
    sector: '',
    linkedin_url: '',
    calendly_url_30: '',
    accepts_45min_calls: false,
    calendly_url_45: '',
  })

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const apprenticeId = localStorage.getItem('apprenticeId')
        if (!apprenticeId) {
          router.push('/apprentice/login')
          return
        }

        const { profile: data } = await apiFetch('/api/profile')
        setProfile(data)
        setFormData({
          name: data.name,
          company: data.company,
          sector: data.sector,
          linkedin_url: data.linkedin_url || '',
          calendly_url_30: data.calendly_url_30,
          accepts_45min_calls: data.accepts_45min_calls,
          calendly_url_45: data.calendly_url_45 || '',
        })
      } catch (err) {
        console.error('Failed to load profile', err)
        router.push('/apprentice/login')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!profile) return

    setSaving(true)
    try {
      await apiFetch('/api/profile', { method: 'PATCH', body: JSON.stringify({
          name: formData.name,
          company: formData.company,
          sector: formData.sector,
          linkedin_url: formData.linkedin_url || null,
          calendly_url_30: formData.calendly_url_30,
          accepts_45min_calls: formData.accepts_45min_calls,
          calendly_url_45: formData.accepts_45min_calls ? formData.calendly_url_45 : null,
        }) })
      toast.success('Profile updated!')
      router.push('/apprentice/profile')
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
        <h1 className="ac-h1">Mentor settings</h1>
        <p className="ac-lede ac-mt-2">Update your mentor profile</p>

        <form onSubmit={handleSubmit} className="ac-card ac-mt-6">
          <div className="ac-stack" style={{ '--gap': '24px' } as any}>
            <div className="ac-field">
              <label className="ac-label" htmlFor="name">Name</label>
              <input className="ac-input" id="name" type="text" value={formData.name} onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))} disabled={saving} />
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="company">Company</label>
              <input className="ac-input" id="company" type="text" value={formData.company} onChange={(e) => setFormData(prev => ({ ...prev, company: e.target.value }))} disabled={saving} />
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="sector">Sector</label>
              <select className="ac-select" id="sector" value={formData.sector} onChange={(e) => setFormData(prev => ({ ...prev, sector: e.target.value }))} disabled={saving}>
                <option value="">Select a sector</option>
                {SECTORS.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="linkedin">LinkedIn URL</label>
              <input className="ac-input" id="linkedin" type="url" value={formData.linkedin_url} onChange={(e) => setFormData(prev => ({ ...prev, linkedin_url: e.target.value }))} disabled={saving} />
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="cal30">Cal.com link for 30-minute calls</label>
              <input className="ac-input" id="cal30" type="url" value={formData.calendly_url_30} onChange={(e) => setFormData(prev => ({ ...prev, calendly_url_30: e.target.value }))} disabled={saving} />
            </div>

            <label style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'flex-start' }}>
              <input type="checkbox" checked={formData.accepts_45min_calls} onChange={(e) => setFormData(prev => ({ ...prev, accepts_45min_calls: e.target.checked, calendly_url_45: e.target.checked ? prev.calendly_url_45 : '' }))} disabled={saving} style={{ marginTop: '4px' }} />
              <span className="ac-small">I also want to offer 45-minute calls (£10 per call)</span>
            </label>

            {formData.accepts_45min_calls && (
              <div className="ac-field">
                <label className="ac-label" htmlFor="cal45">Cal.com link for 45-minute calls</label>
                <input className="ac-input" id="cal45" type="url" value={formData.calendly_url_45} onChange={(e) => setFormData(prev => ({ ...prev, calendly_url_45: e.target.value }))} disabled={saving} />
              </div>
            )}

            <button type="submit" disabled={saving} className="ac-btn ac-btn--block ac-btn--lg">{saving ? 'Saving...' : 'Save changes'}</button>
          </div>
        </form>
      </div>
    </div>
  )
}
