'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

const SECTORS = [
  'Finance',
  'Law',
  'Engineering',
  'Technology',
  'Consulting',
  'Healthcare',
  'Manufacturing',
  'Media',
  'Other',
]

export default function ApprenticeSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    apprenticeshipName: '',
    sector: '',
    linkedinUrl: '',
    calcomUrl: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name || !formData.apprenticeshipName || !formData.sector || !formData.linkedinUrl || !formData.calcomUrl) {
        throw new Error('All fields are required')
      }

      if (!formData.linkedinUrl.includes('linkedin.com')) {
        throw new Error('Please enter a valid LinkedIn URL')
      }

      if (!formData.calcomUrl.includes('cal.com')) {
        throw new Error('Please enter a valid Cal.com URL')
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
      localStorage.setItem('apprenticeId', data.id)
      router.push('/apprentice/profile')
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
            <label className="ac-label" htmlFor="calcomUrl">Cal.com booking link</label>
            <input
              className="ac-input"
              id="calcomUrl"
              name="calcomUrl"
              type="url"
              value={formData.calcomUrl}
              onChange={handleChange}
              placeholder="https://cal.com/yourname"
              disabled={loading}
            />
            <p className="ac-hint ac-mt-1">Your calendar for students to book calls</p>
          </div>

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
