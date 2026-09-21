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

export default function StudentSignup() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [isUnder16, setIsUnder16] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    linkedinUrl: '',
    sectors: [] as string[],
    ageVerified: false,
    guardianEmail: '',
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const handleSectorChange = (sector: string) => {
    setFormData(prev => ({
      ...prev,
      sectors: prev.sectors.includes(sector)
        ? prev.sectors.filter(s => s !== sector)
        : [...prev.sectors, sector]
    }))
  }

  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const isOver16 = e.target.checked
    setIsUnder16(!isOver16)
    setFormData(prev => ({
      ...prev,
      ageVerified: isOver16,
      guardianEmail: isOver16 ? '' : prev.guardianEmail
    }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!formData.name || !formData.email || formData.sectors.length === 0) {
        throw new Error('Please fill in all required fields')
      }

      if (!formData.email.includes('@')) {
        throw new Error('Please enter a valid email address')
      }

      if (formData.linkedinUrl && !formData.linkedinUrl.includes('linkedin.com')) {
        throw new Error('Please enter a valid LinkedIn URL')
      }

      if (!formData.ageVerified) {
        throw new Error('You must be 16 or older to sign up')
      }

      if (isUnder16 && !formData.guardianEmail) {
        throw new Error('Guardian email is required for users under 16')
      }

      const response = await fetch('/api/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Signup failed')
      }

      const data = await response.json()
      localStorage.setItem('studentId', data.id)
      router.push('/directory')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ac-container ac-section">
      <div className="ac-stack" style={{ maxWidth: '56rem', marginBottom: '48px' }}>
        <h1 className="ac-h1">Book a call with a mentor</h1>
        <p className="ac-lede">Tell us about yourself and the sectors you're interested in. We'll help you find the right apprentice to talk to.</p>
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
              placeholder="e.g., Alex Johnson"
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
            <p className="ac-hint ac-mt-1">We'll send your booking link here</p>
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
            <p className="ac-hint ac-mt-1">Helps mentors learn more about you (optional but recommended)</p>
          </div>

          <div className="ac-field">
            <label className="ac-label">Sectors you're interested in</label>
            <div className="ac-stack" style={{ '--gap': '8px' } as any}>
              {SECTORS.map(sector => (
                <label key={sector} className="ac-check" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={formData.sectors.includes(sector)}
                    onChange={() => handleSectorChange(sector)}
                    disabled={loading}
                  />
                  <span>{sector}</span>
                </label>
              ))}
            </div>
            {formData.sectors.length === 0 && (
              <p className="ac-error ac-mt-1">Select at least one sector</p>
            )}
          </div>

          <div className="ac-stack" style={{ '--gap': '12px' } as any}>
            <label style={{ display: 'flex', gap: '12px', cursor: 'pointer', alignItems: 'flex-start' }}>
              <input
                type="checkbox"
                checked={formData.ageVerified}
                onChange={handleAgeChange}
                disabled={loading}
                style={{ marginTop: '4px' }}
              />
              <span className="ac-small">I confirm I am 16 or older</span>
            </label>

            {isUnder16 && (
              <div className="ac-field">
                <label className="ac-label" htmlFor="guardianEmail">Parent/Guardian Email</label>
                <input
                  className="ac-input"
                  id="guardianEmail"
                  name="guardianEmail"
                  type="email"
                  value={formData.guardianEmail}
                  onChange={handleChange}
                  placeholder="parent@email.com"
                  disabled={loading}
                />
                <p className="ac-hint ac-mt-1">We'll send a consent form to verify approval</p>
              </div>
            )}
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
            {loading ? 'Creating account...' : 'Continue to mentors'}
          </button>

          <p className="ac-small ac-muted ac-center">
            Are you an apprentice? <Link href="/apprentice/signup" className="ac-link">Become a mentor</Link>
          </p>
        </div>
      </form>
    </div>
  )
}
