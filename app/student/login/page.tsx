'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { saveSession } from '@/lib/session-client'

export default function StudentLogin() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (!email || !password) {
        throw new Error('Please enter your email and password')
      }

      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          userType: 'student',
        }),
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Login failed')
      }

      const data = await response.json()
      saveSession(data.token, data.user.profileId, 'student')
      router.push(searchParams.get('next') || '/student/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="ac-container ac-section">
      <div style={{ maxWidth: '28rem', margin: '0 auto' }}>
        <div className="ac-stack ac-mb-4" style={{ '--gap': '12px' } as any}>
          <h1 className="ac-h1">Log back in</h1>
          <p className="ac-lede">Access your bookings and preferences</p>
        </div>

        <form onSubmit={handleSubmit} className="ac-card">
          <div className="ac-stack" style={{ '--gap': '24px' } as any}>
            <div className="ac-field">
              <label className="ac-label" htmlFor="email">Email address</label>
              <input
                className="ac-input"
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="your@email.com"
                disabled={loading}
              />
            </div>

            <div className="ac-field">
              <label className="ac-label" htmlFor="password">Password</label>
              <input
                className="ac-input"
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                disabled={loading}
              />
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
              {loading ? 'Logging in...' : 'Log in'}
            </button>

            <p className="ac-small ac-muted ac-center">
              Don't have an account? <Link href="/signup" className="ac-link">Sign up</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
