'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { saveSession } from '@/lib/session-client'

const SECTORS = [
  'Finance',
  'Law',
  'Engineering',
  'Tech',
  'Consulting',
  'Other',
]

export default function ApprenticeSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    apprenticeshipName: '',
    company: '',
    sector: '',
    linkedinUrl: '',
    calendlyUrl30: '',
    accepts45MinCalls: false,
    calendlyUrl45: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name || !formData.email || !formData.password || !formData.apprenticeshipName || !formData.company || !formData.sector || !formData.calendlyUrl30) {
        throw new Error('All required fields must be filled')
      }

      if (!formData.email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      if (formData.password.length < 8) {
        throw new Error('Password must be at least 8 characters')
      }

      if (formData.linkedinUrl && !formData.linkedinUrl.includes('linkedin.com')) {
        throw new Error('Please enter a valid LinkedIn URL')
      }

      if (!formData.calendlyUrl30.includes('cal.com')) {
        throw new Error('Please enter a valid cal.com URL for 30-minute calls')
      }

      if (formData.accepts45MinCalls && !formData.calendlyUrl45) {
        throw new Error('Please enter a cal.com URL for 45-minute calls')
      }

      if (formData.accepts45MinCalls && !formData.calendlyUrl45.includes('cal.com')) {
        throw new Error('Please enter a valid cal.com URL for 45-minute calls')
      }

      const response = await fetch('/api/apprentice/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Signup failed')
      }

      const data = await response.json()
      saveSession(data.token, data.id, 'apprentice')
      router.push('/apprentice/signup-success')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ac-container ac-section">
      <div className="ac-stack" style={{ maxWidth: '56rem', marginBottom: '48px' }}>
        <h1 className="ac-h1">Become a mentor</h1>
        <p className="ac-lede">Share your apprenticeship experience with people considering the same path.</p>
      </div>

      <form onSubmit={handleSubmit} className="ac-card" style={{ maxWidth: '28rem' }}>
        <div className="ac-stack" style={{ '--gap': '24px' } as any}>
          <div className="ac-field">
            <label className="ac-label" htmlFor="name">Your name</label>
            <input
              className="ac-input"
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g., Priya Raman"
              disabled={loading}
            />
          </div>

          <div className="ac-field">
            <label className="ac-label" htmlFor="email">Email address</label>
            <input
              className="ac-input"
              id="email"
              name="email"
              type="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="your@email.com"
              disabled={loading}
            />
          </div>

          <div className="ac-field">
            <label className="ac-label" htmlFor="password">Password</label>
            <input
              className="ac-input"
              id="password"
              name="password"
              type="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="••••••••"
              disabled={loading}
            />
            <p className="ac-hint ac-mt-1">At least 8 characters</p>
          </div>

          <div className="ac-field">
            <label className="ac-label" htmlFor="apprenticeshipName">Apprenticeship name</label>
            <input
              className="ac-input"
              id="apprenticeshipName"
              name="apprenticeshipName"
              type="text"
              value={formData.apprenticeshipName}
              onChange={handleChange}
              placeholder="e.g., Investment Banking Apprenticeship"
              disabled={loading}
            />
          </div>

          <div className="ac-field">
            <label className="ac-label" htmlFor="company">Company</label>
            <input
              className="ac-input"
              id="company"
              name="company"
              type="text"
              value={formData.company}
              onChange={handleChange}
              placeholder="e.g., J.P. Morgan"
              disabled={loading}
            />
          </div>

          <div className="ac-field">
            <label className="ac-label" htmlFor="sector">Sector</label>
            <select
              className="ac-input"
              id="sector"
              name="sector"
              value={formData.sector}
              onChange={handleChange}
              disabled={loading}
            >
              <option value="">Select a sector</option>
              {SECTORS.map(s => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div className="ac-field">
            <label className="ac-label" htmlFor="linkedinUrl">LinkedIn URL</label>
            <input
              className="ac-input"
              id="linkedinUrl"
              name="linkedinUrl"
              type="url"
              value={formData.linkedinUrl}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/yourprofile"
              disabled={loading}
            />
            <p className="ac-hint ac-mt-1">Helps students learn more about you</p>
          </div>

          <div className="ac-field">
            <label className="ac-label" htmlFor="calendlyUrl30">Cal.com link for 30-minute calls</label>
            <input
              className="ac-input"
              id="calendlyUrl30"
              name="calendlyUrl30"
              type="url"
              value={formData.calendlyUrl30}
              onChange={handleChange}
              placeholder="https://cal.com/yourname/30min"
              disabled={loading}
            />
            <p className="ac-hint ac-mt-1">Students will book 30-minute calls here</p>
          </div>

          <div className="ac-field">
            <label style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={formData.accepts45MinCalls}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  accepts45MinCalls: e.target.checked,
                  calendlyUrl45: e.target.checked ? prev.calendlyUrl45 : ''
                }))}
                disabled={loading}
                style={{ marginTop: '4px' }}
              />
              <span className="ac-small">I also want to offer 45-minute calls (£10 per call)</span>
            </label>
          </div>

          {formData.accepts45MinCalls && (
            <div className="ac-field">
              <label className="ac-label" htmlFor="calendlyUrl45">Cal.com link for 45-minute calls</label>
              <input
                className="ac-input"
                id="calendlyUrl45"
                name="calendlyUrl45"
                type="url"
                value={formData.calendlyUrl45}
                onChange={handleChange}
                placeholder="https://cal.com/yourname/45min"
                disabled={loading}
              />
              <p className="ac-hint ac-mt-1">Students will book 45-minute calls here</p>
            </div>
          )}

          {error && (
            <div style={{ padding: '12px 16px', borderLeft: '4px solid var(--ac-danger)', background: 'var(--ac-navy-800)', borderRadius: '0 var(--ac-radius-control) var(--ac-radius-control) 0' }}>
              <p className="ac-small" style={{ color: 'var(--ac-danger)', margin: 0 }}>{error}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className="ac-btn ac-btn--block ac-btn--lg"
          >
            {loading ? 'Creating account...' : 'Create account'}
          </button>

          <p className="ac-small ac-muted ac-center">
            Already have an account? <Link href="/apprentice/login" className="ac-link">Log in</Link>
          </p>
        </div>
      </form>

      <div className="ac-mt-8 ac-center" style={{ maxWidth: '56rem' }}>
        <p className="ac-small ac-muted">
          Looking to book a call? <Link href="/signup" className="ac-link">Sign up as a student</Link>
        </p>
      </div>
    </div>
  )
}
